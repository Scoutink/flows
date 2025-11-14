// ===== TEMPLATE BUILDER APPLICATION =====

document.addEventListener('DOMContentLoaded', async () => {
    await init();
});

// ===== STATE =====
let state = {
    templates: [],
    currentTemplate: null,
    editMode: null, // null | 'create' | 'edit'
    theme: 'light',
    availableIcons: []
};

// ===== UTILITIES =====
const generateId = (prefix) => `${prefix}-${Date.now()}-${Math.random().toString(36).slice(2, 7)}`;

const formatDate = (dateStr) => {
    if (!dateStr) return '';
    const date = new Date(dateStr);
    return date.toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' });
};

const deepCopy = (obj) => JSON.parse(JSON.stringify(obj));

// ===== DATA LAYER =====
const loadTemplates = async () => {
    try {
        const res = await fetch(`data/templates.json?t=${Date.now()}`);
        if (!res.ok) throw new Error('Failed to load templates');
        const data = await res.json();
        return data.templates || [];
    } catch (e) {
        console.error('Load templates error:', e);
        return [];
    }
};

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

const loadAvailableIcons = async () => {
    // Get list of all icons in /icons/ folder
    // In production, this would be a server endpoint
    // For now, return a hardcoded list based on existing icons
    return [
        '3d-glasses.png', 'application-01.png', 'binocular.png', 'business-man-find.png',
        'city.png', 'cloud-public-01.png', 'computer-desktop.png', 'data-copy.png',
        'data-find.png', 'document-find.png', 'document-zoom-in-02.png', 'document-zoom-in-03.png',
        'document-zoom-out-02.png', 'full-screen-expand.png', 'globe.png', 'id-view.png',
        'instrument-binoculars.png', 'internet.png', 'lan.png', 'magnifying-glass.png',
        'mail-server.png', 'message-mail.png', 'messages-information-01.png', 'node.png',
        'nodes.png', 'polling-finger.png', 'preview.png', 'publish.png', 'row.png',
        'search-find.png', 'search.png', 'server-01.png', 'server-up.png', 'shop.png',
        'student-read-02.png', 'view-details-01.png', 'view-details.png', 'view-earth.png',
        'view-incident.png', 'view-list.png', 'view-medium-icons-01.png', 'view-news.png',
        'view-reset.png', 'view-settings.png', 'view-small-icons-01.png', 'view-small-icons.png',
        'view.png', 'virtual-apps.png', 'web-01.png', 'web.png', 'window-01.png',
        'window-delete.png', 'window-earth.png', 'window-horizontal-split.png', 'window-information.png',
        'window-new-01.png', 'window-new-02.png', 'window-new-open.png', 'window-new.png',
        'window-screen.png', 'window.png', 'zoom-in.png', 'zoom-out.png', 'zoom-scroll.png',
        'zoom.png', 'zooming.png'
    ];
};

// ===== INITIALIZATION =====
const init = async () => {
    // Load theme
    const savedTheme = localStorage.getItem('workflowTheme');
    if (savedTheme) {
        state.theme = savedTheme;
        document.body.classList.toggle('dark-theme', savedTheme === 'dark');
    }
    
    // Load data
    state.templates = await loadTemplates();
    state.availableIcons = await loadAvailableIcons();
    
    // Render
    renderTemplateList();
    
    // Setup event listeners
    setupEventListeners();
};

const setupEventListeners = () => {
    // Theme toggle
    const themeBtn = document.getElementById('theme-toggle-btn');
    if (themeBtn) {
        themeBtn.addEventListener('click', toggleTheme);
    }
    
    // Modal close
    const modalClose = document.getElementById('modal-close-btn');
    const modalBackdrop = document.getElementById('modal-backdrop');
    if (modalClose) {
        modalClose.addEventListener('click', closeModal);
    }
    if (modalBackdrop) {
        modalBackdrop.addEventListener('click', (e) => {
            if (e.target === modalBackdrop) closeModal();
        });
    }
};

