# Core Components Analysis

**Document Version**: 1.0  
**Date**: 2025-11-11  
**Scope**: Detailed analysis of each major component

---

## 📦 Component Overview

The system consists of two major subsystems, each with multiple components:

1. **Workflow Manager System** (`index.html`, `script.js`, `style.css`)
2. **PPM Board System** (`boards.html`, `board.html`, `ppm-script.js`, `ppm-style.css`)

---

## 🔄 WORKFLOW MANAGER SYSTEM

### Component 1: State Management

**Location**: `script.js` (lines 26-51)  
**Purpose**: Central state management for workflow manager

#### Structure
```javascript
let appState = {
    theme: 'light',
    currentMode: 'execution',
    workflow: {
        settings: { enforceSequence: true },
        flows: [] // [{id, name, data:[controls...]}]
    },
    executions: {
        flows: {
            // flowId: { completed: { evidenceId: true/false } }
        }
    },
    workflowLinks: {
        links: [] // [{groupId, workflows:[flowId1, flowId2]}]
    },
    currentFlowId: null,
    selectedActionPaths: {},
    expandedTextAreas: new Set(),
    activeTag: null // per-flow execution tag filter
};
```

#### Key Functions
- `getCurrentFlow()` - Get currently active flow
- `getObjectByPath()` - Navigate state tree
- `getParentAndKey()` - Get parent object for mutations

#### Responsibilities
- Store all application state
- Manage current flow selection
- Track execution states per flow
- Store workflow link groups
- Manage UI state (selections, expansions)

---

### Component 2: Flow Management

**Location**: `script.js` (lines 52-120)  
**Purpose**: CRUD operations for workflows (flows)

#### Key Functions

##### `createFlow(name)`
```javascript
const createFlow = (name) => {
    const flow = {
        id: generateId('flow'),
        name: name || 'New Flow',
        data: []
    };
    appState.workflow.flows.push(flow);
    appState.currentFlowId = flow.id;
    populateFlowSelect();
    render();
    return flow;
};
```

##### `deleteFlow(flowId)`
- Removes flow from workflows
- Cleans up execution data
- Removes from link groups
- Updates UI

##### `renameFlow(flowId, newName)`
- Updates flow name
- Refreshes flow selector
- Maintains current selection

##### `isFlowLinked(flowId)`
- Checks if flow is in any link group
- Returns link group if found
- Used for UI indicators

#### Integration Points
- Flow selector dropdown
- Link management system
- Execution tracking
- Save/load operations

---

### Component 3: Workflow Structure Management

**Location**: `script.js` (lines 121-350)  
**Purpose**: CRUD operations for Controls, Actions, Evidence

#### Hierarchical Structure
```
Control (Category)
├── id: "cat-{timestamp}-{random}"
├── name: "Control Name"
├── subcategories: Action[]
└── tags: []

Action
├── id: "act-{timestamp}-{random}"
├── name: "Action Name"
├── text: "Action description"
├── completed: boolean
├── subcategories: Evidence[]
└── tags: []

Evidence
├── id: "evi-{timestamp}-{random}"
├── name: "Evidence ID"
├── text: "Evidence description"
├── completed: boolean
├── grade: number
├── tags: []
├── footer: {links, images, notes, comments}
├── isLocked: boolean
└── isActive: boolean
```

#### Key Functions

##### Add Operations
- `addControl(path)` - Add new control
- `addAction(path, controlId)` - Add action to control
- `addEvidence(path, actionId)` - Add evidence to action

##### Delete Operations
- `deleteNode(path)` - Delete any node
- Recursive cleanup of children
- Execution state cleanup
- Link synchronization

##### Update Operations
- `updateNodeName(path, newName)` - Rename node
- `updateNodeText(path, newText)` - Update description
- `updateNodeGrade(path, newGrade)` - Update evidence grade

##### Tag Operations
- `addTag(path, tag)` - Add tag to node
- `removeTag(path, tag)` - Remove tag from node
- `ensureTagsArray(node)` - Initialize tags array

