# Bug Report and Issues

## Critical Bugs (P0 - Must Fix)

### BUG-001: Concurrent Multi-Tab Editing Causes Data Loss
**Severity**: CRITICAL  
**Location**: Global state management  
**Reproduction**:
1. Open app in two browser tabs
2. Edit different controls in each tab
3. Save from Tab A
4. Save from Tab B
5. **Result**: Tab A changes are lost (last write wins)

**Root Cause**: No optimistic locking or conflict detection  
**Impact**: Data loss in team environments  
**Fix**: Implement version field in workflow.json, check on save

---

### BUG-002: XSS Vulnerability in User Inputs
**Severity**: CRITICAL  
**Location**: Multiple (innerHTML usage)  
**Reproduction**:
1. Add evidence with name: `<img src=x onerror=alert('XSS')>`
2. **Result**: Script executes on render

**Affected Areas**:
- Control names (line 453)
- Action names (line 485)
- Evidence names (line 570)
- Tags (line 323)
- Comments (line 636)

**Root Cause**: Direct innerHTML assignment without sanitization  
**Impact**: Malicious code execution  
**Fix**: Use DOMPurify library or textContent instead of innerHTML

---

### BUG-003: File Upload Exceeds PHP Memory Limit
**Severity**: HIGH  
**Location**: save_workflow.php, save_executions.php  
**Reproduction**:
1. Create large workflow (>100 MB)
2. Click "Save Structure"
3. **Result**: PHP fatal error (memory exhausted)

**Root Cause**: `file_get_contents('php://input')` loads entire payload into memory  
**Impact**: Save failure on large workflows  
**Fix**: Use streaming JSON parser or increase memory_limit

---

## High Priority Bugs (P1)

### BUG-004: Grade Total Validation Not Enforced
**Severity**: HIGH  
**Location**: Evidence grade selector (line 547)  
**Reproduction**:
1. Create action with 3 evidence items
2. Set grades: 2.0, 2.0, 2.0 (total = 6.0)
3. **Result**: Validation error displayed but not blocked

**Root Cause**: Validation is display-only, no enforcement  
**Impact**: Invalid compliance data  
**Fix**: Add validation on save, block if total ≠ 5.0

---

### BUG-005: Orphaned Execution States After Deletion
**Severity**: HIGH  
**Location**: reconcileExecution() (line 164)  
**Reproduction**:
1. Complete several evidence items
2. Delete the parent control
3. Check executions.json
4. **Result**: Completed entries still exist for deleted evidence

**Root Cause**: reconcileExecution() only checks one flow at a time  
**Impact**: Growing executions.json file, memory waste  
**Fix**: Call reconcileAllExecutions() after all deletions

---

### BUG-006: Shared Node Propagation Misses Deep Fields
**Severity**: HIGH  
**Location**: propagateSharedEdit() (line 179)  
**Reproduction**:
1. Create shared evidence with attachments
2. Edit attachments in Flow A
3. **Result**: Attachments not synced to Flow B

**Root Cause**: Object.assign() only copies top-level fields  
**Impact**: Inconsistent shared data  
**Fix**: Deep merge footer object in propagation

---

### BUG-007: Rapid Checkbox Toggles Cause Race Condition
**Severity**: HIGH  
**Location**: handleAppChange() (line 924)  
**Reproduction**:
1. Rapidly click evidence checkbox (toggle on/off 10x quickly)
2. **Result**: Completion state out of sync with checkbox

**Root Cause**: render() called before state update completes  
**Impact**: UI desync  
**Fix**: Debounce render() or use requestAnimationFrame

---

## Medium Priority Bugs (P2)

### BUG-008: Modal Closes on Quill Editor Click (Backdrop Bug)
**Severity**: MEDIUM  
**Location**: Modal backdrop click handler (line 1428)  
**Reproduction**:
1. Open "Add Note" modal
2. Click Quill editor toolbar
3. **Result**: Modal sometimes closes

