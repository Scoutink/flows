# Optimization Recommendations

## Performance Optimization Roadmap

### Phase 1: Quick Wins (1-2 weeks)

#### OPT-001: Cache sharedEvidenceIndex()
**Current Performance**: O(n³) rebuild on every execution toggle  
**Target**: O(1) lookup after initial build  
**Estimated Improvement**: 80-90% faster execution toggles

**Implementation**:
```javascript
let _sharedIndexCache = null;

const invalidateSharedIndex = () => {
    _sharedIndexCache = null;
};

const sharedEvidenceIndex = () => {
    if (_sharedIndexCache) return _sharedIndexCache;
    
    const map = new Map();
    // ... existing logic ...
    _sharedIndexCache = map;
    return map;
};

// Call invalidateSharedIndex() after:
// - Node creation/deletion
// - Flow creation/deletion
// - Import/distribution operations
```

**Impact**: Critical performance improvement  
**Risk**: Low (cache invalidation must be thorough)

---

#### OPT-002: Debounce Text Input Propagation
**Current**: Propagates on every keystroke  
**Target**: Propagate after 500ms of inactivity  
**Estimated Improvement**: 95% reduction in render calls

**Implementation**:
```javascript
let textEditTimeout = null;

document.addEventListener('input', (e) => {
    const ta = e.target.closest('textarea[data-action="edit-text"]');
    if (!ta) return;
    
    clearTimeout(textEditTimeout);
    const flow = getCurrentFlow();
    const node = getObjectByPath(ta.dataset.path, flow);
    node.text = ta.value; // Update immediately
    
    textEditTimeout = setTimeout(() => {
        const parts = ta.dataset.path.split('.');
        const lvl = parts.filter(p=>p==='subcategories').length===2?'evidence':'action';
        propagateSharedEdit(node, lvl);
        render();
    }, 500);
});
```

**Impact**: High improvement for large flows  
**Risk**: Very low

---

#### OPT-003: Optimize getObjectByPath() with Memoization
**Current**: O(n) traversal on every call  
**Target**: O(1) with cache  
**Estimated Improvement**: 50% faster rendering

**Implementation**:
```javascript
const _pathCache = new WeakMap(); // WeakMap per flow object

const getObjectByPath = (path, flow) => {
    let cache = _pathCache.get(flow);
    if (!cache) {
        cache = new Map();
        _pathCache.set(flow, cache);
    }
    
    if (cache.has(path)) return cache.get(path);
    
    const root = { data: flow.data };
    const result = path.split('.').reduce((acc, key) => acc && acc[key], root);
    cache.set(path, result);
    return result;
};

// Invalidate on structure changes
const invalidatePathCache = (flow) => {
    _pathCache.delete(flow);
};
```

**Impact**: Medium improvement  
**Risk**: Low (must invalidate on structure change)

---

#### OPT-004: Lazy Load Quill Editor
**Current**: Loaded on page load (50 KB gzipped)  
**Target**: Load only when needed  
**Estimated Improvement**: 200ms faster initial load

**Implementation**:
```javascript
let quillLoaded = false;

const loadQuill = async () => {
    if (quillLoaded) return;
    await import('https://cdn.quilljs.com/1.3.6/quill.js');
    quillLoaded = true;
};

const showAddAttachmentModal = async (path, type) => {
    if (type === 'note') {
        await loadQuill();
    }
    // ... existing logic ...
};
```

**Impact**: Faster initial page load  
**Risk**: Very low

---

#### OPT-005: Use requestAnimationFrame for Render
**Current**: render() called synchronously, can cause jank  
**Target**: Batch renders using rAF  
**Estimated Improvement**: 60 FPS smooth animations

**Implementation**:
```javascript
let renderScheduled = false;

const scheduleRender = () => {
    if (renderScheduled) return;
    renderScheduled = true;
    requestAnimationFrame(() => {
        render();
        renderScheduled = false;
    });
};

// Replace all render() calls with scheduleRender()
```

**Impact**: Smoother UI, especially during rapid updates  
**Risk**: Very low

---

### Phase 2: Medium Effort (2-4 weeks)

