# Data Flow Analysis

## Application Data Flows

### 1. Initial Load Flow

```
Browser Request
    ↓
index.html loaded
    ↓
script.js loaded
    ↓
DOMContentLoaded event
    ↓
loadAll() called
    ↓
┌────────────────────────┐
│ Parallel Fetch Requests│
├────────────────────────┤
│ workflow.json          │
│ executions.json        │
└────────────────────────┘
    ↓
JSON parsed
    ↓
Legacy migration check
    ↓
appState populated
    ↓
initializeState()
    ├─ Load localStorage (theme, mode)
    ├─ Apply theme
    ├─ Update execution states
    └─ reconcileExecution()
    ↓
render()
    ↓
UI displayed
```

**Timing**: ~200-500ms on average  
**Failure Point**: Missing workflow.json shows error message  
**Optimization**: Could add loading skeleton

---

### 2. User Edit Flow (Creation Mode)

```
User clicks edit button
    ↓
handleAppClick() catches event
    ↓
Extract data-action, data-path
    ↓
Route to specific handler
    ↓
Example: 'edit-name' action
    ↓
prompt() dialog
    ↓
User enters new name
    ↓
node.name = newValue
    ↓
Check if node has shareKey
    ↓
YES → propagateSharedEdit()
    ├─ Iterate all flows
    ├─ Find nodes with matching shareKey
    └─ Copy fields (name, text, tags, grade)
    ↓
updateAllExecutionStates(flow)
    ├─ Calculate isLocked/isActive
    └─ Update flags on evidence nodes
    ↓
render()
    ├─ Rebuild entire DOM
    └─ Re-attach event listeners (via delegation)
    ↓
UI updated
```

**Timing**: ~50-200ms depending on flow size  
**Issue**: No optimistic UI update  
**Issue**: Prompt blocks rendering

---

### 3. Execution Flow (Checkbox Toggle)

```
User clicks evidence checkbox
    ↓
handleAppChange() catches event
    ↓
action = 'toggle-complete'
    ↓
Get node via getObjectByPath()
    ↓
setCompleted(flowId, evidenceId, checked)
    ├─ Ensure exec flow exists
    └─ Set completed[evidenceId] = value
    ↓
Check if node has shareKey
    ↓
YES → propagateSharedExecution()
    ├─ Build sharedEvidenceIndex()
    │   └─ O(n³) iteration of all nodes
    ├─ Get all evidence with same shareKey
    └─ Update completed state for all
    ↓
updateAllExecutionStates(flow)
    ├─ Iterate all actions
    ├─ Find first incomplete evidence
    └─ Set isLocked/isActive flags
    ↓
render()
    ├─ Recalculate progress bars
    ├─ Update checkbox states
    └─ Update lock/active styling
    ↓
UI updated
```

**Timing**: ~100-300ms (includes sharedEvidenceIndex rebuild)  
**Performance Issue**: sharedEvidenceIndex() called on every toggle  
**Optimization**: Could cache index and invalidate on structure changes

---

### 4. Save Flow

```
User clicks "Save Structure" button
    ↓
saveStructure() called
    ↓
Validate appState.currentMode === 'creation'
    ↓
Update button UI (spinner)
    ↓
fetch('save_workflow.php', {
    method: 'POST',
    body: JSON.stringify(appState.workflow)
})
    ↓
Server receives request
    ↓
save_workflow.php
    ├─ Validate JSON
    ├─ Pretty print
    └─ file_put_contents('workflow.json')
    ↓
Server responds with JSON
    {"status": "success", "message": "..."}
    ↓
Client receives response
    ↓
Update button UI (checkmark)
    ↓
setTimeout 1200ms
    ↓
Reset button UI
```

**Timing**: ~100-500ms depending on file size and server  
**No render**: Save doesn't trigger re-render (correct)  
**Issue**: No conflict detection (optimistic locking)

---

### 5. Tag Filter Flow

```
User clicks tag in execution mode
    ↓
handleAppClick() catches event
    ↓
action = 'filter-by-tag'
    ↓
appState.activeTag = tag
    ↓
render()
    ↓
filterWorkflowByTag(rawData, tag)
    ├─ Create empty filteredControls array
    ├─ Iterate controls
    │   ├─ Check if control has tag
    │   │   YES → Include all actions/evidence
    │   │   NO → Continue
    │   ├─ Iterate actions
    │   │   ├─ Check if action has tag
    │   │   │   YES → Include all evidence
    │   │   │   NO → Continue
    │   │   └─ Iterate evidence
    │   │       └─ Check if evidence has tag
    │   │           YES → Include
    │   └─ copyActionWithAllEvidencePaths()
    │       └─ Preserve original paths with _path
    └─ Return filtered array
    ↓
Render only filtered nodes
    ↓
Tag filter banner shown
    ↓
UI updated
```

