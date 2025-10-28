# Project Portfolio Management (PPM) System
## Architecture Design & Development Plan

**Version:** 1.0  
**Date:** October 28, 2025  
**Status:** Design Phase

---

## Table of Contents

1. [Current Workflow Analysis](#1-current-workflow-analysis)
2. [PPM Architecture Overview](#2-ppm-architecture-overview)
3. [Data Model Design](#3-data-model-design)
4. [User Assignment & Roles System](#4-user-assignment--roles-system)
5. [Scheduling & Recurrence System](#5-scheduling--recurrence-system)
6. [Integration Strategy](#6-integration-strategy)
7. [Development Batches](#7-development-batches)
8. [Implementation Timeline](#8-implementation-timeline)

---

## 1. Current Workflow Analysis

### 1.1 Existing Structure

The current system has a **3-level hierarchical structure**:

```
Control (Top Level)
├── Actions (Middle Level)
│   ├── Evidence (Bottom Level - Tasks)
│   │   ├── Name, Description, Grade
│   │   ├── Tags
│   │   ├── Attachments (links, images, notes, comments)
│   │   └── Completion Status
```

**Key Characteristics:**
- **Controls** represent major compliance areas
- **Actions** are specific objectives within controls
- **Evidence** items are concrete tasks with proof requirements
- **Grading System**: Each evidence has a grade (0.5-5.0)
- **Progress Tracking**: Calculated based on completed evidence grades
- **Multi-Flow Support**: Multiple independent or linked workflows
- **Dual Modes**: Creation (structure) vs Execution (completion)
- **Tagging System**: Organization and filtering
- **Attachments**: Rich documentation support

### 1.2 Data Persistence

Current files:
- `workflow.json` - Structure data (Controls, Actions, Evidence)
- `executions.json` - Completion states per flow
- `workflow-links.json` - Linked workflow groups

### 1.3 State Management

```javascript
appState = {
    theme: 'light' | 'dark',
    currentMode: 'creation' | 'execution',
    workflow: { settings, flows: [{id, name, data}] },
    executions: { flows: { [flowId]: { completed: { [evidenceId]: boolean } } } },
    workflowLinks: { links: [{groupId, workflows: [flowId...]}] },
    currentFlowId: string,
    selectedActionPaths: {},
    activeTag: string | null
}
```

### 1.4 Key Functions to Leverage

- **generateId()** - Unique ID generation
- **getObjectByPath()** - Dot-notation navigation
- **render()** - Dynamic DOM rendering
- **Modal system** - Unified dialog management
- **Tag filtering** - Content organization
- **Execution state management** - Completion tracking

---

## 2. PPM Architecture Overview

### 2.1 Concept

The PPM system will be a **Trello-like Kanban board** system that:
1. **Derives from workflow Controls** - Users copy a Control into a project board
2. **Converts structure to tasks** - Actions and Evidence become project tasks
3. **Adds project management** - Assignments, deadlines, recurrence
4. **Maintains separation** - Workflows remain templates; boards are execution instances

### 2.2 Kanban Board Structure

```
Project Board (from Control)
├── Columns (Customizable Stages)
│   ├── Backlog
│   ├── To Do
│   ├── In Progress
│   ├── Review
│   └── Done
└── Cards (Tasks from Actions/Evidence)
    ├── Title (from Action/Evidence name)
    ├── Description (from text)
    ├── Checklist (sub-evidence items)
    ├── Assignments (people with roles)
    ├── Dates (start, due, recurrence)
    ├── Labels (from tags)
    ├── Attachments (from footer)
    └── Activity Log
```

### 2.3 Visual Interface

**Layout:**
```
┌─────────────────────────────────────────────────────┐
│ Header: Board Name | Members | Settings | Views    │
├─────────────────────────────────────────────────────┤
│ ┌─────────┐ ┌─────────┐ ┌─────────┐ ┌─────────┐  │
│ │ Backlog │ │  To Do  │ │Progress │ │  Done   │  │
│ ├─────────┤ ├─────────┤ ├─────────┤ ├─────────┤  │
│ │ [Card]  │ │ [Card]  │ │ [Card]  │ │ [Card]  │  │
│ │ [Card]  │ │ [Card]  │ │ [Card]  │ │         │  │
│ │ [Card]  │ │         │ │         │ │         │  │
│ └─────────┘ └─────────┘ └─────────┘ └─────────┘  │
└─────────────────────────────────────────────────────┘
```

### 2.4 System Components

1. **Board Management** - Create, configure, archive boards
2. **Card Management** - Create, edit, move, assign cards
3. **User Management** - Add members, define roles
4. **Schedule Engine** - Handle dates, reminders, recurrence
5. **Activity Tracking** - Log all actions and changes
6. **Notification System** - Alerts for assignments, deadlines
7. **Integration Layer** - Connect workflows to boards

### 2.5 Key Differences from Workflow

| Aspect | Workflow (Current) | PPM Board (New) |
|--------|-------------------|-----------------|
| **Purpose** | Compliance template | Project execution |
| **Structure** | Hierarchical (Control→Action→Evidence) | Flat (Cards in Columns) |
| **Users** | Single user implied | Multi-user with roles |
| **Timeline** | No dates | Start, due, recurrence |
| **Assignment** | None | Executor, follower, approver, supervisor |
| **Status** | Completed checkbox | Column position + status |
| **Reusability** | Template (reused) | Instance (one-time) |
| **Progress** | Grade-based calculation | Card count or checklist % |

---

## 3. Data Model Design

### 3.1 Board Schema

```json
{
  "boards": [
    {
      "id": "board-xxxxx",
      "name": "Q1 2025 ISO Compliance Project",
      "description": "Quarterly compliance implementation",
      "sourceControlId": "cat-xxxxx",
      "sourceFlowId": "flow-xxxxx",
      "createdAt": "2025-01-15T10:00:00Z",
      "createdBy": "user-xxxxx",
      "archived": false,
      "members": [
        {
          "userId": "user-xxxxx",
          "name": "John Doe",
          "email": "john@company.com",
          "role": "admin",
          "avatar": "https://...",
          "joinedAt": "2025-01-15T10:00:00Z"
        }
      ],
      "columns": [
        {
          "id": "col-xxxxx",
          "name": "Backlog",
          "order": 0,
          "limit": null,
          "color": "#6c757d"
        },
        {
          "id": "col-xxxxx",
          "name": "In Progress",
          "order": 1,
          "limit": 5,
          "color": "#0d6efd"
        }
      ],
      "cards": [...],
      "labels": [...],
      "settings": {
        "notificationsEnabled": true,
        "allowGuestView": false,
        "enforceWIPLimit": true
      },
      "activity": [...]
    }
  ]
}
```

### 3.2 Card Schema

```json
{
  "id": "card-xxxxx",
  "boardId": "board-xxxxx",
  "columnId": "col-xxxxx",
  "order": 0,
  
  "title": "ID.AM-1.1: Document inventory",
  "description": "Create and maintain asset inventory...",
  
  "sourceType": "action" | "evidence",
  "sourceId": "act-xxxxx" | "evi-xxxxx",
  "sourceGrade": 1.5,
  
  "assignments": [
    {
      "userId": "user-xxxxx",
      "role": "executor",
      "assignedAt": "2025-01-15T10:00:00Z",
      "assignedBy": "user-xxxxx"
    },
    {
      "userId": "user-yyyyy",
      "role": "approver",
      "assignedAt": "2025-01-15T11:00:00Z",
      "assignedBy": "user-xxxxx"
    }
  ],
  
  "schedule": {
    "startDate": "2025-02-01",
    "startMode": "date" | "days-after-board" | "days-after-card",
    "startDays": 7,
    "startDependency": "card-xxxxx",
    
    "dueDate": "2025-02-28",
    "dueMode": "date" | "days-after-start",
    "dueDays": 14,
    
    "recurrence": {
      "enabled": true,
      "pattern": "monthly" | "weekly" | "daily" | "custom",
      "interval": 1,
      "startOf": "month" | "week",
      "endOf": "month" | "week",
      "customDays": [1, 15],
      "endMode": "never" | "after-occurrences" | "on-date",
      "endOccurrences": 12,
      "endDate": "2025-12-31"
    },
    
    "reminders": [
      {
        "type": "due-date",
        "before": 3,
        "unit": "days",
        "enabled": true
      },
      {
        "type": "recurrence",
        "when": "start-of-period",
        "enabled": true
      }
    ]
  },
  
  "checklist": [
    {
      "id": "check-xxxxx",
      "text": "Sub-task from evidence",
      "completed": false,
      "completedBy": null,
      "completedAt": null
    }
  ],
  
  "labels": ["high-priority", "firewall", "quarterly"],
  
  "attachments": [
    {
      "id": "att-xxxxx",
      "type": "link" | "image" | "note" | "comment" | "file",
      "title": "Policy Document",
      "url": "https://...",
      "content": "...",
      "uploadedBy": "user-xxxxx",
      "uploadedAt": "2025-01-15T10:00:00Z"
    }
  ],
  
  "status": {
    "current": "in-progress",
    "blocked": false,
    "blockedReason": null,
    "approvalStatus": "pending" | "approved" | "rejected" | null,
    "approvedBy": "user-xxxxx",
    "approvedAt": "2025-02-28T15:00:00Z"
  },
  
  "effort": {
    "estimated": 8,
    "actual": 6.5,
    "unit": "hours"
  },
  
  "activity": [
    {
      "id": "act-xxxxx",
      "type": "created" | "moved" | "assigned" | "completed" | "commented" | "updated",
      "userId": "user-xxxxx",
      "timestamp": "2025-01-15T10:00:00Z",
      "data": {
        "from": "col-xxxxx",
        "to": "col-yyyyy",
        "field": "title",
        "oldValue": "...",
        "newValue": "..."
      }
    }
  ],
  
  "createdAt": "2025-01-15T10:00:00Z",
  "createdBy": "user-xxxxx",
  "updatedAt": "2025-02-01T14:30:00Z",
  "updatedBy": "user-xxxxx"
}
```

### 3.3 User Schema

```json
{
  "users": [
    {
      "id": "user-xxxxx",
      "name": "John Doe",
      "email": "john@company.com",
      "avatar": "https://...",
      "role": "admin" | "member" | "viewer",
      "department": "IT Security",
      "position": "Security Manager",
      "notifications": {
        "email": true,
        "browser": true,
        "assignments": true,
        "mentions": true,
        "reminders": true
      },
      "preferences": {
        "theme": "light" | "dark",
        "boardView": "kanban" | "list" | "calendar",
        "timezone": "Europe/Brussels"
      },
      "createdAt": "2024-01-01T00:00:00Z"
    }
  ]
}
```

### 3.4 Label Schema

```json
{
  "labels": [
    {
      "id": "label-xxxxx",
      "boardId": "board-xxxxx",
      "name": "high-priority",
      "color": "#dc3545",
      "description": "Urgent tasks requiring immediate attention"
    }
  ]
}
```

### 3.5 Activity Log Schema

```json
{
  "activity": [
    {
      "id": "act-xxxxx",
      "boardId": "board-xxxxx",
      "cardId": "card-xxxxx" | null,
      "userId": "user-xxxxx",
      "type": "card.created" | "card.moved" | "card.assigned" | "board.member.added",
      "timestamp": "2025-01-15T10:00:00Z",
      "data": {
        "cardTitle": "Task name",
        "from": "To Do",
        "to": "In Progress",
        "assignedUser": "Jane Smith",
        "role": "executor"
      },
      "description": "John Doe moved 'Task name' from To Do to In Progress"
    }
  ]
}
```

### 3.6 File Structure

New files to create:
```
/workspace/
├── ppm-boards.json          # All boards data
├── ppm-users.json           # User profiles
├── ppm-notifications.json   # Pending notifications queue
├── save_board.php           # Save board data
├── save_users.php           # Save user data
├── save_notifications.php   # Save notifications
├── boards.html              # Boards list view
├── board.html               # Single board Kanban view
├── ppm-script.js           # PPM application logic
└── ppm-style.css           # PPM styles
```

---

## 4. User Assignment & Roles System

### 4.1 Role Types

**Board Roles:**
- **Admin** - Full control over board (delete, archive, manage members)
- **Member** - Can create/edit cards, assign tasks
- **Viewer** - Read-only access

**Card Assignment Roles:**
- **Executor** 👷 - Person responsible for completing the task
- **Follower** 👁️ - Observer tracking progress (receives updates)
- **Approver** ✅ - Must approve completion before card moves to done
- **Supervisor** 📊 - Oversees impact and continuous monitoring

### 4.2 Assignment Rules

1. **Multiple Assignments**: A card can have multiple people in different roles
2. **Role Permissions**:
   - **Executor**: Can update status, add progress notes, complete checklist
   - **Follower**: Read-only, receives notifications
   - **Approver**: Can approve/reject completion, request changes
   - **Supervisor**: Can add monitoring notes, request updates
3. **Notifications**: Each role receives relevant updates
4. **Reassignment**: Admins and current executors can reassign

### 4.3 Assignment Workflow

```
1. Card Created → Auto-assign creator as executor
2. Executor adds followers/approvers
3. Executor completes work → moves to "Review"
4. Approver reviews → approves or rejects
5. If approved → moves to "Done"
6. If rejected → moves back with comments
7. Supervisor monitors impact over time
```

---

## 5. Scheduling & Recurrence System

### 5.1 Date Types

**Start Date:**
- **Fixed Date**: Specific calendar date (2025-02-01)
- **Relative to Board**: X days after board creation
- **Relative to Card**: X days after another card's completion (dependency)

**Due Date:**
- **Fixed Date**: Specific deadline
- **Relative to Start**: X days after start date
- **Flexible**: No hard deadline

### 5.2 Recurrence Patterns

**Pattern Types:**
1. **Daily** - Every X days
2. **Weekly** - Every X weeks on specific days
3. **Monthly** - Start/end of month, or specific dates
4. **Quarterly** - Every 3 months
5. **Yearly** - Annually on specific date
6. **Custom** - Complex patterns (e.g., "every 2nd Friday")

**Recurrence Options:**
```json
{
  "pattern": "monthly",
  "interval": 1,
  "timing": "start-of-month" | "end-of-month" | "specific-days",
  "days": [1, 15],
  "endMode": "never" | "after-count" | "on-date",
  "endCount": 12,
  "endDate": "2025-12-31"
}
```

**Examples:**
- Beginning of every month: `{pattern: "monthly", timing: "start-of-month"}`
- End of every week: `{pattern: "weekly", timing: "end-of-week"}`
- Every 14 days: `{pattern: "daily", interval: 14}`

### 5.3 Reminder System

**Reminder Types:**
1. **Before Due Date** - X days/hours before deadline
2. **On Start Date** - When task should begin
3. **Recurrence Start** - At beginning of each cycle
4. **Overdue** - Daily reminders when past due
5. **Approval Pending** - When waiting for approver

**Notification Channels:**
- Browser notifications (if enabled)
- Email (configurable per user)
- In-app notification center
- Dashboard alerts

### 5.4 Recurring Task Logic

When a recurring task is completed:
1. Current card moves to "Done"
2. New card is automatically created for next occurrence
3. New card inherits:
   - Title, description, checklist template
   - Assignments (same people, same roles)
   - Labels
   - Attachments (references, not copies)
4. New card gets new dates based on recurrence pattern
5. Activity log links cards: "Generated from card-xxxxx"

---

## 6. Integration Strategy

### 6.1 Workflow → Board Conversion

**User Action:** In Execution Mode, user clicks "Create Project Board" on a Control

**Conversion Process:**
```
Control (Workflow)
    ↓
Board (PPM)
    ↓
Actions → Swimlanes OR Parent Cards
    ↓
Evidence → Cards OR Checklist Items
```

**Mapping Options:**

**Option A: Flat Structure (Recommended)**
- Control → Board
- Each Action → Column "section" or label
- Each Evidence → Individual Card

**Option B: Hierarchical**
- Control → Board
- Each Action → Parent Card
- Each Evidence → Checklist Item in parent card

**Option C: Hybrid (Most Flexible)**
- Control → Board
- User chooses per Action:
  - Convert to Column (for grouping)
  - Convert to Parent Card (for complex actions)
  - Convert to Cards (for simple actions)

### 6.2 Data Transformation

```javascript
function convertControlToBoard(control, flowId) {
  const board = {
    id: generateId('board'),
    name: control.name,
    description: control.text || '',
    sourceControlId: control.id,
    sourceFlowId: flowId,
    createdAt: new Date().toISOString(),
    createdBy: getCurrentUser().id,
    columns: createDefaultColumns(),
    cards: [],
    members: [getCurrentUser()],
    labels: convertTagsToLabels(control),
    settings: getDefaultBoardSettings()
  };
  
  // Convert Actions and Evidence to cards
  (control.subcategories || []).forEach(action => {
    // Option: Create parent card for action
    const parentCard = {
      id: generateId('card'),
      boardId: board.id,
      columnId: board.columns[0].id, // Backlog
      title: action.name,
      description: action.text,
      sourceType: 'action',
      sourceId: action.id,
      checklist: [],
      labels: extractTags(action),
      ...
    };
    
    // Convert evidence to checklist or separate cards
    (action.subcategories || []).forEach(evidence => {
      const card = {
        id: generateId('card'),
        boardId: board.id,
        columnId: board.columns[0].id,
        title: evidence.name,
        description: evidence.text,
        sourceType: 'evidence',
        sourceId: evidence.id,
        sourceGrade: evidence.grade,
        attachments: convertFooterToAttachments(evidence.footer),
        labels: extractTags(evidence),
        ...
      };
      board.cards.push(card);
    });
  });
  
  return board;
}
```

### 6.3 Bidirectional Sync (Optional Phase 2)

**Sync Rules:**
- Board completion % → Update workflow execution state
- Workflow structure changes → Optionally update board cards
- Keep history of sync events
- Allow manual override/disconnect

### 6.4 UI Integration Points

**In Workflow View (Execution Mode):**
```
Control Header:
  [Existing buttons...]
  [📊 Create Project Board]  ← New button
```

**After Creating Board:**
```
Control Header:
  [📊 View Board: "Q1 2025 Project"]  ← Link to board
  [+ Create Another Board]
```

**New Navigation:**
```
Top Menu:
  [Workflows] [📋 Boards] [👤 Profile]
              ↑ New section
```

---

## 7. Development Batches

### BATCH 1: Core PPM Foundation (Week 1-2)
**Goal:** Create basic board structure and card management

**Tasks:**
1. **Data Layer**
   - Create `ppm-boards.json` schema
   - Create `ppm-users.json` schema
   - Create `save_board.php` endpoint
   - Create `save_users.php` endpoint

2. **Basic UI Structure**
   - Create `boards.html` (list all boards)
   - Create `board.html` (single board view)
   - Create `ppm-style.css` with Kanban layout
   - Set up basic modal system (reuse from workflow)

3. **Core Functions**
   - Board CRUD (create, read, update, delete)
   - Column management (add, rename, reorder, delete)
   - Card CRUD operations
   - Drag-and-drop for cards between columns

4. **State Management**
   ```javascript
   ppmState = {
     boards: [],
     currentBoardId: null,
     currentUser: null,
     draggedCard: null
   }
   ```

**Deliverable:** Working Kanban board where you can:
- Create a board
- Add columns
- Create cards
- Drag cards between columns
- Edit card title/description

---

### BATCH 2: User Management & Assignments (Week 3)
**Goal:** Add multi-user support and assignment system

**Tasks:**
1. **User System**
   - User registration/profile UI
   - Member management modal
   - Add/remove members from board
   - User avatar display

2. **Assignment Features**
   - Assignment UI in card modal
   - Role selector (executor, follower, approver, supervisor)
   - Multiple assignments per card
   - Visual indicators (avatars on cards)
   - Assignment notifications (basic)

3. **Permissions**
   - Board role enforcement (admin, member, viewer)
   - Card assignment role enforcement
   - UI element visibility based on permissions

4. **Board Members View**
   - Show all members with roles
   - Filter cards by assigned user
   - Member activity summary

**Deliverable:** Multi-user boards with role-based assignments

---

### BATCH 3: Scheduling System (Week 4)
**Goal:** Implement dates, deadlines, and basic reminders

**Tasks:**
1. **Date Management**
   - Start date picker
   - Due date picker
   - Date calculation for relative dates
   - Visual date indicators on cards
   - Calendar view (alternative to Kanban)

2. **Date Types Implementation**
   - Fixed dates
   - Relative to board creation
   - Relative to card dependency
   - Duration-based (X days after start)

3. **Visual Indicators**
   - Color-code cards by urgency (green, yellow, red)
   - Overdue indicators
   - Upcoming deadline badges
   - Progress timeline view

4. **Basic Reminders**
   - Browser notification API integration
   - In-app notification center
   - Reminder preferences per user

**Deliverable:** Full date management with visual timeline

---

### BATCH 4: Recurrence Engine (Week 5)
**Goal:** Implement recurring tasks

**Tasks:**
1. **Recurrence Configuration**
   - Pattern selector UI (daily, weekly, monthly, etc.)
   - Interval configuration
   - End condition selector (never, after X, on date)
   - Custom pattern builder

2. **Recurrence Logic**
   - Calculate next occurrence date
   - Auto-generate new card on completion
   - Link recurring card instances
   - Handle recurrence modifications

3. **Recurrence Patterns**
   - Daily (every X days)
   - Weekly (specific days)
   - Monthly (start/end/specific days)
   - Quarterly
   - Yearly
   - Custom patterns

4. **Recurrence Management**
   - Edit future occurrences
   - Stop recurrence
   - View recurrence history
   - Bulk update recurring tasks

**Deliverable:** Fully functional recurring task system

---

### BATCH 5: Workflow Integration (Week 6)
**Goal:** Connect workflow system to PPM boards

**Tasks:**
1. **Conversion Function**
   - "Create Board from Control" button in workflow
   - Control → Board conversion modal
   - Configure conversion options (flat/hierarchical/hybrid)
   - Preview before creation

2. **Data Mapping**
   - Map Control to Board
   - Map Actions to Cards or Columns
   - Map Evidence to Cards or Checklist
   - Convert tags to labels
   - Copy attachments

3. **Bidirectional Links**
   - Link board to source control/flow
   - Show board link in workflow view
   - Track board status in workflow
   - Optional: sync completion back to workflow

4. **Navigation**
   - Add "Boards" section to main navigation
   - Link from workflow to boards
   - Breadcrumb navigation
   - Quick switcher (workflow ↔ board)

**Deliverable:** Seamless workflow → board conversion

---

### BATCH 6: Activity & Notifications (Week 7)
**Goal:** Implement activity logging and notification system

**Tasks:**
1. **Activity Log**
   - Log all card actions
   - Log board changes
   - User action tracking
   - Display activity feed per card
   - Display activity feed per board

2. **Notification System**
   - Email notification templates
   - `ppm-notifications.json` queue
   - `save_notifications.php` endpoint
   - Notification aggregation (avoid spam)
   - Notification preferences per user

3. **Notification Triggers**
   - Assignment notifications
   - Due date reminders (1 day, 3 days, 1 week before)
   - Overdue alerts
   - Approval requests
   - Comments and mentions
   - Card moved to your column
   - Recurrence starting soon

4. **Notification Center**
   - In-app notification dropdown
   - Mark as read
   - Notification history
   - Filter by type

**Deliverable:** Complete activity tracking and smart notifications

---

### BATCH 7: Advanced Features (Week 8)
**Goal:** Add polish and power-user features

**Tasks:**
1. **Checklist System**
   - Add checklist to cards
   - Checklist templates
   - Progress indicators
   - Checklist item assignment

2. **Labels & Filters**
   - Label management
   - Color-coded labels
   - Filter cards by label
   - Filter by assignment
   - Filter by date range
   - Search cards

3. **Attachments**
   - File upload support (images, PDFs)
   - Link attachments
   - Attachment preview
   - Attachment gallery view

4. **Board Views**
   - Kanban view (default)
   - List view (compact)
   - Calendar view (by dates)
   - Timeline/Gantt view
   - Board view switcher

5. **Reporting**
   - Board progress dashboard
   - Burndown chart
   - Velocity tracking
   - Time tracking
   - Export to CSV/PDF

**Deliverable:** Feature-complete PPM system

---

### BATCH 8: Polish & Optimization (Week 9)
**Goal:** Performance, UX refinement, testing

**Tasks:**
1. **Performance**
   - Lazy loading for large boards
   - Virtual scrolling for many cards
   - Optimize drag-and-drop
   - Cache management
   - Debounce save operations

2. **UX Improvements**
   - Keyboard shortcuts
   - Undo/redo actions
   - Bulk operations (select multiple cards)
   - Quick add card
   - Card templates
   - Board templates

3. **Mobile Responsiveness**
   - Touch-friendly drag-and-drop
   - Responsive board layout
   - Mobile navigation
   - Swipe gestures

4. **Testing & Bug Fixes**
   - Cross-browser testing
   - Edge case handling
   - Data validation
   - Error handling
   - Loading states

**Deliverable:** Production-ready PPM system

---

## 8. Implementation Timeline

### Timeline Overview (9 Weeks)

```
Week 1-2: Batch 1 - Core PPM Foundation
  ├── Board & card structure
  ├── Kanban UI
  └── Basic CRUD operations

Week 3: Batch 2 - User Management & Assignments
  ├── User system
  ├── Role-based assignments
  └── Permissions

Week 4: Batch 3 - Scheduling System
  ├── Date management
  ├── Visual indicators
  └── Basic reminders

Week 5: Batch 4 - Recurrence Engine
  ├── Recurrence patterns
  ├── Auto-generation
  └── Recurrence management

Week 6: Batch 5 - Workflow Integration
  ├── Conversion function
  ├── Data mapping
  └── Navigation

Week 7: Batch 6 - Activity & Notifications
  ├── Activity logging
  ├── Notification system
  └── Notification center

Week 8: Batch 7 - Advanced Features
  ├── Checklists
  ├── Filters
  ├── Multiple views
  └── Reporting

Week 9: Batch 8 - Polish & Optimization
  ├── Performance tuning
  ├── UX refinement
  ├── Mobile support
  └── Testing
```

### Success Metrics

After each batch:
- ✅ All features in batch are functional
- ✅ No critical bugs
- ✅ Code is documented
- ✅ Git commit with clear message
- ✅ User can test the feature

Final success criteria:
- ✅ User can create project board from workflow control
- ✅ User can assign team members with different roles
- ✅ User can set start dates, due dates, and recurrence
- ✅ System sends reminders based on schedule
- ✅ Multiple users can collaborate on boards
- ✅ System tracks activity and progress
- ✅ UI is responsive and performant

---

## 9. Technical Architecture Decisions

### 9.1 Frontend Architecture

**Framework:** Vanilla JavaScript (consistent with workflow)
**Why:** 
- No build process
- Low complexity
- Easy to understand and modify
- Fast prototyping

**Structure:**
```javascript
// ppm-script.js
const PPM = {
  state: { ... },
  ui: {
    renderBoard() { ... },
    renderCard() { ... },
    renderModal() { ... }
  },
  data: {
    loadBoards() { ... },
    saveBoard() { ... },
    loadUsers() { ... }
  },
  cards: {
    create() { ... },
    move() { ... },
    assign() { ... }
  },
  schedule: {
    calculateDueDate() { ... },
    generateRecurrence() { ... },
    sendReminder() { ... }
  },
  utils: {
    generateId() { ... },
    formatDate() { ... }
  }
};
```

### 9.2 Backend Architecture

**Stack:** PHP + JSON files (consistent with workflow)

**Why:**
- Simple deployment
- No database setup required
- Easy to backup (copy JSON files)
- Consistent with existing system

**Endpoints:**
- `save_board.php` - Save board data
- `save_users.php` - Save user data
- `save_notifications.php` - Queue notifications
- `get_board.php` - Load specific board
- `get_user_boards.php` - Get boards for user

### 9.3 Data Storage

**Format:** JSON files
**Backup Strategy:** Version control + periodic snapshots
**Scalability:** Can migrate to database later if needed

### 9.4 Real-time Updates (Future)

**Phase 1:** Manual refresh / periodic polling
**Phase 2:** WebSocket for real-time collaboration
- Live updates when others move cards
- Live cursor positions
- Conflict resolution

---

## 10. UI/UX Design Principles

### 10.1 Visual Design

**Color Scheme:**
- Primary: #4a6cf7 (blue) - Same as workflow
- Success: #10b981 (green)
- Warning: #f59e0b (yellow)
- Danger: #ef4444 (red)
- Neutral: #6c757d (gray)

**Typography:**
- Same font family as workflow
- Clear hierarchy
- Readable sizes

**Icons:**
- Font Awesome 6 (consistent with workflow)
- Clear, recognizable icons
- Consistent icon usage

### 10.2 Interaction Design

**Drag-and-Drop:**
- Visual feedback (ghost card, drop zone highlight)
- Smooth animations
- Touch-friendly

**Modal Dialogs:**
- Consistent with workflow modals
- Escape to close
- Click backdrop to close
- Focus management

**Forms:**
- Inline editing where possible
- Clear validation messages
- Save on blur for simple fields
- Explicit save for complex forms

### 10.3 Responsive Design

**Breakpoints:**
- Desktop: > 1024px (full Kanban)
- Tablet: 768px - 1024px (scrollable Kanban)
- Mobile: < 768px (list view)

**Mobile Adaptations:**
- Single column view
- Swipe to see columns
- Bottom sheet for card details
- Simplified forms

---

## 11. Migration & Rollout Strategy

### 11.1 Phased Rollout

**Phase 1: Internal Testing (Batches 1-3)**
- Developer testing only
- Feature flags to hide from users
- Test with sample data

**Phase 2: Beta Testing (Batches 4-6)**
- Invite select users
- Gather feedback
- Iterate on UX

**Phase 3: Production (Batches 7-8)**
- Full release
- User documentation
- Training materials

### 11.2 User Training

**Documentation:**
- User manual (similar to workflow manual)
- Video tutorials
- Quick start guide
- FAQ section

**In-App Help:**
- Tooltips for new features
- Interactive tutorial
- Help button with context-sensitive docs

---

## 12. Future Enhancements (Post-v1)

### 12.1 Advanced Features

1. **Time Tracking**
   - Log time spent on cards
   - Estimated vs actual time
   - Time reports per user/board

2. **Advanced Automation**
   - Rules engine (if card moved to X, do Y)
   - Auto-assign based on labels
   - Auto-move cards on completion

3. **Integrations**
   - Calendar sync (Google, Outlook)
   - Email integration (create card from email)
   - Slack/Teams notifications
   - Export to project management tools

4. **Custom Fields**
   - Add custom fields to cards
   - Field types: text, number, date, dropdown
   - Filter and sort by custom fields

5. **Portfolio View**
   - Multi-board dashboard
   - Cross-board reporting
   - Resource allocation view
   - Dependencies between boards

### 12.2 AI-Powered Features

1. **Smart Scheduling**
   - AI suggests optimal dates
   - Workload balancing
   - Conflict detection

2. **Smart Assignments**
   - Suggest assignees based on skills
   - Load balancing across team
   - Pattern learning from history

3. **Predictive Analytics**
   - Estimate completion dates
   - Risk assessment
   - Bottleneck detection

---

## 13. Risk Assessment & Mitigation

### 13.1 Technical Risks

| Risk | Impact | Likelihood | Mitigation |
|------|--------|------------|------------|
| Performance with large boards | High | Medium | Virtual scrolling, lazy loading, pagination |
| Data loss during save | Critical | Low | Auto-save drafts, backup before save, version history |
| Concurrent edit conflicts | Medium | Medium | Last-write-wins + warning, future: operational transform |
| Browser compatibility | Medium | Low | Test on major browsers, use standard APIs |

### 13.2 UX Risks

| Risk | Impact | Likelihood | Mitigation |
|------|--------|------------|------------|
| Complex UI overwhelming users | High | Medium | Progressive disclosure, good onboarding, clear docs |
| Notification fatigue | Medium | High | Smart aggregation, user preferences, digest options |
| Mobile UX poor | Medium | Medium | Mobile-first design for key features, touch testing |

### 13.3 Adoption Risks

| Risk | Impact | Likelihood | Mitigation |
|------|--------|------------|------------|
| Users don't understand integration | High | Medium | Clear documentation, video tutorials, examples |
| Users prefer existing tools | High | Low | Focus on unique workflow integration benefit |
| Learning curve too steep | Medium | Medium | Simple defaults, guided tutorials, templates |

---

## 14. Appendix: Technical Specifications

### 14.1 Browser Support

**Minimum:**
- Chrome 90+
- Firefox 88+
- Safari 14+
- Edge 90+

**Required APIs:**
- Drag and Drop API
- LocalStorage
- Fetch API
- Notification API (optional)
- Date/Time APIs

### 14.2 Performance Targets

- **Initial Load:** < 2s
- **Card Move:** < 100ms
- **Board Switch:** < 500ms
- **Search:** < 200ms
- **Max Cards per Board:** 500 (with virtual scrolling: 5000)

### 14.3 Security Considerations

1. **Input Validation**
   - Sanitize all user inputs
   - Validate JSON structure
   - Prevent XSS attacks

2. **Access Control**
   - Verify user permissions on all actions
   - Board-level and card-level permissions
   - Audit trail for sensitive actions

3. **Data Privacy**
   - User data encryption at rest (future)
   - HTTPS only
   - Privacy policy compliance

---

## 15. Conclusion

This architecture provides a **comprehensive, feasible, and scalable** solution for adding project management capabilities to the compliance workflow system.

**Key Benefits:**
- ✅ Seamless integration with existing workflow
- ✅ Familiar user interface patterns
- ✅ Progressive enhancement (start simple, add features)
- ✅ Multi-user collaboration
- ✅ Flexible scheduling and recurrence
- ✅ Maintainable codebase

**Next Steps:**
1. Review and approve this architecture
2. Set up development environment
3. Begin Batch 1 implementation
4. Iterate based on feedback

**Estimated Total Effort:** 9 weeks (1 developer, full-time equivalent)

---

**Ready to proceed with implementation? Let me know if you want me to start building Batch 1!**
