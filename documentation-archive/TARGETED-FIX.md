# Targeted Fix for Empty Workflow Button

## Issue Found:
The empty workflow creation has NO validation for empty name.

## The Problem:
1. Form submit calls `createEmptyWorkflow(name)` 
2. `createEmptyWorkflow` doesn't check if name is valid
3. If name is empty, it tries to create workflow with empty name
4. This causes silent failure or error

## The Fix (Minimal, Targeted):
Add ONE simple validation check in the form handler for empty mode:

```javascript
} else if (mode === 'empty') {
    const name = document.getElementById('empty-name').value.trim();
    if (!name) {
        alert('Please enter a workflow name');
        return;
    }
    await createEmptyWorkflow(name);
```

This is a 3-line fix that:
- Validates name is not empty
- Shows clear error message
- Prevents calling createEmptyWorkflow with empty name
- Does NOT add tons of error handling everywhere
- Does NOT break existing code
