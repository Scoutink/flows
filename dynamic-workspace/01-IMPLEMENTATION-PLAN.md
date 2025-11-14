# Dynamic Workflow Templates - Implementation Plan

**Branch**: cursor/dynamic-workflow-templates-1762883094  
**Date**: 2025-11-11  
**Status**: Implementation Planning

---

## 🎯 Implementation Overview

Based on the analysis in `00-ANALYSIS-AND-DESIGN.md`, this document provides the detailed implementation plan with specific tasks, code examples, and success criteria for each phase.

---

## 📊 Phase Breakdown

### Phase 1: Data Layer & Foundation (Priority: CRITICAL)
**Timeline**: 3-4 hours  
**Dependencies**: None  
**Deliverables**:
- New data folder structure
- Template schema and default template
- Updated workflow schema
- Migration utilities
- Data access layer

### Phase 2: Template Builder UI (Priority: HIGH)
**Timeline**: 4-5 hours  
**Dependencies**: Phase 1  
**Deliverables**:
- Template builder page
- Template list/management
- Level configuration UI
- Unit configuration UI
- Icon picker component

### Phase 3: Dynamic Workflow Engine (Priority: CRITICAL)
**Timeline**: 5-6 hours  
**Dependencies**: Phase 1, 2  
**Deliverables**:
- Template-based workflow creation
- Dynamic rendering system
- Property visibility logic
- Cumulative grade calculator
- Progress bar calculator

### Phase 4: Feature Integration (Priority: HIGH)
**Timeline**: 3-4 hours  
**Dependencies**: Phase 3  
**Deliverables**:
- Tag filtering (multi-level)
- Linked workflows (template-aware)
- Flow copy (with template)
- All existing features working

### Phase 5: Testing & Documentation (Priority: MEDIUM)
**Timeline**: 2-3 hours  
**Dependencies**: Phase 1-4  
**Deliverables**:
- Comprehensive testing
- User documentation
- Migration guide
- Performance validation

**Total Estimated Time**: 17-22 hours

---

## 🚀 Phase 1: Data Layer & Foundation

### Task 1.1: Create Data Folder Structure

**Files to Create**:
```
/workspace/data/
├── templates.json          (NEW)
├── workflows.json          (MIGRATE from root)
├── executions.json         (MIGRATE from root)
└── workflow-links.json     (MIGRATE from root)
```

**Implementation**:
```bash
# 1. Create data folder
mkdir -p /workspace/data

# 2. Move existing files
mv /workspace/workflow.json /workspace/data/workflows.json
mv /workspace/executions.json /workspace/data/executions.json
mv /workspace/workflow-links.json /workspace/data/workflow-links.json

# 3. Create new templates.json
touch /workspace/data/templates.json
```

**Initial templates.json**:
```json
{
  "templates": []
}
```

### Task 1.2: Create Default "Classic" Template

