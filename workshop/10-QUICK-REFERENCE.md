# Quick Reference Guide

## 🔍 Finding Things Fast

### Common Questions & Where to Look

| Question | Document | Page/Section |
|----------|----------|--------------|
| How does the app work? | 01-ARCHITECTURE-OVERVIEW.md | Application Layers |
| Where is function X? | 02-FUNCTION-MAPPING.md | Function Inventory |
| Why is it slow? | 05-OPTIMIZATION-RECOMMENDATIONS.md | Performance Hotspots |
| What bugs exist? | 04-BUG-REPORT.md | Complete bug list |
| What features are missing? | 06-ENHANCEMENT-PROPOSALS.md | Priority Matrix |
| How much will it cost? | 08-EXECUTIVE-SUMMARY.md | Investment Required |
| How is data stored? | 03-DATA-FLOW-ANALYSIS.md | Data Model |
| Is the code good? | 07-CODE-QUALITY-ANALYSIS.md | Quality Score |

---

## 🏗️ Architecture at a Glance

```
USER BROWSER
    ↓
JavaScript SPA (1,433 lines)
    ↓
PHP Backend (80 lines)
    ↓
JSON Files (workflow.json + executions.json)
```

**Key Pattern**: Client-heavy MVC with file-based persistence

---

## 📊 Critical Numbers

### Codebase
- **3,200 total lines** (JS: 1,433, CSS: 215, HTML: 132, PHP: 80)
- **48 functions** documented
- **0 tests** (major gap)
- **6.5/10 quality score**

### Performance
- **O(n³)** worst-case complexity (shared index)
- **100-200ms** render time for 100 controls
- **0% caching** (everything recalculated)

### Bugs
- **37 total issues** identified
- **3 critical** (XSS, no auth, data loss)
- **7 high priority**
- **27 medium/low priority**

### Investment
- **$64k-$88k** minimum (Phases 1-3)
- **4-5 months** to MVP
- **6-9 months** to production-ready

---

## 🔴 Critical Issues (Fix Immediately)

### Security
```javascript
// VULNERABLE
el.innerHTML = `<div>${user_input}</div>`; // XSS risk

// FIX
import DOMPurify from 'dompurify';
el.innerHTML = DOMPurify.sanitize(`<div>${user_input}</div>`);
```

### Authentication
```javascript
// MISSING - Add this
const requireAuth = (req, res, next) => {
    const token = req.headers.authorization;
    if (!token) return res.status(401).json({ error: 'Unauthorized' });
    // Verify JWT token
    next();
};

app.post('/api/workflows', requireAuth, saveWorkflow);
```

### Data Loss
```javascript
// PROBLEM: Last write wins
await saveWorkflow(data);

// FIX: Optimistic locking
const saveWorkflow = async (data) => {
    const current = await loadWorkflow();
    if (current.version !== data.version) {
        throw new Error('Conflict: Data was modified by another user');
    }
    data.version++;
    await writeWorkflow(data);
};
```

---

## ⚡ Performance Quick Wins

### 1. Cache Shared Index (20 min implementation)
```javascript
let _sharedIndexCache = null;

const invalidateSharedIndex = () => {
    _sharedIndexCache = null;
};

const sharedEvidenceIndex = () => {
    if (_sharedIndexCache) return _sharedIndexCache;
    // ... build index ...
    _sharedIndexCache = map;
    return map;
};

// Call invalidateSharedIndex() after structure changes
```

### 2. Debounce Text Input (15 min implementation)
```javascript
let textEditTimeout = null;

document.addEventListener('input', (e) => {
    const ta = e.target.closest('textarea[data-action="edit-text"]');
    if (!ta) return;
    
    clearTimeout(textEditTimeout);
    textEditTimeout = setTimeout(() => {
        propagateSharedEdit(node, lvl);
        render();
    }, 500);
});
```

### 3. Use requestAnimationFrame (10 min implementation)
```javascript
let renderScheduled = false;

const scheduleRender = () => {
    if (renderScheduled) return;
    renderScheduled = true;
    requestAnimationFrame(() => {
        render();
        renderScheduled = false;
    });
};

// Replace all render() calls with scheduleRender()
```

**Total time**: 45 minutes  
**Performance gain**: 70-80% faster

---

## 🎯 Function Cheat Sheet

### Most Important Functions