const toggleTheme = () => {
    state.theme = state.theme === 'light' ? 'dark' : 'light';
    document.body.classList.toggle('dark-theme', state.theme === 'dark');
    localStorage.setItem('workflowTheme', state.theme);
};

// ===== MODAL SYSTEM =====
const openModal = (title, bodyHTML, onOpen = null) => {
    const backdrop = document.getElementById('modal-backdrop');
    const titleEl = document.getElementById('modal-title');
    const bodyEl = document.getElementById('modal-body');
    
    titleEl.textContent = title;
    bodyEl.innerHTML = bodyHTML;
    backdrop.classList.remove('hidden');
    
    if (onOpen) onOpen();
};

const closeModal = () => {
    const backdrop = document.getElementById('modal-backdrop');
    backdrop.classList.add('hidden');
};

// ===== TEMPLATE LIST VIEW =====
const renderTemplateList = () => {
    const content = document.getElementById('template-content');
    
    const html = `
        <div class="template-list">
            <div class="list-header">
                <h2><i class="fa-solid fa-layer-group"></i> Workflow Templates</h2>
                <button class="btn-primary" onclick="startCreateTemplate()">
                    <i class="fa-solid fa-plus"></i> Create New Template
                </button>
            </div>
            
            ${state.templates.length > 0 ? `
                <div class="templates-grid">
                    ${state.templates.map(template => renderTemplateCard(template)).join('')}
                </div>
            ` : `
                <div class="empty-state">
                    <i class="fa-solid fa-folder-open"></i>
                    <h3>No Templates Yet</h3>
                    <p>Create your first workflow template to define custom structures for your compliance workflows</p>
                    <button class="btn-primary" onclick="startCreateTemplate()">
                        <i class="fa-solid fa-plus"></i> Create Template
                    </button>
                </div>
            `}
        </div>
    `;
    
    content.innerHTML = html;
};

const renderTemplateCard = (template) => {
    return `
        <div class="template-card">
            <div class="template-card-header">
                <h3>${template.name}</h3>
                ${template.isDefault ? '<span class="badge-default">Default</span>' : ''}
            </div>
            <p class="template-description">${template.description || 'No description provided'}</p>
            <div class="template-stats">
                <span><i class="fa-solid fa-layer-group"></i> ${template.levels.length} level${template.levels.length !== 1 ? 's' : ''}</span>
                <span><i class="fa-solid fa-calendar"></i> ${formatDate(template.createdAt)}</span>
            </div>
            <div class="template-actions">
                <button class="btn-secondary" onclick="viewTemplate('${template.id}')">
                    <i class="fa-solid fa-eye"></i> View
                </button>
                <button class="btn-secondary" onclick="editTemplate('${template.id}')">
                    <i class="fa-solid fa-pen"></i> Edit
                </button>
                ${!template.isDefault ? `
                    <button class="btn-danger" onclick="deleteTemplate('${template.id}')">
                        <i class="fa-solid fa-trash"></i>
                    </button>
                ` : ''}
            </div>
        </div>
    `;
};

// ===== TEMPLATE CREATION/EDITING =====
window.startCreateTemplate = () => {
    state.editMode = 'create';
    state.currentTemplate = createEmptyTemplate();
    renderTemplateBuilder();
};

window.editTemplate = (templateId) => {
    const template = state.templates.find(t => t.id === templateId);
    if (!template) return;
    
    state.editMode = 'edit';
    state.currentTemplate = deepCopy(template);
    renderTemplateBuilder();
};

