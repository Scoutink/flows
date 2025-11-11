# System Architecture - Compliance Workflow Manager

**Document Version**: 1.0  
**Date**: 2025-11-11  
**Scope**: Technical architecture deep-dive

---

## 🏗️ Architecture Overview

The Compliance Workflow Manager follows a **modular, layered architecture** with clear separation of concerns.

### High-Level Architecture

```
┌─────────────────────────────────────────────────────────────┐
│                    PRESENTATION LAYER                        │
│  ┌────────────────────┐         ┌─────────────────────┐    │
│  │  Workflow Manager  │         │   PPM Board System  │    │
│  │   (index.html)     │ ←────→  │  (boards.html)      │    │
│  │   script.js        │         │  ppm-script.js      │    │
│  │   style.css        │         │  ppm-style.css      │    │
│  └────────────────────┘         └─────────────────────┘    │
└─────────────────────────────────────────────────────────────┘
                          ↕
┌─────────────────────────────────────────────────────────────┐
│                   APPLICATION LAYER                          │
│  ┌──────────────────────────────────────────────────────┐   │
│  │              State Management                        │   │
│  │  • appState (workflow manager)                       │   │
│  │  • PPM.state (board system)                         │   │
│  │  • localStorage (theme, preferences)                 │   │
│  └──────────────────────────────────────────────────────┘   │
│  ┌──────────────────────────────────────────────────────┐   │
│  │              Business Logic                          │   │
│  │  • Workflow operations                              │   │
│  │  • Board operations                                 │   │
│  │  • User management                                  │   │
│  │  • Integration layer                                │   │
│  └──────────────────────────────────────────────────────┘   │
└─────────────────────────────────────────────────────────────┘
                          ↕
┌─────────────────────────────────────────────────────────────┐
│                    DATA LAYER                                │
│  ┌──────────┐  ┌───────────┐  ┌──────────┐  ┌──────────┐  │
│  │workflow  │  │executions │  │ppm-boards│  │ppm-users │  │
│  │.json     │  │.json      │  │.json     │  │.json     │  │
│  └──────────┘  └───────────┘  └──────────┘  └──────────┘  │
│  ┌──────────┐                                               │
│  │workflow- │                                               │
│  │links.json│                                               │
│  └──────────┘                                               │
└─────────────────────────────────────────────────────────────┘
                          ↕
┌─────────────────────────────────────────────────────────────┐
│                  PERSISTENCE LAYER                           │
│  ┌──────────────┐  ┌──────────────┐  ┌──────────────┐      │
│  │save_workflow │  │save_board    │  │save_users    │      │
│  │.php          │  │.php          │  │.php          │      │
│  └──────────────┘  └──────────────┘  └──────────────┘      │
│  ┌──────────────┐  ┌──────────────┐                        │
│  │save_execu-   │  │save_workflow_│                        │
│  │tions.php     │  │links.php     │                        │
│  └──────────────┘  └──────────────┘                        │
└─────────────────────────────────────────────────────────────┘
```

---

## 📦 Component Breakdown

### 1. Workflow Manager Component

**Files**: `index.html`, `script.js`, `style.css`

#### Responsibilities
- Workflow structure management (CRUD operations)
- Multi-flow support
- Creation/Execution mode switching
- Tag management
- Linked workflow synchronization
- Evidence completion tracking
- Rich text editing (Quill)

#### Key Sub-Components

##### A. State Management
```javascript
appState = {
    theme: 'light',
    currentMode: 'execution',
    workflow: {
        settings: { enforceSequence: true },
        flows: [] // [{id, name, data:[controls...]}]
    },
    executions: {
        flows: {
            // flowId: { completed: { evidenceId: true/false } }
        }
    },
    workflowLinks: {
        links: [] // [{groupId, workflows:[flowId1, flowId2]}]
    },
    currentFlowId: null,
    selectedActionPaths: {},
    expandedTextAreas: new Set(),
    activeTag: null
}
```

##### B. Rendering System
- **Hierarchical rendering**: Control → Action → Evidence
- **Conditional rendering**: Creation vs Execution mode
- **Tag-based filtering**: Dynamic filtering by active tag
- **Performance optimization**: Selective re-renders

##### C. Event System
- **Delegation-based**: Single root listener for efficiency
- **Action-path pattern**: Data attributes for element identification
- **Modal system**: Reusable modal for all dialogs

#### Data Flow
```
User Event → Event Handler → State Mutation → Save → Re-render → DOM Update
```

---

### 2. PPM Board System Component

**Files**: `boards.html`, `board.html`, `ppm-script.js`, `ppm-style.css`

