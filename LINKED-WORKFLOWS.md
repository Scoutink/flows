# Linked Workflows Feature

## Overview

The Linked Workflows feature allows you to create workflows that stay structurally synchronized. When you make changes to one linked workflow in **Creation Mode**, those changes automatically propagate to all other workflows in the same link group.

---

## Key Concepts

### Three Workflow Creation Modes

When you click **"New"** to create a workflow, you now have three options:

1. **Empty** - Create a new empty workflow from scratch
2. **Copy** - Duplicate an existing workflow (independent, no synchronization)
3. **Linked** - Create a new workflow linked to an existing one (stays synchronized)

### Linked vs Copy

| Feature | Copy | Linked |
|---------|------|--------|
| Initial structure | Duplicated from source | Duplicated from source |
| Structural changes sync | ❌ No | ✅ Yes (in Creation mode) |
| Execution states sync | ❌ No | ❌ No |
| Independent after creation | ✅ Yes | ❌ No (until unlinked) |
| Can unlink later | N/A | ✅ Yes |

---

## How It Works

### Creating a Linked Workflow

1. **Switch to Creation Mode** (important!)
2. Click **"New"** button
3. Enter a name for the new workflow
4. Select **"Linked"** option
5. Choose the source workflow to link from
6. Click **"Create"**

The new workflow will:
- Start with the same structure as the source
- Have unique IDs for all nodes (controls, actions, evidence)
- Be added to the same link group as the source
- Show a **"🔗 Linked"** indicator badge
- Display an **"Unlink"** button

### Structural Synchronization

**What Syncs:**
- Adding controls, actions, or evidence
- Editing names and descriptions
- Changing grades
- Adding or removing tags
- Deleting controls, actions, or evidence
- Any structural changes made in Creation Mode

**What Doesn't Sync:**
- Execution state (checkboxes in Execution Mode)
- Attachments (links, images, notes, comments)
- Flow names (each workflow has its own name)

### When Synchronization Happens

Synchronization occurs when you:
1. Make changes to the structure in **Creation Mode**
2. Click **"Save Structure"** button

The system will:
1. Detect which workflows are linked to the current one
2. Copy the entire structure from the current workflow
3. Regenerate IDs for target workflows (maintaining uniqueness)
4. Preserve execution states in target workflows
5. Save all changes

---

## Visual Indicators

### Linked Indicator Badge

When a workflow is linked, you'll see:
- **Badge**: `🔗 Linked` next to the flow selector
- **Color**: Purple/indigo background
- **Visibility**: Only in Creation Mode

### Unlink Button

- **Icon**: 🔗 with slash
- **Label**: "Unlink"
- **Visibility**: Only shows when workflow is linked
- **Location**: Next to rename/delete buttons

---

## Unlinking Workflows

### How to Unlink

1. **Switch to Creation Mode**
2. Select the workflow you want to unlink
3. Click the **"Unlink"** button
4. Confirm the action

### What Happens When You Unlink

