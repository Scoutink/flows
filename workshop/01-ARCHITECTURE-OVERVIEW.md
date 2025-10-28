# Architecture Overview - Compliance Workflow Manager v6.1

## Executive Summary
This POC is a **Single-Page Application (SPA)** for managing compliance workflows using an Action and Evidence Register model. It supports multi-flow management with sharing/cloning capabilities, dual operating modes (creation/execution), and real-time state persistence.

---

## Technology Stack

### Frontend
- **Vanilla JavaScript (ES6+)**: No frameworks, pure DOM manipulation
- **Quill.js v1.3.6**: Rich text editor for notes
- **Font Awesome 6.4.0**: Icon library
- **Custom CSS**: CSS variables for theming

### Backend
- **PHP 7.x+**: Server-side persistence layer
- **JSON Files**: File-based data storage
  - `workflow.json`: Structure/creation data
  - `executions.json`: Execution state data

### Architecture Pattern
**Client-Heavy MVC**:
- **Model**: JSON data structures (workflow, executions, appState)
- **View**: DOM rendering functions
- **Controller**: Event handlers and state mutations

---

## Application Layers

```
┌─────────────────────────────────────────┐
│         User Interface (HTML/CSS)       │
│  - Top Bar (Header, Controls, Mode)    │
│  - Workflow Display (Dynamic Render)   │
│  - Modal System                         │
└─────────────────────────────────────────┘
                    │
                    ▼
┌─────────────────────────────────────────┐
│      State Management (JavaScript)       │
│  - appState (central state object)      │
│  - Event Handlers                        │
│  - Render Engine                         │
└─────────────────────────────────────────┘
                    │
                    ▼
┌─────────────────────────────────────────┐
│      Data Persistence (PHP + JSON)       │
│  - save_workflow.php                     │
│  - save_executions.php                   │
│  - workflow.json                         │
│  - executions.json                       │
└─────────────────────────────────────────┘
```

---

## Data Model Hierarchy

### Structure (workflow.json)
```
Workflow (Root)
├── settings
│   └── enforceSequence: boolean
└── flows[] (Multiple flows)
    ├── id: string
    ├── name: string
    └── data[] (Controls)
        ├── id: string
        ├── name: string
        ├── text: string
        ├── tags: string[]
        ├── shareKey?: string
        └── subcategories[] (Actions)
            ├── id: string
            ├── name: string
            ├── text: string
            ├── tags: string[]
            ├── shareKey?: string
            └── subcategories[] (Evidence)
                ├── id: string
                ├── name: string
                ├── text: string
                ├── grade: number (0.5-5.0)
                ├── completed: boolean (legacy)
                ├── tags: string[]
                ├── shareKey?: string
                └── footer
                    ├── links[]
                    ├── images[]
                    ├── notes[]
                    └── comments[]
```

### Execution State (executions.json)
```
Executions
└── flows{}
    └── [flowId]
        └── completed{}
            └── [evidenceId]: boolean
```

---

## Key Design Patterns

### 1. **Path-Based Object Navigation**
- Uses dot-notation paths (e.g., `"data.0.subcategories.1.subcategories.2"`)
- Functions: `getObjectByPath()`, `getParentAndKey()`
- Enables deep nested structure traversal

### 2. **Share Key Propagation**
- Nodes can share structure across flows via `shareKey`
- Edits to shared nodes propagate to all instances
- Execution states can be synchronized across shared evidence

### 3. **Dual-Mode Operation**
- **Creation Mode**: Structure editing, CRUD operations
- **Execution Mode**: Task completion, read-only structure
- CSS-based visibility control (`.creation-only`, `.execution-only`)

### 4. **Tag-Based Filtering**
- Per-flow filtering (activeTag)
- Cross-flow global filtering (Global Filter modal)
- Hierarchical tag inheritance (if parent has tag, show all children)

### 5. **Sequential Execution Locking**
- Optional enforcement of evidence completion order
- `isLocked`, `isActive` flags control UI state
- Calculated dynamically via `updateAllExecutionStates()`

