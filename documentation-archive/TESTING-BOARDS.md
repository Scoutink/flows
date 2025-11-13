# Board System Testing Guide

## ✅ All Board Files Ready

### Quick Test Checklist:

#### Test 1: Manual Board Creation (2 minutes)
1. Open `boards.html` in browser
2. Click "Create Board" button
3. Enter name: "Test Board Alpha"
4. Press OK
5. **✅ Expected:** Redirect to Kanban board view
6. **✅ Verify:** Board appears in boards.html list

#### Test 2: Board Operations (3 minutes)
1. Open any board
2. Click "Add Column" → Enter "In Review" → Add
3. Click "+" in any column → Add card "Test Task"
4. Drag card between columns
5. Click card to open details → Add description
6. **✅ Expected:** All operations work smoothly
7. **✅ Verify:** Refresh page, changes persist

#### Test 3: Export Unit to Board (2 minutes)
1. Open `index.html` (workflows)
2. Switch to Execution mode
3. Find a parent unit with children
4. Click Board icon/button on that unit
5. Confirm export
6. **✅ Expected:** New board created with children as cards
7. **✅ Verify:** Cards in "To Do" column

#### Test 4: Export Tag to Board (2 minutes)
1. Open workflow in Execution mode
2. Click any tag to filter
3. Click "Create Board" in filter banner
4. Confirm board name and export
5. **✅ Expected:** New board with all tagged items
6. **✅ Verify:** All tagged units appear as cards

---

## 🔍 What to Look For:

### ✅ Success Indicators:
- Board list loads without errors
- Create button opens prompt
- New boards appear immediately
- Kanban view displays properly
- Drag & drop works
- Data persists after refresh
- Export creates complete boards

### ⚠️ Potential Issues:
- Console errors (press F12)
- "Failed to load boards" alert
- Blank board grid
- Cards not appearing
- Changes not saving

---

## 🐛 If Problems Occur:

1. **Check Browser Console (F12)**
   - Look for fetch errors
   - Look for JavaScript errors

2. **Verify File Paths**
   - Check network tab for 404 errors
   - Ensure data/ppm-boards.json exists

3. **Check PHP Logs**
   - Ensure save_board.php has write permissions
   - Check server error logs

4. **Clear Browser Cache**
   - Hard refresh (Ctrl+Shift+R)
   - Clear site data

---

## 📁 Files Involved:

- **boards.html** - Board list page
- **board.html** - Kanban board view
- **ppm-script.js** - Board JavaScript
- **ppm-style.css** - Board styles
- **save_board.php** - Backend save
- **data/ppm-boards.json** - Board data
- **data/ppm-users.json** - User data

---

## 🎯 Expected Results:

All tests should pass without errors. If any test fails, check:
1. File permissions on data folder
2. PHP is running
3. No JavaScript console errors
4. Correct file paths in code

---

**Testing Time: ~10 minutes total**