#### Link Synchronization
When workflow is linked, structure changes propagate:
```javascript
const synchronizeLinkedWorkflows = (sourceFlowId, operation, data) => {
    const linkGroup = findLinkGroupForFlow(sourceFlowId);
    if (!linkGroup) return;
    
    linkGroup.workflows.forEach(flowId => {
        if (flowId !== sourceFlowId) {
            applyOperation(flowId, operation, data);
        }
    });
};
```

---

### Component 4: Execution Tracking

**Location**: `script.js` (lines 92-110)  
**Purpose**: Track evidence completion per flow

#### State Structure
```javascript
executions: {
    flows: {
        "flow-123": {
            completed: {
                "evi-456": true,
                "evi-789": false
            }
        }
    }
}
```

#### Key Functions

##### `ensureExecFlow(flowId)`
- Ensures execution state exists for flow
- Creates if missing
- Returns flow execution object

##### `setCompleted(flowId, evidenceId, value)`
- Sets completion status
- Boolean value
- Per-flow isolation

##### `isCompleted(flowId, evidenceId)`
- Check completion status
- Returns false if not set
- Used in rendering

#### Sequential Enforcement
```javascript
const canCompleteEvidence = (flowId, evidence, action) => {
    if (!appState.workflow.settings.enforceSequence) return true;
    
    const actionEvidences = action.subcategories;
    const evidenceIndex = actionEvidences.findIndex(e => e.id === evidence.id);
    
    // Check all previous evidence
    for (let i = 0; i < evidenceIndex; i++) {
        if (!isCompleted(flowId, actionEvidences[i].id)) {
            return false;
        }
    }
    return true;
};
```

---

### Component 5: Tag System

**Location**: `script.js` (lines 351-450)  
**Purpose**: Flexible tagging and filtering

#### Tag Management

##### Add Tag
```javascript
const addTagToNode = (path, tag) => {
    const flow = getCurrentFlow();
    const node = getObjectByPath(path, flow);
    if (!node) return;
    
    ensureTagsArray(node);
    if (!node.tags.includes(tag)) {
        node.tags.push(tag);
        render();
    }
};
```

##### Remove Tag
```javascript
const removeTagFromNode = (path, tag) => {
    const flow = getCurrentFlow();
    const node = getObjectByPath(path, flow);
    if (!node) return;
    
    if (node.tags) {
        node.tags = node.tags.filter(t => t !== tag);
        render();
    }
};
```

#### Tag Filtering (Execution Mode)
```javascript
const setActiveTag = (tag) => {
    appState.activeTag = tag;
    render();
};

const clearActiveTag = () => {
    appState.activeTag = null;
    render();
};
```

#### Tag Autocomplete
```javascript
const getCurrentFlowTags = () => {
    const flow = getCurrentFlow();
    if (!flow) return [];
    
    const tags = new Set();
    const traverse = (nodes) => {
        nodes.forEach(node => {
            if (node.tags) {
                node.tags.forEach(tag => tags.add(tag));
            }
            if (node.subcategories) {
                traverse(node.subcategories);
            }
        });
    };
    
    traverse(flow.data);
    return Array.from(tags).sort();
};
```

---

### Component 6: Rendering System

**Location**: `script.js` (lines 500-1200)  
**Purpose**: DOM rendering and updates

#### Rendering Architecture

```
render()
├── renderFlowContent()
│   ├── renderControls()
│   │   ├── renderControlHeader()
│   │   ├── renderControlBody()
│   │   └── renderActions()
│   │       ├── renderActionHeader()
│   │       ├── renderActionBody()
│   │       └── renderEvidence()
│   │           ├── renderEvidenceHeader()
│   │           ├── renderEvidenceBody()
│   │           └── renderFooter()
│   └── applyModeStyles()
└── updateUI()
```

#### Key Rendering Functions

##### `render()`
Main render function:
```javascript
const render = () => {
    if (!getCurrentFlow()) {
        workflowRoot.innerHTML = '<div class="loading-state">Select or create a flow</div>';
        return;
    }
    
    const flow = getCurrentFlow();
    const html = renderControls(flow.data);
    workflowRoot.innerHTML = html;
    
    applyModeStyles();
    updateLinkedIndicator();
    updateTagFilterBanner();
};
```

