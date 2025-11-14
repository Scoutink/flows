# WORKFLOW TO BOARD EXPORT - COMPREHENSIVE PLAN

## 🎯 TASK OBJECTIVE

Enable exporting workflows (full, partial, or tag-filtered) to boards with dynamic list integration and flexible content mapping.

---

## 📊 DATA STRUCTURE ANALYSIS

### WORKFLOW DATA STRUCTURE
```
workflow.json / workflows.json
├─ settings: { enforceSequence }
└─ flows: []
   ├─ id
   ├─ name
   ├─ templateId
   ├─ templateSnapshot
   └─ data: [] (hierarchical tree)
      ├─ Level 0 (Rules/Categories)
      │  ├─ id
      │  ├─ levelId
      │  ├─ name
      │  ├─ tags: []
      │  └─ subcategories: []
      │     ├─ Level 1 (Actions)
      │     │  ├─ id, levelId, name, text
      │     │  ├─ completed, tags
      │     │  └─ subcategories: []
      │     │     └─ Level 2 (Evidences)
      │     │        ├─ id, levelId, name, text
      │     │        ├─ completed, grade, tags
      │     │        └─ footer: { links[], images[], notes[], comments[] }
```

### BOARD DATA STRUCTURE
```
ppm-boards.json
└─ boards: []
   ├─ id, name, description
   ├─ columns: []
   ├─ cards: []
   │  ├─ id, title, description
   │  ├─ attachments: [{ type, title, url, content, author, timestamp }]
   │  ├─ checklist: []
   │  ├─ milestoneId, categoryId, groupIds
   │  └─ isDone
   └─ dynamicList: { isActive, nodes: [] }
      └─ nodes: []
         ├─ id, title, type (connection/task)
         ├─ parentId, level, order
         ├─ linkedTaskIds: [] (for connection nodes)
         └─ taskData: { attachments[], checklist[] } (for task nodes)
```

---

## 🗺️ CONTENT MAPPING SPECIFICATIONS

### Workflow Node → Board Task Mapping
| Workflow Property | Board Task Property | Notes |
|-------------------|---------------------|-------|
| `node.name` | `card.title` | Direct copy |
| `node.text` | `card.description` | Direct copy |
| `node.footer.comments[]` | `card.attachments[]` | Type: 'comment', content: comment string |
| `node.footer.notes[]` | `card.attachments[]` | Type: 'note', title: note.title, content: note.content |
| `node.footer.links[]` | `card.attachments[]` | Type: 'link', title: link.text, url: link.url |
| `node.footer.images[]` | `card.attachments[]` | Type: 'image', url: image string |
| `node.tags[]` | `card.labels[]` | Convert tags to labels |
| `node.completed` | `card.isDone` | Boolean flag |
| `node.grade` | `card.sourceGrade` | Store for reference |
| Tree position | Dynamic list checkbox | See hierarchy mapping below |

### Dynamic List Hierarchy Mapping
- Workflow tree structure → Dynamic list nodes with parent-child relationships
- Each workflow node can be exported as:
  - **Task node**: Standalone task in dynamic list with full content
  - **Connection node**: Organizer/filter for board tasks

---

## 🎨 EXPORT OPTIONS & UI DESIGN

### 1. EXPORT SCOPE
**User can choose:**
- ✅ **Full Workflow**: Export entire workflow tree
- ✅ **Partial Workflow**: User selects specific branches/sections
- ✅ **Tag-Filtered**: Export only nodes with specific tag

### 2. BOARD NAMING CONVENTION
- **Full Export**: `{WorkflowName} Full`
- **Partial Export**: `{WorkflowName} Partial`
- **Tag-Filtered**: `{WorkflowName} #{TagName}`