- The workflow is removed from its link group
- It becomes an independent workflow
- The **"🔗 Linked"** indicator disappears
- Future changes will NOT sync to other workflows
- Other workflows in the group remain linked to each other
- Past structure remains unchanged (it doesn't revert)

### Example Scenario

```
Before:
Flow A, Flow B, Flow C (all linked)

Unlink Flow B:
Flow A, Flow C (still linked)
Flow B (now independent)

Make change in Flow A:
- Flow A: Updated ✓
- Flow C: Updated ✓  
- Flow B: NOT updated (independent)
```

---

## Technical Implementation

### Data Structure

#### workflow-links.json
```json
{
  "links": [
    {
      "groupId": "link-xxxxx-xxxxx",
      "workflows": ["flow-id-1", "flow-id-2", "flow-id-3"]
    }
  ]
}
```

### Key Functions

#### Core Functions
- `getLinkedWorkflows(flowId)` - Get all workflows linked to this one
- `isWorkflowLinked(flowId)` - Check if workflow is in a link group
- `createLinkGroup(sourceFlowId, targetFlowId)` - Create new link group
- `addToLinkGroup(flowId, existingFlowId)` - Add to existing group
- `unlinkWorkflow(flowId)` - Remove from link group
- `propagateToLinkedWorkflows(sourceFlowId)` - Sync structure to linked workflows

#### Modified Functions
- `openNewFlowModal()` - Added "Linked" option
- `saveStructure()` - Calls propagate before saving
- `deleteCurrentFlow()` - Removes from link groups
- `render()` - Shows/hides link indicators

### Files Added/Modified

**New Files:**
- `workflow-links.json` - Link group storage
- `save_workflow_links.php` - Backend persistence

**Modified Files:**
- `script.js` - Link management logic (200+ lines added)
- `index.html` - UI elements for link indicator and unlink button
- `style.css` - Styling for linked indicator badge

---

## Use Cases

### Use Case 1: Multi-Region Compliance

**Scenario**: Same compliance requirements across different regions

1. Create "EU Compliance" workflow
2. Create "US Compliance" as **linked** to EU
3. Create "APAC Compliance" as **linked** to EU

**Result**: 
- All three share the same structure
- Update once, syncs to all
- Each region tracks execution independently

### Use Case 2: Template Workflow

**Scenario**: Standard workflow template for multiple projects

1. Create "ISO 27001 Template" workflow
2. For each new project, create **linked** workflow
3. Update template when standards change

**Result**:
- All projects automatically get updated structure
- Each project tracks its own progress
- Can unlink mature projects that need custom changes

### Use Case 3: Testing Changes

**Scenario**: Test structural changes before applying to main workflow

1. Create "Production" workflow
2. Create "Testing" as **linked** to Production
3. Make experimental changes in Testing
4. If good, apply to Production (both sync)
5. If bad, unlink Testing and delete it

**Result**:
- Safe experimentation
- Easy rollout to all linked workflows
- Can maintain separate testing environment

---

## Best Practices

### ✅ DO

1. **Link workflows with similar purposes**
   - Same compliance framework
   - Same process across teams
   - Template-based workflows

2. **Use descriptive names**
   - "ISO 27001 - North Region"
   - "ISO 27001 - South Region"
   - Helps identify which workflows should be linked

3. **Unlink when workflows diverge**
   - If a workflow needs custom structure
   - When requirements differ significantly
   - Before major structural changes to one workflow

4. **Save regularly in Creation Mode**
   - Synchronization happens on save
   - Don't forget to save to propagate changes

### ❌ DON'T

1. **Don't link fundamentally different workflows**
   - Different compliance frameworks
   - Different process types
   - Unrelated purposes

2. **Don't expect execution to sync**
   - Each workflow tracks its own completion
   - Execution mode is independent

3. **Don't unlink then relink**
   - Unlinking is one-way
   - Create a new linked workflow instead

4. **Don't delete linked workflows without unlinking first**
   - System handles this automatically
   - But unlinking first is cleaner

---

## Troubleshooting

### Issue: Changes Not Syncing

**Symptoms**: Made changes but linked workflows didn't update

**Solutions**:
1. Verify you're in **Creation Mode** (not Execution)
2. Click **"Save Structure"** button
3. Check that workflows are actually linked (look for 🔗 badge)
4. Refresh the page and check again

### Issue: Linked Indicator Not Showing

**Symptoms**: Workflow should be linked but badge doesn't appear

**Solutions**:
1. Switch to **Creation Mode** (indicator only shows there)
2. Check `workflow-links.json` to verify link exists
3. Reload the page
4. Check browser console for errors

### Issue: Execution States Syncing Unexpectedly

**Symptoms**: Checking boxes in one workflow affects another

**Solutions**:
- This shouldn't happen! Execution states are independent
- If it does, there may be a bug with shared evidence (old feature)
- Check if evidence has `shareKey` properties (different feature)

### Issue: Can't Create Linked Workflow

**Symptoms**: Create button doesn't work for linked option

**Solutions**:
1. Must be in **Creation Mode**
2. Must have at least one existing workflow to link from
3. Check browser console for JavaScript errors
4. Verify `save_workflow_links.php` has write permissions

---

## Advanced Topics

### Multiple Link Groups

You can have multiple independent link groups:

```
Group 1: Flow A, Flow B, Flow C (linked together)
Group 2: Flow D, Flow E (linked together)
Independent: Flow F, Flow G
```

Changes in Group 1 don't affect Group 2 or independent flows.

### Link Group Cleanup

When workflows are deleted or unlinked, the system automatically:
- Removes the workflow ID from the link group
- Deletes link groups with only 1 workflow
- Cleans up `workflow-links.json`

### ID Regeneration Strategy

When propagating structure to linked workflows:
1. Deep clone the source workflow structure
2. Generate new unique IDs for all nodes
3. Map old evidence IDs to new IDs
4. Preserve execution state using the new IDs
5. Keep execution states independent

This ensures:
- No ID conflicts across workflows
- Each workflow has unique identifiers
- Execution tracking works correctly

---

## Comparison with Old "Share" Feature

The old "Share" feature used `shareKey` on individual nodes. The new Linked Workflows feature is different:

| Aspect | Old Share (shareKey) | New Linked Workflows |
|--------|---------------------|---------------------|
| Level | Node-level | Workflow-level |
| Granularity | Individual controls/actions/evidence | Entire workflow |
| Synchronization | Edit any shared node → all instances update | Edit workflow → all linked workflows update |
| Execution sync | Could sync (with shareKey) | Never syncs |
| Management | Complex, hard to track | Simple, explicit |
| UI | No indicators | Clear badges and buttons |

**Recommendation**: Use Linked Workflows for whole-workflow synchronization. The old shareKey system is still present but not recommended for new workflows.

---

## Future Enhancements

Potential improvements for future versions:

1. **Link visualization** - Show graph of which workflows are linked
2. **Selective sync** - Choose which parts to sync
3. **Conflict resolution** - Handle simultaneous edits to linked workflows
4. **Link history** - Track when workflows were linked/unlinked
5. **Bulk operations** - Link/unlink multiple workflows at once
6. **Link notifications** - Alert when linked workflows are updated
7. **Merge workflows** - Combine two workflows into one
8. **Temporary unlink** - Pause syncing without unlinking

---

## API Reference

### Functions

```javascript
// Check if workflow is linked
isWorkflowLinked(flowId: string): boolean

// Get linked workflow IDs
getLinkedWorkflows(flowId: string): string[]

// Create new link group
createLinkGroup(sourceFlowId: string, targetFlowId: string): string

// Add to existing link group
addToLinkGroup(flowId: string, existingFlowId: string): string | null

// Remove from link group
unlinkWorkflow(flowId: string): void

// Propagate structure to linked workflows
propagateToLinkedWorkflows(sourceFlowId: string): void

// Save links to server
saveWorkflowLinks(): Promise<boolean>
```

### State

```javascript
appState.workflowLinks = {
  links: [
    {
      groupId: "link-xxxxx-xxxxx",
      workflows: ["flow-id-1", "flow-id-2"]
    }
  ]
}
```

---

## Commit Details

**Branch**: cursor/codebase-forensic-analysis-and-workshop-creation-bf08  
**Commit**: 6ee949a  
**Files Changed**: 5 files, 228 insertions(+), 28 deletions(-)

**Changes**:
- Added `workflow-links.json`
- Added `save_workflow_links.php`
- Modified `script.js` (link management logic)
- Modified `index.html` (UI elements)
- Modified `style.css` (styling)

---

## Summary

✅ **Completed Features:**
- Three-mode workflow creation (Empty, Copy, Linked)
- Automatic structural synchronization
- Independent execution tracking
- Link/unlink functionality
- Visual indicators (badge + button)
- Persistent link storage
- Automatic link cleanup

🎯 **Key Benefits:**
- Maintain consistent structures across workflows
- Update once, sync to all
- Each workflow tracks execution independently
- Easy to manage and visualize
- Flexible (can unlink anytime)

📝 **Remember:**
- Linking is for **structure only**
- Execution stays **independent**
- Changes sync on **save**
- Only works in **Creation Mode**

---

**Status**: ✅ Complete and Pushed to Repository  
**Date**: October 28, 2025  
**Version**: v6.2 with Linked Workflows
