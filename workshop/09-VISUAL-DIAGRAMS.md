# Visual Diagrams and Mappings

## Application Architecture Diagram

```
┌─────────────────────────────────────────────────────────────────┐
│                        USER BROWSER                              │
├─────────────────────────────────────────────────────────────────┤
│                                                                   │
│  ┌───────────────────────────────────────────────────────────┐  │
│  │                    PRESENTATION LAYER                      │  │
│  ├───────────────────────────────────────────────────────────┤  │
│  │                                                             │  │
│  │  ┌──────────┐  ┌──────────┐  ┌──────────┐  ┌──────────┐  │  │
│  │  │  Header  │  │ Flow     │  │  Theme   │  │  Modal   │  │  │
│  │  │ Controls │  │ Selector │  │  Toggle  │  │  System  │  │  │
│  │  └──────────┘  └──────────┘  └──────────┘  └──────────┘  │  │
│  │                                                             │  │
│  │  ┌─────────────────────────────────────────────────────┐  │  │
│  │  │         WORKFLOW DISPLAY (Dynamic Render)           │  │  │
│  │  ├─────────────────────────────────────────────────────┤  │  │
│  │  │  Control 1                                          │  │  │
│  │  │  ├── Actions Panel │ Evidence Panel ───┤            │  │  │
│  │  │  │  • Action 1     │ Evidence 1        │            │  │  │
│  │  │  │  • Action 2     │ Evidence 2        │            │  │  │
│  │  │  └─────────────────┴───────────────────┘            │  │  │
│  │  │                                                       │  │  │
│  │  │  Control 2                                          │  │  │
│  │  │  └── Actions Panel │ Evidence Panel ───┘            │  │  │
│  │  └─────────────────────────────────────────────────────┘  │  │
│  └───────────────────────────────────────────────────────────┘  │
│                              │                                   │
│                              ▼                                   │
│  ┌───────────────────────────────────────────────────────────┐  │
│  │                    APPLICATION LOGIC                       │  │
│  ├───────────────────────────────────────────────────────────┤  │
│  │                                                             │  │
│  │  ┌─────────────────┐  ┌─────────────────┐                 │  │
│  │  │  Event Handlers │  │ State Mutations │                 │  │
│  │  ├─────────────────┤  ├─────────────────┤                 │  │
│  │  │ • handleClick   │  │ • setCompleted  │                 │  │
│  │  │ • handleChange  │  │ • addNode       │                 │  │
│  │  │ • handleInput   │  │ • deleteNode    │                 │  │
│  │  │ • handleSubmit  │  │ • propagateEdit │                 │  │
│  │  └─────────────────┘  └─────────────────┘                 │  │
│  │                                                             │  │
│  │  ┌──────────────────────────────────────────────────────┐ │  │
│  │  │             CENTRAL STATE (appState)                 │ │  │
│  │  ├──────────────────────────────────────────────────────┤ │  │
│  │  │  • theme: 'light' | 'dark'                           │ │  │
│  │  │  • currentMode: 'creation' | 'execution'             │ │  │
│  │  │  • workflow: { settings, flows[] }                   │ │  │
│  │  │  • executions: { flows: { [flowId]: completed{} } } │ │  │
│  │  │  • currentFlowId: string                             │ │  │
│  │  │  • activeTag: string | null                          │ │  │
│  │  └──────────────────────────────────────────────────────┘ │  │
│  │                                                             │  │
│  │  ┌─────────────────┐  ┌─────────────────┐                 │  │
│  │  │ Render Engine   │  │ Utility Helpers │                 │  │
│  │  ├─────────────────┤  ├─────────────────┤                 │  │
│  │  │ • render()      │  │ • generateId    │                 │  │
│  │  │ • renderControl │  │ • getByPath     │                 │  │
│  │  │ • renderAction  │  │ • ensureTags    │                 │  │
│  │  │ • renderEvidence│  │ • nodeHasTag    │                 │  │
│  │  └─────────────────┘  └─────────────────┘                 │  │
│  └───────────────────────────────────────────────────────────┘  │
│                              │                                   │
│                              ▼                                   │
│  ┌───────────────────────────────────────────────────────────┐  │
│  │                   PERSISTENCE LAYER                        │  │
│  ├───────────────────────────────────────────────────────────┤  │
│  │                                                             │  │
│  │  ┌──────────────┐           ┌──────────────┐              │  │
│  │  │ LocalStorage │           │  Fetch API   │              │  │
│  │  ├──────────────┤           ├──────────────┤              │  │
│  │  │ • theme      │           │ • loadAll()  │              │  │
│  │  │ • mode       │           │ • saveStruct │              │  │
│  │  └──────────────┘           │ • saveExec   │              │  │
│  │                              └──────────────┘              │  │
│  └───────────────────────────────────────────────────────────┘  │
└───────────────────────────────────┬───────────────────────────────┘
                                    │ HTTP
                                    ▼
┌─────────────────────────────────────────────────────────────────┐
│                         WEB SERVER                               │
├─────────────────────────────────────────────────────────────────┤
│                                                                   │
│  ┌────────────────┐  ┌────────────────┐  ┌────────────────┐    │
│  │  index.html    │  │  script.js     │  │  style.css     │    │
│  │  (Static)      │  │  (Static)      │  │  (Static)      │    │
│  └────────────────┘  └────────────────┘  └────────────────┘    │
│                                                                   │
│  ┌────────────────────────────────────────────────────────────┐ │
│  │                    PHP BACKEND                              │ │
│  ├────────────────────────────────────────────────────────────┤ │
│  │                                                              │ │
│  │  ┌──────────────────────┐  ┌──────────────────────┐        │ │
│  │  │ save_workflow.php    │  │ save_executions.php  │        │ │
│  │  ├──────────────────────┤  ├──────────────────────┤        │ │
│  │  │ 1. Receive JSON      │  │ 1. Receive JSON      │        │ │
│  │  │ 2. Validate syntax   │  │ 2. Validate syntax   │        │ │
│  │  │ 3. Write to file     │  │ 3. Write to file     │        │ │
│  │  │ 4. Return status     │  │ 4. Return status     │        │ │
│  │  └──────────────────────┘  └──────────────────────┘        │ │
│  │           │                          │                       │ │
│  │           ▼                          ▼                       │ │
│  │  ┌──────────────────────┐  ┌──────────────────────┐        │ │
│  │  │   workflow.json      │  │  executions.json     │        │ │
│  │  │  (File Storage)      │  │  (File Storage)      │        │ │
│  │  └──────────────────────┘  └──────────────────────┘        │ │
│  └────────────────────────────────────────────────────────────┘ │
└─────────────────────────────────────────────────────────────────┘
```