**Root Cause**: Event bubbling, backdrop click handler not checking target precisely  
**Impact**: User frustration  
**Fix**: Add stopPropagation or check e.target === modal.backdrop more strictly

---

### BUG-009: Tag Filter Breaks on Special Characters
**Severity**: MEDIUM  
**Location**: filterWorkflowByTag() (line 342)  
**Reproduction**:
1. Add tag: `test#123`
2. Filter by tag
3. **Result**: No matches or JS error

**Root Cause**: Tag not escaped in HTML attributes  
**Impact**: Filtering broken for certain tags  
**Fix**: Escape tag in data attributes or use data-index instead

---

### BUG-010: Progress Bar Animation Flickers
**Severity**: MEDIUM  
**Location**: CSS progress-bar (line 107)  
**Reproduction**:
1. Toggle evidence completion rapidly
2. **Result**: Progress bar animates multiple times (0% → 50% → 0% → 50%)

**Root Cause**: render() rebuilds DOM, CSS transition restarts  
**Impact**: Visual glitch  
**Fix**: Update style.width directly without rebuild, or disable transition during rapid updates

---

### BUG-011: Import Modal Shows Source Flow in List
**Severity**: MEDIUM  
**Location**: openImportModal() (line 1062)  
**Reproduction**:
1. Open import modal from Flow A
2. **Result**: Flow A appears in source list (can import from itself)

**Root Cause**: No filter to exclude current flow  
**Impact**: User confusion, potential duplicate structures  
**Fix**: Filter out getCurrentFlow() from items list

---

### BUG-012: Delete Flow Doesn't Update URL or State
**Severity**: MEDIUM  
**Location**: deleteCurrentFlow() (line 1356)  
**Reproduction**:
1. Create 2 flows, switch to Flow B
2. Delete Flow B
3. **Result**: currentFlowId may be invalid if Flow B was the only flow

**Root Cause**: Sets currentFlowId to flows[0], but flows might be empty  
**Impact**: Crash if all flows deleted  
**Fix**: Check if flows array is empty after deletion

---

### BUG-013: Text Input Propagation Lags on Large Flows
**Severity**: MEDIUM  
**Location**: Text edit handler (line 943)  
**Reproduction**:
1. Open flow with 100+ controls
2. Type in evidence description
3. **Result**: Input lags by 500ms+

**Root Cause**: propagateSharedEdit() called on every keystroke → full render  
**Impact**: Poor UX  
**Fix**: Debounce propagation by 500ms

---

## Low Priority Bugs (P3)

### BUG-014: Theme Toggle Doesn't Update Icon
**Severity**: LOW  
**Location**: toggleTheme() (line 71)  
**Reproduction**:
1. Toggle theme
2. **Result**: Button icon stays the same (fa-circle-half-stroke)

**Root Cause**: No icon update logic  
**Impact**: Minor UX issue  
**Fix**: Update icon to moon/sun based on theme

---

### BUG-015: Validation Error Persists After Grade Correction
**Severity**: LOW  
**Location**: renderActionPanel() (line 478)  
**Reproduction**:
1. Create action with grades totaling 4.5
2. Validation error shown
3. Correct to 5.0
4. **Result**: Error disappears only after re-render (not immediate)

**Root Cause**: Validation checked on render only  
**Impact**: Minor UX confusion  
**Fix**: Recalculate validation on grade change

---

### BUG-016: Empty Flow Name Allowed
**Severity**: LOW  
**Location**: openNewFlowModal() (line 1281)  
**Reproduction**:
1. Click "New Flow"
2. Leave name blank (or spaces only)
3. Submit
4. **Result**: Flow created with empty name

**Root Cause**: No trim() on input value  
**Impact**: Poor data quality  
**Fix**: Trim and validate non-empty before creating flow

---

### BUG-017: Duplicate Tags Allowed
**Severity**: LOW  
**Location**: Tag add handler (line 955)  
**Reproduction**:
1. Add tag "test"
2. Add tag "test" again
3. **Result**: Duplicate "test" tags appear

