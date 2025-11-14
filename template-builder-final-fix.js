// COMPLETE FIX FOR TEMPLATE BUILDER
// The issue: renderTemplateBuilder() wipes the DOM without saving form values to state first
// Solution: Add a function to sync form values to state BEFORE any re-render

// NEW FUNCTION: Sync form values to state object
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

// FIXED: Update unit config (called when checkbox is toggled)
window.updateUnitConfig = (levelIndex, property, value) => {
    // FIRST: Save current form values to state
    syncFormToState();
    
    // THEN: Update the property
    state.currentTemplate.levels[levelIndex].unitConfig[property] = value;
    
    // Auto-check cumulative when grade is enabled
    if (property === 'enableGrade' && value === true) {
        state.currentTemplate.levels[levelIndex].unitConfig.gradeCumulative = true;
    }
    
    // Uncheck cumulative when grade is disabled
    if (property === 'enableGrade' && value === false) {
        state.currentTemplate.levels[levelIndex].unitConfig.gradeCumulative = false;
    }
    
    // FINALLY: Re-render with updated state
    renderTemplateBuilder();
};

// FIXED: Add level
window.addLevel = () => {
    // FIRST: Save current form values to state
    syncFormToState();
    
    // THEN: Add new level
    const newLevel = createEmptyLevel(state.currentTemplate.levels.length);
    state.currentTemplate.levels.push(newLevel);
    
    // FINALLY: Re-render
    renderTemplateBuilder();
};

// FIXED: Remove level
window.removeLevel = (index) => {
    if (state.currentTemplate.levels.length <= 1) {
        alert('Template must have at least one level');
        return;
    }
    
    if (!confirm(`Remove level "${state.currentTemplate.levels[index].name || `Level ${index + 1}`}"?`)) {
        return;
    }
    
    // FIRST: Save current form values to state
    syncFormToState();
    
    // THEN: Remove level
    state.currentTemplate.levels.splice(index, 1);
    
    // Reorder
    state.currentTemplate.levels.forEach((level, idx) => {
        level.order = idx;
    });
    
    // FINALLY: Re-render
    renderTemplateBuilder();
};

// FIXED: Move level up
window.moveLevelUp = (index) => {
    if (index === 0) return;
    
    // FIRST: Save current form values to state
    syncFormToState();
    
    // THEN: Swap
    [state.currentTemplate.levels[index - 1], state.currentTemplate.levels[index]] = 
    [state.currentTemplate.levels[index], state.currentTemplate.levels[index - 1]];
    
    // Reorder
    state.currentTemplate.levels.forEach((level, idx) => {
        level.order = idx;
    });
    
    // FINALLY: Re-render
    renderTemplateBuilder();
};

// FIXED: Move level down
window.moveLevelDown = (index) => {
    if (index === state.currentTemplate.levels.length - 1) return;
    
    // FIRST: Save current form values to state
    syncFormToState();
    
    // THEN: Swap
    [state.currentTemplate.levels[index], state.currentTemplate.levels[index + 1]] = 
    [state.currentTemplate.levels[index + 1], state.currentTemplate.levels[index]];
    
    // Reorder
    state.currentTemplate.levels.forEach((level, idx) => {
        level.order = idx;
    });
    
    // FINALLY: Re-render
    renderTemplateBuilder();
};
