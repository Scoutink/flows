# 🔧 Comprehensive Workflow Fix Plan

## Critical Issues Identified:

### 1. Missing Workflow-Level UI
**Problem:** Template defines workflow properties (icon, description, sequential order) but NO UI exists to set them
**Impact:** User cannot configure workflow-level settings
**Fix:** Add `renderWorkflowInfo()` section at top of workflow area

### 2. Blank Page on Creation
**Problem:** New workflows show blank page instead of empty state
**Impact:** User doesn't know if workflow was created
**Fix:** Ensure empty state message always shows when `flow.data` is empty

### 3. Icon Picker Missing
**Problem:** No UI to select icons for workflows or units
**Impact:** Icon feature is unusable
**Fix:** Implement `showIconPicker()` modal

### 4. Sequential Order in Wrong Place
**Problem:** Sequential order checkbox is in global settings bar, but should be per-workflow
**Impact:** Setting applies globally instead of per-workflow
**Fix:** Move to workflow info section (when template enables it)

## Implementation Plan:

### Phase 1: Add Workflow Info Section
- Create `renderWorkflowInfo()` function
- Show icon picker if `template.workflowConfig.enableIcon`
- Show description textarea if `template.workflowConfig.enableDescription`
- Show sequential checkbox if `template.workflowConfig.enableSequentialOrder`
- Only visible in creation mode

### Phase 2: Implement Icon Picker
- Create `showIconPicker()` modal
- List all icons from `/icons` folder
- Allow selection for both workflow and unit icons
- Update `flow.icon` or `unit.icon` on selection

### Phase 3: Fix Render Flow
- Call `renderWorkflowInfo()` first
- Then render units
- Show empty state if no units
- Ensure "Add [Level]" button always visible

### Phase 4: Update Unit Rendering
- Add icon picker button to unit header (if config.enableIcon)
- Display selected icon
- Allow changing icon in creation mode

## Code Changes Required:

### File: script.js

1. **Add after line 459** - New function `renderWorkflowInfo()`
2. **Modify line 432-459** - Update `render()` to include workflow info
3. **Add new function** - `showIconPicker(target, targetId)`
4. **Add new function** - `updateWorkflowProperty(property, value)`
5. **Update renderUnitHeader()** - Add icon picker button

### File: index.html

**No changes needed** - All UI is dynamically rendered

### File: style.css

**May need:** CSS for workflow info section and icon picker modal

## Expected Result:

✅ Workflow info section visible at top (creation mode only)
✅ Icon picker functional for workflows and units
✅ Description editable for workflows
✅ Sequential order per-workflow (not global)
✅ Empty state always shows when no units exist
✅ Add button always works