window.viewTemplate = (templateId) => {
    const template = state.templates.find(t => t.id === templateId);
    if (!template) return;
    
    const html = `
        <div class="template-view">
            <div class="form-section">
                <h4>Template Information</h4>
                <p><strong>Name:</strong> ${template.name}</p>
                <p><strong>Description:</strong> ${template.description || 'None'}</p>
                <p><strong>Version:</strong> ${template.version || '1.0.0'}</p>
                <p><strong>Created:</strong> ${formatDate(template.createdAt)}</p>
            </div>
            
            <div class="form-section">
                <h4>Levels (${template.levels.length})</h4>
                ${template.levels.map((level, idx) => `
                    <div class="level-item" style="margin-bottom: 1rem;">
                        <h5>Level ${idx + 1}: ${level.name}</h5>
                        <p><strong>Singular:</strong> ${level.singularName} | <strong>Plural:</strong> ${level.pluralName}</p>
                        ${level.description ? `<p>${level.description}</p>` : ''}
                        <p><strong>Enabled properties:</strong></p>
                        <ul style="margin: 0.5rem 0; padding-left: 2rem;">
                            ${Object.entries(level.unitConfig).filter(([k, v]) => v === true).map(([k]) => 
                                `<li>${k.replace(/^enable/, '').replace(/([A-Z])/g, ' $1').trim()}</li>`
                            ).join('')}
                        </ul>
                    </div>
                `).join('')}
            </div>
            
            <div class="modal-actions">
                <button class="btn-primary" onclick="closeModal()">Close</button>
            </div>
        </div>
    `;
    
    openModal('Template Details', html);
};

window.deleteTemplate = async (templateId) => {
    const template = state.templates.find(t => t.id === templateId);
    if (!template) return;
    
    if (!confirm(`Are you sure you want to delete the template "${template.name}"? This action cannot be undone.`)) {
        return;
    }
    
    state.templates = state.templates.filter(t => t.id !== templateId);
    if (await saveTemplates(state.templates)) {
        renderTemplateList();
    }
};

const createEmptyTemplate = () => {
    return {
        id: generateId('template'),
        name: '',
        description: '',
        isDefault: false,
        version: '1.0.0',
        createdAt: new Date().toISOString(),
        createdBy: 'user',
        updatedAt: new Date().toISOString(),
        icon: null,
        workflowConfig: {
            enableIcon: false,
            enableDescription: true,
            enableSequentialOrder: true
        },
        levels: [
            createEmptyLevel(0)
        ]
    };
};

const createEmptyLevel = (order) => {
    return {
        id: generateId('level'),
        order: order,
        name: '',
        pluralName: '',
        singularName: '',
        description: '',
        icon: null,
        color: '#6366f1',
        unitConfig: {
            enableIcon: true,
            enableUnitId: false,
            enableName: true,
            enableDescription: true,
            enableTags: true,
            enableDone: true,
            enableGrade: false,
            gradeCumulative: false,
            enableProgressBar: false,
            enableLinks: false,
            enableImages: false,
            enableNotes: false,
            enableComments: false
        }
    };
};

