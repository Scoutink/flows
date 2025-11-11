# Quick Reference Guide

**Document Version**: 1.0  
**Date**: 2025-11-11  
**Purpose**: Fast lookup for common tasks and patterns

---

## 🚀 Getting Started

### Access the System
1. Open `index.html` in browser
2. Click "New" to create first flow
3. Add controls, actions, evidence
4. Switch to Execution mode to track progress
5. Click "Boards" to access PPM system

### Prerequisites
- Web server with PHP
- Modern browser
- Write permissions for JSON files

---

## 📂 File Reference

### Core Files
```
index.html              - Main workflow UI
script.js               - Core workflow logic
style.css               - Main styles
boards.html             - Boards list view
board.html              - Individual board view
ppm-script.js           - PPM logic
ppm-style.css           - PPM styles
documentation.html      - User manual
boards-documentation.html - Boards manual
```

### Data Files
```
workflow.json           - Workflow structure
executions.json         - Completion tracking
workflow-links.json     - Linked workflows
ppm-boards.json         - Boards data
ppm-users.json          - User profiles
```

### Backend Files
```
save_workflow.php       - Save workflows
save_executions.php     - Save execution state
save_workflow_links.php - Save links
save_board.php          - Save boards
save_users.php          - Save users
```

---

## 🎯 Common Tasks

### Workflow Management

#### Create New Flow
```javascript
// UI: Click "New" button in flow selector
// Code:
const flow = createFlow("Flow Name");
```

#### Switch Between Flows
```javascript
// UI: Use flow selector dropdown
// Code:
appState.currentFlowId = flowId;
render();
```

#### Rename Flow
```javascript
// UI: Click rename button (pencil icon)
// Code:
renameFlow(flowId, "New Name");
```

#### Delete Flow
```javascript
// UI: Click delete button (trash icon)
// Code:
deleteFlow(flowId);
```

#### Link Flows
```javascript
// UI: Click "Link" button, select flows
// Code:
linkWorkflows([flowId1, flowId2, flowId3]);
```

#### Unlink Flow
```javascript
// UI: Click "Unlink" button
// Code:
unlinkWorkflow(flowId);
```

---

### Structure Management

#### Add Control
```javascript
// UI: Click "Add New Rule" button
// Code:
addControl('data');
```

#### Add Action to Control
```javascript
// UI: Click + button on control header
// Code:
addAction(controlPath, controlId);
```

#### Add Evidence to Action
```javascript
// UI: Click + button on action header
// Code:
addEvidence(actionPath, actionId);
```

#### Delete Any Node
```javascript
// UI: Click delete button (trash icon)
// Code:
deleteNode(path);
// Note: Deletes node and all children
```

#### Rename Node
```javascript
// UI: Edit name field and blur
// Code:
updateNodeName(path, newName);
```

---

### Tagging

#### Add Tag to Node
```javascript
// UI: Click tag+ button, enter tag name
// Code:
addTagToNode(path, tagName);
```

#### Remove Tag from Node
```javascript
// UI: Click X on tag badge
// Code:
removeTagFromNode(path, tagName);
```

#### Filter by Tag (Execution Mode)
```javascript
// UI: Click tag badge in execution mode
// Code:
setActiveTag(tagName);
```

#### Clear Tag Filter
```javascript
// UI: Click "Clear" in tag filter banner
// Code:
clearActiveTag();
```

#### Export Tagged Items to Board
```javascript
// UI: Filter by tag, click "Create Board" in banner
// Code:
// Handled automatically by UI integration
```

---

### Execution Tracking

#### Switch to Execution Mode
```javascript
// UI: Toggle mode switch
// Code:
appState.currentMode = 'execution';
applyModeStyles();
```

#### Mark Evidence Complete
```javascript
// UI: Check checkbox next to evidence
// Code:
const flowId = appState.currentFlowId;
setCompleted(flowId, evidenceId, true);
```

