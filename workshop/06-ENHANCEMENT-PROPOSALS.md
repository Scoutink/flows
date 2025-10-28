# Enhancement Proposals and Feature Ideas

## Priority Matrix

| Feature | Impact | Effort | Priority |
|---------|--------|--------|----------|
| Search & Filter | High | Low | P0 |
| Export/Import | High | Medium | P0 |
| Undo/Redo | High | High | P1 |
| User Authentication | Critical | High | P1 |
| Audit Log | High | Medium | P1 |
| Real-time Collaboration | High | Very High | P2 |
| Templates | Medium | Low | P2 |
| Reporting Dashboard | High | High | P2 |
| Mobile App | High | Very High | P3 |

---

## Core Features (P0 - Must Have)

### FEAT-001: Global Search Across All Flows
**Problem**: No way to find specific text across large workflows  
**Solution**: Full-text search with highlighting

**Implementation**:
```javascript
const searchWorkflows = (query, options = {}) => {
    const results = [];
    const lowerQuery = query.toLowerCase();
    
    appState.workflow.flows.forEach(flow => {
        (flow.data || []).forEach((ctl, ci) => {
            const searchNode = (node, path, level) => {
                const matches = [];
                
                // Search name
                if (node.name?.toLowerCase().includes(lowerQuery)) {
                    matches.push({ field: 'name', value: node.name });
                }
                
                // Search text
                if (node.text?.toLowerCase().includes(lowerQuery)) {
                    matches.push({ field: 'text', value: node.text });
                }
                
                // Search tags
                if (options.includeTags) {
                    node.tags?.forEach(tag => {
                        if (tag.toLowerCase().includes(lowerQuery)) {
                            matches.push({ field: 'tag', value: tag });
                        }
                    });
                }
                
                if (matches.length > 0) {
                    results.push({
                        flow: flow.name,
                        path,
                        level,
                        node: { id: node.id, name: node.name },
                        matches
                    });
                }
                
                // Recurse
                node.subcategories?.forEach((child, i) => {
                    searchNode(child, `${path}.subcategories.${i}`, level + 1);
                });
            };
            
            searchNode(ctl, `data.${ci}`, 0);
        });
    });
    
    return results;
};
```

**UI Design**:
- Search bar in header (keyboard shortcut: Ctrl+F)
- Results panel with jump-to functionality
- Highlight matches in yellow
- Filters: Flow, Level (Control/Action/Evidence), Tags

**Estimated Effort**: 2-3 days  
**Impact**: High - essential for large workflows

---

### FEAT-002: Advanced Export Functionality
**Problem**: No way to export data for reporting or backup  
**Solution**: Multiple export formats

**Export Formats**:
1. **JSON**: Full structure with metadata
2. **Excel**: Hierarchical spreadsheet
3. **PDF**: Formatted report with progress
4. **CSV**: Flat export for analysis
5. **Markdown**: Documentation format

**Implementation Example (Excel)**:
```javascript
const exportToExcel = async () => {
    // Use SheetJS library
    const XLSX = await import('https://cdn.sheetjs.com/xlsx-latest/package/xlsx.mjs');
    
    const data = [];
    const flow = getCurrentFlow();
    
    (flow.data || []).forEach(ctl => {
        (ctl.subcategories || []).forEach(act => {
            (act.subcategories || []).forEach(ev => {
                data.push({
                    'Control': ctl.name,
                    'Action': act.name,
                    'Evidence': ev.name,
                    'Grade': ev.grade,
                    'Completed': getCompleted(appState.currentFlowId, ev.id, false) ? 'Yes' : 'No',
                    'Tags': (ev.tags || []).join(', '),
                    'Description': ev.text
                });
            });
        });
    });
    
    const ws = XLSX.utils.json_to_sheet(data);
    const wb = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(wb, ws, flow.name);
    XLSX.writeFile(wb, `${flow.name}_export.xlsx`);
};
```

**PDF Export with Progress**:
- Use jsPDF library
- Include cover page with flow summary
- Show progress bars and completion percentages
- Include all attachments as appendix

**Estimated Effort**: 5-7 days  
**Impact**: High - essential for reporting

---