### 3. DYNAMIC LIST EXPORT
**Option**: "Export workflow tree to Dynamic List"
- **If YES**: Show content tree in modal
- For each node, user selects:
  - ☐ Task (task node in dynamic list)
  - ☐ Reference (connection node in dynamic list)
  - ☐ Skip (don't export to dynamic list)

### 4. REFERENCE COLUMN EXPORT
**Option**: "Export specific level to References column"
- Select which level (Rules/Actions/Evidences)
- **Bulk Dynamic List Setup**:
  - All descendants of exported items → **Task nodes** in dynamic list
  - All ancestors of exported items → **Connection nodes** in dynamic list

---

## 🔧 TECHNICAL IMPLEMENTATION PLAN

### PHASE 1: Analysis & Documentation (CURRENT)
- ✅ Analyze workflow data structure
- ✅ Analyze board data structure
- ✅ Define content mapping rules
- ✅ Design export flow & UI

### PHASE 2: Export Modal UI
**Create export dialog with sections:**
1. **Scope Selection**
   - Radio buttons: Full / Partial / Tag-Filtered
   - If Partial: Tree view with checkboxes
   - If Tag-Filtered: Tag dropdown

2. **Board Settings**
   - Board name (auto-generated, editable)
   - Board description (optional)

3. **Reference Column Options**
   - Checkbox: "Export level to References column"
   - Dropdown: Select level (if workflow has multiple levels)

4. **Dynamic List Options**
   - Checkbox: "Export tree to Dynamic List"
   - If checked: Show tree with type selector (Task/Reference/Skip) for each node

5. **Preview & Actions**
   - Summary of what will be exported
   - Create Board button

### PHASE 3: Core Export Logic
**Functions to implement:**
1. `exportWorkflowToBoard(flowId, options)`
2. `collectExportNodes(flow, scope, filter)`
3. `mapWorkflowNodeToCard(node, columnId, board)`
4. `createDynamicListFromWorkflow(nodes, typeMapping)`
5. `buildWorkflowHierarchy(nodes)`

### PHASE 4: Content Conversion
**Map workflow footer → board attachments:**
- Comments: Array of strings → Array of attachment objects (type: 'comment')
- Notes: Array of {title, content} → Array of attachment objects (type: 'note')
- Links: Array of {text, url} → Array of attachment objects (type: 'link')
- Images: Array of URL strings → Array of attachment objects (type: 'image')

### PHASE 5: Integration Points
**Where to add export button:**
- Workflow page (index.html)
- Add "Export to Board" button in flow controls
- Hook into existing modal system

### PHASE 6: Testing & Validation
- Test full export
- Test partial export
- Test tag-filtered export
- Test with/without dynamic list
- Test with/without reference column
- Verify all content mapping
- Ensure no data corruption

---

## 📁 FILES TO MODIFY

### PRIMARY FILES
1. **`/workspace/script.js`** - Add export logic
2. **`/workspace/index.html`** - Add export button/UI
3. **`/workspace/ppm-script.js`** - Ensure board creation compatibility

### HELPER DATA
4. **`/workspace/data/workflows.json`** - Source data (READ ONLY)
5. **`/workspace/data/ppm-boards.json`** - Target data (WRITE)

---

## 🚨 CRITICAL REQUIREMENTS

### Must NOT Break:
- ✅ Existing workflow functionality
- ✅ Existing board functionality
- ✅ Dynamic list system
- ✅ Bulk actions
- ✅ Category/Milestone filtering

### Must Ensure:
- ✅ All attachments properly converted
- ✅ Hierarchy preserved in dynamic list
- ✅ Tags converted to labels
- ✅ Completed status transferred
- ✅ Author/timestamp metadata preserved
- ✅ No data loss during conversion

### Data Integrity:
- ✅ Use async/await for all saves
- ✅ Validate data before saving
- ✅ Provide user feedback (progress, success, errors)
- ✅ Handle edge cases (empty nodes, missing data)

---

## 🔄 EXPORT WORKFLOW

```
1. User clicks "Export to Board" button
   ↓
2. Export modal opens
   ↓
3. User selects scope (Full/Partial/Tag)
   ↓
4. User configures options:
   - Reference column export (Yes/No, which level)
   - Dynamic list export (Yes/No, node types)
   ↓
5. Preview shows what will be exported
   ↓
6. User clicks "Create Board"
   ↓
7. System processes:
   a. Collect nodes based on scope
   b. Create board with default columns
   c. Map nodes to cards (References column or not)
   d. Convert footer content to attachments
   e. Build dynamic list hierarchy (if enabled)
   f. Save board to ppm-boards.json
   ↓
8. Success! Redirect to new board
```

---

## 📝 TASK BREAKDOWN

### STEP 1: Create Export Button & Entry Point
- Add "Export to Board" button in workflow controls
- Create event handler

### STEP 2: Build Export Modal UI
- Create modal HTML structure
- Implement scope selection UI
- Implement tree view for partial selection
- Implement tag filter dropdown
- Implement reference column options
- Implement dynamic list options

### STEP 3: Implement Node Collection Logic
- Function to recursively collect nodes
- Apply filters (full/partial/tag)
- Build flat list and hierarchy map

### STEP 4: Implement Content Mapping
- Function to convert workflow node → board card
- Function to convert footer → attachments array
- Handle all attachment types correctly

### STEP 5: Implement Dynamic List Generation
- Build dynamic list nodes from workflow tree
- Apply user-selected node types (task/connection)
- Maintain parent-child relationships
- Link board cards to dynamic list nodes

### STEP 6: Implement Board Creation
- Create board with proper structure
- Add cards to appropriate columns
- Create dynamic list (if enabled)
- Save to ppm-boards.json

### STEP 7: Integration & Testing
- Test all export modes
- Verify data integrity
- Check UI/UX flow
- Handle errors gracefully

---

## 🛡️ SAFETY MEASURES

1. **Read-only workflow data** - Never modify workflow during export
2. **Validation before save** - Check all required fields
3. **Atomic operations** - All or nothing approach
4. **User confirmation** - Preview before creating
5. **Error handling** - Try-catch blocks, clear error messages
6. **No breaking changes** - Only add new functionality
7. **Backup consideration** - User can always delete board if needed

---

## 🎯 SUCCESS CRITERIA

✅ User can export full workflow to board
✅ User can export partial workflow (selected sections)
✅ User can export tag-filtered workflow
✅ All content properly mapped (name, description, attachments)
✅ Dynamic list created with correct hierarchy
✅ Reference column populated if selected
✅ Board opens successfully with all data
✅ No existing functionality broken
✅ Clear user feedback throughout process

---

**STATUS**: Planning complete. Ready for implementation upon approval.
