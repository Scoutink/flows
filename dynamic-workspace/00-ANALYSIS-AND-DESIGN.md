# Dynamic Workflow Templates - Analysis & Design

**Branch**: cursor/dynamic-workflow-templates-1762883094  
**Date**: 2025-11-11  
**Status**: Analysis & Design Phase

---

## 📋 Table of Contents

1. [Executive Summary](#executive-summary)
2. [Current System Analysis](#current-system-analysis)
3. [Requirements Analysis](#requirements-analysis)
4. [Proposed Architecture](#proposed-architecture)
5. [Critical Issues & Recommendations](#critical-issues--recommendations)
6. [Data Model Design](#data-model-design)
7. [Implementation Phases](#implementation-phases)
8. [Migration Strategy](#migration-strategy)
9. [Testing Strategy](#testing-strategy)

---

## 🎯 Executive Summary

### Objective
Transform the static 3-level workflow system into a **dynamic, template-based system** that allows users to create custom workflow structures with arbitrary levels and configurable unit properties.

### Key Changes
- ✅ **From Static → Dynamic**: Replace fixed 3-level structure with configurable N-level templates
- ✅ **Template System**: New template creation and management module
- ✅ **Unit Building Blocks**: Reusable unit templates with toggleable properties
- ✅ **Backward Compatibility**: Existing workflows must continue to work
- ✅ **Feature Preservation**: All current features (tags, filtering, modes, etc.) must be maintained

### Complexity Assessment
**High Complexity** - This is a fundamental architectural change affecting:
- Data models (complete restructure)
- UI/UX (new template builder)
- Business logic (dynamic rendering)
- Backward compatibility (data migration)

---

## 🔍 Current System Analysis

### Current Structure

```
Workflow (Flow)
├── settings: { enforceSequence: boolean }
└── data: Control[] (Level 1 - "Rules")
    ├── id, name, tags[]
    └── subcategories: Action[] (Level 2 - "Actions")
        ├── id, name, text, completed, tags[]
        └── subcategories: Evidence[] (Level 3 - "Evidences")
            ├── id, name, text, completed, grade, tags[]
            ├── footer: { links[], images[], notes[], comments[] }
            └── subcategories: [] (always empty)
```

### Fixed Constraints
1. **Exactly 3 levels**: Control → Action → Evidence
2. **Fixed property distribution**:
   - Controls: name, tags only
   - Actions: name, text, completed, tags
   - Evidence: name, text, completed, grade, tags, attachments
3. **Hardcoded level names**: "Rules", "Actions", "Evidences"
4. **Attachments only at Level 3**
5. **Progress tracking only for Actions (Level 2)**

### Current Features to Preserve
✅ Multi-flow support  
✅ Creation/Execution modes  
✅ Tag-based filtering  
✅ Linked workflows (structural synchronization)  
✅ Sequential enforcement option  
✅ Execution tracking (separate from structure)  
✅ Rich text editing (Quill for notes)  
✅ Flow copy functionality  
✅ Theme toggle (light/dark)  
✅ Mobile responsive design  

---

## 📝 Requirements Analysis

### 1. Unit Template Structure

**Purpose**: Reusable building block for workflow levels

**Properties** (all toggleable):

#### Identity Section
```typescript
interface UnitTemplate {
  // Always present (system-generated)
  id: string;  // "unit-{timestamp}-{random}"
  
  // Toggleable properties
  enableIcon?: boolean;
  enableUnitId?: boolean;
  enableName?: boolean;
  enableDescription?: boolean;
  enableTags?: boolean;
  enableDone?: boolean;
  enableGrade?: boolean;
  gradeCumulative?: boolean;  // Only if enableGrade = true
  enableProgressBar?: boolean;
  
  // Attachments (toggleable)
  enableLinks?: boolean;
  enableImages?: boolean;
  enableNotes?: boolean;
  enableComments?: boolean;
}
```

**Key Observations**:
- ✅ Good: Flexible, covers all current features plus new ones
- ⚠️ Issue: "Unit ID" and "id" naming confusion
  - Recommendation: Rename "Unit ID" to "displayId" or "userDefinedId"
- ⚠️ Issue: Icon selection from folder
  - Recommendation: Need icon picker component

### 2. Workflow Template Structure

**Purpose**: Define the structure and capabilities of workflows

```typescript
interface WorkflowTemplate {
  id: string;  // "template-{timestamp}-{random}"
  name: string;  // Required
  
  // Workflow-level settings (toggleable)
  enableIcon?: boolean;
  enableDescription?: boolean;
  enableSequentialOrder?: boolean;
  
  // Template structure
  levels: TemplateLevel[];  // Arbitrary number of levels
}

interface TemplateLevel {
  id: string;  // "level-{timestamp}-{random}"
  order: number;  // 0, 1, 2, etc.
  
  // Level metadata (toggleable)
  enableIcon?: boolean;
  name: string;  // Required (e.g., "Rules", "Actions", "Evidences")
  enableDescription?: boolean;
  
  // Unit configuration for this level
  unitConfig: UnitConfiguration;
}

interface UnitConfiguration {
  // Which Unit properties are enabled for units at this level
  enableIcon: boolean;
  enableUnitId: boolean;
  enableName: boolean;
  enableDescription: boolean;
  enableTags: boolean;
  enableDone: boolean;
  enableGrade: boolean;
  gradeCumulative: boolean;
  enableProgressBar: boolean;
  enableLinks: boolean;
  enableImages: boolean;
  enableNotes: boolean;
  enableComments: boolean;
}
```

**Key Observations**:
- ✅ Good: Supports arbitrary levels
- ✅ Good: Per-level unit configuration
- ⚠️ Issue: No min/max level constraints
  - Recommendation: Suggest 1-10 levels (UI/performance considerations)
- ⚠️ Issue: Level names must be unique?
  - Recommendation: Yes, enforce unique names per template

### 3. Template-Based Workflow Creation

**Flow**:
```
1. User clicks "New" workflow
2. Instead of empty, show template selector
3. User selects template
4. System creates workflow with template structure
5. User fills in enabled properties only
```

**Backward Compatibility**:
- Create a "Classic" default template matching current 3-level structure
- Migrate existing workflows to use "Classic" template

---

## 🏗️ Proposed Architecture

### Data Layer Restructure

#### New File Structure (`/workspace/data/`)

```
data/
├── templates.json              # All workflow templates
├── workflows.json              # Workflow instances (linked to templates)
├── executions.json             # Execution tracking (unchanged)
├── workflow-links.json         # Linked workflows (unchanged)
└── unit-instances.json         # All unit instances across all workflows
```

**Rationale**: Separate concerns for better scalability

#### Alternative Structure (Simpler)

```
data/
├── templates.json              # All workflow templates
├── workflows.json              # Workflows with embedded units (current style)
├── executions.json             # Execution tracking
└── workflow-links.json         # Linked workflows
```

**Recommendation**: Start with **Alternative (Simpler)** structure
- Easier migration from current system
- Less complexity for prototype phase
- Can refactor to normalized structure later if needed

### Data Model Design

#### templates.json

```json
{
  "templates": [
    {
      "id": "template-default-classic",
      "name": "Classic Compliance (3-Level)",
      "description": "Traditional 3-level structure (Rules → Actions → Evidences)",
      "isDefault": true,
      "createdAt": "2025-11-11T00:00:00.000Z",
      "createdBy": "system",
      "workflowConfig": {
        "enableIcon": false,
        "enableDescription": true,
        "enableSequentialOrder": true
      },
      "levels": [
        {
          "id": "level-1",
          "order": 0,
          "name": "Rules",
          "pluralName": "Rules",
          "singularName": "Rule",
          "enableIcon": false,
          "enableDescription": false,
          "unitConfig": {
            "enableIcon": true,
            "enableUnitId": false,
            "enableName": true,
            "enableDescription": false,
            "enableTags": true,
            "enableDone": false,
            "enableGrade": false,
            "gradeCumulative": false,
            "enableProgressBar": true,
            "enableLinks": false,
            "enableImages": false,
            "enableNotes": false,
            "enableComments": false
          }
        },
        {
          "id": "level-2",
          "order": 1,
          "name": "Actions",
          "pluralName": "Actions",
          "singularName": "Action",
          "enableIcon": false,
          "enableDescription": false,
          "unitConfig": {
            "enableIcon": true,
            "enableUnitId": false,
            "enableName": true,
            "enableDescription": true,
            "enableTags": true,
            "enableDone": true,
            "enableGrade": false,
            "gradeCumulative": false,
            "enableProgressBar": true,
            "enableLinks": false,
            "enableImages": false,
            "enableNotes": false,
            "enableComments": false
          }
        },
        {
          "id": "level-3",
          "order": 2,
          "name": "Evidences",
          "pluralName": "Evidences",
          "singularName": "Evidence",
          "enableIcon": false,
          "enableDescription": false,
          "unitConfig": {
            "enableIcon": true,
            "enableUnitId": true,
            "enableName": true,
            "enableDescription": true,
            "enableTags": true,
            "enableDone": true,
            "enableGrade": true,
            "gradeCumulative": true,
            "enableProgressBar": false,
            "enableLinks": true,
            "enableImages": true,
            "enableNotes": true,
            "enableComments": true
          }
        }
      ]
    }
  ]
}
```

#### workflows.json (Updated)

```json
{
  "settings": {
    "enforceSequence": false
  },
  "flows": [
    {
      "id": "flow-123",
      "name": "NIST CSF Compliance",
      "templateId": "template-default-classic",  // NEW: Link to template
      "icon": null,  // NEW: Optional
      "description": "",  // NEW: Optional
      "data": [/* units following template structure */]
    }
  ]
}
```

#### Unit Instance Structure (Dynamic)

```typescript
interface UnitInstance {
  id: string;
  
  // Template metadata (readonly)
  levelId: string;  // Which template level this unit belongs to
  templateId: string;  // Which template this unit uses
  
  // User-editable properties (only if enabled in template)
  icon?: string;  // Path to icon
  unitId?: string;  // Display ID (e.g., "ID.AM-1.1")
  name: string;  // Always required
  description?: string;
  tags?: string[];
  
  // Completion tracking (only if enabled)
  completed?: boolean;
  
  // Grading (only if enabled)
  grade?: number;
  
  // Attachments (only if enabled)
  footer?: {
    links?: Array<{text: string, url: string}>;
    images?: string[];
    notes?: Array<{title: string, content: string}>;
    comments?: string[];
  };
  
  // Tree structure
  subcategories: UnitInstance[];
  
  // UI state (not persisted)
  isExpanded?: boolean;
}
```

---

## ⚠️ Critical Issues & Recommendations

### Issue 1: Cumulative Grading Logic

**Current Behavior**: Not well-defined in existing system

**Proposed Behavior**:
```typescript
// When cumulative is enabled:
// 1. Parent grade = SUM of all direct children grades
// 2. Parent grade is READ-ONLY (calculated)
// 3. When child grade changes, parent recalculates
// 4. Done checkbox logic:
//    - Parent done = ALL children done
//    - Checking parent → checks all children
//    - Unchecking parent → unchecks all children
//    - Checking last child → auto-checks parent
```

**Recommendation**: 
- ✅ Implement as described above
- ✅ Add visual indicator (e.g., "Σ" icon) for cumulative grades
- ✅ Gray out parent grade input when cumulative is enabled

### Issue 2: Progress Bar Calculation

**Current**: Progress bar on Actions shows completion of Evidence items

**Proposed**: Generic progress calculation
```typescript
// For any level with progress bar enabled:
calculateProgress(unit) {
  const children = unit.subcategories;
  if (children.length === 0) return 0;
  
  const completedChildren = children.filter(c => c.completed === true).length;
  return (completedChildren / children.length) * 100;
}
```

**Recommendation**:
- ✅ Progress bar only meaningful if children have `enableDone` = true
- ✅ Hide progress bar if no children exist yet
- ⚠️ What if child level doesn't have `enableDone`? 
  - Suggestion: Don't allow progress bar if child level lacks done checkbox

### Issue 3: Icon Management

**User Idea**: Click icon to select from `/icons/` folder

**Issues**:
- Need icon picker UI component
- Currently 60+ icon files (how to display?)
- Icon preview needed

**Recommendation**:
```typescript
// Icon Picker Component
interface IconPickerProps {
  currentIcon?: string;
  onSelect: (iconPath: string) => void;
}

// Features:
// 1. Grid display of all icons
// 2. Search/filter by name
// 3. Preview on hover
// 4. Default placeholder icon
// 5. "No icon" option
```

### Issue 4: Template Validation

**Missing**: Validation rules for template creation

**Required Validations**:
```typescript
const validateTemplate = (template: WorkflowTemplate) => {
  // 1. Must have at least 1 level
  if (template.levels.length === 0) return "Template must have at least one level";
  
  // 2. Level names must be unique
  const names = template.levels.map(l => l.name);
  if (new Set(names).size !== names.length) return "Level names must be unique";
  
  // 3. Progress bar requires children with done checkbox
  for (let i = 0; i < template.levels.length - 1; i++) {
    const level = template.levels[i];
    const childLevel = template.levels[i + 1];
    if (level.unitConfig.enableProgressBar && !childLevel.unitConfig.enableDone) {
      return `Level "${level.name}" has progress bar but child level doesn't have done checkbox`;
    }
  }
  
  // 4. Cumulative grade requires children with grades
  for (let i = 0; i < template.levels.length - 1; i++) {
    const level = template.levels[i];
    const childLevel = template.levels[i + 1];
    if (level.unitConfig.gradeCumulative && !childLevel.unitConfig.enableGrade) {
      return `Level "${level.name}" has cumulative grades but child level doesn't have grades`;
    }
  }
  
  // 5. Reasonable level count (1-10)
  if (template.levels.length > 10) return "Maximum 10 levels allowed";
  
  return null; // Valid
};
```

**Recommendation**: Implement validation in template builder UI with real-time feedback

### Issue 5: Linked Workflows with Different Templates

**Current**: Linked workflows synchronize structure

**Problem**: What if linked workflows use different templates?

**Options**:
1. **Restrict**: Only allow linking workflows with same template
2. **Convert**: When linking, convert all to same template
3. **Ignore**: Allow linking, sync only common structure

**Recommendation**: **Option 1 (Restrict)**
- Simplest and safest
- Clear user expectation
- Show warning: "Only workflows with template 'X' can be linked"

### Issue 6: Migration of Existing Workflows

**Challenge**: Existing workflows have no `templateId`

**Migration Strategy**:
```typescript
const migrateExistingWorkflows = () => {
  // 1. Create "Classic" default template (3 levels)
  const classicTemplate = createClassicTemplate();
  saveTemplate(classicTemplate);
  
  // 2. Update all existing workflows
  workflows.flows.forEach(flow => {
    if (!flow.templateId) {
      flow.templateId = classicTemplate.id;
      
      // Ensure data structure matches
      flow.data = migrateControlsToUnits(flow.data, classicTemplate);
    }
  });
  
  saveWorkflows(workflows);
};
```

**Recommendation**: Run migration automatically on first load of new version

### Issue 7: Template Editing vs Workflow Instances

**Question**: What happens if I edit a template after creating workflows?

**Options**:
1. **Update All**: All workflows using template get updated (dangerous!)
2. **Versioning**: Templates are versioned, workflows link to specific version
3. **Copy-on-Create**: Workflow gets a copy of template structure (no link)

**Recommendation**: **Option 3 (Copy-on-Create)**
```typescript
// When creating workflow from template:
const workflow = {
  id: generateId('flow'),
  name: workflowName,
  templateId: template.id,  // For reference only
  templateSnapshot: deepCopy(template),  // Frozen copy
  data: []
};

// Workflow is independent after creation
// Template changes don't affect existing workflows
// Can show "based on template X v1.0" in UI
```

---

## 🗂️ Data Model Design (Final)

### File: `/workspace/data/templates.json`

```typescript
interface TemplatesData {
  templates: WorkflowTemplate[];
}

interface WorkflowTemplate {
  id: string;  // "template-{timestamp}-{random}"
  name: string;
  description?: string;
  isDefault: boolean;  // One template marked as default
  createdAt: string;  // ISO-8601
  createdBy: string;  // User ID
  updatedAt: string;
  
  // Workflow-level configuration
  workflowConfig: {
    enableIcon: boolean;
    enableDescription: boolean;
    enableSequentialOrder: boolean;
  };
  
  // Template structure
  levels: TemplateLevel[];
}

interface TemplateLevel {
  id: string;  // "level-{timestamp}-{random}"
  order: number;  // 0-based index
  name: string;  // "Rules", "Actions", etc.
  pluralName: string;  // For UI: "Add new Rule"
  singularName: string;  // For UI: "Rule added"
  description?: string;
  icon?: string;  // Optional level icon
  
  // Level metadata toggles
  enableIcon: boolean;
  enableDescription: boolean;
  
  // Unit configuration for this level
  unitConfig: UnitConfiguration;
}

interface UnitConfiguration {
  // Identity
  enableIcon: boolean;
  enableUnitId: boolean;  // Display ID (e.g., "ID.AM-1")
  enableName: boolean;  // Usually always true
  enableDescription: boolean;
  enableTags: boolean;
  
  // Completion
  enableDone: boolean;
  
  // Grading
  enableGrade: boolean;
  gradeCumulative: boolean;  // Only relevant if enableGrade = true
  
  // Visual
  enableProgressBar: boolean;  // Only if children have enableDone
  
  // Attachments
  enableLinks: boolean;
  enableImages: boolean;
  enableNotes: boolean;
  enableComments: boolean;
}
```

### File: `/workspace/data/workflows.json` (Updated)

```typescript
interface WorkflowsData {
  settings: {
    enforceSequence: boolean;  // Global default
  };
  flows: Flow[];
}

interface Flow {
  id: string;
  name: string;
  
  // Template reference
  templateId: string;  // FK to templates.json
  templateSnapshot: WorkflowTemplate;  // Frozen copy at creation time
  
  // Workflow-level properties (if enabled in template)
  icon?: string;
  description?: string;
  enforceSequence?: boolean;  // Override global if template allows
  
  // Workflow data
  data: UnitInstance[];
  
  // Metadata
  createdAt: string;
  updatedAt: string;
}

interface UnitInstance {
  id: string;  // "unit-{timestamp}-{random}"
  levelId: string;  // Which template level (for validation)
  
  // Properties (only present if enabled in template)
  icon?: string;
  unitId?: string;  // Display ID
  name: string;
  description?: string;
  tags?: string[];
  completed?: boolean;
  grade?: number;
  
  // Attachments
  footer?: {
    links?: Array<{text: string; url: string}>;
    images?: string[];
    notes?: Array<{title: string; content: string}>;
    comments?: string[];
  };
  
  // Tree structure
  subcategories: UnitInstance[];
  
  // UI state (not persisted)
  isExpanded?: boolean;
  isLocked?: boolean;
  isActive?: boolean;
}
```

### Files: `executions.json`, `workflow-links.json` (Unchanged)

These remain the same as current system.

---

## 🚧 Implementation Phases

### Phase 1: Data Layer & Migration (Week 1)
1. ✅ Create `/workspace/data/` folder
2. ✅ Design and create `templates.json` schema
3. ✅ Create "Classic" default template
4. ✅ Update `workflows.json` schema
5. ✅ Implement migration function for existing workflows
6. ✅ Create data access layer (load/save functions)

### Phase 2: Template Builder UI (Week 2)
1. ✅ Create `template-builder.html` page
2. ✅ Template list view
3. ✅ Template creation wizard:
   - Step 1: Template name & workflow settings
   - Step 2: Define levels
   - Step 3: Configure unit properties per level
   - Step 4: Review & save
4. ✅ Icon picker component
5. ✅ Template validation with visual feedback

### Phase 3: Dynamic Workflow Creation (Week 3)
1. ✅ Update flow selector to show template dropdown
2. ✅ Implement template-based workflow creation
3. ✅ Dynamic rendering based on template
4. ✅ Property visibility based on template config
5. ✅ Cumulative grade calculation
6. ✅ Progress bar calculation (generic)

### Phase 4: Feature Preservation (Week 4)
1. ✅ Tag filtering (works with any level)
2. ✅ Creation/Execution modes
3. ✅ Flow copy (with template)
4. ✅ Linked workflows (template matching validation)
5. ✅ Sequential enforcement
6. ✅ Rich text editing
7. ✅ Mobile responsive

### Phase 5: Testing & Polish (Week 5)
1. ✅ Create test templates (2-level, 4-level, etc.)
2. ✅ Test all existing features
3. ✅ Performance testing (10-level workflow)
4. ✅ Mobile testing
5. ✅ Documentation updates
6. ✅ User guide for template creation

---

## 🔄 Migration Strategy

### Step 1: Create Default Template
```typescript
const createClassicTemplate = (): WorkflowTemplate => {
  return {
    id: 'template-default-classic',
    name: 'Classic Compliance (3-Level)',
    description: 'Traditional 3-level structure matching original system',
    isDefault: true,
    createdAt: new Date().toISOString(),
    createdBy: 'system',
    updatedAt: new Date().toISOString(),
    workflowConfig: {
      enableIcon: false,
      enableDescription: true,
      enableSequentialOrder: true
    },
    levels: [
      // Level 1: Rules (Controls)
      {
        id: 'level-1-rules',
        order: 0,
        name: 'Rules',
        pluralName: 'Rules',
        singularName: 'Rule',
        enableIcon: false,
        enableDescription: false,
        unitConfig: {
          enableIcon: true,
          enableUnitId: false,
          enableName: true,
          enableDescription: false,
          enableTags: true,
          enableDone: false,
          enableGrade: false,
          gradeCumulative: false,
          enableProgressBar: true,
          enableLinks: false,
          enableImages: false,
          enableNotes: false,
          enableComments: false
        }
      },
      // Level 2: Actions
      {
        id: 'level-2-actions',
        order: 1,
        name: 'Actions',
        pluralName: 'Actions',
        singularName: 'Action',
        enableIcon: false,
        enableDescription: false,
        unitConfig: {
          enableIcon: true,
          enableUnitId: false,
          enableName: true,
          enableDescription: true,
          enableTags: true,
          enableDone: true,
          enableGrade: false,
          gradeCumulative: false,
          enableProgressBar: true,
          enableLinks: false,
          enableImages: false,
          enableNotes: false,
          enableComments: false
        }
      },
      // Level 3: Evidences
      {
        id: 'level-3-evidences',
        order: 2,
        name: 'Evidences',
        pluralName: 'Evidences',
        singularName: 'Evidence',
        enableIcon: false,
        enableDescription: false,
        unitConfig: {
          enableIcon: true,
          enableUnitId: true,
          enableName: true,
          enableDescription: true,
          enableTags: true,
          enableDone: true,
          enableGrade: true,
          gradeCumulative: true,
          enableProgressBar: false,
          enableLinks: true,
          enableImages: true,
          enableNotes: true,
          enableComments: true
        }
      }
    ]
  };
};
```

### Step 2: Migrate Existing Workflows
```typescript
const migrateWorkflowsToTemplates = () => {
  // Load existing data
  const workflows = loadWorkflows();
  const classicTemplate = createClassicTemplate();
  
  // Save default template
  saveTemplate(classicTemplate);
  
  // Migrate each flow
  workflows.flows.forEach(flow => {
    if (!flow.templateId) {
      flow.templateId = classicTemplate.id;
      flow.templateSnapshot = deepCopy(classicTemplate);
      
      // Add levelId to each unit
      addLevelIds(flow.data, classicTemplate.levels);
    }
  });
  
  // Save migrated workflows
  saveWorkflows(workflows);
};

const addLevelIds = (units: any[], levels: TemplateLevel[], depth = 0) => {
  units.forEach(unit => {
    unit.levelId = levels[depth].id;
    if (unit.subcategories && unit.subcategories.length > 0) {
      addLevelIds(unit.subcategories, levels, depth + 1);
    }
  });
};
```

### Step 3: Backward Compatibility Check
```typescript
// Test that migrated workflows work exactly as before
const testBackwardCompatibility = () => {
  // 1. Load migrated workflow
  // 2. Verify all properties present
  // 3. Verify rendering matches old system
  // 4. Verify tag filtering works
  // 5. Verify execution tracking works
  // 6. Verify all buttons/actions work
};
```

---

## 🧪 Testing Strategy

### Unit Tests
```typescript
// Template validation
test('validates template level count', () => {
  const template = createTemplate({ levels: [] });
  expect(validateTemplate(template)).toContain('at least one level');
});

// Cumulative grade calculation
test('calculates cumulative grades correctly', () => {
  const parent = createUnit({ grade: 0, children: [
    { grade: 5 }, { grade: 3 }, { grade: 2 }
  ]});
  expect(calculateCumulativeGrade(parent)).toBe(10);
});

// Progress bar calculation
test('calculates progress correctly', () => {
  const parent = createUnit({ children: [
    { completed: true },
    { completed: true },
    { completed: false },
    { completed: false }
  ]});
  expect(calculateProgress(parent)).toBe(50);
});
```

### Integration Tests
```typescript
// Template-based workflow creation
test('creates workflow from template', () => {
  const template = createTemplate({ levels: 2 });
  const workflow = createWorkflowFromTemplate(template, 'Test Flow');
  expect(workflow.templateId).toBe(template.id);
  expect(workflow.data).toEqual([]);
});

// Feature preservation
test('tag filtering works with dynamic levels', () => {
  // Create 4-level workflow
  // Add tags at different levels
  // Filter by tag
  // Verify correct units shown
});
```

### Manual Testing Checklist
- [ ] Create 2-level template, verify workflow creation
- [ ] Create 5-level template, verify workflow creation
- [ ] Test cumulative grades (3 levels deep)
- [ ] Test progress bars at multiple levels
- [ ] Test tag filtering with 4+ levels
- [ ] Test creation/execution mode switching
- [ ] Test flow copy with templates
- [ ] Test linked workflows (same template)
- [ ] Test linked workflows (different templates - should fail)
- [ ] Test icon picker
- [ ] Test all attachment types at any level
- [ ] Test mobile responsive
- [ ] Test theme toggle
- [ ] Migrate existing workflow, verify functionality

---

## 📋 Implementation Checklist

### Data Layer
- [ ] Create `/workspace/data/` folder structure
- [ ] Create `templates.json` with schema
- [ ] Create "Classic" default template
- [ ] Update `workflows.json` schema
- [ ] Implement template load/save functions
- [ ] Implement workflow load/save functions
- [ ] Implement migration function
- [ ] Test migration with existing data

### Template Builder UI
- [ ] Create `template-builder.html`
- [ ] Template list page
- [ ] Template creation wizard (4 steps)
- [ ] Icon picker component
- [ ] Level configuration UI
- [ ] Unit configuration UI
- [ ] Template validation
- [ ] Save/cancel functionality

### Workflow System Updates
- [ ] Update flow selector (template dropdown)
- [ ] Implement dynamic workflow creation
- [ ] Dynamic rendering engine
- [ ] Cumulative grade calculation
- [ ] Generic progress bar calculation
- [ ] Property visibility logic
- [ ] Add/delete unit (any level)
- [ ] Unit property editors (dynamic)

### Feature Preservation
- [ ] Tag filtering (any level)
- [ ] Tag autocomplete (any level)
- [ ] Creation/Execution modes
- [ ] Sequential enforcement
- [ ] Flow copy (with template)
- [ ] Linked workflows (template validation)
- [ ] Rich text editing (Quill)
- [ ] Theme toggle
- [ ] Mobile responsive

### Testing
- [ ] Unit tests (grade, progress, validation)
- [ ] Integration tests
- [ ] Manual testing checklist
- [ ] Performance testing
- [ ] Mobile testing

### Documentation
- [ ] Update user documentation
- [ ] Create template builder guide
- [ ] Update system architecture docs
- [ ] Create migration guide
- [ ] Update data model docs

---

## 🎯 Success Criteria

1. ✅ **Template Creation**: Can create templates with 1-10 levels
2. ✅ **Template-Based Workflows**: Can create workflows from any template
3. ✅ **Property Configurability**: All unit properties are toggleable per level
4. ✅ **Cumulative Grades**: Work correctly across all levels
5. ✅ **Progress Bars**: Calculate correctly for any level
6. ✅ **Feature Preservation**: All existing features work with dynamic structure
7. ✅ **Backward Compatibility**: Existing workflows continue to work
8. ✅ **Performance**: 10-level workflow renders and operates smoothly
9. ✅ **Mobile**: Works on mobile devices
10. ✅ **User Experience**: Intuitive template builder and workflow creator

---

## 📝 Next Steps

1. **Review this analysis** with stakeholders
2. **Approve architecture** decisions
3. **Begin Phase 1** implementation (data layer)
4. **Iterative development** following phases
5. **Continuous testing** during development

---

**Status**: ✅ Analysis Complete - Ready for Implementation

**Estimated Timeline**: 5 weeks for full implementation

**Risk Level**: Medium-High (major architectural change)

**Recommendation**: Proceed with phased approach, maintaining backward compatibility at each phase
