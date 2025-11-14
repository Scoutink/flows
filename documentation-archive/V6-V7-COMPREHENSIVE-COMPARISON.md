# V6 vs V7 COMPREHENSIVE FEATURE COMPARISON

## CODE ANALYSIS:
- **V6 (main branch):** 1997 lines
- **V7 (current):** 1786 lines  
- **Difference:** -211 lines (10.6% reduction)

---

## ❌ MAJOR FEATURES REMOVED IN V7:

### 1. LINKED WORKFLOWS SYSTEM (Complete Feature Removal)

**V6 Implementation:**
```javascript
// Data structure (line 42-43)
workflowLinks: {
    links: [] // [{groupId, workflows:[flowId1, flowId2]}]
}

// Functions (lines 223-262):
- getLinkedWorkflows(flowId) // Get all linked flows
- isWorkflowLinked(flowId) // Check if linked
- createLinkGroup(flowId1, flowId2) // Create link group
- addToLinkGroup(newFlowId, existingFlowId) // Add to group
- unlinkWorkflow(flowId) // Remove from group

// Propagation (lines 266-284):
- propagateToLinkedWorkflows(sourceFlowId)
  → Syncs structure changes to all linked workflows

// File operations:
- Load: workflow-links.json (line 309, 335-338)
- Save: save_workflow_links.php (lines 379-390)

// UI:
- "Linked" option in workflow creation (line 1351-1352)
- Unlink button (line 1479-1484)
- Linked indicator badge
```

**V7 Status:** ❌ **COMPLETELY REMOVED**
- No workflowLinks in appState
- No link management functions
- No workflow-links.json loading
- No propagateToLinkedWorkflows()
- "Linked" option missing from creation dialog
- Unlink button exists in HTML but non-functional

---

### 2. SHAREKEY SYSTEM (Cross-Workflow Node Syncing)

**V6 Implementation:**
```javascript
// SharedKey for syncing individual nodes across workflows
- propagateSharedEdit(editedNode, level) // Sync edits (line 184-202)
- propagateSharedDelete(shareKey, level) // Sync deletes (line 204-218)
- propagateSharedExecution(shareKey, value) // Sync completion (line 123-131)

// Used in:
- Edit node name/text/tags → syncs to all nodes with same shareKey
- Delete node → deletes from all workflows with that shareKey
- Check/uncheck evidence → syncs completion status
```

**V7 Status:** ❌ **COMPLETELY REMOVED**
- No shareKey in node structure
- No propagation functions
- No cross-workflow syncing

---

### 3. EMPTY WORKFLOW CREATION

**V6 Implementation:**
```javascript
// Line 1347-1348
<label><input type="radio" name="new-flow-mode" value="empty" checked> 
    <strong>Empty</strong> - Create new empty workflow</label>

// Line 1373-1374
if (mode === 'copy' || mode === 'linked') {
    // copy data from source
} // else mode === 'empty' → data = []
```

**V7 Status:** ❌ **REMOVED**
- Must use template to create workflow
- No "Empty" option in dialog

---

### 4. IMPORT/CLONE/SHARE NODES ACROSS WORKFLOWS

**V6 Implementation:**
```javascript
// Lines 1186-1336: Complete import system
- openImportModal(path, level)
- Copy mode: Duplicates nodes to other workflows
- Share mode: Creates linked nodes with shareKey

// UI buttons:
- "Import" button on controls/actions (creation mode)
- Modal to select target workflows
- Copy vs Share options
```

**V7 Status:** ❌ **REMOVED**
- No import/clone/share functionality
- No cross-workflow node copying

---

## ⚠️ FEATURES CHANGED IN V7:

### 5. WORKFLOW CREATION OPTIONS

**V6:**
```javascript
// Three options (line 1347-1352):
1. Empty - New blank workflow
2. Copy - Duplicate existing (independent)
3. Linked - Duplicate with sync
```

**V7:**
```javascript
// Two options (script.js line 316-396):
1. From Template - Must choose template
2. Copy - Duplicate existing (independent)
```

---

### 6. STRUCTURE DEFINITION

**V6:**
- Fixed 3-level structure (Controls → Actions → Evidence)
- Hardcoded levels
- All workflows have same structure

**V7:**
- Dynamic 1-10 levels via templates
- Template defines level names, properties
- Each workflow can have different structure (via different templates)

---

### 7. GRADING SYSTEM

**V6:**
- Evidence grades must total 5.0 per action
- Warning shown if not equal to 5.0
- Manual grade entry

**V7:**
- Flexible grading (no 5.0 requirement)
- Cumulative grades (optional, template-based)
- Auto-calculated parent grades

---

### 8. PROPERTIES PER LEVEL

**V6:**
- Fixed properties per level:
  - Controls: name, description, tags
  - Actions: name, description, tags, progress bar
  - Evidence: name, description, tags, grade, done checkbox, attachments

**V7:**
- Configurable per-level properties (template-based):
  - Icon, Display ID, Name, Description, Tags
  - Done, Grade, Cumulative Grade, Progress Bar
  - Links, Images, Notes, Comments
- Each level can have different property sets

