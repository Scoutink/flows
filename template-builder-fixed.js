// COMPLETE REWRITE OF saveTemplate function
// This replaces lines 634-733 in template-builder.js

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