### FEAT-003: Bulk Import from Excel/CSV
**Problem**: Manual data entry for large workflows  
**Solution**: Import wizard with mapping

**Import Flow**:
1. Upload Excel/CSV file
2. Preview data in table
3. Map columns to fields (Control, Action, Evidence, etc.)
4. Validate structure (no orphan evidence, grade totals)
5. Choose import mode (new flow, merge into existing)
6. Import with progress bar
7. Show summary of imported items

**Implementation**:
```javascript
const importFromExcel = async (file) => {
    const XLSX = await import('https://cdn.sheetjs.com/xlsx-latest/package/xlsx.mjs');
    
    const data = await file.arrayBuffer();
    const workbook = XLSX.read(data);
    const sheet = workbook.Sheets[workbook.SheetNames[0]];
    const rows = XLSX.utils.sheet_to_json(sheet);
    
    // Group by control and action
    const structure = {};
    rows.forEach(row => {
        const ctlName = row['Control'];
        const actName = row['Action'];
        
        if (!structure[ctlName]) {
            structure[ctlName] = { name: ctlName, actions: {} };
        }
        
        if (!structure[ctlName].actions[actName]) {
            structure[ctlName].actions[actName] = { name: actName, evidence: [] };
        }
        
        structure[ctlName].actions[actName].evidence.push({
            name: row['Evidence'],
            text: row['Description'] || '',
            grade: parseFloat(row['Grade']) || 1.0,
            tags: row['Tags'] ? row['Tags'].split(',').map(t => t.trim()) : []
        });
    });
    
    // Validate grade totals
    const errors = [];
    Object.values(structure).forEach(ctl => {
        Object.values(ctl.actions).forEach(act => {
            const total = act.evidence.reduce((sum, ev) => sum + ev.grade, 0);
            if (Math.abs(total - 5.0) > 0.01) {
                errors.push(`Action "${act.name}" grade total is ${total}, expected 5.0`);
            }
        });
    });
    
    if (errors.length > 0) {
        return { success: false, errors };
    }
    
    // Convert to flow structure
    const flow = {
        id: generateId('flow'),
        name: `Imported ${new Date().toISOString().split('T')[0]}`,
        data: Object.values(structure).map(ctl => ({
            id: generateId('cat'),
            name: ctl.name,
            text: '',
            tags: [],
            subcategories: Object.values(ctl.actions).map(act => ({
                id: generateId('act'),
                name: act.name,
                text: '',
                tags: [],
                subcategories: act.evidence.map(ev => ({
                    id: generateId('evi'),
                    name: ev.name,
                    text: ev.text,
                    grade: ev.grade,
                    tags: ev.tags,
                    completed: false,
                    footer: { links: [], images: [], notes: [], comments: [] },
                    subcategories: []
                }))
            }))
        }))
    };
    
    return { success: true, flow };
};
```

**Estimated Effort**: 7-10 days  
**Impact**: High - enables bulk operations

---

### FEAT-004: Quick Filters and Saved Views
**Problem**: Repeatedly applying same filters  
**Solution**: Save filter presets

**Features**:
- Save current filter as preset (name + icon)
- Quick access dropdown in header
- Filters: Tags, completion status, grade range, text search
- Combine multiple filters with AND/OR logic

**Implementation**:
```javascript
const savedFilters = [
    {
        id: 'filter-1',
        name: 'High Priority Incomplete',
        icon: 'fa-exclamation-triangle',
        conditions: [
            { field: 'completed', operator: 'eq', value: false },
            { field: 'grade', operator: 'gte', value: 2.0 }
        ],
        logic: 'AND'
    },
    {
        id: 'filter-2',
        name: 'Firewall Related',
        icon: 'fa-shield',
        conditions: [
            { field: 'tags', operator: 'includes', value: 'firewall' }
        ]
    }
];

const applyFilter = (filter) => {
    const matches = (node, nodeType) => {
        return filter.conditions.every(cond => {
            if (cond.field === 'completed') {
                return getCompleted(appState.currentFlowId, node.id, false) === cond.value;
            }
            if (cond.field === 'grade') {
                if (cond.operator === 'gte') return node.grade >= cond.value;
                if (cond.operator === 'lte') return node.grade <= cond.value;
            }
            if (cond.field === 'tags') {
                if (cond.operator === 'includes') return node.tags?.includes(cond.value);
            }
            return true;
        });
    };
    
    // Apply to current flow...
};
```