| Function | Line | Purpose | Called By |
|----------|------|---------|-----------|
| `render()` | 375 | Rebuild entire UI | Almost everything |
| `handleAppClick()` | 800 | Route user clicks | Document click event |
| `loadAll()` | 217 | Load data from server | DOMContentLoaded |
| `saveStructure()` | 257 | Save workflow to server | Save button |
| `getCurrentFlow()` | 74 | Get active flow | 40+ call sites |
| `getObjectByPath()` | 76 | Navigate to node | 40+ call sites |
| `propagateSharedEdit()` | 179 | Sync across flows | Edit handlers |
| `sharedEvidenceIndex()` | 104 | Build sharing map | Propagation |
| `filterWorkflowByTag()` | 342 | Apply tag filter | render() |
| `updateAllExecutionStates()` | 596 | Calculate locks | Many places |

### Performance Bottlenecks

| Function | Complexity | Fix Priority |
|----------|------------|--------------|
| `sharedEvidenceIndex()` | O(n³) | 🔴 Critical |
| `render()` | O(n) | 🔴 Critical |
| `filterWorkflowByTag()` | O(n³) | 🟠 High |
| `propagateSharedEdit()` | O(n²) | 🟠 High |

---

## 📁 File Locations

### Current Structure
```
/workspace/
├── index.html           # Main HTML (132 lines)
├── script.js            # All JavaScript (1,433 lines) ← MONOLITH
├── style.css            # All styles (215 lines)
├── save_workflow.php    # Structure save endpoint (40 lines)
├── save_executions.php  # Execution save endpoint (40 lines)
├── workflow.json        # Structure data (large, ~220KB)
└── executions.json      # Execution state (~5KB)
```

### Recommended Structure (after refactoring)
```
src/
├── utils/           # Helper functions
├── state/           # State management
├── rendering/       # Render functions
├── events/          # Event handlers
├── modals/          # Modal dialogs
├── api/             # Server communication
└── styles/          # CSS files
```

---

## 🐛 Bug Priority Quick Reference

### Fix Today (Critical)
1. **BUG-001**: Concurrent multi-tab editing causes data loss
2. **BUG-002**: XSS vulnerability in user inputs
3. **SEC-002**: No authentication/authorization

### Fix This Week (High Priority)
4. **BUG-004**: Grade total validation not enforced
5. **BUG-005**: Orphaned execution states after deletion
6. **BUG-006**: Shared node propagation misses deep fields
7. **BUG-007**: Rapid checkbox toggles cause race condition
8. **PERF-001**: sharedEvidenceIndex() rebuilt on every toggle
9. **PERF-002**: Full DOM rebuild on every state change
10. **SEC-001**: No CSRF protection

### Fix This Month (Medium Priority)
- BUG-008 to BUG-013 (see bug report)
- PERF-003: No debouncing on text input
- A11Y issues

---

## 🚀 Implementation Priorities

### Week 1: Security Hotfixes (44 hours)
```bash
# 1. Add DOMPurify (4 hours)
npm install dompurify
# Replace all innerHTML with DOMPurify.sanitize()

# 2. Basic Auth (16 hours)
# Implement JWT-based authentication
# Add login page, token management

# 3. Input Validation (8 hours)
# Add validation to all PHP endpoints
# Validate JSON schema

# 4. Documentation (16 hours)
# Add JSDoc comments to critical functions
```

### Week 2-4: Stabilization (76 hours)
- Split into modules (20 hours)
- Set up Jest testing (12 hours)
- Write unit tests for utilities (24 hours)
- Cache shared index (4 hours)
- Debounce text inputs (4 hours)
- Add error logging (8 hours)
- Implement optimistic locking (4 hours)

### Month 2-3: Essential Features (160 hours)
- Global search (24 hours)
- Export to Excel/PDF (32 hours)
- Bulk import from Excel (32 hours)
- Undo/redo system (40 hours)
- Audit log (24 hours)
- Auto-save (8 hours)

---

## 📖 Code Patterns

### Adding a New Node
```javascript
// 1. Create node object
const newNode = {
    id: generateId('evi'),
    name: 'Node Name',
    text: '',
    tags: [],
    // ... other fields
};

// 2. Add to parent
parent.subcategories = parent.subcategories || [];
parent.subcategories.push(newNode);

// 3. Optional: Distribute to other flows
openDistributeNewNodeModal({ node: newNode, level: 'evidence', flow });

// 4. Reconcile execution state
reconcileExecution(appState.currentFlowId);

// 5. Re-render
render();
```

### Editing a Shared Node
```javascript
// 1. Get node by path
const node = getObjectByPath(path, getCurrentFlow());

// 2. Modify property
node.name = newValue;

// 3. Propagate to shared instances
if (node.shareKey) {
    propagateSharedEdit(node, level); // level: 'control'|'action'|'evidence'
}

// 4. Re-render
render();
```