// ===== TEMPLATE BUILDER VIEW =====
const renderTemplateBuilder = () => {
    const content = document.getElementById('template-content');
    const template = state.currentTemplate;
    const isEdit = state.editMode === 'edit';
    
    const html = `
        <div class="template-builder-form">
            <div class="list-header">
                <h2>${isEdit ? 'Edit Template' : 'Create New Template'}</h2>
                <button class="btn-secondary" onclick="cancelTemplateBuilder()">
                    <i class="fa-solid fa-xmark"></i> Cancel
                </button>
            </div>
            
            <!-- Template Info -->
            <div class="form-section">
                <div class="form-section-header">
                    <i class="fa-solid fa-info-circle"></i>
                    <h3>Template Information</h3>
                </div>
                
                <div class="form-row">
                    <label>Template Name <span class="required">*</span></label>
                    <input type="text" id="template-name" value="${template.name}" 
                           placeholder="e.g., Classic Compliance, Agile Sprint, Risk Assessment" required>
                    <span class="form-hint">Choose a descriptive name for this template</span>
                </div>
                
                <div class="form-row">
                    <label>Description</label>
                    <textarea id="template-description" placeholder="Describe when and how this template should be used">${template.description}</textarea>
                    <span class="form-hint">Optional: Explain the purpose and use cases for this template</span>
                </div>
                
                <div class="form-row">
                    <label>
                        <input type="checkbox" id="template-default" ${template.isDefault ? 'checked' : ''}>
                        Set as default template
                    </label>
                    <span class="form-hint">The default template is pre-selected when creating new workflows</span>
                </div>
            </div>
            
            <!-- Workflow Configuration -->
            <div class="form-section">
                <div class="form-section-header">
                    <i class="fa-solid fa-cog"></i>
                    <h3>Workflow-Level Configuration</h3>
                </div>
                <p class="form-hint">Choose which properties are available at the workflow level</p>
                
                <div class="toggle-group">
                    ${renderToggle('workflow-icon', 'Workflow Icon', 'Allow workflows to have an icon', template.workflowConfig.enableIcon)}
                    ${renderToggle('workflow-description', 'Workflow Description', 'Allow workflows to have a description', template.workflowConfig.enableDescription)}
                    ${renderToggle('workflow-sequential', 'Sequential Order Option', 'Allow enforcing sequential completion of evidence', template.workflowConfig.enableSequentialOrder)}
                </div>
            </div>
            
            <!-- Levels Configuration -->
            <div class="form-section">
                <div class="form-section-header">
                    <i class="fa-solid fa-layer-group"></i>
                    <h3>Workflow Levels</h3>
                </div>
                <p class="form-hint">Define the hierarchical structure of your workflows (1-10 levels)</p>
                
                <div class="levels-list" id="levels-list">
                    ${template.levels.map((level, idx) => renderLevelItem(level, idx)).join('')}
                </div>
                
                ${template.levels.length < 10 ? `
                    <button class="btn-secondary" onclick="addLevel()" style="margin-top: 1rem;">
                        <i class="fa-solid fa-plus"></i> Add Level
                    </button>
                ` : ''}
            </div>
            
            <!-- Validation Messages -->
            <div id="validation-messages"></div>
            
            <!-- Form Actions -->
            <div class="form-actions">
                <button class="btn-secondary" onclick="cancelTemplateBuilder()">
                    <i class="fa-solid fa-xmark"></i> Cancel
                </button>
                <button class="btn-primary" onclick="saveTemplate()">
                    <i class="fa-solid fa-check"></i> ${isEdit ? 'Update Template' : 'Create Template'}
                </button>
            </div>
        </div>
    `;
    
    content.innerHTML = html;
};

const renderToggle = (id, title, description, checked) => {
    return `
        <div class="toggle-item">
            <div class="toggle-item-info">
                <div class="toggle-item-title">${title}</div>
                <div class="toggle-item-desc">${description}</div>
            </div>
            <label class="switch">
                <input type="checkbox" id="${id}" ${checked ? 'checked' : ''}>
                <span class="slider"></span>
            </label>
        </div>
    `;
};

