# Function Mapping and Relationships

## Complete Function Inventory

### Total Functions: 48
### Lines of Code: ~1,433 (JavaScript only)

---

## Utility Functions (Core Helpers)

### `generateId(prefix)` - Line 51
**Purpose**: Generate unique IDs for nodes  
**Parameters**: 
- `prefix` (string): Prefix for ID (e.g., 'cat', 'act', 'evi', 'flow')

**Returns**: String in format `${prefix}-${timestamp}-${random5chars}`  
**Called by**: All creation functions  
**Dependencies**: None  
**Notes**: Uses Date.now() + Math.random() - potential collision risk in rapid creation

---

### `getAbsoluteUrl(url)` - Line 54
**Purpose**: Normalize URLs to absolute format  
**Parameters**: 
- `url` (string): User-provided URL

**Returns**: Absolute URL string  
**Logic**:
- Returns 'about:blank' for empty/invalid
- Preserves 'assets/' paths
- Adds 'https://' prefix if missing

**Called by**: 
- `renderEvidenceNode()` (line 583, 584, 585)
- `showLinkModal()` (line 620, 625)

**Security Note**: Could be exploited with javascript: URLs

---

### `ensureTagsArray(node)` - Line 61
**Purpose**: Initialize tags array if missing  
**Parameters**: 
- `node` (object): Any workflow node

**Returns**: tags array reference  
**Mutates**: node.tags  
**Called by**: `renderTags()`, tag operations

---

### `nodeHasTag(node, tag)` - Line 62
**Purpose**: Check if node contains specific tag  
**Parameters**: 
- `node` (object): Workflow node
- `tag` (string): Tag to check

**Returns**: boolean  
**Called by**: `filterWorkflowByTag()` (line 347, 356, 363)

---

## Theme and Mode Management

### `applyTheme(theme)` - Line 65
**Purpose**: Apply and persist theme  
**Parameters**: 
- `theme` ('light' | 'dark')

**Side Effects**:
- Updates body class
- Updates appState.theme
- Persists to localStorage
- Triggers full render

**Called by**: 
- `toggleTheme()` (line 71)
- `initializeState()` (line 1372)

---

### `toggleTheme()` - Line 71
**Purpose**: Toggle between light and dark theme  
**Event Handler**: Bound to theme-toggle-btn  
**Calls**: `applyTheme()`

---

## Flow Management

### `getCurrentFlow()` - Line 74
**Purpose**: Get currently selected flow object  
**Returns**: Flow object or null  
**Called by**: Almost all workflow operations (~40 call sites)  
**Critical**: Central accessor for current context

---

### `getObjectByPath(path, flow)` - Line 76
**Purpose**: Navigate nested structure via path string  
**Parameters**: 
- `path` (string): Dot-notation path (e.g., "data.0.subcategories.1")
- `flow` (object): Flow object

**Returns**: Node at path or undefined  
**Algorithm**: Split path, reduce over keys  
**Performance**: O(n) where n = path depth  
**Called by**: 40+ locations throughout codebase

---

### `getParentAndKey(path, flow)` - Line 80
**Purpose**: Get parent array and index for deletion  
**Parameters**: 
- `path` (string): Dot-notation path
- `flow` (object): Flow object

**Returns**: `{ parent: array, key: number }`  
**Called by**: `delete-node` action (line 869)

---

## Execution State Management

### `ensureExecFlow(flowId)` - Line 87
**Purpose**: Lazy initialize execution state for flow  
**Parameters**: 
- `flowId` (string): Flow identifier

**Returns**: Execution object `{ completed: {} }`  
**Mutates**: appState.executions.flows  
**Called by**: All execution state accessors

---

### `setCompleted(flowId, evidenceId, value)` - Line 93
**Purpose**: Set completion state for evidence  
**Parameters**: 
- `flowId` (string)
- `evidenceId` (string)
- `value` (boolean)

**Side Effects**: Updates appState.executions  
**Called by**: 
- Toggle complete handler (line 926)
- Shared execution propagation (line 124)
- Distribution functions (lines 1214, 1242, 1265)

---

### `getCompleted(flowId, evidenceId, fallback)` - Line 97
**Purpose**: Get completion state with fallback  
**Parameters**: 
- `flowId` (string)
- `evidenceId` (string)
- `fallback` (boolean): Default if not found