**UI**:
- Filter builder modal with drag-and-drop conditions
- Visual indicator of active filters
- One-click clear all filters

**Estimated Effort**: 5-7 days  
**Impact**: Medium-High - improves workflow efficiency

---

## Essential Features (P1)

### FEAT-005: Undo/Redo System
**Problem**: No way to revert mistakes  
**Solution**: Command pattern with history

**Implementation**:
```javascript
class Command {
    execute() { throw new Error('Not implemented'); }
    undo() { throw new Error('Not implemented'); }
}

class AddNodeCommand extends Command {
    constructor(parentPath, node) {
        super();
        this.parentPath = parentPath;
        this.node = node;
    }
    
    execute() {
        const parent = getObjectByPath(this.parentPath, getCurrentFlow());
        parent.subcategories = parent.subcategories || [];
        parent.subcategories.push(this.node);
        render();
    }
    
    undo() {
        const parent = getObjectByPath(this.parentPath, getCurrentFlow());
        parent.subcategories.pop();
        render();
    }
}

class CommandHistory {
    constructor() {
        this.history = [];
        this.currentIndex = -1;
    }
    
    execute(command) {
        // Remove any commands after current index
        this.history = this.history.slice(0, this.currentIndex + 1);
        
        command.execute();
        this.history.push(command);
        this.currentIndex++;
    }
    
    undo() {
        if (this.currentIndex >= 0) {
            this.history[this.currentIndex].undo();
            this.currentIndex--;
        }
    }
    
    redo() {
        if (this.currentIndex < this.history.length - 1) {
            this.currentIndex++;
            this.history[this.currentIndex].execute();
        }
    }
}

const history = new CommandHistory();

// Usage
history.execute(new AddNodeCommand('data.0', newControl));

// Keyboard shortcuts
document.addEventListener('keydown', (e) => {
    if (e.ctrlKey && e.key === 'z') history.undo();
    if (e.ctrlKey && e.key === 'y') history.redo();
});
```

**UI Indicators**:
- Undo/Redo buttons in header (enabled/disabled based on history)
- Show last action in tooltip
- History panel showing last 10 actions

**Estimated Effort**: 10-14 days  
**Impact**: High - essential for user confidence

---

### FEAT-006: User Authentication and Roles
**Problem**: No access control  
**Solution**: Multi-user system with roles

**Roles**:
1. **Admin**: Full access, manage users
2. **Editor**: Create/edit structure and execute
3. **Executor**: Execute mode only, no structure changes
4. **Viewer**: Read-only access

**Implementation** (Backend - Node.js example):
```javascript
// users.js
const users = [
    { id: 1, username: 'admin', role: 'admin', passwordHash: '...' },
    { id: 2, username: 'auditor', role: 'executor', passwordHash: '...' },
    { id: 3, username: 'viewer', role: 'viewer', passwordHash: '...' }
];

// auth.js
const jwt = require('jsonwebtoken');

const login = (req, res) => {
    const { username, password } = req.body;
    const user = users.find(u => u.username === username);
    
    if (!user || !bcrypt.compareSync(password, user.passwordHash)) {
        return res.status(401).json({ error: 'Invalid credentials' });
    }
    
    const token = jwt.sign({ userId: user.id, role: user.role }, SECRET, { expiresIn: '24h' });
    res.json({ token, user: { id: user.id, username: user.username, role: user.role } });
};

const authMiddleware = (req, res, next) => {
    const token = req.headers.authorization?.split(' ')[1];
    if (!token) return res.status(401).json({ error: 'No token' });
    
    try {
        const decoded = jwt.verify(token, SECRET);
        req.user = decoded;
        next();
    } catch (err) {
        res.status(401).json({ error: 'Invalid token' });
    }
};

const requireRole = (...roles) => {
    return (req, res, next) => {
        if (!roles.includes(req.user.role)) {
            return res.status(403).json({ error: 'Insufficient permissions' });
        }
        next();
    };
};

// Routes
app.post('/api/login', login);
app.post('/api/workflows', authMiddleware, requireRole('admin', 'editor'), saveWorkflow);
app.post('/api/executions', authMiddleware, requireRole('admin', 'editor', 'executor'), saveExecution);
```