---

## Data Model Hierarchy

```
appState.workflow
│
├── settings
│   └── enforceSequence: boolean
│
└── flows[] ─────────────────────────────────────────┐
    ├── id: "flow-xxxxx"                             │
    ├── name: "Flow Name"                            │
    └── data[] (Controls) ──────────────────────┐    │
        ├── id: "cat-xxxxx"                     │    │
        ├── name: "Control Name"                │    │
        ├── text: "Description"                 │    │
        ├── tags: ["tag1", "tag2"]              │    │
        ├── shareKey?: "shared-key-123"         │    │
        └── subcategories[] (Actions) ──────┐   │    │
            ├── id: "act-xxxxx"             │   │    │
            ├── name: "Action Name"         │   │    │
            ├── text: "Description"         │   │    │
            ├── tags: []                    │   │    │
            ├── shareKey?: string           │   │    │
            └── subcategories[] (Evidence) ─┼───┼────┼──┐
                ├── id: "evi-xxxxx"        │   │    │  │
                ├── name: "Evidence Name"   │   │    │  │
                ├── text: "Description"     │   │    │  │
                ├── grade: 1.0              │   │    │  │
                ├── completed: false        │   │    │  │
                ├── tags: []                │   │    │  │
                ├── shareKey?: string       │   │    │  │
                ├── isLocked?: boolean ◄────┼───┼────┼──┼─ Runtime
                ├── isActive?: boolean ◄────┼───┼────┼──┘  (not persisted)
                ├── footer                  │   │    │
                │   ├── links[]             │   │    │
                │   ├── images[]            │   │    │
                │   ├── notes[]             │   │    │
                │   └── comments[]          │   │    │
                └── subcategories[] (empty) │   │    │
                                            │   │    │
appState.executions                         │   │    │
│                                           │   │    │
└── flows{}                                 │   │    │
    └── [flowId] ◄──────────────────────────┘   │    │
        └── completed{}                          │    │
            └── [evidenceId] ◄───────────────────┘    │
                = boolean                              │
                                                       │
appState (Runtime Only)                                │
├── theme: 'light' | 'dark'                            │
├── currentMode: 'creation' | 'execution'              │
├── currentFlowId ◄────────────────────────────────────┘
├── selectedActionPaths: { [controlPath]: actionPath }
├── activeTag: string | null
└── expandedTextAreas: Set<string>
```

