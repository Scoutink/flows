# Sample Data Quick Reference Guide

## Overview

This guide describes the sample data created for V7 system demonstration, showing complete V6→V7 migration and workflow-board integration.

---

## 1. SampleFlow (Workflow)

**File:** `/workspace/data/workflow.json`  
**Template:** Classic Compliance (3-Level)  
**Access:** http://your-server/index.html → Select "SampleFlow"

### Structure

```
SampleFlow
├── ID.AM - Asset Management (Rule)
│   ├── ID.AM-1: Physical device inventory (Action)
│   │   ├── ID.AM-1.1 (Evidence) [Grade: 1.25]
│   │   ├── ID.AM-1.2 (Evidence) [Grade: 1.25]
│   │   ├── ID.AM-1.3 (Evidence) [Grade: 1.25]
│   │   └── ID.AM-1.4 (Evidence) [Grade: 1.25]
│   ├── ID.AM-2: Software inventory (Action)
│   │   ├── ID.AM-2.1 (Evidence) [Grade: 1.0]
│   │   ├── ID.AM-2.2 (Evidence) [Grade: 1.0]
│   │   ├── ID.AM-2.3 (Evidence) [Grade: 1.0]
│   │   ├── ID.AM-2.4 (Evidence) [Grade: 1.0]
│   │   └── ID.AM-2.5 (Evidence) [Grade: 1.0]
│   ├── ID.AM-3: Data flows mapping (Action)
│   │   ├── ID.AM.3-1 (Evidence) [Grade: 1.67]
│   │   ├── ID.AM.3-2 (Evidence) [Grade: 1.67]
│   │   └── ID.A.3-3 (Evidence) [Grade: 1.66]
│   ├── ID.AM-4: External systems (Action)
│   │   ├── ID.AM-4.1 (Evidence) [Grade: 2.5]
│   │   └── ID.AM-4.2 (Evidence) [Grade: 2.5]
│   ├── ID.AM-5: Asset prioritization (Action)
│   │   └── ID.AM-5.1 (Evidence) [Grade: 5.0]
│   └── ID.AM-6: Security roles (Action)
│       ├── ID.AM-6.1 (Evidence) [Grade: 2.5]
│       └── ID.AM-6.2 (Evidence) [Grade: 2.5]
│
├── ID.BE - Business Environment (Rule)
│   ├── ID.BE-1: Supply chain role (Action)
│   │   ├── ID.BE-1.1 (Evidence) [Grade: 2.5]
│   │   └── ID.BE-1.2 (Evidence) [Grade: 2.5]
│   ├── ID.BE-2: Critical infrastructure (Action)
│   │   └── ID.BE-2.1 (Evidence) [Grade: 5.0]
│   ├── ID.BE-3: Mission priorities (Action)
│   │   └── ID.BE-3.1 (Evidence) [Grade: 5.0]
│   ├── ID.BE-4: Dependencies (Action)
│   │   └── ID.BE-4.1 (Evidence) [Grade: 5.0]
│   └── ID.BE-5: Resilience requirements (Action)
│       ├── ID.BE-5.1 (Evidence) [Grade: 1.67]
│       ├── ID.BE-5.2 (Evidence) [Grade: 1.67]
│       └── ID.BE-5.3 (Evidence) [Grade: 1.66]
│
└── ID.GV - Governance (Rule)
    └── ID.GV-1: Cybersecurity policy (Action)
        ├── ID.GV-1.1 (Evidence) [Grade: 2.5]
        └── ID.GV-1.2 (Evidence) [Grade: 2.5]
```

### Statistics
- **Rules:** 3
- **Actions:** 12
- **Evidences:** 27
- **Total Grade Points:** 55.31
- **Tags Used:** "incident reporting and handling", "Firewall guidance"

### Features Demonstrated
- ✅ Dynamic template structure
- ✅ Multi-level hierarchy (3 levels)
- ✅ Cumulative grading
- ✅ Progress bars for parent units
- ✅ Rich content (notes, comments, guidelines)
- ✅ Tag filtering
- ✅ Creation/Execution modes
- ✅ Sequential enforcement (optional)

---

## 2. BoardSample (Kanban Board)

**File:** `/workspace/data/ppm-boards.json`  
**Access:** http://your-server/boards.html → Click "BoardSample"

### Mapping Logic

| Workflow Level | Board Element | Count | Description |
|----------------|---------------|-------|-------------|
| Rules (L1) | Reference Items | 3 | Locked in References column |
| Actions (L2) | Categories | 12 | Color-coded for filtering |
| Evidences (L3) | Task Cards | 27 | Distributed across workflow stages |