#### OPT-006: Implement Virtual Scrolling for Large Lists
**Current**: Renders all controls (can be 100+)  
**Target**: Render only visible + buffer  
**Estimated Improvement**: 90% faster render for 100+ controls

**Implementation Strategy**:
1. Calculate viewport height
2. Determine which controls are visible
3. Render only those + 5 above/below (buffer)
4. Add spacer divs for scroll height
5. Update on scroll (debounced)

**Libraries to Consider**:
- `react-window` (if migrating to React)
- `virtual-scroller` (vanilla JS)
- Custom implementation

**Impact**: Massive improvement for large workflows  
**Risk**: Medium (complex implementation)

---

#### OPT-007: Incremental DOM Updates (Diffing)
**Current**: Full DOM rebuild on every change  
**Target**: Update only changed nodes  
**Estimated Improvement**: 80% faster renders

**Implementation Options**:
1. **Snabbdom** (lightweight virtual DOM library)
2. **Incremental DOM** (Google library)
3. **Custom diffing** using data-id attributes

**Example with data-id approach**:
```javascript
const renderControlNode = (control, path, isFiltered, flow) => {
    const existingEl = document.querySelector(`[data-node-id="${control.id}"]`);
    
    if (existingEl) {
        // Update only changed properties
        const titleEl = existingEl.querySelector('.control-title');
        if (titleEl.textContent !== control.name) {
            titleEl.textContent = control.name;
        }
        // ... update other changed fields ...
        return existingEl;
    }
    
    // Create new element only if doesn't exist
    const el = document.createElement('div');
    el.dataset.nodeId = control.id;
    // ... existing creation logic ...
    return el;
};
```

**Impact**: Dramatic improvement  
**Risk**: Medium (requires refactoring render logic)

---

#### OPT-008: Web Workers for Heavy Computations
**Current**: Filtering, indexing block main thread  
**Target**: Offload to worker  
**Estimated Improvement**: UI stays responsive during heavy ops

**Use Cases**:
- `sharedEvidenceIndex()` calculation
- `filterWorkflowByTag()` for large datasets
- `runGlobalFilter()` processing

**Implementation**:
```javascript
// worker.js
self.onmessage = (e) => {
    if (e.data.type === 'buildIndex') {
        const index = buildSharedIndex(e.data.flows);
        self.postMessage({ type: 'indexReady', index });
    }
};

// main.js
const worker = new Worker('worker.js');

const sharedEvidenceIndex = () => {
    return new Promise((resolve) => {
        worker.postMessage({ type: 'buildIndex', flows: appState.workflow.flows });
        worker.onmessage = (e) => {
            if (e.data.type === 'indexReady') {
                resolve(e.data.index);
            }
        };
    });
};
```

**Impact**: High for large datasets  
**Risk**: Medium (async complexity, data serialization overhead)

---

#### OPT-009: Implement IndexedDB for Client-Side Caching
**Current**: Full fetch on every page load  
**Target**: Cache in IndexedDB, fetch only if changed  
**Estimated Improvement**: 80% faster page loads (after first load)

**Implementation**:
```javascript
const openDB = () => {
    return new Promise((resolve, reject) => {
        const request = indexedDB.open('WorkflowDB', 1);
        request.onsuccess = () => resolve(request.result);
        request.onerror = () => reject(request.error);
        request.onupgradeneeded = (e) => {
            const db = e.target.result;
            db.createObjectStore('workflows');
        };
    });
};

const loadAll = async () => {
    const db = await openDB();
    
    // Try IndexedDB first
    const cached = await getFromDB(db, 'workflow');
    if (cached) {
        appState.workflow = cached;
        render();
    }
    
    // Fetch from server
    const res = await fetch('workflow.json');
    const workflow = await res.json();
    
    // Update cache
    await saveToDB(db, 'workflow', workflow);
    
    if (!cached || JSON.stringify(cached) !== JSON.stringify(workflow)) {
        appState.workflow = workflow;
        render();
    }
};
```

**Impact**: Much faster load times  
**Risk**: Medium (quota management, cache invalidation)

---