##### `renderControls(controls)`
Renders all controls:
```javascript
const renderControls = (controls) => {
    if (!controls || controls.length === 0) {
        return '<div class="empty-state">No controls yet. Add one to get started.</div>';
    }
    
    // Filter by active tag if set
    let filtered = controls;
    if (appState.activeTag) {
        filtered = filterByTag(controls, appState.activeTag);
    }
    
    return filtered.map((control, index) => renderControl(control, `data.${index}`)).join('');
};
```

##### `renderControl(control, path)`
Renders single control:
```javascript
const renderControl = (control, path) => {
    return `
        <div class="control" data-path="${path}">
            ${renderControlHeader(control, path)}
            ${renderControlBody(control, path)}
            ${renderActions(control.subcategories, path)}
        </div>
    `;
};
```

#### Conditional Rendering
```javascript
const renderByMode = (creationHTML, executionHTML) => {
    return appState.currentMode === 'creation' ? creationHTML : executionHTML;
};

// Usage
${renderByMode(
    `<button class="btn-delete" data-action="delete" data-path="${path}">Delete</button>`,
    ''
)}
```

#### Tag Filtering
```javascript
const filterByTag = (nodes, tag) => {
    return nodes.filter(node => {
        // Check node itself
        if (nodeHasTag(node, tag)) return true;
        
        // Check descendants
        if (node.subcategories) {
            const hasDescendantWithTag = hasDescendantTag(node.subcategories, tag);
            if (hasDescendantWithTag) return true;
        }
        
        return false;
    });
};
```

---

### Component 7: Event System

**Location**: `script.js` (lines 1200-1500)  
**Purpose**: Handle user interactions

#### Event Delegation Pattern
```javascript
workflowRoot.addEventListener('click', (e) => {
    const target = e.target.closest('[data-action]');
    if (!target) return;
    
    const action = target.dataset.action;
    const path = target.dataset.path;
    
    switch (action) {
        case 'add-control':
            handleAddControl(path);
            break;
        case 'add-action':
            handleAddAction(path);
            break;
        case 'delete':
            handleDelete(path);
            break;
        // ... more actions
    }
});
```

#### Key Event Handlers

##### Control Operations
- `handleAddControl()` - Add new control
- `handleDeleteControl()` - Delete control
- `handleRenameControl()` - Rename control

##### Action Operations
- `handleAddAction()` - Add action to control
- `handleDeleteAction()` - Delete action
- `handleCompleteAction()` - Mark action complete

##### Evidence Operations
- `handleAddEvidence()` - Add evidence to action
- `handleDeleteEvidence()` - Delete evidence
- `handleCompleteEvidence()` - Toggle evidence completion
- `handleGradeEvidence()` - Set evidence grade

##### Tag Operations
- `handleAddTag()` - Open tag input modal
- `handleRemoveTag()` - Remove tag
- `handleFilterByTag()` - Set active tag filter

##### Footer Operations
- `handleAddLink()` - Add link to footer
- `handleAddImage()` - Add image to footer
- `handleAddNote()` - Add note with Quill editor
- `handleAddComment()` - Add comment

---

### Component 8: Modal System

**Location**: `script.js` (lines 1500-1650)  
**Purpose**: Reusable modal dialogs

#### Modal Structure
```javascript
const modal = {
    backdrop: document.getElementById('modal-backdrop'),
    title: document.getElementById('modal-title'),
    body: document.getElementById('modal-body'),
    closeBtn: document.getElementById('modal-close-btn')
};
```

#### Key Functions

##### `openModal(title, bodyHTML, onOpen)`
```javascript
const openModal = (title, bodyHTML, onOpen) => {
    modal.title.textContent = title;
    modal.body.innerHTML = bodyHTML;
    modal.backdrop.classList.remove('hidden');
    if (onOpen) onOpen();
};
```