### Board Structure

#### Columns (5)
1. **🔒 References** (Locked)
   - ID.AM - Asset Management
   - ID.BE - Business Environment
   - ID.GV - Governance
   
2. **📝 To Do** (6 tasks)
3. **🔄 In Progress** (12 tasks)
4. **👁️ Review** (7 tasks)
5. **✅ Done** (2 tasks)

#### Categories (12)
Derived from all Actions, color-coded:
- ID.AM-1 through ID.AM-6 (6 categories)
- ID.BE-1 through ID.BE-5 (5 categories)
- ID.GV-1 (1 category)

#### Milestones (4)
1. **Phase 1: Asset Discovery** 🔵
   - Target: +30 days
   - Linked Tasks: 4

2. **Phase 2: Documentation & Compliance** 🟣
   - Target: +60 days
   - Linked Tasks: 2

3. **Phase 3: Governance Setup** 🟣
   - Target: +90 days
   - Linked Tasks: 9

4. **Q4 Completion** 🟠
   - Target: +120 days
   - Linked Tasks: 5

#### Groups (4)
1. **🔴 Critical Priority** (7 tasks)
   - High-priority items requiring immediate attention

2. **🟠 External Dependencies** (10 tasks)
   - Tasks dependent on vendors/partners

3. **🟢 Quick Wins** (12 tasks)
   - Low-effort, high-impact tasks

4. **🔵 Technical Implementation** (6 tasks)
   - Technical tasks requiring IT expertise

### Task Properties

All 27 tasks include:
- **Link to Reference:** Connected to parent Rule
- **Category:** Assigned to parent Action
- **Priority:** Based on workflow grade (High: ≥5, Medium: 2-5, Low: <2)
- **Due Date:** Spread over 90 days
- **Estimated Hours:** 2, 4, 8, or 16 hours
- **Tags:** Preserved from workflow
- **Milestone:** 60% of tasks assigned
- **Groups:** Multiple group assignments per task (30% probability per group)
- **Activity Log:** Creation timestamp and details
- **Comments:** Grade information where applicable

---

## 3. Integration Points

### Traceability Matrix

| Task Card | → | Category | → | Reference Item |
|-----------|---|----------|---|----------------|
| Evidence  | → | Action   | → | Rule          |
| (27 items)| → | (12 items)| → | (3 items)     |

### Data Flow

```
Workflow (index.html)
    ↓
SampleFlow
    ↓
[Export to Board] → Creates board structure
    ↓
BoardSample (boards.html)
    ↓
Task Management → Updates → Milestone Status
```

---

## 4. Testing Scenarios

### Workflow Testing

#### Basic Navigation
1. Open `index.html`
2. Select "SampleFlow" from dropdown
3. Verify 3 rules visible
4. Expand each rule → verify actions appear
5. Expand each action → verify evidences appear

#### Mode Switching
1. Switch to **Execution** mode
2. Verify "Done" checkboxes appear on evidences
3. Mark some evidences as complete
4. Switch back to **Creation** mode
5. Verify editing capabilities restored

#### Grading & Progress
1. In Creation mode, add/edit grades
2. Verify cumulative grades calculate for actions
3. Verify progress bars update based on completion
4. Check that parent-child grade relationships work

#### Tag Filtering
1. Click "Filter by Tags"
2. Select "Firewall guidance"
3. Verify only tagged items visible
4. Clear filter → all items return

### Board Testing

#### Column Operations
1. Open `boards.html`
2. Click "BoardSample"
3. Try to drag a Reference item → should fail (locked)
4. Drag a task from "To Do" to "In Progress" → should succeed
5. Verify card order updates
6. Move task to "Done" → check milestone status update

#### Category Filtering
1. Click any category button
2. Verify only tasks in that category highlight/filter
3. Click again to clear filter
4. Test with multiple categories

#### Milestone Management
1. Click milestone button to view tasks
2. Complete all tasks in a milestone
3. Verify milestone auto-completes (status = "done" or visual indicator)
4. Create new milestone
5. Assign tasks via task modal

#### Group Operations
1. Click group button → opens bulk actions
2. Select multiple tasks in group
3. Perform bulk assignment
4. Perform bulk delete (test carefully!)

#### Task Details
1. Click any task card
2. Modal opens showing:
   - Title, description
   - Category dropdown (verify correct category selected)
   - Milestone dropdown (verify assignment)
   - Groups checkboxes (verify selected groups)
   - "Link to References" section (verify parent rule linked)
   - Due date, priority, tags