#### Set Evidence Grade
```javascript
// UI: Enter number in grade input
// Code:
updateNodeGrade(path, gradeValue);
```

#### Enable Sequential Enforcement
```javascript
// UI: Check "Enforce Sequential Order" checkbox
// Code:
appState.workflow.settings.enforceSequence = true;
```

---

### Evidence Footer/Attachments

#### Add Link
```javascript
// UI: Click "Link+" button, enter URL and text
// Code:
const footer = evidence.footer;
footer.links.push({ text: "Link Text", url: "https://..." });
```

#### Add Image
```javascript
// UI: Click "Image+" button, enter URL
// Code:
footer.images.push("https://image-url.jpg");
```

#### Add Note (Rich Text)
```javascript
// UI: Click "Note+" button, use Quill editor
// Code:
footer.notes.push({ title: "Note Title", content: "<p>HTML content</p>" });
```

#### Add Comment
```javascript
// UI: Click "Comment+" button, enter text
// Code:
footer.comments.push("Comment text");
```

---

### Saving

#### Save Workflow Structure
```javascript
// UI: Click "Save Structure" button
// Code:
await saveWorkflow();
```

#### Save Execution State
```javascript
// UI: Click "Save Execution" button
// Code:
await saveExecutions();
```

#### Save Workflow Links
```javascript
// Code: Automatically called after link operations
await saveLinkGroups();
```

---

## 🎨 PPM Boards

### Board Management

#### Create Board from Scratch
```javascript
// UI: Click "Create Board" on boards.html
// Code:
const board = createBoard("Board Name", "Description");
```

#### Create Board from Workflow Control
```javascript
// UI: Click "Create Board" in tag filter banner
// Or: Right-click control → Export to Board
// Code:
const board = convertControlToBoard(control, flowId);
```

#### Open Board
```javascript
// UI: Click board card on boards.html
// Navigate to: board.html?id={boardId}
```

#### Archive Board
```javascript
// UI: Board menu → Archive
// Code:
board.archived = true;
saveBoards();
```

#### Delete Board
```javascript
// UI: Board menu → Delete
// Code:
state.boards = state.boards.filter(b => b.id !== boardId);
saveBoards();
```

---

### Column Management

#### Add Column
```javascript
// UI: Click "Add Column" button on board.html
// Code:
addColumn(board, "Column Name");
```

#### Rename Column
```javascript
// UI: Column menu → Rename
// Code:
updateColumn(board, columnId, { name: "New Name" });
```

#### Set WIP Limit
```javascript
// UI: Column menu → Set WIP Limit
// Code:
updateColumn(board, columnId, { limit: 5 });
```

#### Delete Column
```javascript
// UI: Column menu → Delete
// Code:
deleteColumn(board, columnId);
// Note: Cards moved to first column
```

---

### Card Management

#### Create Card
```javascript
// UI: Click + in column header
// Code:
createCard(board, columnId, {
    title: "Card Title",
    description: "Card Description"
});
```

#### Move Card (Drag and Drop)
```javascript
// UI: Drag card to different column
// Code:
moveCard(board, cardId, toColumnId, toOrder);
```

#### Open Card Detail
```javascript
// UI: Click card
// Code:
ui.openCardDetail(cardId);
```

#### Delete Card
```javascript
// UI: In card detail modal, click Delete
// Code:
deleteCard(board, cardId);
```

#### Assign User to Card
```javascript
// UI: In card detail, click "Assign Executor" (or other role)
// Code:
assignUser(board, cardId, userId, 'executor');
// Roles: 'executor', 'approver', 'follower', 'supervisor'
```

#### Set Due Date
```javascript
// UI: In card detail, select date
// Code:
card.schedule.dueDate = "2025-12-31";
saveBoards();
```

#### Add Checklist Item
```javascript
// Code:
card.checklist.push({
    id: generateId('check'),
    text: "Checklist item text",
    completed: false,
    completedBy: null,
    completedAt: null
});
```