const renderLevelItem = (level, index) => {
    return `
        <div class="level-item" data-level-index="${index}">
            <div class="level-item-header">
                <div class="level-order">${index + 1}</div>
                <input type="text" class="level-name" value="${level.name}" placeholder="Level name (e.g., Rules, Actions, Tasks)">
                <div class="level-item-actions">
                    ${index > 0 ? `<button class="btn-icon" onclick="moveLevelUp(${index})" title="Move up"><i class="fa-solid fa-arrow-up"></i></button>` : ''}
                    ${index < state.currentTemplate.levels.length - 1 ? `<button class="btn-icon" onclick="moveLevelDown(${index})" title="Move down"><i class="fa-solid fa-arrow-down"></i></button>` : ''}
                    ${state.currentTemplate.levels.length > 1 ? `<button class="btn-icon danger" onclick="removeLevel(${index})" title="Delete level"><i class="fa-solid fa-trash"></i></button>` : ''}
                </div>
            </div>
            
            <div class="form-row">
                <label>Singular Name (e.g., "Rule")</label>
                <input type="text" class="level-singular" value="${level.singularName}" placeholder="Singular form">
            </div>
            
            <div class="form-row">
                <label>Plural Name (e.g., "Rules")</label>
                <input type="text" class="level-plural" value="${level.pluralName}" placeholder="Plural form">
            </div>
            
            <div class="form-row">
                <label>Level Description (optional)</label>
                <input type="text" class="level-description" value="${level.description}" placeholder="Brief description of this level">
            </div>
            
            <div class="form-row">
                <label><strong>Unit Properties for This Level</strong></label>
                <p class="form-hint">Select which properties units at this level can have</p>
                <div class="unit-config-grid">
                    ${renderUnitConfigCheckbox(index, 'enableIcon', 'Icon', level.unitConfig.enableIcon)}
                    ${renderUnitConfigCheckbox(index, 'enableUnitId', 'Display ID', level.unitConfig.enableUnitId)}
                    ${renderUnitConfigCheckbox(index, 'enableName', 'Name', level.unitConfig.enableName, true)}
                    ${renderUnitConfigCheckbox(index, 'enableDescription', 'Description', level.unitConfig.enableDescription)}
                    ${renderUnitConfigCheckbox(index, 'enableTags', 'Tags', level.unitConfig.enableTags)}
                    ${renderUnitConfigCheckbox(index, 'enableDone', 'Done Checkbox', level.unitConfig.enableDone)}
                    ${renderUnitConfigCheckbox(index, 'enableGrade', 'Grade', level.unitConfig.enableGrade)}
                    ${level.unitConfig.enableGrade ? renderUnitConfigCheckbox(index, 'gradeCumulative', 'Cumulative Grade', level.unitConfig.gradeCumulative) : ''}
                    ${renderUnitConfigCheckbox(index, 'enableProgressBar', 'Progress Bar', level.unitConfig.enableProgressBar)}
                    ${renderUnitConfigCheckbox(index, 'enableLinks', 'Links', level.unitConfig.enableLinks)}
                    ${renderUnitConfigCheckbox(index, 'enableImages', 'Images', level.unitConfig.enableImages)}
                    ${renderUnitConfigCheckbox(index, 'enableNotes', 'Notes', level.unitConfig.enableNotes)}
                    ${renderUnitConfigCheckbox(index, 'enableComments', 'Comments', level.unitConfig.enableComments)}
                </div>
            </div>
        </div>
    `;
};

const renderUnitConfigCheckbox = (levelIndex, property, label, checked, disabled = false) => {
    return `
        <div class="config-checkbox ${checked ? 'checked' : ''}">
            <input type="checkbox" 
                   id="level-${levelIndex}-${property}" 
                   data-level="${levelIndex}" 
                   data-property="${property}"
                   ${checked ? 'checked' : ''}
                   ${disabled ? 'disabled' : ''}
                   onchange="updateUnitConfig(${levelIndex}, '${property}', this.checked)">
            <label for="level-${levelIndex}-${property}">${label}</label>
        </div>
    `;
};


// ===== SYNC FORM TO STATE =====
// This function reads all form values and updates state.currentTemplate
// Call this BEFORE any operation that triggers renderTemplateBuilder()
const syncFormToState = () => {
    if (!state.currentTemplate) return;
    
    const template = state.currentTemplate;
    
    // Sync template-level fields
    const nameEl = document.getElementById('template-name');
    const descEl = document.getElementById('template-description');
    const defaultEl = document.getElementById('template-default');
    
    if (nameEl) template.name = nameEl.value.trim();
    if (descEl) template.description = descEl.value.trim();
    if (defaultEl) template.isDefault = defaultEl.checked;
    
    // Sync workflow config
    const iconEl = document.getElementById('workflow-icon');
    const workflowDescEl = document.getElementById('workflow-description');
    const seqEl = document.getElementById('workflow-sequential');
    
    if (iconEl) template.workflowConfig.enableIcon = iconEl.checked;
    if (workflowDescEl) template.workflowConfig.enableDescription = workflowDescEl.checked;
    if (seqEl) template.workflowConfig.enableSequentialOrder = seqEl.checked;
    
    // Sync level data
    template.levels.forEach((level, idx) => {
        const levelEl = document.querySelector(`[data-level-index="${idx}"]`);
        if (!levelEl) return;
        
        const nameInput = levelEl.querySelector('.level-name');
        const singularInput = levelEl.querySelector('.level-singular');
        const pluralInput = levelEl.querySelector('.level-plural');
        const descInput = levelEl.querySelector('.level-description');
        
        if (nameInput) level.name = nameInput.value.trim();
        if (singularInput) level.singularName = singularInput.value.trim();
        if (pluralInput) level.pluralName = pluralInput.value.trim();
        if (descInput) level.description = descInput.value.trim();
    });
};