**Timing**: ~50-200ms depending on data size  
**Key Feature**: Preserves original paths for correct mutations  
**Issue**: No URL parameter for shareable filtered views

---

### 6. Multi-Flow Creation Flow

```
User clicks "New Flow"
    ↓
openNewFlowModal()
    ↓
Display form with:
    ├─ Flow name input
    ├─ Mode radio buttons (empty/clone/share)
    └─ Source flow selector
    ↓
User fills form and submits
    ↓
Form submit handler
    ↓
Get mode (empty/clone/share)
    ↓
mode === 'clone'
    ├─ Deep copy source flow data
    ├─ Generate new IDs for all nodes
    │   ├─ Control IDs
    │   ├─ Action IDs
    │   └─ Evidence IDs
    └─ Delete all shareKeys
    ↓
mode === 'share'
    ├─ Deep copy source flow data
    ├─ Preserve IDs
    ├─ Set shareKey on all nodes
    │   └─ Use existing shareKey or node.id
    └─ initializeSharedExecutionFromSource()
        ├─ Find matching evidence by shareKey
        └─ Copy completion states
    ↓
mode === 'empty'
    └─ Create flow with empty data array
    ↓
Push new flow to appState.workflow.flows
    ↓
Set currentFlowId to new flow
    ↓
closeModal()
    ↓
render()
    ↓
New flow displayed
```

**Complexity**: High (especially share mode)  
**Issue**: No validation for duplicate flow names  
**Feature**: Execution state inheritance for shared flows

---

### 7. Global Tag Filter Flow

```
User clicks "Global Filter"
    ↓
openGlobalTagFilter()
    ↓
Display modal with:
    ├─ Flow checkboxes (all checked)
    ├─ Tag input with autocomplete
    └─ Submit button
    ↓
User types in tag input
    ↓
'input' event fires
    ↓
refreshDatalist() called
    ├─ Get checked flows
    ├─ collectTags() for those flows
    │   └─ Triple nested iteration
    ├─ Parse last token from comma-separated
    ├─ Filter tags containing token
    └─ Populate datalist options
    ↓
User submits form
    ↓
runGlobalFilter(flowIds, tags)
    ├─ Create results Map
    ├─ Iterate selected flows
    │   └─ For each control/action/evidence
    │       ├─ Check if tags match
    │       │   YES → Add to results
    │       │       ├─ Key by shareKey or id
    │       │       └─ Track flow names
    │       └─ Handle hierarchical matching
    │           ├─ Control match → include actions/evidence
    │           └─ Action match → include evidence
    └─ Display results in modal
        └─ Show node label + flows it appears in
```

**Performance**: O(n³) worst case  
**Feature**: Deduplicates by shareKey  
**Issue**: Results not actionable (no navigation)

---

### 8. Attachment Management Flow

```
User clicks "Add Link" button
    ↓
handleAppClick() catches event
    ↓
action = 'add-attachment', type = 'link'
    ↓
showAddAttachmentModal(path, type)
    ↓
Display form:
    ├─ URL input
    └─ Link text input
    ↓
User fills and submits
    ↓
Form submit handler (line 976)
    ↓
Extract values
    ↓
Get node via getObjectByPath()
    ↓
Ensure node.footer exists
    ↓
Push to node.footer.links[]
    ↓
closeModal()
    ↓
render()
    ↓
Link appears in footer
    ↓
User clicks link in footer
    ↓
action = 'show-link-in-modal'
    ↓
showLinkModal(path, index)
    ↓
Get link from node.footer.links[index]
    ↓
Display modal with:
    ├─ Sandboxed iframe
    └─ "Open in new tab" link
```

**Security**: Iframe sandbox protects against malicious content  
**Issue**: No validation for URL format  
**Issue**: No HTTPS enforcement

---

### 9. Import/Distribution Flow