---

## Function Relationship Map

```
                      ┌─────────────────────┐
                      │   DOMContentLoaded  │
                      └──────────┬──────────┘
                                 │
                                 ▼
                      ┌─────────────────────┐
                      │     loadAll()       │ ◄──────────┐
                      └──────────┬──────────┘            │
                                 │                       │
                 ┌───────────────┴───────────────┐       │
                 ▼                               ▼       │
    ┌──────────────────────┐        ┌──────────────────┐│
    │ fetch('workflow.json')│       │fetch('exec.json')││
    └──────────┬─────────────┘        └────────┬─────────┘│
               │                               │          │
               └───────────┬───────────────────┘          │
                           ▼                              │
                  ┌──────────────────┐                    │
                  │ initializeState()│                    │
                  └────────┬─────────┘                    │
                           │                              │
              ┌────────────┼────────────┐                 │
              ▼            ▼            ▼                 │
    ┌─────────────┐ ┌─────────────┐ ┌──────────────┐    │
    │ applyTheme()│ │updateAllExe│ │reconcileExec │    │
    └─────────────┘ │cutionStates│ └──────────────┘    │
                    └─────────────┘                      │
                           │                              │
                           ▼                              │
                  ┌──────────────────┐                    │
                  │     render()     │◄───────────────────┘
                  └────────┬─────────┘         │
                           │                   │
          ┌────────────────┼───────────────────┼──────────┐
          ▼                ▼                   ▼          ▼
┌──────────────────┐ ┌──────────────┐ ┌────────────┐ ┌────────────┐
│renderControlNode │ │updateClasses │ │renderBanner│ │renderHeader│
└────────┬─────────┘ └──────────────┘ └────────────┘ └────────────┘
         │
    ┌────┴────┐
    ▼         ▼
┌──────────┐ ┌──────────────┐
│renderAction│renderEvidence│
│  Panel   │ │   Panel      │
└────┬─────┘ └──────┬───────┘
     │              │
     └──────┬───────┘
            ▼
   ┌──────────────────┐
   │renderEvidenceNode│
   └──────────────────┘
            │
            │  ┌─────────────────┐
            ├─►│  renderTags()   │
            │  └─────────────────┘
            │
            │  ┌─────────────────┐
            └─►│calculateProgress│
               └─────────────────┘

USER INTERACTIONS
─────────────────

  User Action (click/change/input)
            │
            ▼
   ┌──────────────────┐
   │ handleAppClick() │
   │ handleAppChange()│
   └────────┬─────────┘
            │
            ▼
   ┌──────────────────┐
   │  Route to Action │
   └────────┬─────────┘
            │
    ┌───────┼───────┬──────────┬──────────┬──────────┐
    ▼       ▼       ▼          ▼          ▼          ▼
┌────────┐ ┌────────┐ ┌──────────┐ ┌─────────┐ ┌─────────┐
│add-node│ │edit-name│toggle-comp││delete-node││add-attach│
└───┬────┘ └───┬────┘ └────┬─────┘ └────┬────┘ └────┬────┘
    │          │           │            │           │
    └──────────┴───────────┴────────────┴───────────┘
                           │
                           ▼
                  ┌──────────────────┐
                  │ State Mutation   │
                  └────────┬─────────┘
                           │
              ┌────────────┼────────────┐
              ▼            ▼            ▼
    ┌──────────────┐ ┌─────────────┐ ┌──────────────┐
    │propagateShared│ │setCompleted │ │reconcileExec │
    │     Edit      │ └─────────────┘ └──────────────┘
    └───────────────┘
              │
              ▼
    ┌──────────────────┐
    │updateAllExecution│
    │     States       │
    └────────┬─────────┘
             │
             ▼
    ┌──────────────────┐
    │     render()     │
    └──────────────────┘

SAVE FLOW
─────────

User clicks "Save Structure/Execution"
              │
              ▼
    ┌──────────────────┐
    │ saveStructure()  │
    │ saveExecution()  │
    └────────┬─────────┘
             │
             ▼
    ┌──────────────────┐
    │  fetch POST to   │
    │  PHP endpoint    │
    └────────┬─────────┘
             │
             ▼
    ┌──────────────────┐
    │ save_*.php       │
    │ - Validate JSON  │
    │ - Write to file  │
    │ - Return status  │
    └────────┬─────────┘
             │
             ▼
    ┌──────────────────┐
    │ Update Button UI │
    │ (spinner → check)│
    └──────────────────┘
```