### 6. **Modal-Based UI**
- Single modal system for all dialogs
- Dynamic content injection
- Quill editor integration for rich text

---

## State Management

### Central State Object (`appState`)
```javascript
{
    theme: 'light' | 'dark',
    currentMode: 'creation' | 'execution',
    workflow: {
        settings: { enforceSequence: boolean },
        flows: [...]
    },
    executions: {
        flows: { [flowId]: { completed: {...} } }
    },
    currentFlowId: string,
    selectedActionPaths: { [controlPath]: actionPath },
    expandedTextAreas: Set<string>,
    activeTag: string | null,
    quillEditor: Quill | null
}
```

### State Persistence
- **LocalStorage**: Theme and mode preferences
- **Server (JSON)**: Workflow structure and execution state
- **No session management**: Pure stateless backend

---

## Rendering Strategy

### Full Re-render on State Change
- Every state mutation triggers `render()`
- Entire workflow DOM is rebuilt from scratch
- Simple but potentially inefficient for large datasets
- No virtual DOM or diffing algorithm

### Rendering Pipeline
1. Update body classes (mode, theme)
2. Populate flow selector
3. Apply tag filters (if activeTag set)
4. Build control nodes recursively
5. Calculate progress bars
6. Attach event listeners (via delegation)

---

## Security Considerations

### Current Implementation
- ⚠️ **No authentication/authorization**
- ⚠️ **No input validation** (server-side)
- ⚠️ **No CSRF protection**
- ⚠️ **No SQL injection risk** (JSON file storage)
- ✅ **XSS mitigation**: innerHTML used but content is user-controlled (needs sanitization)
- ✅ **Sandboxed iframes**: Links opened with `sandbox` attribute

### Recommended Security Enhancements
1. Add user authentication
2. Implement CSRF tokens
3. Sanitize all user inputs (DOMPurify)
4. Add server-side validation
5. Implement access control per flow

---

## Performance Characteristics

### Bottlenecks
1. **Full DOM rebuild** on every render
2. **No pagination** for large datasets
3. **Synchronous file I/O** in PHP
4. **No caching layer**
5. **Linear search** for object path resolution

### Current Performance Profile
- **Acceptable**: <50 controls, <500 evidence items
- **Degraded**: 50-100 controls
- **Poor**: >100 controls or >1000 evidence items

---

## Browser Compatibility

### Required Features
- ES6 (arrow functions, template literals, destructuring)
- Fetch API
- LocalStorage
- CSS Variables
- Flexbox & Grid

### Minimum Versions
- Chrome 51+
- Firefox 54+
- Safari 10+
- Edge 15+
- **No IE11 support**

---

## Deployment Architecture

```
User Browser ──HTTP──> Web Server (Apache/Nginx)
                           │
                           ├──> index.html
                           ├──> script.js
                           ├──> style.css
                           │
                           ├──> save_workflow.php ──> workflow.json
                           └──> save_executions.php ──> executions.json
```

### File Permissions Required
- `workflow.json`: 644 (rw-r--r--)
- `executions.json`: 644 (rw-r--r--)
- Web server write access to JSON files

---

## Extensibility Points

### Easy to Extend
1. **New attachment types**: Add to footer structure
2. **New themes**: Add CSS variables
3. **New node levels**: Extend subcategories pattern
4. **Export formats**: Add client-side generation

### Hard to Extend
1. **Real-time collaboration**: Requires WebSocket architecture
2. **Undo/Redo**: No command pattern implemented
3. **Offline mode**: No ServiceWorker/IndexedDB
4. **Large datasets**: Needs pagination/virtualization

---

## Next Steps for Production

1. **Authentication**: Implement user system
2. **Database**: Migrate from JSON to SQL/NoSQL
3. **API Layer**: RESTful API with versioning
4. **Testing**: Unit tests, integration tests, E2E tests
5. **Optimization**: Virtual scrolling, incremental rendering
6. **Validation**: Schema validation (JSON Schema)
7. **Audit Log**: Track all changes with timestamps
8. **Backup**: Automated backups of workflow data