```
User clicks "Clone/Share" button on control
    ↓
action = 'import-node', level = 'action'
    ↓
openImportModal(targetPath, level)
    ↓
Build list of source nodes:
    ├─ level = 'action' → all controls from all flows
    └─ level = 'evidence' → all actions from all flows
    ↓
Display form:
    ├─ Source selector dropdown
    └─ Mode radio (clone/share)
    ↓
User selects and submits
    ↓
Get target node (control or action)
    ↓
Get source node subcategories
    ↓
For each subcategory:
    ├─ Deep copy node
    ├─ mode === 'clone'
    │   ├─ Generate new IDs
    │   └─ Delete shareKeys
    └─ mode === 'share'
        └─ Set shareKey (existing or node.id)
    ↓
Push to target.subcategories
    ↓
closeModal()
    ↓
render()
```

**Use Case**: Reuse structures across flows  
**Complexity**: Medium  
**Issue**: No duplicate detection

---

### 10. Sequential Execution Lock Flow

```
User completes evidence
    ↓
setCompleted(flowId, evidenceId, true)
    ↓
updateAllExecutionStates(flow) called
    ↓
Get enforceSequence setting
    ↓
enforceSequence === false
    └─ Set all isLocked = false, isActive = false
    ↓
enforceSequence === true
    ├─ For each action in flow:
    │   ├─ foundFirstIncomplete = false
    │   └─ For each evidence:
    │       ├─ Get completion state
    │       ├─ If !done && !foundFirstIncomplete
    │       │   ├─ Set isLocked = false
    │       │   ├─ Set isActive = true
    │       │   └─ foundFirstIncomplete = true
    │       └─ Else
    │           ├─ Set isActive = false
    │           └─ Set isLocked = foundFirstIncomplete
    ↓
render()
    ├─ Apply .locked class (opacity 0.6, pointer-events none)
    └─ Apply .active class (border glow)
```

**Purpose**: Force evidence completion order  
**UI Effect**: Visual lock and disable interactions  
**Issue**: Lock can be bypassed by toggling enforceSequence

---

### 11. Shared Structure Edit Propagation

```
User edits evidence grade in Flow A
    ↓
handleAppChange() catches event
    ↓
action = 'change-grade'
    ↓
node.grade = parseFloat(value)
    ↓
propagateSharedEdit(node, 'evidence')
    ↓
Check if node.shareKey exists
    ↓
Iterate all flows:
    └─ For each control:
        └─ For each action:
            └─ For each evidence:
                ├─ If shareKey matches
                │   └─ Object.assign(evidence, {
                │       name: node.name,
                │       text: node.text,
                │       tags: node.tags,
                │       grade: node.grade
                │     })
    ↓
render()
    ↓
Grade updated in all flows
```

**Propagation Fields**:
- Control: name, text, tags
- Action: name, text, tags  
- Evidence: name, text, tags, grade

**NOT Propagated**:
- IDs (always unique per flow)
- Completion states (managed separately)
- Footer attachments (flow-specific)

**Issue**: Shallow copy - nested objects not synced

---

## State Management Details

### appState Structure (Runtime)
```javascript
{
    // UI Preferences (persisted to localStorage)
    theme: 'light' | 'dark',
    currentMode: 'creation' | 'execution',
    
    // Structure Data (persisted to workflow.json)
    workflow: {
        settings: {
            enforceSequence: boolean
        },
        flows: [
            {
                id: string,
                name: string,
                data: [
                    {
                        id: string,
                        name: string,
                        text: string,
                        tags: string[],
                        shareKey?: string,
                        subcategories: [
                            {
                                id: string,
                                name: string,
                                text: string,
                                tags: string[],
                                shareKey?: string,
                                completed: boolean, // legacy
                                subcategories: [
                                    {
                                        id: string,
                                        name: string,
                                        text: string,
                                        grade: number,
                                        completed: boolean, // legacy
                                        tags: string[],
                                        shareKey?: string,
                                        footer: {
                                            links: [{url, text}],
                                            images: [string],
                                            notes: [{title, content}],
                                            comments: [string]
                                        },
                                        subcategories: [], // unused
                                        // Runtime flags (not persisted)
                                        isLocked?: boolean,
                                        isActive?: boolean
                                    }
                                ]
                            }
                        ]
                    }
                ]
            }
        ]
    },
    
    // Execution Data (persisted to executions.json)
    executions: {
        flows: {
            [flowId]: {
                completed: {
                    [evidenceId]: boolean
                }
            }
        }
    },
    
    // UI State (volatile)
    currentFlowId: string,
    selectedActionPaths: {
        [controlPath]: actionPath
    },
    expandedTextAreas: Set<string>, // unused
    activeTag: string | null
}
```