---

## State Flow Diagram

```
┌───────────────────────────────────────────────────────────────┐
│                     APPLICATION STATES                         │
├───────────────────────────────────────────────────────────────┤
│                                                                 │
│  ┌─────────────┐         ┌─────────────┐                      │
│  │   LOADING   │────────►│   LOADED    │                      │
│  └─────────────┘         └──────┬──────┘                      │
│       (Initial)                 │                              │
│                                 │                              │
│        ┌────────────────────────┴─────────────────────┐       │
│        │                                              │       │
│        ▼                                              ▼       │
│  ┌─────────────┐                              ┌─────────────┐│
│  │  CREATION   │◄────────────────────────────►│  EXECUTION  ││
│  │    MODE     │   Mode Switch Toggle         │    MODE     ││
│  └──────┬──────┘                              └──────┬──────┘│
│         │                                            │        │
│         │  Structure Changes:                        │        │
│         │  • Add/Edit/Delete Nodes                   │        │
│         │  • Modify Tags                             │        │
│         │  • Change Grades                           │        │
│         │  • Add Attachments                         │        │
│         │                                            │        │
│         │  State Changes:                            │        │
│         │  • Toggle Complete                         │        │
│         │  • Filter by Tag                           │        │
│         │                                            │        │
│         ▼                                            ▼        │
│  ┌─────────────┐                              ┌─────────────┐│
│  │   SAVING    │                              │   SAVING    ││
│  │ STRUCTURE   │                              │  EXECUTION  ││
│  └──────┬──────┘                              └──────┬──────┘│
│         │                                            │        │
│         └───────────┬────────────────────────────────┘        │
│                     │                                         │
│                     ▼                                         │
│              ┌─────────────┐                                  │
│              │   SAVED     │                                  │
│              └─────────────┘                                  │
│                                                                 │
└─────────────────────────────────────────────────────────────────┘

MODE TRANSITION RESTRICTIONS
─────────────────────────────
┌────────────────────┬────────────────────────────────────────────┐
│      ACTION        │              ALLOWED IN                    │
├────────────────────┼────────────────────────────────────────────┤
│ Add Node           │ Creation Only                              │
│ Edit Name          │ Creation Only                              │
│ Delete Node        │ Creation Only                              │
│ Add Attachment     │ Creation Only                              │
│ Toggle Complete    │ Execution Only                             │
│ Filter by Tag      │ Both (but UI differs)                      │
│ View Attachments   │ Both                                       │
│ Save Structure     │ Creation Only                              │
│ Save Execution     │ Execution Only                             │
└────────────────────┴────────────────────────────────────────────┘
```

---

## Event Flow Diagram

