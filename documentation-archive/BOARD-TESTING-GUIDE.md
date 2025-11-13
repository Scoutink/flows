# Board System - Testing Guide

**Updated:** 2025-11-13  
**All Fixes Applied:** ✅

---

## Quick Test Scenarios

### Test 1: References Column & Terminology
1. Open `boards.html`
2. Create a new board (include References column)
3. Open the board
4. **Verify:** First column is named "References" (not "Backlog")
5. Add a task to References column
6. Try to drag it → **Should block with alert**
7. Create task in another column
8. Click task → "Link to Reference Items" → **Verify caption says "Reference" not "Backlog"**

### Test 2: Modal Layering
1. Open any task (not in References column)
2. Click "Link to Reference Items" button
3. **Verify:** Modal appears ON TOP of task modal
4. Select reference items
5. Click Save
6. **Verify:** Returns to task modal with links updated

### Test 3: Milestone Colors
1. Go to board
2. Click "+ Add" in Milestones section
3. Create milestone "Sprint 1" with color (e.g., blue #0000ff)
4. **Verify:** Milestone button shows:
   - Blue color dot
   - Blue border
   - Light blue background (15% opacity)

### Test 4: Carousel Navigation
1. Create 10+ milestones
2. **Verify:** Carousel shows 3-4 at a time (no horizontal scroll)
3. Click right arrow → **Scrolls to next items**
4. Click left arrow → **Scrolls back**
5. Repeat for Categories and Groups

### Test 5: Task Assignment
1. Create milestone "Q4 Goals"
2. Create category "Frontend"
3. Create group "Critical"
4. Open any task
5. **Verify modal has 3 new sections:**
   - Milestone dropdown
   - Category dropdown
   - Groups checkboxes
6. Select milestone → **Auto-saves, milestone count updates**
7. Select category → **Auto-saves, category count updates**
8. Check group → **Auto-saves, group count updates**

### Test 6: Done Status & Milestone Auto-Completion
1. Create milestone "Test Sprint"
2. Create 3 tasks in "To Do" column
3. Assign all 3 tasks to "Test Sprint"
4. **Verify:** Milestone shows "0/3"
5. Move 1 task to "Done"
6. **Verify:** 
   - Task turns green with checkmark ✅
   - Milestone shows "1/3"
7. Move remaining 2 tasks to "Done"
8. **Verify:**
   - All 3 tasks are green
   - Milestone shows "3/3" and turns green (completed)

---

## Complete Feature Test

### Full Workflow Test:
```
1. Create Board
   ├─ Name: "Test Board"
   ├─ Include References: ✓
   └─ Result: Board with References column

2. Create Reference Items
   ├─ Add 2 tasks to References column
   └─ Verify: Cannot drag them

3. Create Milestones
   ├─ Add "Phase 1" (blue)
   ├─ Add "Phase 2" (green)
   ├─ Add "Phase 3" (orange)
   └─ Verify: Colors display, carousel works

4. Create Categories
   ├─ Add "Frontend" (blue)
   ├─ Add "Backend" (green)
   └─ Verify: Can filter by clicking

5. Create Groups
   ├─ Add "Critical" (red)
   ├─ Add "Optional" (yellow)
   └─ Verify: Can view details

6. Create Tasks
   ├─ Add 5 tasks to "To Do"
   └─ Link to reference items

7. Assign Tasks
   ├─ Open each task
   ├─ Assign to milestone
   ├─ Assign to category
   ├─ Add to groups
   └─ Verify: Counts update

8. Complete Workflow
   ├─ Move tasks through columns
   ├─ Mark tasks as Done
   └─ Verify: Milestone auto-completes

9. Bulk Operations
   ├─ Click group
   ├─ Bulk Actions → Delete All
   └─ Verify: All group tasks deleted
```

---

## Data Persistence Verification

After each operation, refresh the browser:
- [ ] Milestones persist
- [ ] Categories persist
- [ ] Groups persist
- [ ] Task assignments persist
- [ ] Milestone status persists
- [ ] Reference links persist

---

## Visual Checks

✓ References column: Lock icon, dashed border
✓ Milestone buttons: Color dots, colored borders
✓ Category buttons: Color dots
✓ Group buttons: Color dots
✓ Done tasks: Green background, checkmark icon
✓ Completed milestones: Green background
✓ Active category: Blue highlighted
✓ Carousel arrows: Visible and functional

---

## Expected Results

✅ All terminology uses "References" (not "Backlog")
✅ Modals layer correctly (reference modal on top)
✅ Milestone colors visible on all milestones
✅ Carousel prevents horizontal scrolling
✅ Tasks can be assigned to milestones/categories/groups
✅ Done tasks show green with checkmark
✅ Milestones auto-complete when all tasks done
✅ All data persists after page refresh

---

**Testing Status:** Ready for User Acceptance Testing ✅

