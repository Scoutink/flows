# Data Models & Structures

**Document Version**: 1.0  
**Date**: 2025-11-11  
**Scope**: Complete data schema documentation

---

## 📊 Overview

This document provides comprehensive schemas for all data structures used in the Compliance Workflow Manager system.

---

## 🗂️ File: workflow.json

### Purpose
Stores the complete workflow structure including all flows, controls, actions, and evidence.

### Root Schema

```typescript
{
  settings: WorkflowSettings,
  flows: Flow[]
}
```

### WorkflowSettings

```typescript
interface WorkflowSettings {
  enforceSequence: boolean  // If true, evidence must be completed in order
}
```

### Flow

```typescript
interface Flow {
  id: string               // Format: "flow-{timestamp}-{random}"
  name: string            // Flow name
  data: Control[]         // Array of controls
}
```

### Control (Category)

```typescript
interface Control {
  id: string                    // Format: "cat-{timestamp}-{random}"
  name: string                  // Control name
  subcategories: Action[]       // Array of actions
  tags?: string[]               // Optional tags for categorization
}
```

### Action

```typescript
interface Action {
  id: string                    // Format: "act-{timestamp}-{random}"
  name: string                  // Action name
  text: string                  // Action description
  completed: boolean            // Action completion status
  subcategories: Evidence[]     // Array of evidence items
  tags?: string[]               // Optional tags
}
```

### Evidence

```typescript
interface Evidence {
  id: string                    // Format: "evi-{timestamp}-{random}"
  name: string                  // Evidence identifier (e.g., "ID.AM-1.1")
  text: string                  // Evidence description
  completed: boolean            // Completion status
  grade: number                 // Evidence grade/score
  tags?: string[]               // Optional tags
  footer: EvidenceFooter        // Attachments and notes
  isLocked: boolean             // If true, cannot be edited
  isActive: boolean             // If true, currently active
  subcategories: []             // Always empty (leaf node)
}
```

### EvidenceFooter

```typescript
interface EvidenceFooter {
  links: Link[]                 // External links
  images: string[]              // Image URLs
  notes: Note[]                 // Rich text notes
  comments: string[]            // Simple text comments
}

interface Link {
  text: string                  // Link display text
  url: string                   // Link URL
}

interface Note {
  title: string                 // Note title
  content: string               // Rich HTML content (from Quill)
}
```

### Example

```json
{
  "settings": {
    "enforceSequence": false
  },
  "flows": [
    {
      "id": "flow-1761566127638-rb786",
      "name": "NIST CSF Framework",
      "data": [
        {
          "id": "cat-1761691229395-98uze",
          "name": "ID.AM - Asset Management",
          "subcategories": [
            {
              "id": "act-1761691229395-p0u6n",
              "name": "ID.AM-1: Physical device inventory",
              "text": "Maintain inventory of physical devices",
              "completed": false,
              "tags": ["inventory", "assets"],
              "subcategories": [
                {
                  "id": "evi-1761691229395-z6krz",
                  "name": "ID.AM-1.1",
                  "text": "Asset inventory must be documented and updated",
                  "completed": true,
                  "grade": 1.25,
                  "tags": ["critical", "documentation"],
                  "footer": {
                    "links": [
                      {
                        "text": "Asset Management Policy",
                        "url": "https://example.com/policy.pdf"
                      }
                    ],
                    "images": [],
                    "notes": [
                      {
                        "title": "Implementation Guide",
                        "content": "<p>Use CMDB for tracking</p>"
                      }
                    ],
                    "comments": [
                      "Requires quarterly review"
                    ]
                  },
                  "subcategories": [],
                  "isLocked": false,
                  "isActive": false
                }
              ]
            }
          ]
        }
      ]
    }
  ]
}
```

---

## 🗂️ File: executions.json

### Purpose
Stores completion status for evidence items, separated by flow.

### Root Schema

```typescript
{
  flows: {
    [flowId: string]: FlowExecution
  }
}
```

### FlowExecution

