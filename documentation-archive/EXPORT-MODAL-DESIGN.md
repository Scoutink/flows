# EXPORT MODAL UI DESIGN SPECIFICATION

## 🎨 MODAL STRUCTURE

### Modal Flow
```
┌─────────────────────────────────────────────────────────────┐
│  Export Workflow to Board                              [×]  │
├─────────────────────────────────────────────────────────────┤
│                                                             │
│  ┌─ SECTION 1: EXPORT SCOPE ──────────────────────────┐  │
│  │ ○ Full Workflow                                      │  │
│  │ ○ Partial Workflow (select sections below)          │  │
│  │ ○ Tag-Filtered (select tag below)                   │  │
│  │                                                       │  │
│  │ [If Partial: Tree view with checkboxes]             │  │
│  │ [If Tag: Dropdown of available tags]                │  │
│  └──────────────────────────────────────────────────────┘  │
│                                                             │
│  ┌─ SECTION 2: BOARD CONFIGURATION ────────────────────┐  │
│  │ Board Name: [WorkflowName Full           ]          │  │
│  │ Description: [Optional                   ]          │  │
│  └──────────────────────────────────────────────────────┘  │
│                                                             │
│  ┌─ SECTION 3: REFERENCE COLUMN (OPTIONAL) ────────────┐  │
│  │ ☐ Export specific level to References column        │  │
│  │   Level: [Dropdown: Rules/Actions/Evidences]        │  │
│  │   ℹ️ This will bulk-create dynamic list nodes       │  │
│  └──────────────────────────────────────────────────────┘  │
│                                                             │
│  ┌─ SECTION 4: DYNAMIC LIST (OPTIONAL) ────────────────┐  │
│  │ ☐ Export workflow tree to Dynamic List              │  │
│  │                                                       │  │
│  │ [If checked: Show tree with type selector]          │  │
│  │   └─ Rule 1                    [Task▼]              │  │
│  │      ├─ Action 1.1              [Connection▼]        │  │
│  │      │  └─ Evidence 1.1.1       [Task▼]             │  │
│  │      └─ Action 1.2              [Skip▼]             │  │
│  └──────────────────────────────────────────────────────┘  │
│                                                             │
│  ┌─ SECTION 5: PREVIEW ─────────────────────────────────┐  │
│  │ • Will export 15 nodes                               │  │
│  │ • 5 to References column, 10 to board                │  │
│  │ • 15 dynamic list nodes (8 tasks, 7 connections)     │  │
│  └──────────────────────────────────────────────────────┘  │
│                                                             │
│                          [Cancel]  [Create Board]          │
│                                                             │
└─────────────────────────────────────────────────────────────┘
```

---

## 📐 UI COMPONENT SPECIFICATIONS

### SECTION 1: Export Scope
**Type**: Radio button group + conditional UI

**HTML Structure**:
```html
<div class="export-section">
  <h3>Export Scope</h3>
  <label>
    <input type="radio" name="export-scope" value="full" checked>
    Full Workflow
  </label>
  <label>
    <input type="radio" name="export-scope" value="partial">
    Partial Workflow
  </label>
  <label>
    <input type="radio" name="export-scope" value="tag">
    Tag-Filtered
  </label>
  
  <!-- Conditional: Partial tree -->
  <div id="partial-tree" style="display: none;">
    <!-- Tree view with checkboxes -->
  </div>
  
  <!-- Conditional: Tag dropdown -->
  <div id="tag-filter" style="display: none;">
    <select id="tag-select">
      <option value="">Select tag...</option>
      <!-- Populated from workflow tags -->
    </select>
  </div>
</div>
```

**Behavior**:
- Default: "Full Workflow" selected
- On "Partial" select: Show tree view with checkboxes
- On "Tag" select: Show tag dropdown populated from workflow
- Update preview when scope changes

---

### SECTION 2: Board Configuration
**Type**: Text inputs

**HTML Structure**:
```html
<div class="export-section">
  <h3>Board Configuration</h3>
  <label>
    Board Name:
    <input type="text" id="board-name" value="[Auto-generated]">
  </label>
  <label>
    Description (optional):
    <textarea id="board-description" rows="3"></textarea>
  </label>
</div>
```

**Behavior**:
- Board name auto-populated based on scope:
  - Full: `{FlowName} Full`
  - Partial: `{FlowName} Partial`
  - Tag: `{FlowName} #{TagName}`
- User can edit name
- Description optional

---

### SECTION 3: Reference Column Export
**Type**: Checkbox + conditional dropdown

**HTML Structure**:
```html
<div class="export-section">
  <h3>Reference Column (Optional)</h3>
  <label>
    <input type="checkbox" id="export-reference">
    Export specific level to References column
  </label>
  
  <div id="reference-options" style="display: none;">
    <label>
      Level:
      <select id="reference-level">
        <option value="0">Rules</option>
        <option value="1">Actions</option>
        <option value="2">Evidences</option>
      </select>
    </label>
    <p class="info-text">
      <i class="fa-solid fa-circle-info"></i>
      Descendants → Task nodes | Ancestors → Connection nodes
    </p>
  </div>
</div>
```