#### OPT-010: Optimize CSS with Containment
**Current**: Browser recalculates layout for entire page  
**Target**: Isolate control nodes  
**Estimated Improvement**: 30% faster rendering

**Implementation**:
```css
.control-node {
    contain: layout style paint;
    /* Existing styles... */
}

.evidence-node {
    contain: layout paint;
}
```

**Impact**: Reduced layout thrashing  
**Risk**: Very low

---

### Phase 3: Major Refactoring (1-2 months)

#### OPT-011: Migrate to Modern Framework (React/Vue/Svelte)
**Current**: Vanilla JS with manual DOM manipulation  
**Target**: Framework with virtual DOM  
**Estimated Improvement**: 
- 90% faster renders
- 50% less code
- Better maintainability

**Recommendation**: **Svelte** (compiles to vanilla JS, smallest bundle)

**Migration Path**:
1. Week 1-2: Set up Svelte project, migrate data models
2. Week 3-4: Migrate rendering logic to Svelte components
3. Week 5-6: Migrate event handlers, state management
4. Week 7-8: Testing, bug fixes, optimization

**Impact**: Massive improvement in all areas  
**Risk**: High (complete rewrite)

---

#### OPT-012: Implement Server-Side Rendering (SSR)
**Current**: Client-only rendering  
**Target**: Pre-render initial state on server  
**Estimated Improvement**: 
- 70% faster first contentful paint
- Better SEO
- Faster perceived load time

**Implementation**: Node.js with Express + chosen framework's SSR

**Impact**: Much better performance on initial load  
**Risk**: High (requires backend infrastructure)

---

#### OPT-013: Migrate to Database (PostgreSQL/MongoDB)
**Current**: JSON file storage (blocking I/O)  
**Target**: Proper database with indexing  
**Estimated Improvement**:
- 95% faster saves (async, indexed)
- Concurrent access support
- Transaction support

**Schema Design** (PostgreSQL):
```sql
CREATE TABLE flows (
    id UUID PRIMARY KEY,
    name VARCHAR(255),
    created_at TIMESTAMP,
    updated_at TIMESTAMP
);

CREATE TABLE nodes (
    id UUID PRIMARY KEY,
    flow_id UUID REFERENCES flows(id),
    parent_id UUID REFERENCES nodes(id),
    type VARCHAR(50), -- 'control', 'action', 'evidence'
    name TEXT,
    text TEXT,
    grade DECIMAL(3,2),
    share_key UUID,
    position INTEGER,
    tags JSONB,
    footer JSONB
);

CREATE INDEX idx_nodes_flow ON nodes(flow_id);
CREATE INDEX idx_nodes_share_key ON nodes(share_key);
CREATE INDEX idx_nodes_tags ON nodes USING GIN(tags);

CREATE TABLE executions (
    flow_id UUID REFERENCES flows(id),
    evidence_id UUID REFERENCES nodes(id),
    completed BOOLEAN,
    PRIMARY KEY (flow_id, evidence_id)
);
```

**Impact**: Production-grade scalability  
**Risk**: High (major architecture change)

---

#### OPT-014: Implement REST API with Pagination
**Current**: Load entire workflow at once  
**Target**: Paginated API endpoints  
**Estimated Improvement**: 
- 80% smaller initial payload
- Incremental loading

**API Design**:
```
GET /api/flows                    # List flows
GET /api/flows/:id                # Get flow metadata
GET /api/flows/:id/controls?page=1&limit=20  # Paginated controls
GET /api/controls/:id/actions     # Actions for control
GET /api/actions/:id/evidence     # Evidence for action
POST /api/flows/:id/controls      # Create control
PATCH /api/evidence/:id/complete  # Toggle completion
```

**Impact**: Scalable to thousands of nodes  
**Risk**: High (requires backend rewrite)

---

### Phase 4: Advanced Optimizations (Ongoing)

#### OPT-015: Implement Service Worker for Offline Mode
**Current**: Requires network connection  
**Target**: Full offline functionality  
**Estimated Improvement**: 100% availability offline