**Returns**: boolean  
**Called by**: 
- `renderEvidenceNode()` (line 537)
- `calculateActionProgress()` (line 425)

---

### `sharedEvidenceIndex()` - Line 104
**Purpose**: Build index of all evidence by shareKey  
**Returns**: `Map<shareKey, [{flowId, evidenceId}]>`  
**Algorithm**: Triple nested loop over all flows/controls/actions/evidence  
**Performance**: O(n³) where n = avg nodes per level  
**Called by**: 
- `propagateSharedExecution()` (line 121)
- Distribution functions

**⚠️ Performance Warning**: Rebuilds entire index on every call

---

### `propagateSharedExecution(shareKey, value)` - Line 119
**Purpose**: Sync execution state across shared evidence  
**Parameters**: 
- `shareKey` (string): Shared identifier
- `value` (boolean): Completion state

**Calls**: `sharedEvidenceIndex()`, `setCompleted()`  
**Called by**: Toggle complete handler (line 928)

---

### `reconcileAllExecutions()` - Line 129
**Purpose**: Remove orphaned execution states  
**Algorithm**: 
1. Collect all valid evidence IDs
2. Delete execution entries not in set

**Performance**: O(n) where n = total evidence  
**Called by**: 
- Structure deletion (line 213)
- After structure changes

---

### `reconcileExecution(flowId)` - Line 164
**Purpose**: Reconcile single flow execution state  
**Parameters**: 
- `flowId` (string)

**Similar to**: `reconcileAllExecutions()` but scoped  
**Called by**: 
- Delete node (line 875)
- `initializeState()` (line 1382)

---

### `initializeSharedExecutionFromSource(newFlowId, srcFlowId)` - Line 145
**Purpose**: Copy execution state when creating shared flow  
**Parameters**: 
- `newFlowId` (string): New flow ID
- `srcFlowId` (string): Source flow ID

**Algorithm**: 
1. Find matching evidence by shareKey
2. Copy completion states

**Called by**: New flow creation (line 1340)

---

## Sharing and Propagation

### `setShareKeyDeep(node, shareKey)` - Line 175
**Purpose**: Recursively set shareKey on node tree  
**Parameters**: 
- `node` (object): Root node
- `shareKey` (string): Key to set

**Mutates**: node and all descendants  
**Called by**: 
- Import modal (lines 1105, 1118)
- New flow creation (line 1329)

---

### `propagateSharedEdit(editedNode, level)` - Line 179
**Purpose**: Sync edits across all shared instances  
**Parameters**: 
- `editedNode` (object): Modified node
- `level` ('control' | 'action' | 'evidence')

**Fields Synced**:
- Control/Action: name, text, tags
- Evidence: name, text, tags, grade

**Algorithm**: Iterate all flows, find matching shareKey, copy fields  
**Called by**: 
- Edit name (line 866)
- Text edit (line 951)
- Tag operations (line 970)
- Grade change (line 937)

**⚠️ Note**: Shallow copy - nested objects not synced

---

### `propagateSharedDelete(shareKey, level)` - Line 199
**Purpose**: Delete shared nodes across all flows  
**Parameters**: 
- `shareKey` (string)
- `level` ('control' | 'action' | 'evidence')

**Side Effects**: 
- Filters out matching nodes
- Calls `reconcileAllExecutions()`

**Called by**: Delete node action (line 874)

---

## Server I/O Functions

### `loadAll()` - Line 217 (async)
**Purpose**: Initial data load from server  
**Calls**: 
- `fetch('workflow.json')`
- `fetch('executions.json')`

**Side Effects**:
- Populates appState.workflow
- Populates appState.executions
- Handles legacy migration
- Calls `initializeState()`
- Calls `render()`

**Error Handling**: Catches and displays error message  
**Migration Logic** (lines 227-237): Converts old single-flow format to multi-flow

---

### `saveStructure()` - Line 257 (async)
**Purpose**: Save workflow structure to server  
**Method**: POST to save_workflow.php  
**UI Feedback**: 
- Loading spinner
- Success checkmark (1.2s)
- Error warning (1.6s)

**Error Handling**: Try-catch with UI notification

---

### `saveExecution()` - Line 278 (async)
**Purpose**: Save execution state to server  
**Method**: POST to save_executions.php  
**Similar to**: `saveStructure()`