**Frontend Integration**:
```javascript
// Store token in localStorage
const login = async (username, password) => {
    const res = await fetch('/api/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ username, password })
    });
    
    const data = await res.json();
    localStorage.setItem('authToken', data.token);
    appState.currentUser = data.user;
    
    // Update UI based on role
    updateUIForRole(data.user.role);
};

const updateUIForRole = (role) => {
    if (role === 'viewer') {
        // Hide all edit buttons
        document.querySelectorAll('.creation-only').forEach(el => el.remove());
        document.querySelectorAll('.execution-only .btn-edit').forEach(el => el.remove());
    } else if (role === 'executor') {
        // Hide creation mode
        document.getElementById('mode-switch-checkbox').disabled = true;
        appState.currentMode = 'execution';
    }
};
```

**Estimated Effort**: 14-21 days  
**Impact**: Critical - required for production

---

### FEAT-007: Comprehensive Audit Log
**Problem**: No record of who changed what  
**Solution**: Full audit trail

**Data Structure**:
```javascript
{
    id: 'log-123',
    timestamp: '2025-10-28T10:30:00Z',
    userId: 'user-456',
    userName: 'John Doe',
    action: 'edit_evidence_name',
    flowId: 'flow-789',
    flowName: 'Main Flow',
    targetId: 'evi-101',
    targetType: 'evidence',
    changes: {
        before: { name: 'Old Name' },
        after: { name: 'New Name' }
    },
    ip: '192.168.1.100',
    userAgent: 'Mozilla/5.0...'
}
```

**Logged Actions**:
- Create/edit/delete nodes
- Toggle completion
- Add/edit/delete attachments
- Change grades
- Add/remove tags
- Create/rename/delete flows
- Login/logout

**UI Features**:
- Audit log viewer (admin only)
- Filter by user, date range, action type, flow
- Export audit log to CSV
- Visual diff viewer for changes

**Implementation**:
```javascript
const logAction = async (action, details) => {
    const log = {
        id: generateId('log'),
        timestamp: new Date().toISOString(),
        userId: appState.currentUser.id,
        userName: appState.currentUser.username,
        action,
        flowId: appState.currentFlowId,
        flowName: getCurrentFlow()?.name,
        ...details
    };
    
    await fetch('/api/audit-log', {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${localStorage.getItem('authToken')}`
        },
        body: JSON.stringify(log)
    });
};

// Usage
const handleEditName = (node, newName) => {
    const oldName = node.name;
    node.name = newName;
    
    logAction('edit_name', {
        targetId: node.id,
        targetType: 'evidence', // or 'control', 'action'
        changes: {
            before: { name: oldName },
            after: { name: newName }
        }
    });
    
    render();
};
```

**Estimated Effort**: 10-14 days  
**Impact**: High - compliance requirement

---

### FEAT-008: Version Control and History
**Problem**: No way to see past versions or restore  
**Solution**: Git-like versioning

**Features**:
- Auto-commit on every save (with commit message option)
- View version history
- Compare versions (visual diff)
- Restore previous version
- Branch workflows for experimentation

**Implementation**:
```javascript
// Backend storage
const versions = [
    {
        id: 'v1',
        flowId: 'flow-123',
        timestamp: '2025-10-28T09:00:00Z',
        userId: 'user-456',
        message: 'Initial version',
        data: { /* full flow data snapshot */ },
        parent: null
    },
    {
        id: 'v2',
        flowId: 'flow-123',
        timestamp: '2025-10-28T10:00:00Z',
        userId: 'user-456',
        message: 'Added firewall controls',
        data: { /* ... */ },
        parent: 'v1'
    }
];

// Version diff
const compareVersions = (v1, v2) => {
    const diff = {
        added: [],
        removed: [],
        modified: []
    };
    
    // Use jsondiffpatch library
    const delta = jsondiffpatch.diff(v1.data, v2.data);
    
    // Analyze delta to populate diff
    // ... complex logic ...
    
    return diff;
};