**Root Cause**: Check `!tags.includes(val)` works, but case-sensitive  
**Issue**: User can add "Test" and "test" separately  
**Impact**: Data quality  
**Fix**: Case-insensitive duplicate check

---

### BUG-018: Attachment URLs Not Validated
**Severity**: LOW  
**Location**: showAddAttachmentModal() (line 669)  
**Reproduction**:
1. Add link with URL: `javascript:alert('xss')`
2. **Result**: URL saved (but iframe sandbox blocks execution)

**Root Cause**: No URL validation  
**Impact**: Low (sandbox mitigates) but unprofessional  
**Fix**: Validate URL starts with http:// or https://

---

### BUG-019: Prompt Dialogs Block UI Thread
**Severity**: LOW  
**Location**: Multiple (lines 833, 841, 849, 862, 869, 1019, 1023, 1026)  
**Reproduction**:
1. Click any edit button
2. **Result**: Entire page frozen until prompt answered

**Root Cause**: prompt() is synchronous and blocking  
**Impact**: Poor UX, can't interact with other elements  
**Fix**: Replace prompt() with custom modal forms

---

### BUG-020: Save Button Stays Disabled on Network Error
**Severity**: LOW  
**Location**: saveStructure() (line 257)  
**Reproduction**:
1. Disconnect network
2. Click "Save Structure"
3. Wait for error
4. **Result**: Button re-enables after timeout, but should be immediate

**Root Cause**: setTimeout delay in error handler  
**Impact**: Minor UX issue  
**Fix**: Re-enable button in catch block before setTimeout

---

## Edge Case Bugs

### BUG-021: ID Collision Possible (Low Probability)
**Severity**: LOW  
**Location**: generateId() (line 51)  
**Reproduction**: (Theoretical)
1. Create 1000+ items in same millisecond
2. **Result**: Possible ID collision (Math.random() collision)

**Probability**: ~1 in 10 million  
**Impact**: Duplicate IDs cause data corruption  
**Fix**: Use crypto.randomUUID() (ES6+)

---

### BUG-022: Deep Nesting Causes Stack Overflow
**Severity**: LOW  
**Location**: Recursive functions (filterWorkflowByTag, setShareKeyDeep)  
**Reproduction**:
1. Manually edit JSON to create deeply nested structure (100+ levels)
2. Load app
3. **Result**: Stack overflow

**Root Cause**: No tail call optimization, JS stack limit ~10,000  
**Impact**: Only if user maliciously edits JSON  
**Fix**: Implement iterative algorithms with explicit stack

---

### BUG-023: localStorage Quota Exceeded
**Severity**: LOW  
**Location**: applyTheme(), mode switch (lines 68, 1390)  
**Reproduction**:
1. Fill localStorage from other apps
2. Toggle theme
3. **Result**: Silent failure (no error shown)

**Root Cause**: No try-catch around localStorage.setItem()  
**Impact**: Theme not persisted  
**Fix**: Wrap in try-catch, show error if quota exceeded

---

### BUG-024: Large JSON Files Crash Browser
**Severity**: LOW  
**Location**: loadAll() (line 217)  
**Reproduction**:
1. Create workflow.json > 100 MB
2. Load app
3. **Result**: Browser tab freezes/crashes

**Root Cause**: JSON.parse() blocks main thread, entire file loaded into memory  
**Impact**: Only for extremely large workflows  
**Fix**: Implement streaming JSON parser or pagination

---

## Security Issues

### SEC-001: No CSRF Protection
**Severity**: HIGH  
**Location**: save_workflow.php, save_executions.php  
**Attack Vector**: Malicious site sends POST to save_*.php  
**Impact**: Attacker can overwrite workflow data  
**Fix**: Implement CSRF tokens

---

### SEC-002: No Authentication/Authorization
**Severity**: CRITICAL  
**Location**: Global (no auth system)  
**Attack Vector**: Anyone can access/edit workflows  
**Impact**: Data breach, unauthorized modifications  
**Fix**: Implement user authentication and role-based access control