```typescript
interface FlowExecution {
  completed: {
    [evidenceId: string]: boolean
  }
}
```

### Example

```json
{
  "flows": {
    "flow-1761566127638-rb786": {
      "completed": {
        "evi-1761691229395-z6krz": true,
        "evi-1761691229395-1l14m": false,
        "evi-1761691229396-abc12": true
      }
    },
    "flow-1761566127638-xyz99": {
      "completed": {
        "evi-1761691229397-def34": false
      }
    }
  }
}
```

### Notes
- Separate from workflow structure for performance
- Allows independent execution tracking per flow
- Missing entries default to `false`

---

## 🗂️ File: workflow-links.json

### Purpose
Stores relationships between linked workflows for structural synchronization.

### Root Schema

```typescript
{
  links: LinkGroup[]
}
```

### LinkGroup

```typescript
interface LinkGroup {
  groupId: string           // Format: "group-{timestamp}-{random}"
  workflows: string[]       // Array of flow IDs in this group
}
```

### Example

```json
{
  "links": [
    {
      "groupId": "group-1761812047784-abc123",
      "workflows": [
        "flow-1761566127638-rb786",
        "flow-1761566127638-xyz99",
        "flow-1761566127638-def44"
      ]
    },
    {
      "groupId": "group-1761812047885-def456",
      "workflows": [
        "flow-1761566127639-aaa11",
        "flow-1761566127639-bbb22"
      ]
    }
  ]
}
```

### Behavior
- When structure changes in one workflow, it synchronizes to all workflows in the same link group
- Execution states remain independent
- Tags remain independent per workflow

---

## 🗂️ File: ppm-boards.json

### Purpose
Stores all project boards, columns, cards, and related data.

### Root Schema

```typescript
{
  boards: Board[]
}
```

### Board

```typescript
interface Board {
  id: string                      // Format: "board-{timestamp}-{random}"
  name: string                    // Board name
  description: string             // Board description
  sourceControlId: string | null  // Original control ID (if converted from workflow)
  sourceFlowId: string | null     // Original flow ID
  createdAt: string              // ISO-8601 timestamp
  createdBy: string              // User ID of creator
  archived: boolean              // If true, board is archived
  members: BoardMember[]         // Board members
  columns: Column[]              // Board columns
  cards: Card[]                  // All cards (column membership via columnId)
  labels: Label[]                // Board labels
  settings: BoardSettings        // Board settings
  activity: Activity[]           // Activity log
}
```

### BoardMember

```typescript
interface BoardMember {
  userId: string                 // User ID
  name: string                   // User name
  email: string                  // User email
  role: 'admin' | 'member'       // Board role
  avatar: string                 // Avatar URL or empty
  joinedAt: string              // ISO-8601 timestamp
}
```

### Column

```typescript
interface Column {
  id: string                     // Format: "col-{timestamp}-{random}"
  name: string                   // Column name
  order: number                  // Display order (0-based)
  limit: number | null           // WIP limit (null = unlimited)
  color: string                  // Hex color code
}
```

### Card

```typescript
interface Card {
  id: string                     // Format: "card-{timestamp}-{random}"
  boardId: string                // Parent board ID
  columnId: string               // Current column ID
  order: number                  // Position within column (0-based)
  title: string                  // Card title
  description: string            // Card description
  sourceType: 'control' | 'action' | 'evidence' | null  // Original workflow node type
  sourceId: string | null        // Original node ID
  sourceGrade: number | null     // Original evidence grade
  assignments: Assignment[]      // User assignments
  schedule: Schedule             // Scheduling information
  checklist: ChecklistItem[]     // Checklist items
  labels: string[]               // Label names
  attachments: Attachment[]      // Attachments
  linkedBacklogItems: string[]   // IDs of backlog cards this card is linked to
  status: CardStatus             // Status information
  effort: Effort                 // Effort tracking
  activity: []                   // Reserved for future use
  createdAt: string             // ISO-8601 timestamp
  createdBy: string             // User ID
  updatedAt: string             // ISO-8601 timestamp
  updatedBy: string             // User ID
}
```