```
┌─────────────────────────────────────────────────────────────────┐
│                     EVENT DELEGATION                             │
└─────────────────────────────────────────────────────────────────┘

USER INTERACTION
       │
       ▼
┌─────────────────┐
│  Browser Event  │
│  (click/change/ │
│   input/submit) │
└────────┬────────┘
         │
         ▼
┌─────────────────────────────────────────────────────────────────┐
│              GLOBAL EVENT LISTENERS (Delegation)                 │
├─────────────────────────────────────────────────────────────────┤
│                                                                   │
│  document.addEventListener('click', handleAppClick);             │
│  document.addEventListener('change', handleAppChange);           │
│  document.addEventListener('input', textEditHandler);            │
│  document.addEventListener('keydown', tagAddHandler);            │
│  document.addEventListener('submit', attachmentFormHandler);     │
│                                                                   │
└─────────┬───────────────────────────────────────────────────────┘
          │
          ▼
┌─────────────────────────────────────────────────────────────────┐
│                 FIND CLOSEST [data-action]                       │
└─────────┬───────────────────────────────────────────────────────┘
          │
          ▼
┌─────────────────────────────────────────────────────────────────┐
│              EXTRACT ACTION METADATA                             │
│  • data-action="add-evidence"                                    │
│  • data-path="data.0.subcategories.1"                            │
│  • data-index="2"                                                │
│  • data-type="link"                                              │
│  • data-level="evidence"                                         │
└─────────┬───────────────────────────────────────────────────────┘
          │
          ▼
┌─────────────────────────────────────────────────────────────────┐
│                    PERMISSION CHECK                              │
│  if (creationOnlyAction && mode === 'execution') return;        │
└─────────┬───────────────────────────────────────────────────────┘
          │
          ▼
┌─────────────────────────────────────────────────────────────────┐
│                 ROUTE TO ACTION HANDLER                          │
└─────────┬───────────────────────────────────────────────────────┘
          │
  ┌───────┼───────┬──────────┬──────────┬──────────┬──────────┐
  ▼       ▼       ▼          ▼          ▼          ▼          ▼
┌──────┐┌──────┐┌──────┐┌──────┐┌──────┐┌──────┐┌──────┐┌──────┐
│add-  ││edit- ││delete││select││toggle││filter││manage││show- │
│node  ││name  ││-node ││action││-comp ││-tag  ││attach││modal │
└──┬───┘└──┬───┘└──┬───┘└──┬───┘└──┬───┘└──┬───┘└──┬───┘└──┬───┘
   │       │       │       │       │       │       │       │
   └───────┴───────┴───────┴───────┴───────┴───────┴───────┘
                          │
                          ▼
              ┌───────────────────────┐
              │  EXECUTE ACTION LOGIC │
              └───────────┬───────────┘
                          │
              ┌───────────┼───────────┐
              ▼           ▼           ▼
    ┌─────────────┐ ┌─────────┐ ┌─────────────┐
    │ State       │ │ Propagate│ │ Open Modal  │
    │ Mutation    │ │ Shared   │ │ (if needed) │
    └──────┬──────┘ └────┬────┘ └──────┬──────┘
           │             │             │
           └─────────────┼─────────────┘
                         │
                         ▼
              ┌───────────────────────┐
              │updateAllExecutionStates│
              └───────────┬───────────┘
                          │
                          ▼
              ┌───────────────────────┐
              │      render()         │
              └───────────────────────┘
```

---

## Data Sharing Mechanism

```
┌─────────────────────────────────────────────────────────────────┐
│                    SHARING MECHANISM                             │
└─────────────────────────────────────────────────────────────────┘

SCENARIO: User edits shared evidence name in Flow A

  Flow A                    Flow B                    Flow C
  ├── Control 1             ├── Control 1             ├── Control 5
  │   └── Action 1          │   └── Action 2          │   └── Action 8
  │       └── Evidence X    │       └── Evidence X    │       └── Evidence X
  │           shareKey:     │           shareKey:     │           shareKey:
  │           "shared-123"  │           "shared-123"  │           "shared-123"
  └──────────┬──────────    └──────────┬──────────    └──────────┬──────────
             │                          │                          │
             │  User edits name         │                          │
             │  "Evidence X" → "New Name"                         │
             │                          │                          │
             ▼                          │                          │
  ┌──────────────────────┐             │                          │
  │ propagateSharedEdit()│             │                          │
  └──────────┬───────────┘             │                          │
             │                          │                          │
             │  Iterate all flows       │                          │
             │  Find shareKey matches   │                          │
             │                          │                          │
             ├──────────────────────────┼──────────────────────────┤
             │                          │                          │
             ▼                          ▼                          ▼
  ┌──────────────────────┐  ┌──────────────────────┐  ┌──────────────────────┐
  │ Object.assign(       │  │ Object.assign(       │  │ Object.assign(       │
  │   evidence,          │  │   evidence,          │  │   evidence,          │
  │   { name: "New Name"}│  │   { name: "New Name"}│  │   { name: "New Name"}│
  │ )                    │  │ )                    │  │ )                    │
  └──────────────────────┘  └──────────────────────┘  └──────────────────────┘
             │                          │                          │
             └──────────────────────────┴──────────────────────────┘
                                        │
                                        ▼
                                  ┌───────────┐
                                  │ render()  │
                                  └───────────┘

FIELDS SYNCED BY LEVEL
──────────────────────
Control:   name, text, tags
Action:    name, text, tags
Evidence:  name, text, tags, grade

NOT SYNCED
──────────
• IDs (always unique per flow)
• Completion states (execution-specific)
• Footer attachments (flow-specific)
• isLocked/isActive (runtime flags)

EXECUTION SHARING
─────────────────
Flow A                    Flow B
Evidence X (shareKey)     Evidence X (shareKey)
completed: true           completed: ? ◄─────┐
      │                         │             │
      │ User toggles checkbox   │             │
      │                         │             │
      ▼                         │             │
propagateSharedExecution()      │             │
      │                         │             │
      │  sharedEvidenceIndex()  │             │
      │  ├─ Build map of all    │             │
      │  │  evidence by shareKey│             │
      │  └─ Get all matches     │             │
      │                         │             │
      └─────────────────────────┼─────────────┘
                                ▼
                          completed: true
```