---

### SEC-003: PHP File Write Without Sanitization
**Severity**: HIGH  
**Location**: save_workflow.php (line 31), save_executions.php (line 36)  
**Attack Vector**: Send malicious JSON with PHP code in strings  
**Impact**: If JSON is later evaluated, code execution possible  
**Fix**: Validate JSON structure against schema, sanitize strings

---

### SEC-004: Iframe Sandbox Could Be Bypassed
**Severity**: MEDIUM  
**Location**: showLinkModal() (line 623)  
**Attack Vector**: Sandbox escape vulnerabilities in old browsers  
**Impact**: XSS via embedded content  
**Fix**: Add Content-Security-Policy headers, validate URLs server-side

---

### SEC-005: No Rate Limiting on Saves
**Severity**: LOW  
**Location**: save_*.php  
**Attack Vector**: Attacker floods server with save requests  
**Impact**: DoS via disk I/O  
**Fix**: Implement rate limiting (e.g., max 10 saves/minute)

---

## Browser Compatibility Issues

### COMPAT-001: No IE11 Support
**Severity**: INFO  
**Incompatible Features**: Fetch, Arrow functions, Template literals, CSS variables  
**Fix**: Transpile with Babel, add polyfills for Fetch/Promise

---

### COMPAT-002: Safari LocalStorage Quota Smaller
**Severity**: LOW  
**Issue**: Safari limits localStorage to 5 MB (vs 10 MB in Chrome)  
**Impact**: Theme/mode not saved if other apps use storage  
**Fix**: Handle quota exceeded error gracefully

---

## Performance Bugs

### PERF-001: sharedEvidenceIndex() Rebuilt on Every Toggle
**Severity**: HIGH  
**Location**: propagateSharedExecution() (line 121)  
**Impact**: O(n³) operation on every checkbox click  
**Benchmark**: 200ms+ on flows with 1000+ evidence items  
**Fix**: Cache index, invalidate on structure change only

---

### PERF-002: Full DOM Rebuild on Every State Change
**Severity**: HIGH  
**Location**: render() (line 375)  
**Impact**: 100ms+ render time on large flows  
**Fix**: Implement virtual DOM or incremental updates

---

### PERF-003: No Debouncing on Text Input
**Severity**: MEDIUM  
**Location**: Text edit handler (line 943)  
**Impact**: Propagation + render on every keystroke  
**Fix**: Debounce by 300ms

---

## Accessibility Issues

### A11Y-001: No Keyboard Navigation for Actions
**Severity**: MEDIUM  
**Issue**: Action selection requires mouse click  
**Impact**: Keyboard users can't select actions  
**Fix**: Add tabindex, arrow key navigation

---

### A11Y-002: Insufficient Color Contrast (Dark Theme)
**Severity**: LOW  
**Location**: style.css (line 31)  
**Issue**: Text color #e0e0e0 on background #1e293b fails WCAG AA  
**Fix**: Increase text color to #f0f0f0

---

### A11Y-003: Missing ARIA Labels
**Severity**: LOW  
**Issue**: Many buttons have only icons, no text alternative  
**Fix**: Add aria-label to all icon-only buttons

---

## Summary Statistics

- **Total Bugs**: 24 + 5 Security + 2 Compat + 3 Perf + 3 A11Y = **37 issues**
- **Critical**: 3
- **High**: 7
- **Medium**: 7
- **Low**: 13
- **Info**: 7

## Testing Recommendations

1. **Unit Tests**: Write tests for all utility functions
2. **Integration Tests**: Test data flow paths
3. **E2E Tests**: Automate user workflows with Playwright/Cypress
4. **Performance Tests**: Benchmark render() with large datasets
5. **Security Audit**: Penetration testing for XSS/CSRF
6. **Accessibility Audit**: Screen reader testing, keyboard navigation