### State Mutation Points

**Direct Mutations** (should trigger render):
1. Theme toggle → `appState.theme`
2. Mode switch → `appState.currentMode`
3. Flow selector → `appState.currentFlowId`
4. Node CRUD → `flow.data` array modifications
5. Checkbox toggle → `appState.executions.flows[flowId].completed[evidenceId]`
6. Tag filter → `appState.activeTag`
7. Action selection → `appState.selectedActionPaths[controlPath]`

**Indirect Mutations** (via propagation):
1. Shared edit → Multiple flows affected
2. Shared execution → Multiple evidence states
3. Distribution → Multiple flows receive nodes

---

## Data Persistence Strategy

### LocalStorage (Browser)
```
workflowTheme: 'light' | 'dark'
workflowMode: 'creation' | 'execution'
```
**Lifetime**: Until browser cache cleared  
**Scope**: Per origin

### Server Files (JSON)

#### workflow.json
**Write Trigger**: User clicks "Save Structure"  
**Write Frequency**: Manual only  
**Size**: Can grow to several MB  
**Format**: Pretty-printed JSON

#### executions.json
**Write Trigger**: User clicks "Save Execution"  
**Write Frequency**: Manual only  
**Size**: Typically small (< 100 KB)  
**Format**: Pretty-printed JSON

**Issue**: No auto-save  
**Issue**: No conflict detection  
**Issue**: No versioning/history

---

## Memory Management

### Memory Footprint Estimate

**Baseline (empty app)**: ~2-5 MB

**Per Flow** (average):
- 50 controls × 5 actions × 10 evidence = 2,500 evidence nodes
- Each evidence node: ~1 KB (with attachments)
- **Total per flow**: ~2.5 MB

**With 5 flows**: ~12.5 MB + overhead = **15-20 MB**

### Memory Leaks

**Potential Leaks**:
1. ❌ **Quill editor instances**: Created but not always destroyed
2. ✅ **Event listeners**: Using delegation, no leak
3. ❌ **Modal content**: Not always cleared
4. ✅ **Timers**: setTimeout cleared properly

**Recommendation**: Destroy Quill instances more aggressively

---

## Data Validation Gaps

### Client-Side (JavaScript)
- ❌ No schema validation
- ❌ No type checking
- ❌ No format validation (emails, URLs)
- ❌ No length limits
- ✅ Empty check for some inputs (prompt, form required)

### Server-Side (PHP)
- ✅ JSON syntax validation
- ❌ No schema validation
- ❌ No size limits
- ❌ No sanitization
- ❌ No authentication

**Risk**: Malicious JSON can be saved

---

## Data Flow Optimizations

### Current Issues
1. **Full render on every change**: O(n) DOM rebuild
2. **sharedEvidenceIndex() rebuilt on every call**: O(n³)
3. **No debouncing on text inputs**: Propagates on every keystroke
4. **No batching of state updates**: Multiple renders per action
5. **Synchronous file I/O**: Blocks PHP process

### Recommended Optimizations
1. **Virtual DOM or diffing**: Update only changed nodes
2. **Cache sharedEvidenceIndex**: Invalidate on structure change only
3. **Debounce text inputs**: 300ms delay before propagation
4. **Batch state updates**: Queue changes, render once
5. **Async file I/O**: Use non-blocking writes
6. **Pagination**: Render only visible controls
7. **Web Workers**: Offload filtering/indexing
8. **IndexedDB**: Client-side caching for offline

---

## Data Consistency Concerns

### Race Conditions
1. **Multi-tab editing**: No synchronization → last write wins
2. **Concurrent saves**: No locking → file corruption risk
3. **Shared execution toggle**: Rapid clicks may miss propagation

### Data Integrity
1. **Orphaned shareKeys**: If source deleted, references remain
2. **Orphaned executions**: Reconciliation runs but may miss cases
3. **ID collisions**: generateId() uses timestamp + random → low but non-zero risk

### Mitigation Strategies
1. **Optimistic locking**: Add version field, check on save
2. **Transaction log**: Append-only log of changes
3. **Periodic reconciliation**: Background job to clean orphans
4. **UUIDs**: Use crypto.randomUUID() for collision-free IDs