---

### Backlog Features

#### Link Card to Backlog Item
```javascript
// UI: In card detail, click "Link to Backlog"
// Code:
card.linkedBacklogItems.push(backlogCardId);
saveBoards();
```

#### Filter Board by Backlog Item
```javascript
// UI: Click filter icon on backlog card
// Code:
state.backlogFilter = backlogCardId;
renderColumns(board);
```

#### Clear Backlog Filter
```javascript
// UI: Click "Clear Filter" in filter banner
// Code:
state.backlogFilter = null;
renderColumns(board);
```

---

### Member Management

#### Add Member to Board
```javascript
// UI: Click "Add Member" button
// Code:
board.members.push({
    userId: user.id,
    name: user.name,
    email: user.email,
    role: 'member',
    avatar: user.avatar,
    joinedAt: new Date().toISOString()
});
```

---

## 🎨 UI/UX Features

### Theme

#### Toggle Theme
```javascript
// UI: Click theme toggle button (half-circle icon)
// Code:
toggleTheme();
// Toggles between light and dark
```

### Mode Toggle

#### Switch Between Creation and Execution
```javascript
// UI: Toggle mode switch in header
// Automatically shows/hides appropriate UI elements
```

### Modal System

#### Open Modal
```javascript
openModal("Title", "<p>HTML Content</p>", () => {
    // Optional callback after modal opens
});
```

#### Close Modal
```javascript
closeModal();
```

---

## 🔍 Search and Filter

### Tag-Based Filtering
```javascript
// Execution mode only
// Click any tag badge to filter workflow
```

### Backlog-Based Filtering
```javascript
// Board view only
// Click filter icon on backlog card
```

---

## 💾 Data Access Patterns

### Get Current Flow
```javascript
const flow = getCurrentFlow();
// Returns current flow object or null
```

### Get Object by Path
```javascript
const node = getObjectByPath('data.0.subcategories.1', flow);
// Navigate nested structure by dot notation
```

### Get Current Board
```javascript
const board = getCurrentBoard();
// Returns current board object or null
```

### Get Card by ID
```javascript
const card = getCardById(board, cardId);
// Returns card object or null
```

### Get Cards in Column
```javascript
const cards = getCardsByColumn(board, columnId);
// Returns array of cards, sorted by order
// Respects backlog filter if active
```

---

## 🛠️ Utility Functions

### Generate ID
```javascript
const id = generateId('prefix');
// Returns: "prefix-{timestamp}-{random}"
```

### Format Date
```javascript
const formatted = formatDate("2025-12-31");
// Returns: "Dec 31, 2025"
```

### Get Relative Time
```javascript
const relative = getRelativeTime("2025-12-31");
// Returns: "Due in 50 days" or "5 days overdue"
```

### Get User by ID
```javascript
const user = getUserById(userId);
// Returns user object or null
```

---

## 🐛 Debugging

### Check Current State
```javascript
console.log(appState);           // Workflow manager state
console.log(PPM.state);          // PPM board state
```

### Check Data Files
```
Navigate to:
workflow.json           - View workflow structure
executions.json         - View completion status
ppm-boards.json         - View boards data
```

### Enable Debug Logging
```javascript
// Add to beginning of script.js or ppm-script.js:
const DEBUG = true;
const log = (...args) => DEBUG && console.log(...args);

// Use throughout code:
log('Current flow:', getCurrentFlow());
```

---

## 📝 Code Patterns

### Adding New Feature to Workflow

1. **Add to State** (if needed)
```javascript
appState.newFeature = initialValue;
```

2. **Add Rendering**
```javascript
const renderNewFeature = (data) => {
    return `<div class="new-feature">${data}</div>`;
};
```

3. **Add Event Handler**
```javascript
workflowRoot.addEventListener('click', (e) => {
    if (e.target.matches('.new-feature-btn')) {
        handleNewFeature(e);
    }
});
```

