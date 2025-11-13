# Board Enhancement Implementation Plan

## Overview
Adding advanced features to the board system: References column, Milestones, Categories, and Groups.

## Phase 1: References Column ⏳
### Changes:
1. Rename "Backlog" → "References"
2. Add `locked` property to column data structure
3. Prevent drag & drop from/to locked columns
4. Add visual indicator for locked columns

### Files to modify:
- `ppm-script.js`: createDefaultColumns(), drag handlers
- `ppm-style.css`: locked column styles

---

## Phase 2: Board Creation Dialog 📋
### Changes:
1. Replace simple prompt with modal dialog
2. Add checkbox: "Include References Column" (checked by default)
3. Conditionally create References column based on checkbox

### Files to modify:
- `ppm-script.js`: showCreateBoardDialog(), createBoard()
- `boards.html`: May need modal HTML

---

## Phase 3: Milestones 🎯
### Data Structure:
```javascript
milestone: {
  id: "milestone-xxx",
  name: "Sprint 1",
  description: "",
  linkedCards: ["card-1", "card-2"],
  status: "in_progress", // auto: "completed" when all cards done
  color: "#4a6cf7",
  createdAt: ISO_DATE
}
```

### UI Components:
- Milestones bar above columns
- Create milestone dialog
- Link cards to milestone
- Visual progress indicator
- Auto-completion detection

### Files to modify:
- `ppm-script.js`: milestone CRUD, auto-status updates
- `ppm-style.css`: milestone bar styles
- `board.html`: milestone container

---

## Phase 4: Categories 🏷️
### Data Structure:
```javascript
category: {
  id: "cat-xxx",
  name: "Frontend",
  color: "#28a745",
  icon: "fa-code"
}
```

### UI Components:
- Categories bar above columns
- Create category dialog
- Assign cards to categories
- Filter by category
- Category badges on cards

### Files to modify:
- `ppm-script.js`: category CRUD, filtering
- `ppm-style.css`: category styles
- `board.html`: category container

---

## Phase 5: Groups 👥
### Data Structure:
```javascript
group: {
  id: "group-xxx",
  name: "Design Tasks",
  linkedCards: ["card-1", "card-3"],
  color: "#ffc107"
}
```

### UI Components:
- Groups bar above columns
- Create group dialog
- Add/remove cards to groups
- Bulk operations menu:
  - Assign to user
  - Set due date
  - Add label
  - Change status
  - Delete cards
  - Move to column
- Group badges on cards

### Files to modify:
- `ppm-script.js`: group CRUD, bulk operations
- `ppm-style.css`: group styles
- `board.html`: group container

---

## Implementation Order:
1. ✅ Backup files
2. 🔄 References column (simple)
3. 🔄 Board creation dialog
4. 🔄 Milestones
5. 🔄 Categories
6. 🔄 Groups
7. 🔄 Testing

## Data Schema Updates:

### Board Object:
```javascript
{
  // ... existing fields ...
  milestones: [],
  categories: [],
  groups: [],
  columns: [
    {
      id: "col-xxx",
      name: "References",
      locked: true,  // NEW
      // ... other fields ...
    }
  ]
}
```

### Card Object:
```javascript
{
  // ... existing fields ...
  milestoneId: "milestone-xxx",  // NEW
  categoryId: "cat-xxx",         // NEW
  groupIds: ["group-1", "group-2"] // NEW (array - card can be in multiple groups)
}
```

---

## Visual Layout:

```
┌─────────────────────────────────────────────────────────────┐
│  Board Title                                [Add Column] [⋮] │
├─────────────────────────────────────────────────────────────┤
│  🎯 Milestones: [Sprint 1 (3/5)] [Sprint 2 (0/8)] [+ Add]  │
│  🏷️ Categories: [Frontend] [Backend] [Design] [+ Add]       │
│  👥 Groups: [Critical] [Design Tasks] [+ Add]               │
├─────────────────────────────────────────────────────────────┤
│  ┌─────────┐  ┌─────────┐  ┌─────────┐  ┌─────────┐       │
│  │References│  │  To Do  │  │Progress │  │  Done   │       │
│  │  🔒     │  │         │  │         │  │         │       │
│  ├─────────┤  ├─────────┤  ├─────────┤  ├─────────┤       │
│  │ Card 1  │  │ Card 2  │  │ Card 3  │  │ Card 4  │       │
│  │ 🎯📦🏷️ │  │ 🎯📦    │  │ 🏷️     │  │         │       │
│  └─────────┘  └─────────┘  └─────────┘  └─────────┘       │
└─────────────────────────────────────────────────────────────┘
```

Legend:
- 🔒 = Locked column
- 🎯 = Milestone badge
- 📦 = Group badge
- 🏷️ = Category badge