##### `closeModal()`
```javascript
const closeModal = () => {
    modal.backdrop.classList.add('hidden');
    if (quillEditor) {
        quillEditor = null;
    }
};
```

#### Modal Types

1. **Input Modal** - Simple text input
2. **Textarea Modal** - Multi-line text
3. **Quill Modal** - Rich text editor
4. **Tag Selection Modal** - Tag autocomplete
5. **Confirmation Modal** - Yes/No dialogs
6. **Link Modal** - Add links to footer
7. **Image Modal** - Add images

---

### Component 9: Link Management

**Location**: `script.js` (lines 1650-1800)  
**Purpose**: Manage linked workflows

#### Key Functions

##### `linkWorkflows(flowIds)`
```javascript
const linkWorkflows = (flowIds) => {
    const linkGroup = {
        groupId: generateId('group'),
        workflows: flowIds
    };
    appState.workflowLinks.links.push(linkGroup);
    saveLinkGroups();
    updateLinkedIndicator();
};
```

##### `unlinkWorkflow(flowId)`
```javascript
const unlinkWorkflow = (flowId) => {
    appState.workflowLinks.links = appState.workflowLinks.links.map(link => {
        return {
            ...link,
            workflows: link.workflows.filter(id => id !== flowId)
        };
    }).filter(link => link.workflows.length > 1);
    
    saveLinkGroups();
    updateLinkedIndicator();
};
```

##### `synchronizeStructuralChange(flowId, operation, data)`
```javascript
const synchronizeStructuralChange = (flowId, operation, data) => {
    const linkGroup = findLinkGroupForFlow(flowId);
    if (!linkGroup) return;
    
    linkGroup.workflows.forEach(linkedFlowId => {
        if (linkedFlowId !== flowId) {
            applyOperationToFlow(linkedFlowId, operation, data);
        }
    });
    
    saveWorkflow();
};
```

---

### Component 10: Save/Load System

**Location**: `script.js` (lines 1800-1900)  
**Purpose**: Data persistence

#### Save Functions

##### `saveWorkflow()`
```javascript
const saveWorkflow = async () => {
    try {
        const res = await fetch('save_workflow.php', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(appState.workflow)
        });
        const json = await res.json();
        if (json.status !== 'success') throw new Error(json.message);
        alert('Structure saved successfully!');
    } catch (e) {
        alert('Save failed: ' + e.message);
    }
};
```

##### `saveExecutions()`
```javascript
const saveExecutions = async () => {
    try {
        const res = await fetch('save_executions.php', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(appState.executions)
        });
        const json = await res.json();
        if (json.status !== 'success') throw new Error(json.message);
        alert('Execution state saved!');
    } catch (e) {
        alert('Save failed: ' + e.message);
    }
};
```

#### Load Functions

##### `loadWorkflow()`
```javascript
const loadWorkflow = async () => {
    try {
        const res = await fetch(`workflow.json?t=${Date.now()}`);
        const data = await res.json();
        appState.workflow = data;
        
        // Set current flow
        if (data.flows && data.flows.length > 0) {
            appState.currentFlowId = data.flows[0].id;
        }
        
        populateFlowSelect();
        render();
    } catch (e) {
        console.error('Load failed:', e);
    }
};
```

---

## 🎨 PPM BOARD SYSTEM

### Component 11: PPM State Management

**Location**: `ppm-script.js` (lines 4-16)  
**Purpose**: State management for board system

#### Structure
```javascript
let state = {
    view: 'boards', // 'boards' or 'board'
    currentBoardId: null,
    currentUser: null,
    boards: [],
    users: [],
    theme: 'light',
    draggedCard: null,
    draggedOverColumn: null,
    backlogFilter: null
};
```

---

### Component 12: Board Operations

**Location**: `ppm-script.js` (lines 133-218)  
**Purpose**: CRUD operations for boards

#### Key Functions