// Restore version
const restoreVersion = async (versionId) => {
    const version = await fetch(`/api/versions/${versionId}`).then(r => r.json());
    appState.workflow = version.data;
    render();
    
    // Save as new version
    await saveStructure('Restored from ' + version.message);
};
```

**UI**:
- Version history timeline
- Diff viewer (color-coded additions/deletions)
- "Restore this version" button
- Branch creation dialog

**Estimated Effort**: 21-28 days  
**Impact**: High - advanced feature for power users

---

## Advanced Features (P2)

### FEAT-009: Real-Time Collaboration (WebSocket)
**Problem**: Multiple users can't work simultaneously  
**Solution**: Google Docs-style collaboration

**Architecture**:
```
Client A ────┐
             ├──> WebSocket Server ──> Redis Pub/Sub ──> Database
Client B ────┘
```

**Implementation** (Server - Node.js + Socket.io):
```javascript
const io = require('socket.io')(server);

io.on('connection', (socket) => {
    socket.on('join-flow', (flowId) => {
        socket.join(flowId);
        
        // Broadcast user joined
        io.to(flowId).emit('user-joined', {
            userId: socket.user.id,
            userName: socket.user.name
        });
    });
    
    socket.on('edit-node', ({ flowId, path, changes }) => {
        // Update database
        updateNode(flowId, path, changes);
        
        // Broadcast to other clients
        socket.to(flowId).emit('node-edited', {
            path,
            changes,
            userId: socket.user.id
        });
    });
    
    socket.on('toggle-complete', ({ flowId, evidenceId, value }) => {
        updateCompletion(flowId, evidenceId, value);
        socket.to(flowId).emit('completion-changed', { evidenceId, value });
    });
});
```

**Client Integration**:
```javascript
const socket = io('wss://your-server.com', {
    auth: { token: localStorage.getItem('authToken') }
});

socket.on('connect', () => {
    socket.emit('join-flow', appState.currentFlowId);
});

socket.on('node-edited', ({ path, changes, userId }) => {
    if (userId !== appState.currentUser.id) {
        const node = getObjectByPath(path, getCurrentFlow());
        Object.assign(node, changes);
        render();
        
        // Show notification
        showNotification(`${getUserName(userId)} edited ${node.name}`);
    }
});

socket.on('completion-changed', ({ evidenceId, value }) => {
    setCompleted(appState.currentFlowId, evidenceId, value);
    render();
});
```

**Conflict Resolution**:
- Operational Transformation (OT) for text fields
- Last-write-wins for simple fields
- Show conflict dialog for simultaneous edits

**UI Enhancements**:
- User avatars showing who's viewing
- Live cursors (optional, high complexity)
- Lock indicators for nodes being edited

**Estimated Effort**: 60-90 days  
**Impact**: High - game-changer for teams

---

### FEAT-010: Templates and Blueprints
**Problem**: Repeating same structure for different projects  
**Solution**: Reusable templates

**Features**:
- Save flow as template
- Template library (public + private)
- Template variables (e.g., {{project_name}})
- Create flow from template with variable substitution

**Implementation**:
```javascript
const saveAsTemplate = (flow) => {
    const template = {
        id: generateId('template'),
        name: flow.name + ' Template',
        description: 'Template created from ' + flow.name,
        author: appState.currentUser.username,
        variables: [], // e.g., ['project_name', 'start_date']
        data: flow.data,
        tags: ['compliance', 'audit'],
        isPublic: false,
        created: new Date().toISOString()
    };
    
    return template;
};