4. **Add Save Logic**
```javascript
// State already saved via saveWorkflow()
// or add new PHP endpoint if separate data
```

### Adding New Feature to Boards

1. **Add to Data Model**
```javascript
// In createCard() or createBoard():
newProperty: defaultValue
```

2. **Add Rendering**
```javascript
// In renderCard() or renderBoard():
${card.newProperty ? `<div>${card.newProperty}</div>` : ''}
```

3. **Add UI Handler**
```javascript
// In ppm-script.js PPM.ui:
ui.handleNewFeature = (cardId) => {
    const board = getCurrentBoard();
    const card = getCardById(board, cardId);
    // Modify card
    saveBoards();
    renderColumns(board);
};
```

---

## ⌨️ Keyboard Shortcuts

### Planned (Not Yet Implemented)
```
Ctrl/Cmd + S     - Save
Ctrl/Cmd + N     - New flow/board
Ctrl/Cmd + F     - Find/Filter
Esc              - Close modal
```

---

## 🔗 Integration Points

### Workflow → Board
```javascript
// Tag-based export
1. Apply tag filter in workflow
2. Click "Create Board" in filter banner
3. System creates board with all tagged evidence as cards

// Control export
1. Right-click control (future feature)
2. Select "Export to Board"
3. System creates board from control structure
```

### Board → Workflow
```javascript
// Cards maintain source references
card.sourceType     // 'control', 'action', 'evidence'
card.sourceId       // Original node ID
card.sourceFlowId   // Original flow ID

// Can be used for:
// - Jumping back to workflow
// - Syncing changes
// - Status updates
```

---

## 📊 Performance Tips

### Large Workflows
- Use tag filtering in execution mode
- Collapse controls when not in use
- Export specific sections to boards

### Many Boards
- Archive completed boards
- Use meaningful names for quick search
- Limit cards per column with WIP limits

### Slow Save Operations
- Check PHP error logs
- Verify file permissions
- Ensure adequate disk space
- Consider database backend for large deployments

---

## 🚨 Common Issues

### Issue: Changes Not Saving
**Solution**: Check browser console for errors, verify PHP backend is working

### Issue: Drag and Drop Not Working
**Solution**: Check if cards are rendering with `draggable="true"` attribute

### Issue: Modal Not Closing
**Solution**: Check if modal close button has event listener attached

### Issue: Tag Filter Not Working
**Solution**: Verify you're in Execution mode, check activeTag state

### Issue: Backlog Filter Shows Nothing
**Solution**: Ensure cards are linked to the backlog item you're filtering by

---

## 📚 Further Reading

- **[Executive Summary](./01-EXECUTIVE-SUMMARY.md)** - System overview
- **[System Architecture](./02-SYSTEM-ARCHITECTURE.md)** - Technical architecture
- **[Evolution Timeline](./03-EVOLUTION-TIMELINE.md)** - Development history
- **[Core Components](./04-CORE-COMPONENTS.md)** - Component details
- **[Data Models](./05-DATA-MODELS.md)** - Data schemas

---

## 💡 Pro Tips

1. **Use tags liberally** - They make filtering and board creation powerful
2. **Link related workflows** - Keep structure synchronized across business units
3. **Start with backlog** - Add all tasks to backlog, then move to columns
4. **Set WIP limits** - Prevents overloading "In Progress" column
5. **Use all 4 role types** - Clear accountability and visibility
6. **Link tasks to backlog** - Enables powerful filtering and tracking
7. **Regular saves** - Save frequently to prevent data loss
8. **Mobile friendly** - System works on tablets and phones
9. **Dark mode** - Reduces eye strain during extended use
10. **Documentation** - Refer to built-in documentation for users

---

**Last Updated**: 2025-11-11  
**For More Help**: See README.md or contact system administrator