// ===== LEVEL OPERATIONS =====
window.addLevel = () => {
    syncFormToState(); // Save form values BEFORE adding level
    const newLevel = createEmptyLevel(state.currentTemplate.levels.length);
    state.currentTemplate.levels.push(newLevel);
    renderTemplateBuilder();
};

window.removeLevel = (index) => {
    if (state.currentTemplate.levels.length <= 1) {
        alert('Template must have at least one level');
        return;
    }
    
    if (!confirm(`Remove level "${state.currentTemplate.levels[index].name || `Level ${index + 1}`}"?`)) {
        return;
    }
    
    syncFormToState(); // Save form values BEFORE removing level
    state.currentTemplate.levels.splice(index, 1);
    // Reorder
    state.currentTemplate.levels.forEach((level, idx) => {
        level.order = idx;
    });
    renderTemplateBuilder();
};

window.moveLevelUp = (index) => {
    if (index === 0) return;
    syncFormToState(); // Save form values BEFORE moving
    const temp = state.currentTemplate.levels[index];
    state.currentTemplate.levels[index] = state.currentTemplate.levels[index - 1];
    state.currentTemplate.levels[index - 1] = temp;
    // Reorder
    state.currentTemplate.levels.forEach((level, idx) => {
        level.order = idx;
    });
    renderTemplateBuilder();
};

window.moveLevelDown = (index) => {
    if (index >= state.currentTemplate.levels.length - 1) return;
    syncFormToState(); // Save form values BEFORE moving
    const temp = state.currentTemplate.levels[index];
    state.currentTemplate.levels[index] = state.currentTemplate.levels[index + 1];
    state.currentTemplate.levels[index + 1] = temp;
    // Reorder
    state.currentTemplate.levels.forEach((level, idx) => {
        level.order = idx;
    });
    renderTemplateBuilder();
};

window.updateUnitConfig = (levelIndex, property, value) => {
    syncFormToState(); // Save form values BEFORE updating config
    state.currentTemplate.levels[levelIndex].unitConfig[property] = value;
    
    // Auto-check cumulative when grade is enabled
    if (property === 'enableGrade' && value === true) {
        state.currentTemplate.levels[levelIndex].unitConfig.gradeCumulative = true;
    }
    
    // Uncheck cumulative when grade is disabled
    if (property === 'enableGrade' && value === false) {
        state.currentTemplate.levels[levelIndex].unitConfig.gradeCumulative = false;
    }
    
    renderTemplateBuilder();
};

// ===== TEMPLATE VALIDATION =====
const validateTemplate = (template) => {
    const errors = [];
    
    // Name required
    if (!template.name || template.name.trim() === '') {
        errors.push('Template name is required');
    }
    
    // At least one level
    if (!template.levels || template.levels.length === 0) {
        errors.push('Template must have at least one level');
    }
    
    // Max 10 levels
    if (template.levels && template.levels.length > 10) {
        errors.push('Template cannot have more than 10 levels');
    }
    
    // Level names required and unique
    if (template.levels) {
        const levelNames = [];
        template.levels.forEach((level, idx) => {
            if (!level.name || level.name.trim() === '') {
                errors.push(`Level ${idx + 1} name is required`);
            } else {
                if (levelNames.includes(level.name.toLowerCase())) {
                    errors.push(`Level name "${level.name}" is duplicated`);
                }
                levelNames.push(level.name.toLowerCase());
            }
            
            // Singular and plural names
            if (!level.singularName || level.singularName.trim() === '') {
                errors.push(`Level ${idx + 1} singular name is required`);
            }
            if (!level.pluralName || level.pluralName.trim() === '') {
                errors.push(`Level ${idx + 1} plural name is required`);
            }
        });
        
        // Progress bar validation
        for (let i = 0; i < template.levels.length - 1; i++) {
            const level = template.levels[i];
            const childLevel = template.levels[i + 1];
            
            if (level.unitConfig.enableProgressBar && !childLevel.unitConfig.enableDone) {
                errors.push(`Level "${level.name}" has progress bar enabled but child level "${childLevel.name}" doesn't have done checkbox enabled`);
            }
        }
        
        // Cumulative grade validation
        for (let i = 0; i < template.levels.length - 1; i++) {
            const level = template.levels[i];
            const childLevel = template.levels[i + 1];
            
            if (level.unitConfig.gradeCumulative && !childLevel.unitConfig.enableGrade) {
                errors.push(`Level "${level.name}" has cumulative grades but child level "${childLevel.name}" doesn't have grades enabled`);
            }
        }
    }
    
    return errors;
};