##### `createBoard(name, description, sourceData)`
```javascript
const createBoard = (name, description, sourceData = null) => {
    const board = {
        id: generateId('board'),
        name: name || 'New Board',
        description: description || '',
        sourceControlId: sourceData?.controlId || null,
        sourceFlowId: sourceData?.flowId || null,
        createdAt: new Date().toISOString(),
        createdBy: state.currentUser?.id || 'user-default-001',
        archived: false,
        members: [/* default member */],
        columns: createDefaultColumns(),
        cards: [],
        labels: [],
        settings: {},
        activity: []
    };
    
    state.boards.push(board);
    logActivity(board, null, 'board.created', { boardName: board.name });
    return board;
};
```

##### `createDefaultColumns()`
```javascript
const createDefaultColumns = () => {
    return [
        { id: generateId('col'), name: 'Backlog', order: 0, limit: null, color: '#6c757d' },
        { id: generateId('col'), name: 'To Do', order: 1, limit: null, color: '#0d6efd' },
        { id: generateId('col'), name: 'In Progress', order: 2, limit: 5, color: '#0dcaf0' },
        { id: generateId('col'), name: 'Review', order: 3, limit: null, color: '#ffc107' },
        { id: generateId('col'), name: 'Done', order: 4, limit: null, color: '#198754' }
    ];
};
```

---

### Component 13: Column Operations

**Location**: `ppm-script.js` (lines 180-218)  
**Purpose**: Manage board columns

#### Key Functions

##### `addColumn(board, name)`
##### `updateColumn(board, columnId, updates)`
##### `deleteColumn(board, columnId)`

---

### Component 14: Card Operations

**Location**: `ppm-script.js` (lines 220-355)  
**Purpose**: CRUD operations for cards

#### Key Functions

##### `createCard(board, columnId, cardData)`
Creates comprehensive card object with all properties.

##### `updateCard(board, cardId, updates)`
Updates card and logs activity.

##### `moveCard(board, cardId, toColumnId, toOrder)`
Handles drag-and-drop moves with reordering.

##### `deleteCard(board, cardId)`
Deletes card and reorders remaining cards.

---

### Component 15: Assignment System

**Location**: `ppm-script.js` (lines 357-394)  
**Purpose**: User assignment management

#### Four Role Types
1. **Executor** - Does the work
2. **Approver** - Approves completion
3. **Follower** - Stays informed
4. **Supervisor** - Oversees progress

#### Key Functions

##### `assignUser(board, cardId, userId, role)`
##### `unassignUser(board, cardId, userId, role)`

---

### Component 16: Drag-and-Drop System

**Location**: `ppm-script.js` (lines 753-810)  
**Purpose**: HTML5 drag-and-drop implementation

#### Event Handlers
- `handleDragStart(e)` - Start drag
- `handleDragEnd(e)` - End drag
- `handleDragOver(e)` - Allow drop
- `handleDrop(e)` - Handle drop

---

### Component 17: Integration Layer

**Location**: `ppm-script.js` (lines 434-537)  
**Purpose**: Workflow → Board conversion

#### Key Function

##### `convertControlToBoard(control, flowId)`
```javascript
const convertControlToBoard = (control, flowId) => {
    const board = createBoard(
        control.name,
        control.text || '',
        { controlId: control.id, flowId: flowId }
    );
    
    // Convert tags to labels
    if (control.tags && control.tags.length > 0) {
        control.tags.forEach(tag => {
            board.labels.push({
                id: generateId('label'),
                boardId: board.id,
                name: tag,
                color: getRandomLabelColor(),
                description: ''
            });
        });
    }
    
    // Convert evidence to cards
    const backlogColumn = board.columns[0];
    (control.subcategories || []).forEach(action => {
        (action.subcategories || []).forEach(evidence => {
            const cardData = {
                title: evidence.name,
                description: evidence.text || '',
                sourceType: 'evidence',
                sourceId: evidence.id,
                sourceGrade: evidence.grade,
                labels: [...(action.tags || []), ...(evidence.tags || [])],
                attachments: convertFooterToAttachments(evidence.footer)
            };
            
            createCard(board, backlogColumn.id, cardData);
        });
    });
    
    return board;
};
```

---

**Next**: Read [Data Models & Structures](./05-DATA-MODELS.md) for detailed data schemas