---

### 9. SEQUENTIAL ORDER

**V6:**
- Global setting: `enforceSequence` checkbox
- Line 10: `const enforceSequenceCheckbox = document.getElementById('enforce-sequence-checkbox');`
- Line 1462-1467: Toggle enforcement

**V7:**
- Template-level config: `enableSequentialOrder`
- Workflow-level toggle: If template enables it
- More granular control

---

## ✅ FEATURES PRESERVED IN V7:

### 10. CORE WORKFLOW FEATURES (All Working)
- ✅ Workflow selection dropdown
- ✅ Rename workflow
- ✅ Delete workflow
- ✅ Copy workflow (enhanced for templates)
- ✅ Two modes (Creation/Execution)
- ✅ Tags (add, remove, filter)
- ✅ Tag smart inheritance
- ✅ Attachments (Links, Images, Notes, Comments)
- ✅ Rich text editor (Quill.js)
- ✅ Progress bars
- ✅ Checkboxes
- ✅ Save Structure / Save Execution
- ✅ Theme toggle (light/dark)
- ✅ Export to Boards (unit export & tag export)

---

## 📝 NEW FEATURES IN V7:

### 11. TEMPLATE SYSTEM (Completely New)
- ✅ Template Builder application
- ✅ Dynamic workflow templates
- ✅ Template snapshots (workflows preserve structure)
- ✅ Template selection on creation
- ✅ Per-level property configuration
- ✅ 1-10 dynamic levels

### 12. WORKFLOW-LEVEL PROPERTIES (New)
- ✅ Workflow icon (optional, template-based)
- ✅ Workflow description (optional, template-based)
- ✅ Workflow-level sequential order toggle

### 13. UNIT ENHANCEMENTS (New)
- ✅ Unit icons (customizable, template-based)
- ✅ Display ID field (optional, template-based)
- ✅ Cumulative grades (auto-calculated)
- ✅ Flexible properties per level

### 14. UI IMPROVEMENTS (New)
- ✅ Dynamic level names ("Add Control" becomes "Add {LevelName}")
- ✅ Empty state display
- ✅ Workflow info section
- ✅ Icon picker modals
- ✅ Templates navigation link

---

## 🚨 CRITICAL MISSING FEATURES TO RESTORE:

### HIGH PRIORITY - Essential Features:

1. **✅ LINKED WORKFLOWS**
   - **Why:** Core collaboration feature for teams
   - **Use case:** Same compliance framework across regions
   - **Status:** Needs complete restoration
   - **Complexity:** Medium-High (needs template compatibility)

2. **✅ EMPTY WORKFLOW CREATION**
   - **Why:** Quick workflow creation without templates
   - **Use case:** Simple checklists, rapid prototyping
   - **Status:** Easy to restore
   - **Complexity:** Low

### MEDIUM PRIORITY - Convenience Features:

3. **❓ SHAREKEY SYSTEM**
   - **Why:** Cross-workflow node syncing
   - **Use case:** Shared evidence across departments
   - **Status:** May conflict with templates
   - **Complexity:** High (needs redesign for dynamic levels)

4. **❓ IMPORT/CLONE/SHARE NODES**
   - **Why:** Reuse nodes across workflows
   - **Use case:** Common evidence items
   - **Status:** Needs template compatibility check
   - **Complexity:** Medium

---

## 🎯 RESTORATION PLAN:

### Phase 1: Restore Linked Workflows (CRITICAL)
1. Add workflowLinks to appState
2. Restore link management functions
3. Implement propagateToLinkedWorkflows() with template awareness
4. Add "Linked" option to creation dialog
5. Fix unlink button
6. Restore workflow-links.json loading/saving

### Phase 2: Restore Empty Creation (EASY WIN)
1. Create "Empty" template (1-level, all properties enabled)
2. Add "Empty" option to creation dialog
3. Auto-select Empty template when chosen

### Phase 3: Evaluate ShareKey & Import (OPTIONAL)
1. Analyze template compatibility
2. Redesign for dynamic levels
3. Implement if beneficial

---

## 📊 FEATURE MATRIX:

| Feature | V6 | V7 | Priority | Complexity |
|---------|----|----|----------|------------|
| Linked Workflows | ✅ | ❌ | **CRITICAL** | Medium-High |
| Empty Creation | ✅ | ❌ | **HIGH** | Low |
| ShareKey Sync | ✅ | ❌ | Medium | High |
| Import/Clone | ✅ | ❌ | Medium | Medium |
| Copy Workflow | ✅ | ✅ | - | - |
| Templates | ❌ | ✅ | - | - |
| Dynamic Levels | ❌ | ✅ | - | - |
| Flexible Grading | ❌ | ✅ | - | - |
| Export to Boards | ✅ | ✅ | - | - |

---

## RECOMMENDATION:

**RESTORE IMMEDIATELY:**
1. ✅ Linked Workflows (essential for team collaboration)
2. ✅ Empty workflow creation (user convenience)

**EVALUATE:**
3. ❓ ShareKey system (may not fit dynamic templates)
4. ❓ Import/Clone nodes (needs template compatibility analysis)