### Toggling Completion
```javascript
// 1. Update execution state
setCompleted(flowId, evidenceId, checked);

// 2. Propagate if shared
if (node.shareKey) {
    propagateSharedExecution(node.shareKey, checked);
}

// 3. Update lock states
updateAllExecutionStates(getCurrentFlow());

// 4. Re-render
render();
```

---

## 🔧 Testing Quick Start

### Setup
```bash
npm install --save-dev jest @testing-library/dom
```

### Example Test
```javascript
// tests/utils/id-generator.test.js
import { generateId } from '../../src/utils/id-generator';

describe('generateId', () => {
    it('should generate ID with correct prefix', () => {
        const id = generateId('test');
        expect(id).toMatch(/^test-\d+-[a-z0-9]{5}$/);
    });
    
    it('should generate unique IDs', () => {
        const id1 = generateId('test');
        const id2 = generateId('test');
        expect(id1).not.toBe(id2);
    });
});
```

### Run Tests
```bash
npm test
```

---

## 📈 Success Metrics

### Performance Targets
- **First Contentful Paint**: < 1.0s
- **Time to Interactive**: < 2.0s
- **Render Time**: < 50ms for 50 controls
- **Save Duration**: < 500ms
- **Memory Usage**: < 100 MB for typical workflow

### Quality Targets
- **Test Coverage**: > 80%
- **Code Complexity**: Average < 10
- **Bug Density**: < 1 bug per 1000 LOC
- **Lighthouse Score**: > 90

### Business Targets
- **User Adoption**: Track active users
- **Task Completion Rate**: % of evidence completed
- **Time to Compliance**: Days to achieve compliance
- **User Satisfaction**: NPS score > 50

---

## 🆘 Troubleshooting

### Application Won't Load
1. Check browser console for errors
2. Verify workflow.json exists and is valid JSON
3. Check PHP error logs
4. Verify web server is running
5. Clear browser cache and localStorage

### Performance is Slow
1. Check number of controls (target: < 50)
2. Open DevTools Performance tab
3. Look for long render() calls
4. Check for memory leaks (Quill instances)
5. Verify browser is up to date

### Data Not Saving
1. Check browser console for fetch errors
2. Verify PHP files have write permissions
3. Check PHP error logs
4. Verify JSON is valid (use validator)
5. Check disk space on server

### Modal Won't Close
1. Check for JavaScript errors in console
2. Verify modal backdrop click handler is working
3. Try pressing ESC key (if implemented)
4. Reload page as last resort

---

## 💡 Tips & Best Practices

### Before Making Changes
1. ✅ Read relevant workshop document
2. ✅ Locate function in function mapping
3. ✅ Check for related bugs in bug report
4. ✅ Write test first (TDD)
5. ✅ Make small, incremental changes

### When Adding Features
1. ✅ Check if already proposed in enhancements
2. ✅ Consider impact on performance
3. ✅ Add to both creation and execution modes if applicable
4. ✅ Document with JSDoc comments
5. ✅ Add unit tests

### When Fixing Bugs
1. ✅ Write failing test that reproduces bug
2. ✅ Fix bug (test should pass)
3. ✅ Check for similar bugs elsewhere
4. ✅ Update bug report with "FIXED" status
5. ✅ Add regression test

### Before Committing
1. ✅ Run linter (ESLint)
2. ✅ Run tests (Jest)
3. ✅ Check for console errors
4. ✅ Test in both light and dark themes
5. ✅ Test in both creation and execution modes

---

## 🔗 External Resources

### Libraries Used
- **Quill.js** (v1.3.6): https://quilljs.com/
- **Font Awesome** (v6.4.0): https://fontawesome.com/

### Recommended Reading
- **JavaScript Design Patterns**: https://addyosmani.com/resources/essentialjsdesignpatterns/
- **Web Performance**: https://web.dev/performance/
- **Security Best Practices**: https://owasp.org/www-project-top-ten/

### Tools to Install
- **DOMPurify**: XSS sanitization
- **Jest**: Testing framework
- **ESLint**: Code linting
- **Prettier**: Code formatting
- **Vite**: Modern build tool

---

## 📞 Getting Help

### Before Asking for Help
1. Check this Quick Reference
2. Review relevant workshop document
3. Search function mapping for code location
4. Check bug report for known issues
5. Read code comments (if any)

### When Reporting Issues
Include:
- Browser and version
- Steps to reproduce
- Expected vs actual behavior
- Console errors (screenshot)
- Relevant code snippet

---

**Last Updated**: October 28, 2025  
**Workshop Version**: 1.0  
**Maintainer**: Development Team