---

## Modal System

### `openModal(title, body, onOpen)` - Line 301
**Purpose**: Display modal dialog  
**Parameters**: 
- `title` (string): Modal title
- `body` (string): HTML content
- `onOpen` (function): Callback after modal opens

**Side Effects**:
- Sets modal content
- Shows backdrop
- Adds body class 'modal-open'
- Executes callback

**Called by**: 15+ dialog functions

---

### `closeModal()` - Line 308
**Purpose**: Hide modal and cleanup  
**Side Effects**:
- Hides backdrop
- Clears content
- Removes body class
- Destroys quillEditor instance

**Called by**: 
- Close button (line 1427)
- Backdrop click (line 1428)
- Form submissions

---

## Rendering Functions

### `render()` - Line 375 ⭐ CRITICAL
**Purpose**: Main render function - rebuilds entire UI  
**Algorithm**:
1. Update body classes (mode, theme)
2. Populate flow selector
3. Update mode switch
4. Update tag filter banner
5. Apply tag filter (if activeTag)
6. Build control nodes
7. Append to DOM

**Performance**: O(n) where n = total nodes  
**Called by**: Almost every state mutation (~60 call sites)

**⚠️ Performance Issue**: Full DOM rebuild on every change

---

### `renderControlNode(control, path, isFiltered, flow)` - Line 437
**Purpose**: Render single control with actions and evidence  
**Returns**: DOM element  
**Creates**: 
- Control header
- Tags
- Progress bar
- Action panel
- Evidence panel

**Called by**: `render()` (line 416)

---

### `renderActionPanel(control, controlPath, isFiltered, flow)` - Line 470
**Purpose**: Render action register (left panel)  
**Returns**: HTML string  
**Creates**:
- Action items with selection state
- Progress bars
- Validation errors
- Tags

**Called by**: `renderControlNode()` (line 465)

---

### `renderEvidencePanel(controlFilteredOrFull, controlPath, isFiltered, flow)` - Line 503
**Purpose**: Render evidence register (right panel)  
**Returns**: HTML string  
**Logic**: Finds selected action, renders its evidence  
**Called by**: `renderControlNode()` (line 465)

---

### `renderEvidenceNode(node, path)` - Line 536
**Purpose**: Render single evidence item  
**Returns**: HTML string  
**Creates**:
- Checkbox (execution mode)
- Name with completion styling
- Grade selector
- Description textarea/text
- Tags
- Footer items
- Attachment controls

**Called by**: `renderEvidencePanel()` (line 530)

---

### `renderTags(node, path, flow)` - Line 316
**Purpose**: Render tag chips with add/delete  
**Returns**: HTML string  
**Behavior**:
- Creation mode: Tags with delete buttons + add input
- Execution mode: Clickable tags for filtering

**Called by**: 
- `renderControlNode()` (line 461)
- `renderActionPanel()` (line 480)
- `renderEvidenceNode()` (line 557)

---

### `renderModalList(items, path, type)` - Line 640
**Purpose**: Render list of attachments in modal  
**Parameters**: 
- `items` (array): Links, images, notes, or comments
- `path` (string): Node path
- `type` (string): 'link' | 'image' | 'note' | 'comment'

**Returns**: HTML string  
**Called by**: `showManagementModal()` (lines 663-666)

---

## Progress Calculation

### `calculateActionProgress(action)` - Line 421
**Purpose**: Calculate completion percentage for action  
**Algorithm**:
1. Sum total grades
2. Sum completed grades
3. Return percentage

**Returns**: `{ percent: number, totalGrade: number }`  
**Called by**: 
- `calculateControlProgress()` (line 433)
- `renderActionPanel()` (line 477)

---

### `calculateControlProgress(control)` - Line 431
**Purpose**: Calculate average progress across actions  
**Returns**: number (0-100)  
**Called by**: `renderControlNode()` (line 445)

---

## Filtering

### `copyActionWithAllEvidencePaths(action, actPath)` - Line 332
**Purpose**: Deep copy action with path metadata  
**Parameters**: 
- `action` (object)
- `actPath` (string): Original path

**Returns**: New object with `_path` properties  
**Purpose**: Preserve original paths during filtering  
**Called by**: `filterWorkflowByTag()` (line 349)

---

