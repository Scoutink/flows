# Systematic Fix Plan - Quality Controlled

## ALL BUGS IDENTIFIED:

### Bug 1-3: Empty/Copy/Linked Workflow Buttons Unresponsive
**Location:** Lines 524-549 (form submit handler)
**Root Cause:** No try-catch wrapper, `closeModal()` called even if creation fails
**Impact:** Buttons appear unresponsive, no user feedback on errors
**Fix:** Add try-catch, move `closeModal()` inside try block after success

### Bug 4: First Workflow Shows as "Linked" 
**Location:** Lines 202-203, 1647-1652
**Root Cause:** FALSE ALARM - isWorkflowLinked() is correct
**Actual Issue:** Need to verify data file state during testing
**Fix:** None needed - function works correctly

### Bug 5: Unlink Button Not Working
**Location:** Lines 227-235 (unlinkWorkflow function)  
**Root Cause:** Function works but doesn't update UI after unlinking
**Impact:** UI shows old state until page refresh
**Fix:** Add `populateFlowSelect()` and `render()` calls after unlinking

---

## FIX IMPLEMENTATION ORDER:

### Fix #1: Form Submit Handler (Priority: CRITICAL)
**File:** script.js
**Lines:** 524-549
**Change:**
```javascript
// OLD:
form.addEventListener('submit', async (e) => {
    e.preventDefault();
    const mode = document.getElementById('creation-mode').value;
    
    if (mode === 'template') {
        await createFlowFromTemplate(name, templateId);
    } else if (mode === 'empty') {
        await createEmptyWorkflow(name);
    } else if (mode === 'copy') {
        await copyWorkflow(name, sourceId);
    } else if (mode === 'linked') {
        await createLinkedWorkflow(name, sourceId);
    }
    closeModal();
});

// NEW:
form.addEventListener('submit', async (e) => {
    e.preventDefault();
    const mode = document.getElementById('creation-mode').value;
    
    try {
        if (mode === 'template') {
            const name = document.getElementById('flow-name').value.trim();
            const templateId = document.getElementById('flow-template').value;
            await createFlowFromTemplate(name, templateId);
        } else if (mode === 'empty') {
            const name = document.getElementById('empty-name').value.trim();
            if (!name) {
                alert('Please enter a workflow name');
                return;
            }
            await createEmptyWorkflow(name);
        } else if (mode === 'copy') {
            const name = document.getElementById('copy-name').value.trim();
            if (!name) {
                alert('Please enter a workflow name');
                return;
            }
            const sourceId = document.getElementById('copy-source').value;
            if (!sourceId) {
                alert('Please select a source workflow');
                return;
            }
            await copyWorkflow(name, sourceId);
        } else if (mode === 'linked') {
            const name = document.getElementById('linked-name').value.trim();
            if (!name) {
                alert('Please enter a workflow name');
                return;
            }
            const sourceId = document.getElementById('linked-source').value;
            if (!sourceId) {
                alert('Please select a source workflow');
                return;
            }
            await createLinkedWorkflow(name, sourceId);
        }
        closeModal();  // Only close on success
    } catch (error) {
        console.error('Workflow creation error:', error);
        alert('Failed to create workflow: ' + error.message);
    }
});
```

**Testing:**
1. Try empty workflow without name → should show alert, stay open
2. Try copy without selecting source → should show alert, stay open
3. Try linked without selecting source → should show alert, stay open
4. Create empty workflow with valid name → should work
5. Create copy workflow with valid inputs → should work
6. Create linked workflow with valid inputs → should work

---

### Fix #2: Unlink Function (Priority: HIGH)
**File:** script.js
**Lines:** 227-235
**Change:**
```javascript
// OLD:
const unlinkWorkflow = (flowId) => {
    appState.workflowLinks.links = appState.workflowLinks.links.map(group => {
        return {
            ...group,
            workflows: group.workflows.filter(id => id !== flowId)
        };
    }).filter(group => group.workflows.length > 1);
    saveWorkflowLinks();
};

// NEW:
const unlinkWorkflow = (flowId) => {
    appState.workflowLinks.links = appState.workflowLinks.links.map(group => {
        return {
            ...group,
            workflows: group.workflows.filter(id => id !== flowId)
        };
    }).filter(group => group.workflows.length > 1);
    saveWorkflowLinks();
    populateFlowSelect();  // Update UI immediately
    render();  // Refresh workflow display
};
```

**Testing:**
1. Create 2 linked workflows
2. Verify both show "Linked" indicator
3. Click "Unlink" on one
4. Verify indicator disappears immediately (no refresh needed)
5. Verify other workflow still shows as linked

---

## QUALITY CONTROL CHECKLIST:

Before committing fixes:
- [ ] JavaScript syntax valid (node --check script.js)
- [ ] No linter errors
- [ ] Backup current version
- [ ] Apply fixes one at a time
- [ ] Test each fix individually
- [ ] Test all creation modes work
- [ ] Test unlink functionality
- [ ] Test linked indicator accuracy
- [ ] No regressions in existing features

---

## ROLLBACK PLAN:

If any fix breaks something:
1. Restore from backup immediately
2. Document what broke
3. Revise fix
4. Re-test before re-applying