**Implementation**:
```javascript
// sw.js
self.addEventListener('install', (e) => {
    e.waitUntil(
        caches.open('workflow-v1').then((cache) => {
            return cache.addAll([
                '/',
                '/index.html',
                '/script.js',
                '/style.css',
                '/workflow.json',
                '/executions.json'
            ]);
        })
    );
});

self.addEventListener('fetch', (e) => {
    e.respondWith(
        caches.match(e.request).then((response) => {
            return response || fetch(e.request);
        })
    );
});
```

**Impact**: Works offline, faster loads  
**Risk**: Medium (cache management complexity)

---

#### OPT-016: Add Image Lazy Loading
**Current**: All images load immediately  
**Target**: Load images as they scroll into view  
**Estimated Improvement**: 60% faster page load with many images

**Implementation**:
```javascript
// Use native lazy loading
const renderImage = (url) => `<img src="${url}" loading="lazy" alt="">`;

// Or use Intersection Observer
const lazyLoad = (img) => {
    const observer = new IntersectionObserver((entries) => {
        entries.forEach((entry) => {
            if (entry.isIntersecting) {
                img.src = img.dataset.src;
                observer.unobserve(img);
            }
        });
    });
    observer.observe(img);
};
```

**Impact**: Faster initial render  
**Risk**: Very low

---

#### OPT-017: Bundle and Minify Assets
**Current**: Multiple separate files, unminified  
**Target**: Single minified bundle  
**Estimated Improvement**: 
- 70% smaller file size
- 50% fewer requests
- 40% faster load

**Tools**:
- **Vite** (modern, fast)
- **Webpack** (mature, configurable)
- **Parcel** (zero config)

**Impact**: Production-ready asset delivery  
**Risk**: Low (build process complexity)

---

#### OPT-018: Implement CDN for Static Assets
**Current**: Assets served from origin server  
**Target**: CloudFront/Cloudflare CDN  
**Estimated Improvement**: 
- 80% faster global load times
- Reduced server load

**Implementation**:
1. Upload static assets to S3/storage
2. Configure CDN distribution
3. Update URLs in HTML

**Impact**: Better global performance  
**Risk**: Low (requires CDN account)

---

#### OPT-019: Add Gzip/Brotli Compression
**Current**: No compression  
**Target**: Brotli compression  
**Estimated Improvement**: 
- 70-80% smaller file sizes
- Faster transfers

**Implementation** (.htaccess for Apache):
```apache
<IfModule mod_deflate.c>
    AddOutputFilterByType DEFLATE text/html text/css application/javascript application/json
</IfModule>

<IfModule mod_brotli.c>
    AddOutputFilterByType BROTLI_COMPRESS text/html text/css application/javascript application/json
</IfModule>
```

**Impact**: Faster downloads  
**Risk**: Very low

---

## Memory Optimization

### OPT-020: Cleanup Event Listeners
**Current**: Using delegation (good), but some direct listeners  
**Target**: Remove all direct listeners when not needed  
**Estimated Improvement**: 10-20% less memory

**Implementation**:
```javascript
const attachedListeners = new WeakMap();

const cleanupEventListeners = (element) => {
    const listeners = attachedListeners.get(element);
    if (listeners) {
        listeners.forEach(({ event, handler }) => {
            element.removeEventListener(event, handler);
        });
        attachedListeners.delete(element);
    }
};
```

**Impact**: Reduced memory leaks  
**Risk**: Low

---

### OPT-021: Destroy Quill Instances Properly
**Current**: quillEditor set to null, but not destroyed  
**Target**: Call Quill.destroy() method  
**Estimated Improvement**: 5-10 MB per modal open

**Implementation**:
```javascript
const closeModal = () => {
    if (quillEditor) {
        // Quill doesn't have destroy(), but we can clean up
        quillEditor.root.innerHTML = '';
        quillEditor = null;
    }
    modal.backdrop.classList.add('hidden');
    modal.body.innerHTML = ''; // This cleans up the editor DOM
    document.body.classList.remove('modal-open');
};
```

**Impact**: Reduced memory usage  
**Risk**: Very low

---

### OPT-022: Use Object Pooling for Nodes
**Current**: Create new objects on every render  
**Target**: Reuse objects  
**Estimated Improvement**: 30% less GC pressure