---

## Rendering Pipeline

```
render() CALLED
      │
      ▼
┌─────────────────────────────────────────────────────────────┐
│ PHASE 1: UPDATE GLOBAL UI CLASSES                           │
├─────────────────────────────────────────────────────────────┤
│ • body.className = `${mode}-mode ${theme}-theme`            │
└──────────────────────┬──────────────────────────────────────┘
                       │
                       ▼
┌─────────────────────────────────────────────────────────────┐
│ PHASE 2: RENDER HEADER CONTROLS                             │
├─────────────────────────────────────────────────────────────┤
│ • Flow selector dropdown                                     │
│ • Mode switch checkbox                                       │
│ • Enforce sequence checkbox                                  │
│ • Tag filter banner                                          │
└──────────────────────┬──────────────────────────────────────┘
                       │
                       ▼
┌─────────────────────────────────────────────────────────────┐
│ PHASE 3: GET CURRENT FLOW & DATA                            │
├─────────────────────────────────────────────────────────────┤
│ • getCurrentFlow()                                           │
│ • If no flow → show empty state                             │
└──────────────────────┬──────────────────────────────────────┘
                       │
                       ▼
┌─────────────────────────────────────────────────────────────┐
│ PHASE 4: APPLY TAG FILTER (if activeTag set)                │
├─────────────────────────────────────────────────────────────┤
│ • filterWorkflowByTag(data, activeTag)                      │
│   ├─ Check control tags → include all children             │
│   ├─ Check action tags → include all evidence              │
│   └─ Check evidence tags → include only tagged             │
│ • Preserve original paths with _path metadata              │
└──────────────────────┬──────────────────────────────────────┘
                       │
                       ▼
┌─────────────────────────────────────────────────────────────┐
│ PHASE 5: BUILD DOM FRAGMENT                                 │
├─────────────────────────────────────────────────────────────┤
│ • Create DocumentFragment (performance)                     │
│ • For each control:                                         │
│   └─ renderControlNode(control, path, filtered, flow)      │
└──────────────────────┬──────────────────────────────────────┘
                       │
                       ▼
┌─────────────────────────────────────────────────────────────┐
│ CONTROL RENDERING (per control)                             │
├─────────────────────────────────────────────────────────────┤
│ 1. Create control-node div                                  │
│ 2. Render control header:                                   │
│    ├─ Title                                                 │
│    ├─ Tags (renderTags)                                     │
│    ├─ Progress bar (calculateControlProgress)              │
│    └─ Control buttons (add/edit/delete)                    │
│ 3. Render registers-container:                              │
│    ├─ renderActionPanel (left 40%)                         │
│    └─ renderEvidencePanel (right 60%)                      │
└──────────────────────┬──────────────────────────────────────┘
                       │
      ┌────────────────┴────────────────┐
      ▼                                 ▼
┌─────────────────────────┐  ┌─────────────────────────┐
│ ACTION PANEL RENDERING  │  │ EVIDENCE PANEL RENDERING│
├─────────────────────────┤  ├─────────────────────────┤
│ For each action:        │  │ Get selected action     │
│ • Render action-item    │  │ For each evidence:      │
│ • Calculate progress    │  │ • renderEvidenceNode()  │
│ • Validate grade total  │  │   ├─ Checkbox           │
│ • Render tags           │  │   ├─ Name               │
│ • Mark selected         │  │   ├─ Grade selector     │
│                         │  │   ├─ Description        │
│                         │  │   ├─ Tags               │
│                         │  │   └─ Footer attachments │
└─────────────────────────┘  └─────────────────────────┘
            │                            │
            └────────────┬───────────────┘
                         │
                         ▼
┌─────────────────────────────────────────────────────────────┐
│ PHASE 6: REPLACE DOM CONTENT                                │
├─────────────────────────────────────────────────────────────┤
│ • workflowRoot.innerHTML = '' (clear old)                   │
│ • workflowRoot.appendChild(fragment) (insert new)           │
└──────────────────────┬──────────────────────────────────────┘
                       │
                       ▼
┌─────────────────────────────────────────────────────────────┐
│ PHASE 7: EVENT LISTENERS                                     │
├─────────────────────────────────────────────────────────────┤
│ • Already attached via delegation (document level)          │
│ • No need to re-attach                                      │
└─────────────────────────────────────────────────────────────┘

PERFORMANCE NOTES
─────────────────
• DocumentFragment: Batch DOM insertions (1 reflow instead of N)
• innerHTML: Fast initial render but destroys event listeners
• Event Delegation: No re-attachment needed after render
• Bottleneck: O(n) where n = total nodes to render

OPTIMIZATION OPPORTUNITIES
──────────────────────────
• Virtual Scrolling: Render only visible controls
• Incremental DOM: Update only changed nodes
• Web Workers: Offload filtering to background thread
• Caching: Memoize calculateProgress results
• requestAnimationFrame: Batch multiple renders
```