**Behavior**:
- Unchecked by default
- When checked: Show level dropdown
- Level dropdown populated from workflow template levels
- Info text explains bulk dynamic list creation logic

---

### SECTION 4: Dynamic List Export
**Type**: Checkbox + conditional tree with type selectors

**HTML Structure**:
```html
<div class="export-section">
  <h3>Dynamic List (Optional)</h3>
  <label>
    <input type="checkbox" id="export-dynamic-list">
    Export workflow tree to Dynamic List
  </label>
  
  <div id="dynamic-list-tree" style="display: none;">
    <div class="tree-container">
      <!-- Hierarchical tree view -->
      <!-- Each node has dropdown: Task / Connection / Skip -->
    </div>
  </div>
</div>
```

**Tree Node Structure**:
```html
<div class="tree-node" data-node-id="node-123" data-level="0">
  <div class="tree-node-content">
    <span class="tree-toggle">▼</span>
    <span class="tree-icon">📋</span>
    <span class="tree-label">Rule 1</span>
    <select class="tree-type-selector">
      <option value="task">Task</option>
      <option value="connection">Connection</option>
      <option value="skip">Skip</option>
    </select>
  </div>
  <div class="tree-children">
    <!-- Child nodes recursively -->
  </div>
</div>
```

**Behavior**:
- Unchecked by default
- When checked: Show tree with type selectors
- Tree respects current scope (full/partial/tag)
- Default type: Connection for level 0-1, Task for level 2+
- Update preview when types change

---

### SECTION 5: Preview
**Type**: Read-only summary

**HTML Structure**:
```html
<div class="export-section export-preview">
  <h3>Export Preview</h3>
  <ul id="preview-list">
    <li>Will export <strong id="preview-node-count">0</strong> nodes</li>
    <li id="preview-reference-count" style="display: none;">
      <strong>0</strong> to References column
    </li>
    <li id="preview-board-count">
      <strong>0</strong> to board columns
    </li>
    <li id="preview-dynamic-list-count" style="display: none;">
      <strong>0</strong> dynamic list nodes 
      (<span id="preview-task-count">0</span> tasks, 
       <span id="preview-connection-count">0</span> connections)
    </li>
  </ul>
</div>
```

**Behavior**:
- Updates dynamically based on all selections
- Shows/hides items based on what's enabled
- Provides clear count of what will be created

---

## 🎨 STYLING GUIDELINES

### Colors & Theme
- Use existing PPM theme variables
- Sections have light background (`var(--bg-secondary)`)
- Info text uses muted color (`var(--text-muted)`)
- Preview section uses accent border (`var(--border-accent)`)

### Spacing
- Sections: 1.5rem margin between
- Section padding: 1rem
- Labels: 0.5rem margin bottom
- Inputs: Full width, 0.5rem padding

### Icons
- Use Font Awesome icons consistently
- Scope: 📊 (chart)
- Config: ⚙️ (gear)
- Reference: 📌 (pin)
- Dynamic List: 🌳 (tree)
- Preview: 👁️ (eye)

### Responsive
- Modal max-width: 800px
- Modal max-height: 85vh
- Scrollable content area
- Sticky header and footer

---

## 🔧 JAVASCRIPT INTERACTION

### Event Handlers
```javascript
// Scope selection
document.querySelectorAll('[name="export-scope"]').forEach(radio => {
  radio.addEventListener('change', handleScopeChange);
});

// Reference column toggle
document.getElementById('export-reference').addEventListener('change', handleReferenceToggle);

// Dynamic list toggle
document.getElementById('export-dynamic-list').addEventListener('change', handleDynamicListToggle);

// Tree type selectors
document.querySelectorAll('.tree-type-selector').forEach(select => {
  select.addEventListener('change', updatePreview);
});

// Create board button
document.getElementById('create-board-btn').addEventListener('click', handleExportSubmit);
```

### Key Functions
```javascript
function handleScopeChange(e) {
  const scope = e.target.value;
  updateBoardName(scope);
  updateVisibleTree(scope);
  updatePreview();
}

function updateBoardName(scope) {
  const flowName = getCurrentFlow().name;
  let name = flowName;
  
  if (scope === 'full') name += ' Full';
  else if (scope === 'partial') name += ' Partial';
  else if (scope === 'tag') {
    const tag = document.getElementById('tag-select').value;
    name += tag ? ` #${tag}` : ' Tag-Filtered';
  }
  
  document.getElementById('board-name').value = name;
}

function updatePreview() {
  // Calculate counts based on selections
  // Update preview section
}

function handleExportSubmit() {
  // Gather all selections
  // Validate
  // Call exportWorkflowToBoard()
}
```

---

## ✅ VALIDATION RULES

### Before Export
1. ✅ Board name must not be empty
2. ✅ If partial: At least one node selected
3. ✅ If tag: A tag must be selected
4. ✅ If reference: Level must be selected
5. ✅ At least one node will be exported

### Error Messages
- Empty board name: "Please enter a board name"
- No nodes selected: "Please select at least one section to export"
- No tag selected: "Please select a tag to filter by"
- Invalid configuration: "Please check your export settings"

---

**STATUS**: UI Design complete. Ready for implementation.