#### Responsibilities
- Board management (list, create, delete, archive)
- Individual board view (Kanban)
- Card management (CRUD, drag-and-drop)
- Column management
- User assignments
- Backlog filtering
- Activity logging

#### Key Sub-Components

##### A. PPM State Management
```javascript
PPM.state = {
    view: 'boards', // 'boards' or 'board'
    currentBoardId: null,
    currentUser: null,
    boards: [],
    users: [],
    theme: 'light',
    draggedCard: null,
    draggedOverColumn: null,
    backlogFilter: null
}
```

##### B. Board Operations Module
- **CRUD operations**: Create, read, update, delete boards
- **Column management**: Add, rename, delete, reorder columns
- **Default columns**: Backlog, To Do, In Progress, Review, Done
- **WIP limits**: Optional work-in-progress limits per column

##### C. Card Operations Module
- **CRUD operations**: Full card lifecycle management
- **Drag-and-drop**: Native HTML5 drag-and-drop
- **Order management**: Automatic reordering on move
- **Filtering**: Backlog-based filtering

##### D. Assignment System
- **Four roles**: Executor, Approver, Follower, Supervisor
- **Multi-assignment**: Multiple users per role
- **Board membership**: Automatic addition on assignment

##### E. Integration Layer
- **Workflow-to-board conversion**: `convertControlToBoard()`
- **Tag preservation**: Workflow tags → Board labels
- **Evidence → Cards**: Evidence items become cards
- **Attachment mapping**: Footer content → Attachments

#### Data Flow
```
User Action → UI Event → State Update → Save to JSON → Re-render Board
     ↓
Drag-and-Drop → Calculate New Order → Update All Affected Cards → Save → Render
```

---

### 3. Integration Layer

#### Workflow ↔ Board Integration

##### Export: Workflow to Board
```javascript
// Process flow:
1. User clicks "Create Board" button on tagged items
2. System collects all evidence matching tag
3. convertControlToBoard() creates new board
4. Evidence items become cards in Backlog column
5. Tags become board labels
6. Footer content becomes attachments
7. Board saved to ppm-boards.json
8. User redirected to new board
```

##### Data Mapping
```
Workflow Control     → Board
├── name            → board.name
├── text            → board.description
├── id              → board.sourceControlId
├── tags            → board.labels[]
└── Actions
    └── Evidence[]  → board.cards[]
        ├── name    → card.title
        ├── text    → card.description
        ├── id      → card.sourceId
        ├── grade   → card.sourceGrade
        └── footer  → card.attachments[]
```

---

## 🗄️ Data Layer Architecture

### JSON File Structure

#### 1. `workflow.json`
```json
{
  "settings": {
    "enforceSequence": boolean
  },
  "flows": [
    {
      "id": "flow-{timestamp}-{random}",
      "name": "Flow Name",
      "data": [ /* Control objects */ ]
    }
  ]
}
```

#### 2. `executions.json`
```json
{
  "flows": {
    "flow-id": {
      "completed": {
        "evidence-id": true/false
      }
    }
  }
}
```

#### 3. `ppm-boards.json`
```json
{
  "boards": [
    {
      "id": "board-{timestamp}-{random}",
      "name": "Board Name",
      "description": "...",
      "sourceControlId": "cat-...",
      "sourceFlowId": "flow-...",
      "createdAt": "ISO-8601",
      "createdBy": "user-id",
      "archived": false,
      "members": [ /* Member objects */ ],
      "columns": [ /* Column objects */ ],
      "cards": [ /* Card objects */ ],
      "labels": [ /* Label objects */ ],
      "settings": { /* Board settings */ },
      "activity": [ /* Activity log */ ]
    }
  ]
}
```

#### 4. `ppm-users.json`
```json
{
  "users": [
    {
      "id": "user-{timestamp}-{random}",
      "name": "User Name",
      "email": "user@example.com",
      "avatar": "url or empty",
      "role": "admin|member",
      "department": "...",
      "position": "...",
      "notifications": { /* Notification preferences */ },
      "preferences": { /* User preferences */ },
      "createdAt": "ISO-8601"
    }
  ]
}
```

#### 5. `workflow-links.json`
```json
{
  "links": [
    {
      "groupId": "group-{timestamp}-{random}",
      "workflows": ["flow-id-1", "flow-id-2"]
    }
  ]
}
```

### Data Relationships

```
workflow.json
├── flows[]
    ├── id (PK)
    └── data[]
        ├── Controls (id: cat-*)
            ├── Actions (id: act-*)
                └── Evidence (id: evi-*)

executions.json
├── flows{}
    └── [flow-id] (FK to workflow.flows[].id)
        └── completed{}
            └── [evidence-id] (FK to evi-*)

ppm-boards.json
├── boards[]
    ├── id (PK)
    ├── sourceControlId (FK to cat-*)
    ├── sourceFlowId (FK to flow-*)
    └── cards[]
        ├── id (PK)
        ├── sourceId (FK to evi-*)
        └── linkedBacklogItems[] (FK to card.id)

ppm-users.json
├── users[]
    └── id (PK)

workflow-links.json
├── links[]
    └── workflows[] (FK to flow-id)
```