---

## File Structure Recommendation

```
compliance-workflow-manager/
├── public/
│   ├── index.html
│   ├── assets/
│   │   ├── icons/
│   │   └── images/
│   └── data/ (for development)
│       ├── workflow.json
│       └── executions.json
│
├── src/
│   ├── main.js                    # Entry point
│   │
│   ├── config/
│   │   └── constants.js           # Magic numbers, config
│   │
│   ├── utils/
│   │   ├── id-generator.js        # generateId()
│   │   ├── url-normalizer.js      # getAbsoluteUrl()
│   │   ├── path-navigator.js      # getObjectByPath(), getParentAndKey()
│   │   └── validators.js          # Input validation
│   │
│   ├── state/
│   │   ├── app-state.js           # Central state object
│   │   ├── execution-state.js     # Execution CRUD operations
│   │   ├── sharing.js             # Share key propagation
│   │   └── flow-manager.js        # Flow CRUD operations
│   │
│   ├── rendering/
│   │   ├── render-engine.js       # Main render()
│   │   ├── render-control.js      # renderControlNode()
│   │   ├── render-action.js       # renderActionPanel()
│   │   ├── render-evidence.js     # renderEvidenceNode(), renderEvidencePanel()
│   │   ├── render-tags.js         # renderTags()
│   │   └── progress-calculator.js # calculateProgress()
│   │
│   ├── filtering/
│   │   ├── tag-filter.js          # filterWorkflowByTag()
│   │   └── global-filter.js       # runGlobalFilter()
│   │
│   ├── events/
│   │   ├── event-router.js        # Central event delegation
│   │   ├── click-handler.js       # handleAppClick()
│   │   ├── change-handler.js      # handleAppChange()
│   │   ├── input-handler.js       # Text edit, tag add
│   │   └── form-handler.js        # Attachment forms
│   │
│   ├── modals/
│   │   ├── modal-manager.js       # openModal(), closeModal()
│   │   ├── import-modal.js        # openImportModal()
│   │   ├── distribute-modal.js    # openDistributeNewNodeModal()
│   │   ├── filter-modal.js        # openGlobalTagFilter()
│   │   ├── flow-modal.js          # openNewFlowModal()
│   │   └── attachment-modals.js   # showAddAttachmentModal(), etc.
│   │
│   ├── api/
│   │   ├── workflow-api.js        # loadAll(), saveStructure()
│   │   ├── execution-api.js       # saveExecution()
│   │   └── fetch-client.js        # Centralized fetch wrapper
│   │
│   ├── theme/
│   │   └── theme-manager.js       # applyTheme(), toggleTheme()
│   │
│   └── styles/
│       ├── variables.css          # CSS variables
│       ├── layout.css             # Layout styles
│       ├── components.css         # Component styles
│       └── themes.css             # Dark theme overrides
│
├── server/
│   ├── api/
│   │   ├── workflow.php
│   │   └── executions.php
│   └── data/
│       ├── workflow.json
│       └── executions.json
│
├── tests/
│   ├── unit/
│   │   ├── utils/
│   │   ├── state/
│   │   └── rendering/
│   ├── integration/
│   └── e2e/
│
├── docs/
│   └── workshop/ ◄── THIS FOLDER
│
├── package.json
├── vite.config.js
├── .eslintrc.js
├── .prettierrc
└── README.md
```

This visual mapping provides a clear understanding of the application's architecture, data flow, and component relationships for future development work.