### `filterWorkflowByTag(data, tag, basePath)` - Line 342
**Purpose**: Filter workflow by tag with hierarchical inheritance  
**Algorithm**:
1. If control has tag → include all children
2. Else if action has tag → include all evidence
3. Else include only tagged evidence

**Returns**: Filtered controls array with `_path` metadata  
**Called by**: `render()` (line 404)

**Key Feature**: Preserves original paths for correct mutations

---

## Execution Locking

### `updateAllExecutionStates(flow)` - Line 596
**Purpose**: Calculate lock/active states for sequential enforcement  
**Algorithm**:
1. If enforceSequence disabled → unlock all
2. Find first incomplete evidence per action
3. Mark as active, lock all after it

**Side Effects**: Sets `isLocked` and `isActive` flags  
**Called by**: 
- Multiple places after state changes
- `initializeState()` (line 1381)

---

## Attachment Viewers

### `showLinkModal(path, index)` - Line 617
**Purpose**: Display link in sandboxed iframe  
**Creates**:
- Iframe with link
- "Open in new tab" button

**Security**: Uses `sandbox="allow-scripts allow-same-origin"`

---

### `showViewOnlyModal(path, type)` - Line 630
**Purpose**: Display images or comments in modal  
**Types**: 
- 'images': Gallery grid
- 'comments': List

**Called by**: Footer item clicks (lines 584, 587)

---

### `showManagementModal(path)` - Line 660
**Purpose**: Manage all attachments for evidence  
**Displays**: Links, images, notes, comments with edit/delete  
**Called by**: Manage button (line 574)

---

### `showAddAttachmentModal(path, type)` - Line 669
**Purpose**: Form to add new attachment  
**Types**: link, image, comment, note  
**Special**: Initializes Quill editor for notes

---

## Global Filter

### `openGlobalTagFilter()` - Line 688
**Purpose**: Cross-flow tag filtering interface  
**Features**:
- Flow selection (checkboxes)
- Tag autocomplete (datalist)
- Live tag suggestions

**Calls**: `runGlobalFilter()` on submit

---

### `runGlobalFilter(flowIds, tags)` - Line 753
**Purpose**: Execute global tag search  
**Algorithm**:
1. Iterate selected flows
2. Find all nodes with any specified tag
3. Group by shareKey or id
4. Display results with flow names

**Returns**: Nothing (updates modal DOM)

---

## Event Handlers

### `handleAppClick(e)` - Line 800 ⭐ CRITICAL
**Purpose**: Central click event handler (delegation)  
**Algorithm**:
1. Find closest `[data-action]` element
2. Extract action, path, index, type, level
3. Route to specific handler
4. Call `updateAllExecutionStates()`
5. Call `render()`

**Handles 20+ actions**:
- add-category, add-action, add-evidence
- edit-name, delete-node
- select-action
- import-node
- add-attachment, manage-attachments
- show-link-in-modal, show-image-in-modal, show-note-content
- show-view-modal
- cancel-modal
- delete-tag, filter-by-tag, clear-tag-filter

**Security Gate** (line 813-825): Blocks creation actions in execution mode

---

### `handleAppChange(e)` - Line 917
**Purpose**: Handle input change events (checkboxes, selects)  
**Handles**:
- toggle-complete: Checkbox state
- change-grade: Grade selector

**Calls**: `propagateSharedExecution()` for shared evidence

---

### Text Edit Handler - Line 943
**Purpose**: Handle textarea input for evidence descriptions  
**Listens**: 'input' event  
**Updates**: node.text  
**Propagates**: Via `propagateSharedEdit()`

---

### Tag Add Handler - Line 955
**Purpose**: Handle Enter key in tag input  
**Listens**: 'keydown' event  
**Validates**: Non-empty, no duplicates  
**Propagates**: Via `propagateSharedEdit()`

---

### Attachment Form Handler - Line 976
**Purpose**: Handle attachment form submissions  
**Types**: link, image, comment, note  
**Special**: Extracts Quill HTML for notes

---

### Modal List Edit/Delete Handler - Line 1005
**Purpose**: Handle edit/delete in attachment modal  
**Actions**: 
- delete-link, delete-image, delete-comment, delete-note
- edit-link, edit-image, edit-comment, edit-note

**Special**: Opens sub-modal for note editing

---

### Note Edit Form Handler - Line 1046
**Purpose**: Handle note editing form submission  
**Updates**: note title and content  
**Refreshes**: Management modal