---

## 🔄 State Management Strategy

### Workflow Manager State

#### Single Source of Truth
The `appState` object is the single source of truth for the workflow manager.

#### State Updates
```javascript
// Pattern:
1. User action triggers event
2. Event handler mutates state
3. Save to backend (async)
4. Re-render affected components
5. DOM updates reflect new state
```

#### Persistence Strategy
- **Auto-save**: No explicit save on every change
- **Manual save**: User clicks "Save" buttons
- **Optimistic updates**: UI updates immediately, save async

### PPM State

#### Module Pattern
```javascript
const PPM = (() => {
    let state = { /* PPM state */ };
    
    // Private functions
    const loadBoards = async () => { /* ... */ };
    const saveBoards = async () => { /* ... */ };
    
    // Public API
    return {
        init,
        state,
        ui,
        /* ... */
    };
})();
```

#### Benefits
- **Encapsulation**: Private state and functions
- **Global access**: Single `PPM` global
- **No pollution**: Clean global namespace

---

## 🎨 UI Architecture

### Component Hierarchy

#### Workflow Manager
```
index.html
├── Header
│   ├── Flow Selector
│   ├── Theme Toggle
│   ├── Help Link
│   └── Mode Switch
├── Global Settings
│   ├── Sequential Enforcement Toggle
│   └── Save Buttons
├── Tag Filter Banner (Execution Mode)
└── Workflow Root
    └── Controls[]
        ├── Control Header
        ├── Control Body
        └── Actions[]
            ├── Action Header
            ├── Action Body
            └── Evidence[]
                ├── Evidence Header
                ├── Evidence Body
                └── Footer
                    ├── Links
                    ├── Images
                    ├── Notes
                    └── Comments
```

#### PPM Boards List
```
boards.html
├── Navbar
│   ├── Branding
│   ├── Back Link
│   ├── Documentation Link
│   ├── Theme Toggle
│   └── User Menu
├── Header
│   ├── Title & Subtitle
│   └── Create Board Button
├── Boards Grid
│   └── Board Cards[]
│       ├── Title
│       ├── Description
│       ├── Stats
│       └── Progress Bar
└── Empty State
```

#### PPM Individual Board
```
board.html
├── Navbar
│   ├── Back Button
│   ├── Board Title
│   ├── Board Menu
│   ├── Members
│   ├── Add Member Button
│   ├── Filter Button
│   ├── Documentation Link
│   └── Theme Toggle
├── Backlog Filter Banner
└── Board Columns
    └── Columns[]
        ├── Column Header
        │   ├── Title
        │   ├── Card Count
        │   └── Menu
        └── Column Cards
            └── Cards[]
                ├── Labels
                ├── Title
                ├── Description
                ├── Attachments (Backlog)
                ├── Meta (Due Date, Checklist, etc.)
                └── Assignees
```

### CSS Architecture

#### Methodology
- **BEM-inspired**: Block-Element-Modifier naming
- **Component-based**: Styles organized by component
- **Utility classes**: Common patterns (hidden, danger, etc.)
- **Theme support**: Light/dark via CSS variables

#### File Organization
```css
/* style.css */
1. CSS Variables (theme colors, spacing)
2. Reset/Base Styles
3. Layout Components
4. Workflow Components
5. Modal System
6. Utility Classes
7. Dark Theme Overrides
8. Responsive Media Queries

/* ppm-style.css */
1. CSS Variables
2. Base Styles
3. Navbar
4. Boards Grid
5. Board View
6. Cards
7. Modals
8. Dark Theme
9. Responsive
```

---

## 🔌 API Layer

### Backend PHP Scripts

All follow the same pattern:

```php
<?php
header('Content-Type: application/json');

// Get JSON input
$input = file_get_contents('php://input');
$data = json_decode($input, true);

// Validate
if (!$data || !isset($data['key'])) {
    echo json_encode(['status' => 'error', 'message' => 'Invalid data']);
    exit;
}

// Save to file
$result = file_put_contents('data.json', json_encode($data, JSON_PRETTY_PRINT));

// Response
if ($result !== false) {
    echo json_encode(['status' => 'success']);
} else {
    echo json_encode(['status' => 'error', 'message' => 'Failed to save']);
}
?>
```