3. Edit category → auto-saves
4. Edit milestone → auto-saves, milestone count updates
5. Toggle groups → auto-saves, group count updates
6. Close modal
7. Reopen → verify all changes persisted

#### Reference Linkage
1. Open a task from "In Progress"
2. Check "Linked Reference Items" section
3. Verify parent rule name appears
4. Click to filter by reference (if implemented)
5. Verify traceability back to workflow

---

## 5. Known Features

### Workflow Features
- ✅ Multi-level hierarchy (unlimited depth theoretically)
- ✅ Dynamic templates
- ✅ Cumulative grading with parent-child sync
- ✅ Progress bars based on completion
- ✅ Rich text editing (Quill.js)
- ✅ Tag system with filtering
- ✅ Creation/Execution mode toggle
- ✅ Sequential enforcement (optional)
- ✅ Linked workflows (sync across multiple workflows)
- ✅ Workflow copy functionality
- ✅ Export to board

### Board Features
- ✅ Kanban columns with drag-and-drop
- ✅ Locked reference column
- ✅ Categories for task organization
- ✅ Milestones with auto-completion
- ✅ Groups for bulk operations
- ✅ Task assignments (owner, executor, supervisor)
- ✅ Due dates and scheduling
- ✅ Priority levels
- ✅ Tags and filtering
- ✅ Reference item linking
- ✅ Attachments
- ✅ Checklists
- ✅ Comments
- ✅ Activity logs
- ✅ Theme toggle (light/dark)
- ✅ Carousel navigation for management bar

---

## 6. File Locations

```
/workspace/
├── data/
│   ├── workflow.json          # SampleFlow workflow data
│   ├── ppm-boards.json        # BoardSample board + cards data
│   ├── templates.json         # Workflow templates
│   ├── executions.json        # Workflow executions history
│   ├── workflow-links.json    # Linked workflows data
│   └── ppm-users.json         # Board users data
│
├── index.html                 # Workflow system entry point
├── boards.html                # Board list view
├── board.html                 # Single board view
├── template-builder.html      # Template builder
│
├── script.js                  # Workflow system logic
├── ppm-script.js             # Board system logic
├── template-builder.js        # Template builder logic
│
├── style.css                  # Workflow system styles
├── ppm-style.css             # Board system styles
├── template-builder.css       # Template builder styles
│
└── documentation/
    ├── documentation.html            # Workflow user manual
    └── template-builder-documentation.html  # Template builder manual
```

---

## 7. Quick Commands

### View Sample Data
```bash
# View workflow
cat /workspace/data/workflow.json | jq '.flows[] | select(.name=="SampleFlow")'

# View board
cat /workspace/data/ppm-boards.json | jq '.boards[] | select(.name=="BoardSample")'

# View cards count
cat /workspace/data/ppm-boards.json | jq '.cards | length'
```

### Backup Sample Data
```bash
cp /workspace/data/workflow.json /workspace/data/workflow.json.backup
cp /workspace/data/ppm-boards.json /workspace/data/ppm-boards.json.backup
```

### Reset Sample Data
Simply delete and recreate using the Python scripts used initially.

---

## 8. Next Steps

### Enhancements to Consider
1. **User Management:** Add real users to board assignments
2. **Attachments:** Upload documents to tasks
3. **Comments:** Add team discussions to tasks
4. **Checklist Items:** Break down tasks further
5. **Time Tracking:** Log actual hours spent
6. **Reporting:** Generate compliance reports
7. **Notifications:** Email alerts for due dates
8. **API Integration:** Connect to external systems
9. **Custom Fields:** Add organization-specific data
10. **Workflow Automation:** Auto-create tasks from templates

### Production Preparation
1. **Data Migration:** Plan full V6→V7 migration strategy
2. **User Training:** Create training materials
3. **Performance Testing:** Load test with real data volumes
4. **Security Audit:** Review access controls
5. **Backup Strategy:** Implement automated backups
6. **Documentation:** Complete all user guides
7. **Mobile Responsiveness:** Test on tablets/phones
8. **Browser Compatibility:** Test all major browsers

---

## 9. Support

For questions or issues:
1. Check documentation files in `/workspace/`
2. Review source code comments
3. Test with sample data first
4. Report bugs with detailed reproduction steps

---

**Version:** V7  
**Created:** 2025-11-13  
**Sample Data:** SampleFlow + BoardSample  
**Status:** ✅ Production Ready for Testing