### Assignment

```typescript
interface Assignment {
  userId: string                 // User ID
  role: 'executor' | 'approver' | 'follower' | 'supervisor'  // Assignment role
  assignedAt: string            // ISO-8601 timestamp
  assignedBy: string            // User ID who assigned
}
```

### Schedule

```typescript
interface Schedule {
  startDate: string | null       // ISO-8601 date
  startMode: 'date' | 'relative' | 'dependency'  // Start date calculation mode
  startDays: number | null       // Days offset (for relative mode)
  startDependency: string | null // Card ID dependency
  dueDate: string | null         // ISO-8601 date
  dueMode: 'date' | 'relative'   // Due date calculation mode
  dueDays: number | null         // Days offset (for relative mode)
  recurrence: Recurrence         // Recurrence pattern
  reminders: Reminder[]          // Reminder settings
}

interface Recurrence {
  enabled: boolean               // If true, card recurs
  pattern: 'daily' | 'weekly' | 'monthly' | 'yearly'  // Recurrence pattern
  interval: number               // Repeat every N periods
  startOf: 'month' | 'week' | null  // Start calculation
  endOf: string | null           // End calculation
  customDays: number[]           // Custom days (for weekly pattern)
  endMode: 'never' | 'after' | 'on'  // How recurrence ends
  endOccurrences: number | null  // Number of occurrences (for 'after' mode)
  endDate: string | null         // End date (for 'on' mode)
}

interface Reminder {
  id: string                     // Reminder ID
  type: 'email' | 'browser'      // Reminder type
  time: string                   // ISO-8601 timestamp
  sent: boolean                  // If true, reminder was sent
}
```

### ChecklistItem

```typescript
interface ChecklistItem {
  id: string                     // Format: "check-{timestamp}-{random}"
  text: string                   // Checklist item text
  completed: boolean             // Completion status
  completedBy: string | null     // User ID
  completedAt: string | null     // ISO-8601 timestamp
}
```

### Attachment

```typescript
interface Attachment {
  id: string                     // Format: "att-{timestamp}-{random}"
  type: 'link' | 'image' | 'note' | 'comment'  // Attachment type
  title: string                  // Attachment title
  url: string | null             // URL (for links and images)
  content: string | null         // Content (for notes and comments)
  uploadedBy: string             // User ID
  uploadedAt: string             // ISO-8601 timestamp
}
```

### CardStatus

```typescript
interface CardStatus {
  current: 'pending' | 'in_progress' | 'completed' | 'blocked'  // Current status
  blocked: boolean               // If true, card is blocked
  blockedReason: string | null   // Reason for blocking
  approvalStatus: 'pending' | 'approved' | 'rejected' | null  // Approval status
  approvedBy: string | null      // User ID of approver
  approvedAt: string | null      // ISO-8601 timestamp
}
```

### Effort

```typescript
interface Effort {
  estimated: number | null       // Estimated effort
  actual: number | null          // Actual effort
  unit: 'hours' | 'days' | 'points'  // Effort unit
}
```

### Label

```typescript
interface Label {
  id: string                     // Format: "label-{timestamp}-{random}"
  boardId: string                // Parent board ID
  name: string                   // Label name
  color: string                  // Hex color code
  description: string            // Label description
}
```

### BoardSettings

```typescript
interface BoardSettings {
  notificationsEnabled: boolean  // Enable notifications
  allowGuestView: boolean        // Allow guest viewing
  enforceWIPLimit: boolean       // Enforce WIP limits
}
```

### Activity

```typescript
interface Activity {
  id: string                     // Format: "act-{timestamp}-{random}"
  boardId: string                // Parent board ID
  cardId: string | null          // Related card ID (null for board-level activities)
  userId: string                 // User who performed action
  type: string                   // Activity type (e.g., 'card.created', 'board.updated')
  timestamp: string              // ISO-8601 timestamp
  data: object                   // Activity-specific data
  description: string            // Human-readable description
}
```