---

## Import/Clone/Share

### `openImportModal(targetPath, level)` - Line 1062
**Purpose**: UI to import nodes from other flows  
**Levels**: 
- 'action': Import actions from control
- 'evidence': Import evidence from action

**Modes**:
- Clone: Copy with new IDs
- Share: Copy with shareKey sync

**Called by**: import-node action (line 883)

---

### `openDistributeNewNodeModal({node, level, flow, parentPath})` - Line 1130
**Purpose**: Distribute newly created node to other flows  
**Called by**: 
- add-category (line 838)
- add-action (line 846)
- add-evidence (line 859)

**Algorithm**:
1. Select target flows
2. Choose copy vs share
3. Find parent nodes in targets by shareKey or name
4. Insert node with appropriate IDs/shareKeys
5. Copy execution states for shared nodes

**Complex Logic**: Lines 1159-1269 handle hierarchical parent matching

---

## Flow Management Functions

### `openNewFlowModal()` - Line 1281
**Purpose**: Create new flow dialog  
**Modes**:
- Empty flow
- Clone existing (new IDs)
- Share existing (preserve shareKeys)

**Special**: Initializes execution state for shared flows (line 1340)

---

### `renameCurrentFlow()` - Line 1348
**Purpose**: Rename current flow  
**Guard**: Creation mode only

---

### `deleteCurrentFlow()` - Line 1356
**Purpose**: Delete current flow  
**Guard**: Creation mode only  
**Cleanup**: Removes execution state

---

## Initialization

### `initializeState()` - Line 1369
**Purpose**: Initialize app after data load  
**Steps**:
1. Load theme from localStorage
2. Load mode from localStorage
3. Update execution states
4. Reconcile execution
5. Initial render

**Called by**: `loadAll()` (line 250)

---

## Top-Level Event Binding

### Lines 1387-1431
**Event Listeners**:
- Theme toggle button → `toggleTheme()`
- Mode switch → Update mode, localStorage, render
- Enforce sequence checkbox → Update setting, render
- Save buttons → `saveStructure()` / `saveExecution()`
- Flow selector → Switch flow, clear activeTag, render
- Flow management buttons → new/rename/delete
- Global filter button → `openGlobalTagFilter()`
- Tag filter clear → Clear activeTag, render
- Document clicks → `handleAppClick()`
- Document changes → `handleAppChange()`
- Modal close button → `closeModal()`
- Backdrop click → `closeModal()`

**Final Call**: `loadAll()` (line 1431)

---

## Function Dependency Graph (Critical Paths)

### Render Path
```
User Action
  → handleAppClick/handleAppChange
    → State mutation
      → updateAllExecutionStates()
      → render()
        → renderControlNode()
          → renderActionPanel()
          → renderEvidencePanel()
            → renderEvidenceNode()
```

### Save Path
```
User clicks Save
  → saveStructure() / saveExecution()
    → fetch() to PHP
      → file_put_contents()
        → JSON file updated
```

### Load Path
```
DOMContentLoaded
  → loadAll()
    → fetch() workflow.json + executions.json
      → appState populated
        → initializeState()
          → render()
```

### Shared Edit Path
```
User edits shared node
  → handleAppClick('edit-name')
    → node.name = newValue
      → propagateSharedEdit(node, level)
        → Iterate all flows
          → Find matching shareKey
            → Object.assign(fields)
      → render()
```

---

## Performance Hotspots

1. **render()** (line 375): Full DOM rebuild - O(n)
2. **sharedEvidenceIndex()** (line 104): O(n³) rebuild
3. **filterWorkflowByTag()** (line 342): O(n³) with deep copy
4. **propagateSharedEdit()** (line 179): O(n²) iteration
5. **openDistributeNewNodeModal()** (line 1130): Complex O(n³) matching

---

## Missing Functions (Opportunities)

1. **Export**: No export to PDF/Excel/JSON
2. **Import**: No bulk import from CSV/Excel
3. **Search**: No text search across nodes
4. **History**: No undo/redo
5. **Validation**: No form validation
6. **Sanitization**: No XSS protection
7. **Debouncing**: No input debouncing
8. **Caching**: No computed value caching
9. **Pagination**: No virtual scrolling
10. **Offline**: No ServiceWorker/offline mode