const createFromTemplate = (template, variables) => {
    // Deep clone template data
    let data = JSON.parse(JSON.stringify(template.data));
    
    // Replace variables in strings
    const replaceVars = (obj) => {
        if (typeof obj === 'string') {
            variables.forEach(({ key, value }) => {
                obj = obj.replace(new RegExp(`{{${key}}}`, 'g'), value);
            });
            return obj;
        }
        if (Array.isArray(obj)) {
            return obj.map(replaceVars);
        }
        if (typeof obj === 'object' && obj !== null) {
            Object.keys(obj).forEach(k => {
                obj[k] = replaceVars(obj[k]);
            });
        }
        return obj;
    };
    
    data = replaceVars(data);
    
    // Generate new IDs
    const regenerateIds = (node) => {
        node.id = generateId(node.id.split('-')[0]);
        (node.subcategories || []).forEach(regenerateIds);
    };
    data.forEach(regenerateIds);
    
    return {
        id: generateId('flow'),
        name: variables.find(v => v.key === 'project_name')?.value || 'New Flow',
        data
    };
};
```

**UI**:
- Template browser with search and filters
- Template preview
- Variable input dialog
- Star/favorite templates

**Estimated Effort**: 14-21 days  
**Impact**: Medium - speeds up onboarding

---

### FEAT-011: Reporting Dashboard
**Problem**: No high-level overview of progress  
**Solution**: Visual dashboard with charts

**Charts**:
1. **Overall Completion**: Donut chart showing % complete
2. **Progress by Flow**: Horizontal bar chart
3. **Grade Distribution**: Histogram
4. **Completion Timeline**: Line chart over time
5. **Tags Cloud**: Size by usage frequency
6. **Bottlenecks**: List of incomplete high-grade evidence

**Implementation** (Chart.js):
```javascript
const renderDashboard = () => {
    const stats = calculateStats();
    
    // Overall completion chart
    new Chart(document.getElementById('completionChart'), {
        type: 'doughnut',
        data: {
            labels: ['Completed', 'Incomplete'],
            datasets: [{
                data: [stats.completedCount, stats.totalCount - stats.completedCount],
                backgroundColor: ['#10b981', '#e5e7eb']
            }]
        },
        options: {
            responsive: true,
            plugins: {
                legend: { position: 'bottom' },
                title: { display: true, text: 'Overall Completion' }
            }
        }
    });
    
    // Progress by flow
    new Chart(document.getElementById('flowProgressChart'), {
        type: 'bar',
        data: {
            labels: appState.workflow.flows.map(f => f.name),
            datasets: [{
                label: 'Completion %',
                data: appState.workflow.flows.map(f => calculateFlowProgress(f)),
                backgroundColor: '#6366f1'
            }]
        },
        options: {
            indexAxis: 'y',
            responsive: true,
            scales: {
                x: { min: 0, max: 100 }
            }
        }
    });
};

const calculateStats = () => {
    let totalCount = 0;
    let completedCount = 0;
    let totalGrade = 0;
    let completedGrade = 0;
    
    appState.workflow.flows.forEach(flow => {
        (flow.data || []).forEach(ctl => {
            (ctl.subcategories || []).forEach(act => {
                (act.subcategories || []).forEach(ev => {
                    totalCount++;
                    totalGrade += ev.grade;
                    
                    if (getCompleted(flow.id, ev.id, false)) {
                        completedCount++;
                        completedGrade += ev.grade;
                    }
                });
            });
        });
    });
    
    return {
        totalCount,
        completedCount,
        completionPercent: (completedCount / totalCount) * 100,
        totalGrade,
        completedGrade,
        gradePercent: (completedGrade / totalGrade) * 100
    };
};
```

**Export Options**:
- Export dashboard as PDF
- Schedule email reports (daily/weekly/monthly)
- Embed dashboard in other systems (iframe)

**Estimated Effort**: 14-21 days  
**Impact**: High - executive visibility

---

### FEAT-012: Mobile App (PWA or Native)
**Problem**: Desktop-only access  
**Solution**: Responsive PWA or native mobile app

**PWA Approach** (Progressive Web App):
```javascript
// manifest.json
{
    "name": "Compliance Manager",
    "short_name": "Compliance",
    "start_url": "/",
    "display": "standalone",
    "background_color": "#0f172a",
    "theme_color": "#6366f1",
    "icons": [
        { "src": "/icon-192.png", "sizes": "192x192", "type": "image/png" },
        { "src": "/icon-512.png", "sizes": "512x512", "type": "image/png" }
    ]
}