**File**: `/workspace/data/templates.json`

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
      "updatedAt": "2025-11-11T00:00:00.000Z",
      "workflowConfig": {
        "enableIcon": false,
        "enableDescription": true,
        "enableSequentialOrder": true
      },
      "levels": [
        {
          "id": "level-classic-rules",
          "order": 0,
          "name": "Rules",
          "pluralName": "Rules",
          "singularName": "Rule",
          "description": "Control categories",
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
          "id": "level-classic-actions",
          "order": 1,
          "name": "Actions",
          "pluralName": "Actions",
          "singularName": "Action",
          "description": "Actions to perform",
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
          "id": "level-classic-evidences",
          "order": 2,
          "name": "Evidences",
          "pluralName": "Evidences",
          "singularName": "Evidence",
          "description": "Evidence items",
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

### Task 1.3: Update Data Access Layer

**File**: `/workspace/script.js` (add at top, after current load functions)

```javascript
// ===== NEW: TEMPLATE DATA ACCESS =====
const TEMPLATES_FILE = 'data/templates.json';
const WORKFLOWS_FILE = 'data/workflows.json';
const EXECUTIONS_FILE = 'data/executions.json';
const LINKS_FILE = 'data/workflow-links.json';

// Load templates
const loadTemplates = async () => {
    try {
        const res = await fetch(`${TEMPLATES_FILE}?t=${Date.now()}`);
        if (!res.ok) throw new Error('Failed to load templates');
        const data = await res.json();
        return data.templates || [];
    } catch (e) {
        console.error('Load templates error:', e);
        return [];
    }
};

// Save templates
const saveTemplates = async (templates) => {
    try {
        const res = await fetch('save_templates.php', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ templates })
        });
        const json = await res.json();
        if (json.status !== 'success') throw new Error(json.message);
        return true;
    } catch (e) {
        console.error('Save templates error:', e);
        alert('Failed to save templates: ' + e.message);
        return false;
    }
};

// Get template by ID
const getTemplateById = async (templateId) => {
    const templates = await loadTemplates();
    return templates.find(t => t.id === templateId) || null;
};

// Get default template
const getDefaultTemplate = async () => {
    const templates = await loadTemplates();
    return templates.find(t => t.isDefault) || templates[0] || null;
};

// Get level configuration from template
const getLevelConfig = (template, levelIndex) => {
    if (!template || !template.levels || levelIndex >= template.levels.length) {
        return null;
    }
    return template.levels[levelIndex];
};

// Check if property is enabled for level
const isPropertyEnabled = (template, levelIndex, propertyName) => {
    const level = getLevelConfig(template, levelIndex);
    if (!level) return false;
    return level.unitConfig[propertyName] === true;
};
```

### Task 1.4: Create Backend Save Script

**File**: `/workspace/save_templates.php`

```php
<?php
header('Content-Type: application/json');

// Get JSON input
$input = file_get_contents('php://input');
$data = json_decode($input, true);

// Validate
if (!$data || !isset($data['templates'])) {
    echo json_encode([
        'status' => 'error',
        'message' => 'Invalid data: templates array required'
    ]);
    exit;
}

// Prepare data structure
$output = [
    'templates' => $data['templates']
];

// Save to file
$result = file_put_contents(
    'data/templates.json',
    json_encode($output, JSON_PRETTY_PRINT | JSON_UNESCAPED_SLASHES)
);

// Response
if ($result !== false) {
    echo json_encode([
        'status' => 'success',
        'message' => 'Templates saved successfully'
    ]);
} else {
    echo json_encode([
        'status' => 'error',
        'message' => 'Failed to write templates file'
    ]);
}
?>
```

### Task 1.5: Update Backend Save Scripts (File Paths)

**Update all save_*.php files to use /data/ folder**:

```php
// save_workflow.php - UPDATE line:
$result = file_put_contents('data/workflows.json', ...);

// save_executions.php - UPDATE line:
$result = file_put_contents('data/executions.json', ...);

// save_workflow_links.php - UPDATE line:
$result = file_put_contents('data/workflow-links.json', ...);
```

### Task 1.6: Migration Function

**File**: `/workspace/script.js` (add migration function)

```javascript
// ===== MIGRATION: Static to Dynamic Templates =====
const migrateToTemplateSystem = async () => {
    console.log('Starting migration to template system...');
    
    // 1. Check if already migrated
    const workflows = await loadWorkflow();
    if (workflows.flows && workflows.flows[0]?.templateId) {
        console.log('Already migrated. Skipping.');
        return;
    }
    
    // 2. Load or create Classic template
    let classicTemplate = await getDefaultTemplate();
    if (!classicTemplate) {
        console.log('Creating Classic default template...');
        classicTemplate = createClassicTemplate();
        await saveTemplates([classicTemplate]);
    }
    
    // 3. Migrate each workflow
    console.log(`Migrating ${workflows.flows.length} workflows...`);
    workflows.flows.forEach(flow => {
        if (!flow.templateId) {
            flow.templateId = classicTemplate.id;
            flow.templateSnapshot = JSON.parse(JSON.stringify(classicTemplate));
            
            // Add levelId to each unit
            addLevelIdsToUnits(flow.data, classicTemplate.levels, 0);
        }
    });
    
    // 4. Save migrated workflows
    await saveWorkflow();
    console.log('Migration complete!');
    
    return true;
};

// Helper: Add levelId to all units recursively
const addLevelIdsToUnits = (units, levels, depth) => {
    if (!units || units.length === 0 || depth >= levels.length) return;
    
    const levelId = levels[depth].id;
    units.forEach(unit => {
        unit.levelId = levelId;
        if (unit.subcategories && unit.subcategories.length > 0) {
            addLevelIdsToUnits(unit.subcategories, levels, depth + 1);
        }
    });
};

// Helper: Create Classic template programmatically
const createClassicTemplate = () => {
    return {
        id: 'template-default-classic',
        name: 'Classic Compliance (3-Level)',
        description: 'Traditional 3-level structure (Rules → Actions → Evidences)',
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
            {
                id: 'level-classic-rules',
                order: 0,
                name: 'Rules',
                pluralName: 'Rules',
                singularName: 'Rule',
                description: 'Control categories',
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
            {
                id: 'level-classic-actions',
                order: 1,
                name: 'Actions',
                pluralName: 'Actions',
                singularName: 'Action',
                description: 'Actions to perform',
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
            {
                id: 'level-classic-evidences',
                order: 2,
                name: 'Evidences',
                pluralName: 'Evidences',
                singularName: 'Evidence',
                description: 'Evidence items',
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

// Run migration on load
document.addEventListener('DOMContentLoaded', async () => {
    // Run migration first
    await migrateToTemplateSystem();
    
    // Then continue with normal initialization
    // ... existing DOMContentLoaded code ...
});
```

### Phase 1 Success Criteria

✅ **Data Folder**: `/workspace/data/` exists with all JSON files  
✅ **Templates File**: `templates.json` exists with Classic template  
✅ **Migration**: Existing workflows have `templateId` and `levelId`  
✅ **Load Functions**: Can load templates programmatically  
✅ **Save Functions**: Can save templates via PHP backend  
✅ **Backward Compatibility**: Existing workflows still render correctly  

---

## 🎨 Phase 2: Template Builder UI

### Task 2.1: Create Template Builder Page

**File**: `/workspace/template-builder.html`

```html
<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Template Builder - Compliance Manager</title>
    <link rel="stylesheet" href="https://cdnjs.cloudflare.com/ajax/libs/font-awesome/6.4.0/css/all.min.css">
    <link rel="stylesheet" href="style.css">
    <link rel="stylesheet" href="template-builder.css">
</head>
<body>
    <div class="template-builder-container">
        <!-- Header -->
        <div class="top-bar">
            <div class="header-controls">
                <div class="header-title">
                    <h1>Template Builder</h1>
                    <div class="app-version">Dynamic Templates</div>
                </div>
                <div class="header-buttons">
                    <a href="index.html" class="doc-button">
                        <i class="fa-solid fa-arrow-left"></i> Back to Workflows
                    </a>
                    <button id="theme-toggle-btn" class="doc-button">
                        <i class="fa-solid fa-circle-half-stroke"></i>
                    </button>
                </div>
            </div>
        </div>

        <!-- Template List / Builder Content -->
        <div id="template-content">
            <!-- Will be populated by JavaScript -->
        </div>
    </div>

    <!-- Modal -->
    <div id="modal-backdrop" class="hidden">
        <div id="modal-content">
            <button id="modal-close-btn"><i class="fa-solid fa-xmark"></i></button>
            <h3 id="modal-title">Modal Title</h3>
            <div id="modal-body"></div>
        </div>
    </div>

    <script src="template-builder.js"></script>
</body>
</html>
```

### Task 2.2: Template List View

**File**: `/workspace/template-builder.js` (create new)

```javascript
document.addEventListener('DOMContentLoaded', async () => {
    await init();
});

let state = {
    templates: [],
    currentTemplate: null,
    editMode: 'list' // 'list', 'create', 'edit'
};

const init = async () => {
    state.templates = await loadTemplates();
    renderTemplateList();
    setupEventListeners();
};

const renderTemplateList = () => {
    const content = document.getElementById('template-content');
    
    const html = `
        <div class="template-list">
            <div class="list-header">
                <h2>Workflow Templates</h2>
                <button id="btn-new-template" class="btn-primary">
                    <i class="fa-solid fa-plus"></i> Create New Template
                </button>
            </div>
            
            <div class="templates-grid">
                ${state.templates.map(template => renderTemplateCard(template)).join('')}
            </div>
            
            ${state.templates.length === 0 ? `
                <div class="empty-state">
                    <i class="fa-solid fa-folder-open"></i>
                    <h3>No Templates Yet</h3>
                    <p>Create your first workflow template to get started</p>
                    <button class="btn-primary" onclick="startCreateTemplate()">
                        <i class="fa-solid fa-plus"></i> Create Template
                    </button>
                </div>
            ` : ''}
        </div>
    `;
    
    content.innerHTML = html;
};

const renderTemplateCard = (template) => {
    return `
        <div class="template-card" data-template-id="${template.id}">
            <div class="template-card-header">
                <h3>${template.name}</h3>
                ${template.isDefault ? '<span class="badge-default">Default</span>' : ''}
            </div>
            <p class="template-description">${template.description || 'No description'}</p>
            <div class="template-stats">
                <span><i class="fa-solid fa-layer-group"></i> ${template.levels.length} levels</span>
                <span><i class="fa-solid fa-calendar"></i> ${formatDate(template.createdAt)}</span>
            </div>
            <div class="template-actions">
                <button class="btn-secondary" onclick="editTemplate('${template.id}')">
                    <i class="fa-solid fa-pen"></i> Edit
                </button>
                ${!template.isDefault ? `
                    <button class="btn-danger" onclick="deleteTemplate('${template.id}')">
                        <i class="fa-solid fa-trash"></i> Delete
                    </button>
                ` : ''}
            </div>
        </div>
    `;
};

// ... Continue in next task
```

### Task 2.3: Template Creation Wizard

**Wizard Steps**:
1. Template Info (name, description, workflow settings)
2. Level Structure (add/remove/reorder levels)
3. Level Configuration (per-level unit properties)
4. Review & Save

**Implementation**: See detailed code in separate implementation file

### Task 2.4: Icon Picker Component

**File**: `/workspace/template-builder.js` (add function)

```javascript
const openIconPicker = (currentIcon, onSelect) => {
    // Get all icons from /icons/ folder
    const icons = getAvailableIcons();
    
    const html = `
        <div class="icon-picker">
            <input type="text" id="icon-search" placeholder="Search icons..." class="form-input">
            <div class="icons-grid">
                ${icons.map(icon => `
                    <div class="icon-option ${currentIcon === icon ? 'selected' : ''}" 
                         data-icon="${icon}"
                         onclick="selectIcon('${icon}')">
                        <img src="icons/${icon}" alt="${icon}">
                        <span>${icon.replace('.png', '')}</span>
                    </div>
                `).join('')}
            </div>
        </div>
    `;
    
    openModal('Select Icon', html, () => {
        // Setup search
        document.getElementById('icon-search').addEventListener('input', (e) => {
            filterIcons(e.target.value);
        });
    });
    
    window.selectIcon = (icon) => {
        onSelect(icon);
        closeModal();
    };
};

const getAvailableIcons = () => {
    // In real implementation, fetch from server
    // For now, return hardcoded list from /icons/ folder
    return [
        '3d-glasses.png',
        'application-01.png',
        'binocular.png',
        // ... all icon files
    ];
};
```

### Phase 2 Success Criteria

✅ **Template List**: Can view all templates  
✅ **Template Creation**: Can create new template via wizard  
✅ **Level Configuration**: Can add/remove/reorder levels  
✅ **Unit Configuration**: Can toggle unit properties per level  
✅ **Icon Picker**: Can select icons from folder  
✅ **Validation**: Real-time validation with error messages  
✅ **Save**: Can save template to `templates.json`  

---

## ⚙️ Phase 3: Dynamic Workflow Engine

### Task 3.1: Template Selector in Flow Creation

**File**: `/workspace/script.js` (update flow creation)

```javascript
// Update flow creation to show template selector
const showFlowCreateDialog = async () => {
    const templates = await loadTemplates();
    
    const html = `
        <form id="create-flow-form" class="modal-form">
            <label for="flow-name">Workflow Name *</label>
            <input type="text" id="flow-name" required autofocus>
            
            <label for="flow-template">Based on Template *</label>
            <select id="flow-template" required>
                ${templates.map(t => `
                    <option value="${t.id}" ${t.isDefault ? 'selected' : ''}>
                        ${t.name} (${t.levels.length} levels)
                    </option>
                `).join('')}
            </select>
            
            <div class="modal-actions">
                <button type="button" class="btn-secondary" onclick="closeModal()">Cancel</button>
                <button type="submit" class="btn-primary">Create Workflow</button>
            </div>
        </form>
    `;
    
    openModal('Create New Workflow', html, () => {
        document.getElementById('create-flow-form').addEventListener('submit', async (e) => {
            e.preventDefault();
            const name = document.getElementById('flow-name').value.trim();
            const templateId = document.getElementById('flow-template').value;
            
            await createFlowFromTemplate(name, templateId);
            closeModal();
        });
    });
};

const createFlowFromTemplate = async (name, templateId) => {
    const template = await getTemplateById(templateId);
    if (!template) {
        alert('Template not found!');
        return;
    }
    
    const flow = {
        id: generateId('flow'),
        name: name,
        templateId: template.id,
        templateSnapshot: JSON.parse(JSON.stringify(template)),
        data: [],
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString()
    };
    
    appState.workflow.flows.push(flow);
    appState.currentFlowId = flow.id;
    
    populateFlowSelect();
    render();
    await saveWorkflow();
};
```

### Task 3.2: Dynamic Rendering Engine

**File**: `/workspace/script.js` (replace existing render functions)

```javascript
// Dynamic rendering based on template
const render = () => {
    const flow = getCurrentFlow();
    if (!flow) {
        workflowRoot.innerHTML = '<div class="loading-state">Select or create a workflow</div>';
        return;
    }
    
    const template = flow.templateSnapshot;
    if (!template) {
        // Fallback to old rendering for non-migrated workflows
        renderLegacy();
        return;
    }
    
    // NEW: Dynamic rendering
    const html = renderUnits(flow.data, template, 0);
    workflowRoot.innerHTML = html || '<div class="empty-state">No units yet. Click "Add" to create your first unit.</div>';
    
    applyModeStyles();
    updateLinkedIndicator();
    updateTagFilterBanner();
};

const renderUnits = (units, template, depth) => {
    if (!units || units.length === 0) return '';
    if (depth >= template.levels.length) return '';
    
    const level = template.levels[depth];
    
    // Filter by active tag if set
    let filtered = units;
    if (appState.activeTag) {
        filtered = filterUnitsByTag(units, appState.activeTag, template, depth);
    }
    
    return filtered.map((unit, index) => 
        renderUnit(unit, template, depth, `data.${index}`)
    ).join('');
};

const renderUnit = (unit, template, depth, path) => {
    const level = template.levels[depth];
    const config = level.unitConfig;
    const isCreation = appState.currentMode === 'creation';
    
    return `
        <div class="unit level-${depth}" data-path="${path}" data-level="${depth}">
            ${renderUnitHeader(unit, level, config, depth, path, isCreation)}
            ${renderUnitBody(unit, level, config, path, isCreation)}
            ${depth < template.levels.length - 1 ? renderUnitChildren(unit, template, depth, path) : ''}
        </div>
    `;
};

const renderUnitHeader = (unit, level, config, depth, path, isCreation) => {
    return `
        <div class="unit-header">
            ${config.enableIcon ? `
                <span class="unit-icon" onclick="selectUnitIcon('${path}')">
                    ${unit.icon ? `<img src="icons/${unit.icon}" alt="icon">` : '<i class="fa-solid fa-image"></i>'}
                </span>
            ` : ''}
            
            ${config.enableUnitId ? `
                <input type="text" 
                       class="unit-id-input" 
                       value="${unit.unitId || ''}" 
                       placeholder="ID" 
                       onblur="updateUnitProperty('${path}', 'unitId', this.value)"
                       ${!isCreation ? 'readonly' : ''}>
            ` : ''}
            
            <input type="text" 
                   class="unit-name-input" 
                   value="${unit.name || ''}" 
                   placeholder="${level.singularName} name" 
                   onblur="updateUnitProperty('${path}', 'name', this.value)"
                   ${!isCreation ? 'readonly' : ''}>
            
            ${config.enableTags ? renderUnitTags(unit, path, isCreation) : ''}
            
            ${config.enableDone && !isCreation ? `
                <label class="checkbox-label">
                    <input type="checkbox" 
                           ${unit.completed ? 'checked' : ''} 
                           onchange="toggleUnitCompletion('${path}')">
                    <span>Done</span>
                </label>
            ` : ''}
            
            ${config.enableGrade ? renderGradeInput(unit, config, path, isCreation) : ''}
            
            ${config.enableProgressBar && unit.subcategories ? renderProgressBar(unit, template, depth) : ''}
            
            ${isCreation ? `
                <button class="btn-icon btn-delete" onclick="deleteUnit('${path}')" title="Delete">
                    <i class="fa-solid fa-trash"></i>
                </button>
            ` : ''}
        </div>
    `;
};

// ... Continue with renderUnitBody, renderUnitChildren, etc.
```

### Task 3.3: Cumulative Grade Calculator

```javascript
const calculateCumulativeGrade = (unit, template, depth) => {
    if (depth >= template.levels.length - 1) {
        // Leaf level, return own grade
        return unit.grade || 0;
    }
    
    const level = template.levels[depth];
    if (!level.unitConfig.gradeCumulative) {
        // Not cumulative, return own grade
        return unit.grade || 0;
    }
    
    // Cumulative: sum of children grades
    if (!unit.subcategories || unit.subcategories.length === 0) {
        return 0;
    }
    
    return unit.subcategories.reduce((sum, child) => {
        return sum + calculateCumulativeGrade(child, template, depth + 1);
    }, 0);
};

const updateCumulativeGrades = (unit, template, depth) => {
    if (depth >= template.levels.length - 1) return;
    
    const level = template.levels[depth];
    if (level.unitConfig.gradeCumulative) {
        unit.grade = calculateCumulativeGrade(unit, template, depth);
    }
    
    // Recurse to children
    if (unit.subcategories) {
        unit.subcategories.forEach(child => {
            updateCumulativeGrades(child, template, depth + 1);
        });
    }
};
```

### Task 3.4: Progress Bar Calculator

```javascript
const calculateProgress = (unit, template, depth) => {
    if (!unit.subcategories || unit.subcategories.length === 0) {
        return 0;
    }
    
    const childLevel = template.levels[depth + 1];
    if (!childLevel || !childLevel.unitConfig.enableDone) {
        return 0;
    }
    
    const total = unit.subcategories.length;
    const completed = unit.subcategories.filter(c => c.completed === true).length;
    
    return Math.round((completed / total) * 100);
};

const renderProgressBar = (unit, template, depth) => {
    const progress = calculateProgress(unit, template, depth);
    
    return `
        <div class="progress-bar-container" title="${progress}% complete">
            <div class="progress-bar" style="width: ${progress}%;"></div>
            <span class="progress-text">${progress}%</span>
        </div>
    `;
};
```

### Phase 3 Success Criteria

✅ **Template Selection**: Can select template when creating workflow  
✅ **Dynamic Rendering**: Units render based on template configuration  
✅ **Property Visibility**: Only enabled properties shown/editable  
✅ **Cumulative Grades**: Calculate and display correctly  
✅ **Progress Bars**: Calculate for any level with children  
✅ **Add/Delete Units**: Works at any level  
✅ **Multi-Level Support**: Works with 1-10 levels  

---

## 📋 Remaining Phases Summary

### Phase 4: Feature Integration
- Tag filtering for multi-level
- Linked workflows (template validation)
- Flow copy with template
- All existing features preserved

### Phase 5: Testing & Documentation
- Unit tests
- Integration tests
- User documentation
- Migration guide

---

## ✅ Next Steps

1. **Begin Phase 1 Implementation**: Start with data folder and migration
2. **Test Migration**: Verify existing workflows still work
3. **Proceed to Phase 2**: Once Phase 1 is stable
4. **Iterative Testing**: Test after each phase

---

**Status**: ✅ Plan Complete - Ready to Begin Implementation

**Recommendation**: Start with Phase 1 tasks in order listed