window.saveTemplate = async () => {
    console.log('==================== SAVE TEMPLATE START ====================');
    
    // Step 1: Get the template object from state
    const template = state.currentTemplate;
    if (!template) {
        alert('Error: No template in state!');
        console.error('state.currentTemplate is null');
        return;
    }
    console.log('✓ Template object exists in state');
    
    // Step 2: Read template-level fields from DOM
    console.log('Reading template-level fields from DOM...');
    const templateNameEl = document.getElementById('template-name');
    const templateDescEl = document.getElementById('template-description');
    const templateDefaultEl = document.getElementById('template-default');
    
    console.log('  template-name element:', templateNameEl ? 'FOUND' : 'NOT FOUND');
    console.log('  template-description element:', templateDescEl ? 'FOUND' : 'NOT FOUND');
    console.log('  template-default element:', templateDefaultEl ? 'FOUND' : 'NOT FOUND');
    
    if (!templateNameEl || !templateDescEl || !templateDefaultEl) {
        alert('ERROR: Template form elements not found in DOM!\nPlease refresh the page and try again.');
        console.error('Missing template form elements');
        return;
    }
    
    // Read values
    const templateName = templateNameEl.value.trim();
    const templateDesc = templateDescEl.value.trim();
    const templateDefault = templateDefaultEl.checked;
    
    console.log('  template name VALUE:', `"${templateName}"`);
    console.log('  template desc VALUE:', `"${templateDesc}"`);
    console.log('  template default VALUE:', templateDefault);
    
    // Update template object
    template.name = templateName;
    template.description = templateDesc;
    template.isDefault = templateDefault;
    console.log('✓ Template-level fields updated in object');
    
    // Step 3: Read workflow-level config from DOM
    console.log('Reading workflow config from DOM...');
    const workflowIconEl = document.getElementById('workflow-icon');
    const workflowDescEl = document.getElementById('workflow-description');
    const workflowSeqEl = document.getElementById('workflow-sequential');
    
    if (workflowIconEl && workflowDescEl && workflowSeqEl) {
        template.workflowConfig.enableIcon = workflowIconEl.checked;
        template.workflowConfig.enableDescription = workflowDescEl.checked;
        template.workflowConfig.enableSequentialOrder = workflowSeqEl.checked;
        console.log('✓ Workflow config updated');
    } else {
        console.warn('⚠ Some workflow config elements not found (may be OK)');
    }
    
    // Step 4: Read level data from DOM
    console.log(`Reading level data for ${template.levels.length} levels...`);
    
    for (let idx = 0; idx < template.levels.length; idx++) {
        const level = template.levels[idx];
        console.log(`\nProcessing Level ${idx}:`);
        
        // Find the level container in DOM
        const levelEl = document.querySelector(`[data-level-index="${idx}"]`);
        console.log(`  Level container [data-level-index="${idx}"]:`, levelEl ? 'FOUND' : 'NOT FOUND');
        
        if (!levelEl) {
            console.error(`  ✗ Level ${idx} container not found in DOM!`);
            alert(`ERROR: Level ${idx + 1} form not found in DOM!\nThis should not happen. Please refresh and try again.`);
            return;
        }
        
        // Find input fields within level container
        const levelNameEl = levelEl.querySelector('.level-name');
        const levelSingularEl = levelEl.querySelector('.level-singular');
        const levelPluralEl = levelEl.querySelector('.level-plural');
        const levelDescEl = levelEl.querySelector('.level-description');
        
        console.log(`  .level-name input:`, levelNameEl ? 'FOUND' : 'NOT FOUND');
        console.log(`  .level-singular input:`, levelSingularEl ? 'FOUND' : 'NOT FOUND');
        console.log(`  .level-plural input:`, levelPluralEl ? 'FOUND' : 'NOT FOUND');
        console.log(`  .level-description input:`, levelDescEl ? 'FOUND' : 'NOT FOUND');
        
        if (!levelNameEl || !levelSingularEl || !levelPluralEl) {
            console.error(`  ✗ Level ${idx} inputs not found in DOM!`);
            alert(`ERROR: Level ${idx + 1} input fields not found!\nThis should not happen. Please refresh and try again.`);
            return;
        }
        
        // Read values
        const levelName = levelNameEl.value.trim();
        const levelSingular = levelSingularEl.value.trim();
        const levelPlural = levelPluralEl.value.trim();
        const levelDesc = levelDescEl ? levelDescEl.value.trim() : '';
        
        console.log(`  level name VALUE: "${levelName}"`);
        console.log(`  singular VALUE: "${levelSingular}"`);
        console.log(`  plural VALUE: "${levelPlural}"`);
        console.log(`  description VALUE: "${levelDesc}"`);
        
        // Update level object
        level.name = levelName;
        level.singularName = levelSingular;
        level.pluralName = levelPlural;
        level.description = levelDesc;
        
        console.log(`✓ Level ${idx} data updated in object`);
    }
    
    // Step 5: Validate the complete template object
    console.log('\n==================== VALIDATION ====================');
    console.log('Template object to validate:', JSON.stringify(template, null, 2));
    
    const errors = validateTemplate(template);
    
    if (errors.length > 0) {
        console.error('✗ VALIDATION FAILED with errors:', errors);
        showValidationErrors(errors);
        return;
    }
    
    console.log('✓ VALIDATION PASSED');
    
    // Step 6: Update timestamp
    template.updatedAt = new Date().toISOString();
    
    // Step 7: Add or update in templates array
    if (state.editMode === 'create') {
        console.log('Adding new template to array...');
        state.templates.push(template);
    } else {
        console.log('Updating existing template in array...');
        const index = state.templates.findIndex(t => t.id === template.id);
        if (index !== -1) {
            state.templates[index] = template;
        }
    }
    
    // Step 8: Handle default flag
    if (template.isDefault) {
        console.log('Unsetting default flag on other templates...');
        state.templates.forEach(t => {
            if (t.id !== template.id) {
                t.isDefault = false;
            }
        });
    }
    
    // Step 9: Save to backend
    console.log('Saving to backend...');
    const saved = await saveTemplates(state.templates);
    
    if (saved) {
        console.log('✓ SAVE SUCCESSFUL');
        console.log('==================== SAVE TEMPLATE END ====================\n');
        alert('Template saved successfully!');
        state.editMode = null;
        state.currentTemplate = null;
        renderTemplateList();
    } else {
        console.error('✗ SAVE FAILED');
        console.log('==================== SAVE TEMPLATE END (FAILED) ====================\n');
    }
};

window.cancelTemplateBuilder = () => {
    if (confirm('Discard changes and return to template list?')) {
        state.editMode = null;
        state.currentTemplate = null;
        renderTemplateList();
    }
};

const showValidationErrors = (errors) => {
    const container = document.getElementById('validation-messages');
    if (!container) return;
    
    const html = `
        <div class="validation-message">
            <i class="fa-solid fa-exclamation-triangle"></i>
            <div>
                <strong>Please fix the following errors:</strong>
                <ul style="margin: 0.5rem 0 0 0; padding-left: 1.5rem;">
                    ${errors.map(err => `<li>${err}</li>`).join('')}
                </ul>
            </div>
        </div>
    `;
    
    container.innerHTML = html;
    container.scrollIntoView({ behavior: 'smooth', block: 'nearest' });
};

// ===== EXPORTS =====
window.state = state;