// service-worker.js
self.addEventListener('install', (e) => {
    e.waitUntil(
        caches.open('v1').then((cache) => {
            return cache.addAll([
                '/',
                '/index.html',
                '/script.js',
                '/style.css',
                '/manifest.json'
            ]);
        })
    );
});

// Mobile-specific features
if ('share' in navigator) {
    const shareButton = document.getElementById('share-flow');
    shareButton.addEventListener('click', async () => {
        await navigator.share({
            title: 'Compliance Flow',
            text: 'Check out this compliance workflow',
            url: window.location.href
        });
    });
}

// Push notifications
if ('Notification' in window && 'serviceWorker' in navigator) {
    const permission = await Notification.requestPermission();
    if (permission === 'granted') {
        // Subscribe to push notifications
        const subscription = await registration.pushManager.subscribe({
            userVisibleOnly: true,
            applicationServerKey: PUBLIC_VAPID_KEY
        });
    }
}
```

**Mobile UI Adaptations**:
- Collapsible sidebar for flows
- Bottom navigation bar
- Swipe gestures for actions
- Larger touch targets (48px min)
- Pull-to-refresh

**Estimated Effort**: 30-60 days (PWA), 90-180 days (native)  
**Impact**: High - mobile access critical for field audits

---

## Nice-to-Have Features (P3)

### FEAT-013: AI-Powered Suggestions
**Use Cases**:
- Suggest relevant tags based on evidence text
- Auto-complete evidence descriptions
- Identify duplicate/similar evidence
- Recommend grade based on description

**Implementation** (OpenAI API):
```javascript
const suggestTags = async (text) => {
    const response = await fetch('https://api.openai.com/v1/chat/completions', {
        method: 'POST',
        headers: {
            'Authorization': `Bearer ${OPENAI_API_KEY}`,
            'Content-Type': 'application/json'
        },
        body: JSON.stringify({
            model: 'gpt-4',
            messages: [{
                role: 'system',
                content: 'You are a compliance expert. Suggest 3-5 relevant tags for the following evidence description.'
            }, {
                role: 'user',
                content: text
            }],
            max_tokens: 50
        })
    });
    
    const data = await response.json();
    const tags = data.choices[0].message.content.split(',').map(t => t.trim());
    return tags;
};
```

**Estimated Effort**: 14-21 days  
**Impact**: Medium - nice UX enhancement

---

### FEAT-014: Gamification
**Features**:
- Progress badges (bronze/silver/gold)
- Leaderboard (most completed evidence)
- Streaks (consecutive days with activity)
- Achievements (unlock for milestones)

**Estimated Effort**: 7-14 days  
**Impact**: Low-Medium - motivational

---

### FEAT-015: Integration with External Systems
**Integrations**:
- **Jira**: Create issues for incomplete evidence
- **Slack**: Notifications for completions
- **Google Drive**: Attach files directly
- **SharePoint**: Sync workflows
- **Zapier**: Custom automation

**Estimated Effort**: 21-30 days per integration  
**Impact**: High - enterprise adoption

---

### FEAT-016: Custom Workflows (No-Code Builder)
**Problem**: Fixed 3-level hierarchy  
**Solution**: Configurable levels and fields

**Features**:
- Add custom levels (e.g., Chapter → Section → Control → Action → Evidence)
- Add custom fields (date, number, dropdown, multi-select)
- Visual workflow builder
- Conditional logic (if grade > 3, show additional field)

**Estimated Effort**: 60-90 days  
**Impact**: High - ultimate flexibility

---

## Summary of Enhancements

**Total Proposed Features**: 16  
**Total Estimated Effort**: 350-600 days (1-2 engineer-years)

**Recommended Roadmap**:
1. **Q1 2026**: FEAT-001, FEAT-002, FEAT-003, FEAT-004 (Search, Export, Import, Filters)
2. **Q2 2026**: FEAT-005, FEAT-006, FEAT-007 (Undo, Auth, Audit)
3. **Q3 2026**: FEAT-008, FEAT-011 (Versioning, Dashboard)
4. **Q4 2026**: FEAT-009, FEAT-012 (Collaboration, Mobile)
5. **2027+**: FEAT-010, FEAT-013-016 (Templates, AI, Integrations, Custom)