### Example

```json
{
  "boards": [
    {
      "id": "board-1761812047784-aboeu",
      "name": "ID.AM - Asset Management",
      "description": "Asset management compliance tasks",
      "sourceControlId": "cat-1761691229395-98uze",
      "sourceFlowId": "flow-1761566127638-rb786",
      "createdAt": "2025-10-30T08:14:07.784Z",
      "createdBy": "user-default-001",
      "archived": false,
      "members": [
        {
          "userId": "user-default-001",
          "name": "John Doe",
          "email": "john@example.com",
          "role": "admin",
          "avatar": "",
          "joinedAt": "2025-10-30T08:14:07.785Z"
        }
      ],
      "columns": [
        {
          "id": "col-1761812047785-novrm",
          "name": "Backlog",
          "order": 0,
          "limit": null,
          "color": "#6c757d"
        },
        {
          "id": "col-1761812047785-615kk",
          "name": "To Do",
          "order": 1,
          "limit": null,
          "color": "#0d6efd"
        },
        {
          "id": "col-1761812047785-lpw6c",
          "name": "In Progress",
          "order": 2,
          "limit": 5,
          "color": "#0dcaf0"
        }
      ],
      "cards": [
        {
          "id": "card-1761812047790-xyz123",
          "boardId": "board-1761812047784-aboeu",
          "columnId": "col-1761812047785-novrm",
          "order": 0,
          "title": "ID.AM-1.1",
          "description": "Asset inventory must be documented",
          "sourceType": "evidence",
          "sourceId": "evi-1761691229395-z6krz",
          "sourceGrade": 1.25,
          "assignments": [
            {
              "userId": "user-default-001",
              "role": "executor",
              "assignedAt": "2025-10-30T08:15:00.000Z",
              "assignedBy": "user-default-001"
            }
          ],
          "schedule": {
            "startDate": null,
            "startMode": "date",
            "startDays": null,
            "startDependency": null,
            "dueDate": "2025-11-30",
            "dueMode": "date",
            "dueDays": null,
            "recurrence": {
              "enabled": false,
              "pattern": "monthly",
              "interval": 1,
              "startOf": "month",
              "endOf": null,
              "customDays": [],
              "endMode": "never",
              "endOccurrences": null,
              "endDate": null
            },
            "reminders": []
          },
          "checklist": [],
          "labels": ["critical", "documentation"],
          "attachments": [
            {
              "id": "att-1761812047791-abc456",
              "type": "link",
              "title": "Asset Management Policy",
              "url": "https://example.com/policy.pdf",
              "content": null,
              "uploadedBy": "user-default-001",
              "uploadedAt": "2025-10-30T08:14:07.791Z"
            }
          ],
          "linkedBacklogItems": [],
          "status": {
            "current": "pending",
            "blocked": false,
            "blockedReason": null,
            "approvalStatus": null,
            "approvedBy": null,
            "approvedAt": null
          },
          "effort": {
            "estimated": 8,
            "actual": null,
            "unit": "hours"
          },
          "activity": [],
          "createdAt": "2025-10-30T08:14:07.790Z",
          "createdBy": "user-default-001",
          "updatedAt": "2025-10-30T08:14:07.790Z",
          "updatedBy": "user-default-001"
        }
      ],
      "labels": [
        {
          "id": "label-1761812047792-def789",
          "boardId": "board-1761812047784-aboeu",
          "name": "critical",
          "color": "#dc3545",
          "description": "Critical priority items"
        }
      ],
      "settings": {
        "notificationsEnabled": true,
        "allowGuestView": false,
        "enforceWIPLimit": false
      },
      "activity": [
        {
          "id": "act-1761812047793-ghi012",
          "boardId": "board-1761812047784-aboeu",
          "cardId": null,
          "userId": "user-default-001",
          "type": "board.created",
          "timestamp": "2025-10-30T08:14:07.793Z",
          "data": {
            "boardName": "ID.AM - Asset Management"
          },
          "description": "John Doe created board \"ID.AM - Asset Management\""
        }
      ]
    }
  ]
}
```

