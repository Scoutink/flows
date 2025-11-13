# Dynamic List Tree Feature - User Guide

## Overview

The Dynamic List Tree is a powerful hierarchical organization feature located at the top of each board. It allows you to create custom tree structures up to 10 levels deep, with two types of nodes that serve different purposes.

## Location

The Dynamic List appears at the very top of the board view, above the Management Bar (Milestones/Categories/Groups).

## Key Concepts

### 1. Node Types

**Connection Nodes** 🔗
- Link to multiple board tasks
- Act as filters when clicked (in Active mode)
- Show task count badges
- Filter displays tasks from the node AND all descendant nodes
- Ideal for organizing tasks by phases, categories, or groupings

**Task Nodes** 📋
- Standalone tasks within the dynamic list
- Open a task modal when clicked (in Active mode)
- Contain full task data (title, description, priority, etc.)
- Ideal for high-level tasks or milestones

### 2. Modes

**Creation Mode** ✏️
- Default mode for building and editing the tree
- Shows all CRUD action buttons
- Add, edit, delete, and reorganize nodes
- Link tasks to connection nodes

**Active Mode** ✅
- Interactive mode for using the tree
- Click connection nodes to filter the board
- Click task nodes to open task modals
- Clean interface without edit buttons

Toggle between modes using the button at the top right of the Dynamic List.

## Usage Guide

### Creating Your First Node

1. Click **"Add Root Node"** button
2. Enter a **Title** for the node
3. Select **Node Type**:
   - Connection: For organizing/filtering board tasks
   - Task: For standalone tasks
4. Click **Save**

### Building the Hierarchy

**Add Child Nodes:**
1. Hover over a parent node
2. Click the **➕ Plus** button (visible in Creation mode)
3. Fill in the dialog
4. The node will be added as a child

**Maximum Depth:** 10 levels (0-9)

**Edit Node:**
- Click the **✏️ Edit** button
- Modify title, type, or parent
- Save changes

**Delete Node:**
- Click the **🗑️ Delete** button
- Confirm deletion
- Note: All child nodes will also be deleted

### Linking Tasks to Connection Nodes

1. Ensure node is type "Connection"
2. Click the **🔗 Link** button in Creation mode
3. Check/uncheck tasks from the board
4. Changes save automatically
5. Task count badge updates immediately

### Using Filters (Active Mode)

1. Toggle to **Active Mode**
2. Click any **Connection node**
3. Board filters to show:
   - Tasks linked to that node
   - Tasks linked to ANY descendant nodes
4. Active filter is highlighted
5. Click **"Clear Filter"** to reset

Example:
```
Project Phases (5 tasks total)
├─ Phase 1 (2 tasks)
└─ Phase 2 (3 tasks)
```
Clicking "Project Phases" shows all 5 tasks.
Clicking "Phase 1" shows only those 2 tasks.

### Collapse/Expand

- Click **▼/▶** icon next to nodes with children
- Collapsed nodes hide their children
- Useful for managing large trees

## Use Cases

### 1. Project Phases
```
🔗 Project Lifecycle
   ├─ 🔗 Planning Phase
   ├─ 🔗 Execution Phase
   └─ 🔗 Closure Phase
```

### 2. Compliance Framework
```
🔗 NIS2 Compliance
   ├─ 🔗 Asset Management
   │   ├─ 🔗 Hardware Inventory
   │   └─ 🔗 Software Inventory
   ├─ 🔗 Business Environment
   └─ 🔗 Governance
```

### 3. Mixed Structure
```
🔗 Q4 Goals
   ├─ 🔗 Technical Tasks
   │   └─ 📋 System Upgrade (Task node)
   ├─ 🔗 Documentation
   └─ 📋 Final Review (Task node)
```

### 4. Department Organization
```
🔗 Departments
   ├─ 🔗 IT Department
   ├─ 🔗 HR Department
   └─ 🔗 Finance Department
```

## Data Persistence

- All nodes are stored in the board's `dynamicList` structure
- Auto-saves on every change
- Persists to `ppm-boards.json`
- Independent of other board features

## Data Structure

```json
{
  "board": {
    "dynamicList": {
      "isActive": false,
      "nodes": [
        {
          "id": "node-xxx",
          "title": "Node Title",
          "type": "connection",
          "parentId": null,
          "level": 0,
          "order": 0,
          "collapsed": false,
          "linkedTaskIds": ["card-1", "card-2"],
          "taskData": null,
          "createdAt": "ISO date",
          "updatedAt": "ISO date"
        }
      ]
    }
  }
}
```

## Best Practices

1. **Start Simple**: Begin with 2-3 root nodes
2. **Meaningful Names**: Use clear, descriptive titles
3. **Connection First**: Use Connection nodes for most organization
4. **Task Sparingly**: Task nodes for high-level milestones only
5. **Test Filters**: Switch to Active mode frequently to test
6. **Logical Hierarchy**: Group related items together
7. **Depth Limit**: Try not to go beyond 5-6 levels for usability

## Tips & Tricks

- **Task Counts**: Connection nodes show total tasks (including descendants)
- **Keyboard**: Use Tab to navigate form fields quickly
- **Collapse All**: Collapse parent nodes to get overview
- **Quick Filter**: Click root nodes for broad filtering
- **Reorganize**: Edit nodes to change parent/hierarchy
- **Copy Structure**: Can export/import board data with dynamic lists

## Troubleshooting

**Nodes Not Appearing:**
- Check if tree is collapsed (click expand button)
- Verify board is loaded correctly

**Filter Not Working:**
- Ensure you're in Active mode
- Check that tasks are properly linked
- Verify board has tasks to filter

**Can't Add More Levels:**
- Maximum 10 levels (0-9)
- Check current node's level

**Task Count Wrong:**
- Counts include all descendants
- Refresh the view
- Check linked tasks in dialog

## Integration with Other Features

- **Categories**: Dynamic list is independent, both can be used
- **Milestones**: Complementary, use both for different purposes
- **Groups**: Similar concept but dynamic list offers more flexibility
- **Tags**: Dynamic list filters by explicit links, tags filter by metadata

## Future Enhancements

Potential additions (not yet implemented):
- Drag-and-drop node reordering
- Task node full modal integration
- Export tree structure
- Bulk operations on filtered tasks
- Tree templates
- Node icons customization
- Color coding

## Summary

The Dynamic List Tree provides flexible, hierarchical organization of board tasks with powerful filtering capabilities. Use it to create custom structures that match your workflow, project phases, or organizational needs.

**Key Benefits:**
- ✅ Up to 10 levels of hierarchy
- ✅ Two node types for different purposes
- ✅ Recursive filtering (node + descendants)
- ✅ Real-time task counting
- ✅ Easy mode switching
- ✅ Full CRUD operations
- ✅ Auto-save functionality

---

**Version:** 1.0  
**Last Updated:** 2025-11-13  
**Status:** ✅ Production Ready