**Implementation**:
```javascript
const nodePool = [];

const getNode = () => nodePool.pop() || document.createElement('div');

const releaseNode = (node) => {
    node.innerHTML = '';
    node.className = '';
    nodePool.push(node);
};
```

**Impact**: Smoother performance, less GC  
**Risk**: Medium (requires careful management)

---

## Network Optimization

### OPT-023: Implement Differential Sync
**Current**: Save entire workflow on every save  
**Target**: Send only changes  
**Estimated Improvement**: 
- 95% smaller payloads
- 90% faster saves

**Implementation**:
```javascript
let lastSavedWorkflow = null;

const calculateDiff = (oldData, newData) => {
    // Use library like 'fast-json-patch' or 'jsondiffpatch'
    return diff(oldData, newData);
};

const saveStructure = async () => {
    const changes = calculateDiff(lastSavedWorkflow, appState.workflow);
    
    await fetch('save_workflow.php', {
        method: 'PATCH',
        body: JSON.stringify({ changes })
    });
    
    lastSavedWorkflow = JSON.parse(JSON.stringify(appState.workflow));
};
```

**Impact**: Much faster saves  
**Risk**: Medium (diff algorithm complexity)

---

### OPT-024: Add Auto-Save with Debounce
**Current**: Manual save only  
**Target**: Auto-save after 10 seconds of inactivity  
**Estimated Improvement**: Never lose work

**Implementation**:
```javascript
let autoSaveTimeout = null;
let hasUnsavedChanges = false;

const scheduleAutoSave = () => {
    clearTimeout(autoSaveTimeout);
    hasUnsavedChanges = true;
    
    autoSaveTimeout = setTimeout(() => {
        if (hasUnsavedChanges) {
            saveStructure().then(() => {
                hasUnsavedChanges = false;
            });
        }
    }, 10000); // 10 seconds
};

// Call scheduleAutoSave() after every state mutation
```

**Impact**: Better UX, data safety  
**Risk**: Low

---

## Summary of Optimization Impact

### Immediate Impact (Phase 1)
- **Initial Load**: -30% (lazy Quill, optimized CSS)
- **Render Time**: -70% (caching, debouncing, rAF)
- **Memory Usage**: -20% (cleanup)
- **Implementation Time**: 1-2 weeks

### Short-Term Impact (Phase 2)
- **Initial Load**: -60% (IndexedDB, lazy loading)
- **Render Time**: -85% (virtual scrolling, diffing)
- **Memory Usage**: -40% (pooling)
- **Implementation Time**: 2-4 weeks

### Long-Term Impact (Phase 3-4)
- **Initial Load**: -90% (SSR, CDN, compression)
- **Render Time**: -95% (framework, database)
- **Memory Usage**: -60% (proper architecture)
- **Scalability**: 100x (database, pagination)
- **Implementation Time**: 2-6 months

### Priority Ranking
1. **OPT-001** (Cache shared index) - Critical, easy
2. **OPT-002** (Debounce text) - High, easy
3. **OPT-005** (rAF) - High, easy
4. **OPT-007** (Incremental DOM) - Critical, medium
5. **OPT-006** (Virtual scrolling) - High, medium
6. **OPT-011** (Framework migration) - Critical, hard
7. **OPT-013** (Database) - Critical, hard
8. All others - Based on needs

---

## Benchmarking Strategy

### Metrics to Track
1. **Time to Interactive (TTI)**: Target < 2s
2. **First Contentful Paint (FCP)**: Target < 1s
3. **Render Time**: Target < 50ms for 50 controls
4. **Memory Usage**: Target < 100 MB for typical workflow
5. **Save Duration**: Target < 500ms

### Tools
- **Chrome DevTools Performance**: Profiling, flame graphs
- **Lighthouse**: Overall performance score
- **WebPageTest**: Real-world testing
- **Performance Observer API**: Custom metrics

**Target Performance Scores**:
- Lighthouse Performance: 90+
- First Contentful Paint: < 1.0s
- Time to Interactive: < 2.0s
- Total Blocking Time: < 200ms