#### Available Endpoints
- `save_workflow.php` - Save workflow structure
- `save_executions.php` - Save execution state
- `save_board.php` - Save boards data
- `save_users.php` - Save users data
- `save_workflow_links.php` - Save workflow links

### Client-Side API Usage

```javascript
// Example: Save workflow
const saveWorkflow = async () => {
    try {
        const res = await fetch('save_workflow.php', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(appState.workflow)
        });
        const json = await res.json();
        if (json.status !== 'success') {
            throw new Error(json.message);
        }
        alert('Saved successfully!');
    } catch (e) {
        alert('Save failed: ' + e.message);
    }
};
```

---

## 🚀 Performance Considerations

### Optimization Strategies

#### 1. Selective Rendering
- Only re-render affected components
- Use `innerHTML` for bulk updates
- Avoid full page re-renders

#### 2. Event Delegation
- Single event listener on root elements
- Use data attributes for routing
- Reduces memory overhead

#### 3. Lazy Loading
- Load data only when needed
- Defer non-critical resources
- Progressive enhancement

#### 4. Debouncing
- Debounce search/filter operations
- Throttle scroll events
- Batch state updates

#### 5. Caching
- Cache rendered HTML fragments
- Memoize expensive computations
- Use localStorage for preferences

### Performance Targets

| Metric | Target | Actual |
|--------|--------|--------|
| Initial Load | < 2s | < 1s |
| Render Update | < 100ms | < 50ms |
| Save Operation | < 1s | < 500ms |
| Drag-and-Drop | 60fps | 60fps |
| Modal Open | < 100ms | < 50ms |

---

## 🔒 Security Architecture

### Input Validation
- Client-side validation for UX
- Server-side validation in PHP
- JSON schema validation

### XSS Prevention
- No `eval()` or `Function()` constructors
- Sanitize user input before rendering
- Use `textContent` over `innerHTML` for user data

### Data Integrity
- JSON validation before save
- Atomic file writes
- Backup strategy (outside this app)

### Access Control
- Board membership checks
- Role-based permissions
- No authentication system (assumed external)

---

## 📱 Responsive Design Architecture

### Breakpoints
```css
/* Mobile First Approach */
- Base: 320px - 767px (Mobile)
- Tablet: 768px - 1023px
- Desktop: 1024px+
- Large: 1440px+
```

### Mobile Strategies
1. **Accordion navigation**: Hierarchical collapse/expand
2. **Touch optimization**: Larger touch targets
3. **Simplified layouts**: Single column on mobile
4. **Viewport meta tag**: Proper mobile rendering
5. **Flexible grids**: CSS Grid and Flexbox

### Critical Mobile Fixes
- Scrolling: Fixed position and overflow issues
- Touch: Proper event handling
- Layout: Responsive breakpoints
- Navigation: Accordion pattern for deep hierarchies

---

## 🧩 Extension Points

### How to Extend the System

#### Add New Features
1. **New workflow node type**:
   - Add rendering logic in `renderControl()` family
   - Add CRUD handlers
   - Update data model
   - Add to save/load logic

2. **New board feature**:
   - Add to PPM state
   - Create UI component
   - Add event handlers
   - Update save logic

3. **New integration**:
   - Create conversion function
   - Add UI trigger
   - Map data structures
   - Test thoroughly

#### Plugin Architecture Potential
Could add:
- Event hooks system
- Plugin registration
- Custom renderers
- External API connectors

---

## 📚 Architecture Decisions

### Why Vanilla JavaScript?
- ✅ No build step required
- ✅ No framework updates
- ✅ Direct DOM manipulation
- ✅ Smaller bundle size
- ✅ Complete control

### Why JSON Files?
- ✅ Simple to understand
- ✅ Easy to debug
- ✅ Version control friendly
- ✅ No database setup
- ✅ Portable

### Why Module Pattern for PPM?
- ✅ Encapsulation
- ✅ Private state
- ✅ Clear API
- ✅ No bundler needed

### Why Quill for Rich Text?
- ✅ Lightweight
- ✅ Good UX
- ✅ Easy integration
- ✅ Cross-browser

---

## 🎯 Architecture Strengths

1. **Simplicity**: Easy to understand and maintain
2. **Modularity**: Clear component boundaries
3. **Extensibility**: Easy to add features
4. **Performance**: Optimized rendering and events
5. **Portability**: Runs anywhere with PHP
6. **Maintainability**: Clean code, good structure

## ⚠️ Architecture Limitations

1. **No real-time sync**: Requires page refresh
2. **No database**: JSON files limit scale
3. **No ORM**: Manual data manipulation
4. **No test framework**: Manual testing
5. **Global state**: Could benefit from state management library

---

**Next**: Read [Evolution Timeline](./03-EVOLUTION-TIMELINE.md) for development history