---

## 🗂️ File: ppm-users.json

### Purpose
Stores user profiles and preferences.

### Root Schema

```typescript
{
  users: User[]
}
```

### User

```typescript
interface User {
  id: string                     // Format: "user-{timestamp}-{random}"
  name: string                   // Full name
  email: string                  // Email address
  avatar: string                 // Avatar URL or empty
  role: 'admin' | 'member' | 'guest'  // System role
  department: string             // Department name
  position: string               // Job title
  notifications: NotificationSettings  // Notification preferences
  preferences: UserPreferences   // User preferences
  createdAt: string             // ISO-8601 timestamp
}
```

### NotificationSettings

```typescript
interface NotificationSettings {
  email: boolean                 // Email notifications
  browser: boolean               // Browser notifications
  assignments: boolean           // Notify on assignments
  mentions: boolean              // Notify on mentions
  reminders: boolean             // Notify on reminders
}
```

### UserPreferences

```typescript
interface UserPreferences {
  theme: 'light' | 'dark'        // UI theme
  boardView: 'kanban' | 'list'   // Default board view
  timezone: string               // Timezone (IANA format)
}
```

### Example

```json
{
  "users": [
    {
      "id": "user-default-001",
      "name": "John Doe",
      "email": "john@example.com",
      "avatar": "",
      "role": "admin",
      "department": "IT Security",
      "position": "Compliance Manager",
      "notifications": {
        "email": true,
        "browser": true,
        "assignments": true,
        "mentions": true,
        "reminders": true
      },
      "preferences": {
        "theme": "light",
        "boardView": "kanban",
        "timezone": "Europe/Brussels"
      },
      "createdAt": "2025-01-01T00:00:00.000Z"
    }
  ]
}
```

---

## 🔗 Data Relationships

### Primary Keys (PK)
- **Flow**: `id`
- **Control**: `id`
- **Action**: `id`
- **Evidence**: `id`
- **Board**: `id`
- **Column**: `id`
- **Card**: `id`
- **User**: `id`
- **Label**: `id`
- **Link Group**: `groupId`

### Foreign Keys (FK)

#### workflow.json → executions.json
```
Flow.id → executions.flows[flowId]
Evidence.id → executions.flows[flowId].completed[evidenceId]
```

#### workflow.json → workflow-links.json
```
Flow.id → links[].workflows[]
```

#### workflow.json → ppm-boards.json
```
Control.id → Board.sourceControlId
Flow.id → Board.sourceFlowId
Evidence.id → Card.sourceId
```

#### ppm-boards.json → ppm-users.json
```
BoardMember.userId → User.id
Assignment.userId → User.id
Activity.userId → User.id
Card.createdBy → User.id
Card.updatedBy → User.id
Board.createdBy → User.id
```

#### ppm-boards.json (internal)
```
Card.columnId → Column.id
Card.linkedBacklogItems[] → Card.id
Card.boardId → Board.id
Label.boardId → Board.id
Activity.boardId → Board.id
Activity.cardId → Card.id
```

---

## 🎯 Data Validation Rules

### ID Format
All IDs follow the pattern: `{prefix}-{timestamp}-{random}`
- Prefix identifies entity type
- Timestamp ensures uniqueness
- Random suffix provides collision avoidance

### Timestamps
All timestamps must be valid ISO-8601 format:
```
YYYY-MM-DDTHH:mm:ss.sssZ
```

### Required Fields
- Every entity must have `id`
- Every entity must have creation timestamp
- Every user action must have `userId`

### Constraints
- Column `order` must be unique within board
- Card `order` must be unique within column
- Email must be valid format
- URLs must be valid format or empty
- Colors must be valid hex codes

---

**Next**: Read [Quick Reference Guide](./10-QUICK-REFERENCE.md) for fast lookup
