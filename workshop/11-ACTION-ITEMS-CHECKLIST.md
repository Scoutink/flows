# Action Items Checklist

## 📋 Immediate Actions (Week 1)

### Security Hotfixes - CRITICAL 🔴
**Estimated Time**: 44 hours  
**Priority**: P0 - Must complete before any other work

- [ ] **Install DOMPurify Library** (4 hours)
  - [ ] Add DOMPurify via npm or CDN
  - [ ] Test installation
  - [ ] Create sanitize helper function
  
- [ ] **Fix XSS Vulnerabilities** (12 hours)
  - [ ] Audit all innerHTML usages (20+ locations)
  - [ ] Replace with DOMPurify.sanitize()
  - [ ] Test all affected areas
  - [ ] Locations to fix:
    - [ ] Line 453: Control names
    - [ ] Line 485: Action names
    - [ ] Line 570: Evidence names
    - [ ] Line 323: Tags
    - [ ] Line 636: Comments
    - [ ] Modal title/body content
    - [ ] All user-generated content

- [ ] **Implement Basic Authentication** (16 hours)
  - [ ] Design authentication flow
  - [ ] Create login page/modal
  - [ ] Implement JWT token generation (server-side)
  - [ ] Add token storage (localStorage)
  - [ ] Add token validation middleware
  - [ ] Protect all API endpoints
  - [ ] Add logout functionality
  - [ ] Test authentication flow

- [ ] **Add Input Validation** (8 hours)
  - [ ] PHP: Validate JSON structure
  - [ ] PHP: Check file size limits
  - [ ] PHP: Sanitize all inputs
  - [ ] JS: Validate node names (length, special chars)
  - [ ] JS: Validate grade values (0.5-5.0)
  - [ ] JS: Validate URLs (format, protocol)
  - [ ] Test all validation

- [ ] **Add JSDoc Documentation** (16 hours)
  - [ ] Document top 20 critical functions
  - [ ] Add @param, @returns, @throws tags
  - [ ] Add usage examples
  - [ ] Generate HTML documentation (optional)

**Total Week 1**: 44 hours

---

## 📦 Month 1: Stabilization

### Code Quality - HIGH PRIORITY 🟠
**Estimated Time**: 120 hours

- [ ] **Set Up Development Environment** (8 hours)
  - [ ] Initialize npm project
  - [ ] Add package.json with dependencies
  - [ ] Set up ESLint configuration
  - [ ] Set up Prettier configuration
  - [ ] Add .gitignore
  - [ ] Configure Vite build tool
  - [ ] Set up development server

- [ ] **Set Up Testing Framework** (12 hours)
  - [ ] Install Jest
  - [ ] Install @testing-library/dom
  - [ ] Configure Jest (jest.config.js)
  - [ ] Create tests/ folder structure
  - [ ] Write first sample test
  - [ ] Set up test coverage reporting
  - [ ] Add test scripts to package.json

- [ ] **Split Monolithic File** (20 hours)
  - [ ] Create src/ folder structure
  - [ ] Extract utility functions → utils/
  - [ ] Extract state management → state/
  - [ ] Extract rendering → rendering/
  - [ ] Extract event handlers → events/
  - [ ] Extract modals → modals/
  - [ ] Extract API calls → api/
  - [ ] Update imports/exports
  - [ ] Test everything still works

- [ ] **Write Unit Tests** (40 hours)
  - [ ] Utility functions (16 hours)
    - [ ] generateId()
    - [ ] getAbsoluteUrl()
    - [ ] getObjectByPath()
    - [ ] getParentAndKey()
    - [ ] ensureTagsArray()
    - [ ] nodeHasTag()
  - [ ] State management (16 hours)
    - [ ] setCompleted()
    - [ ] getCompleted()
    - [ ] ensureExecFlow()
    - [ ] propagateSharedEdit()
    - [ ] propagateSharedDelete()
  - [ ] Calculation functions (8 hours)
    - [ ] calculateActionProgress()
    - [ ] calculateControlProgress()
    - [ ] updateAllExecutionStates()
  - [ ] Target: 50% code coverage

- [ ] **Cache Shared Index** (4 hours)
  - [ ] Implement _sharedIndexCache variable
  - [ ] Create invalidateSharedIndex() function
  - [ ] Update sharedEvidenceIndex() to use cache
  - [ ] Add invalidation calls after structure changes
  - [ ] Test performance improvement
  - [ ] Benchmark: Should be 80% faster

- [ ] **Debounce Text Inputs** (4 hours)
  - [ ] Implement debounce utility function
  - [ ] Apply to text edit handler
  - [ ] Apply to tag add handler
  - [ ] Test typing experience
  - [ ] Verify propagation still works

- [ ] **Add Error Logging** (8 hours)
  - [ ] Choose logging service (Sentry recommended)
  - [ ] Integrate logging library
  - [ ] Add error boundaries
  - [ ] Log all caught errors
  - [ ] Add user context to errors
  - [ ] Test error reporting

- [ ] **Implement Optimistic Locking** (4 hours)
  - [ ] Add version field to workflow.json
  - [ ] Increment version on each save
  - [ ] Check version before saving
  - [ ] Handle conflicts with user prompt
  - [ ] Test multi-tab conflict scenario

- [ ] **Add CSRF Protection** (8 hours)
  - [ ] Generate CSRF tokens (server-side)
  - [ ] Include token in all POST requests
  - [ ] Validate tokens on server
  - [ ] Handle token expiration
  - [ ] Test protection

- [ ] **Fix High Priority Bugs** (12 hours)
  - [ ] BUG-004: Enforce grade total validation
  - [ ] BUG-005: Fix orphaned execution states
  - [ ] BUG-006: Deep copy footer in shared propagation
  - [ ] BUG-007: Debounce checkbox toggles

**Total Month 1**: 120 hours (beyond Week 1)

---

## 📅 Month 2-3: Essential Features

### Core Functionality - HIGH PRIORITY 🟠
**Estimated Time**: 160 hours

- [ ] **Global Search** (24 hours)
  - [ ] Design search UI (header search bar)
  - [ ] Implement search function
    - [ ] Search by name
    - [ ] Search by text/description
    - [ ] Search by tags
    - [ ] Search by completion status
  - [ ] Build results panel with highlighting
  - [ ] Add keyboard shortcut (Ctrl+F)
  - [ ] Add jump-to functionality
  - [ ] Test with large datasets
  - [ ] Add search filters

- [ ] **Export Functionality** (32 hours)
  - [ ] Excel export (16 hours)
    - [ ] Install SheetJS library
    - [ ] Implement hierarchical export
    - [ ] Format cells (headers, colors)
    - [ ] Add progress/completion columns
    - [ ] Test with large workflows
  - [ ] PDF export (16 hours)
    - [ ] Install jsPDF library
    - [ ] Design PDF layout
    - [ ] Add cover page with summary
    - [ ] Include progress charts
    - [ ] Add page numbers
    - [ ] Test printing

- [ ] **Bulk Import** (32 hours)
  - [ ] Design import UI (file upload)
  - [ ] Implement Excel parser
  - [ ] Build column mapping interface
  - [ ] Add data validation
    - [ ] Grade totals = 5.0
    - [ ] Required fields present
    - [ ] No orphan evidence
  - [ ] Build import preview
  - [ ] Implement import modes
    - [ ] New flow
    - [ ] Merge into existing
    - [ ] Replace existing
  - [ ] Show import summary
  - [ ] Handle errors gracefully
  - [ ] Test with various Excel formats

- [ ] **Undo/Redo System** (40 hours)
  - [ ] Design command pattern
  - [ ] Implement Command classes
    - [ ] AddNodeCommand
    - [ ] EditNodeCommand
    - [ ] DeleteNodeCommand
    - [ ] ToggleCompleteCommand
    - [ ] AddTagCommand
  - [ ] Implement CommandHistory manager
  - [ ] Add undo() and redo() methods
  - [ ] Add keyboard shortcuts (Ctrl+Z, Ctrl+Y)
  - [ ] Add undo/redo buttons to UI
  - [ ] Show last action in tooltip
  - [ ] Test complex undo/redo scenarios
  - [ ] Set history limit (default: 50 actions)

- [ ] **Audit Log** (24 hours)
  - [ ] Design audit log schema
  - [ ] Create audit_log table/file
  - [ ] Implement logAction() function
  - [ ] Add logging to all mutations
    - [ ] CRUD operations
    - [ ] Toggle completion
    - [ ] Add/edit/delete attachments
    - [ ] Grade changes
    - [ ] Tag operations
  - [ ] Build audit log viewer (admin only)
  - [ ] Add filters (user, date, action type)
  - [ ] Add export audit log to CSV
  - [ ] Test logging performance

- [ ] **Auto-Save** (8 hours)
  - [ ] Implement auto-save with debounce
  - [ ] Set auto-save interval (10 seconds)
  - [ ] Add visual indicator (saving...)
  - [ ] Handle save conflicts
  - [ ] Add manual save override
  - [ ] Test with rapid changes

**Total Months 2-3**: 160 hours

---

## 🏗️ Month 4-6: Architecture Refactor

### Modern Architecture - SHOULD HAVE 🟡
**Estimated Time**: 320 hours

- [ ] **Choose Framework** (8 hours)
  - [ ] Evaluate React vs Vue vs Svelte
  - [ ] Consider bundle size
  - [ ] Consider learning curve
  - [ ] Consider ecosystem
  - [ ] Make decision (Recommendation: Svelte or React)
  - [ ] Get team buy-in

- [ ] **Set Up Framework Project** (16 hours)
  - [ ] Initialize new project
  - [ ] Configure build system (Vite)
  - [ ] Set up routing (if needed)
  - [ ] Configure state management
  - [ ] Set up TypeScript
  - [ ] Configure linting/formatting
  - [ ] Set up development environment

- [ ] **Migrate Data Models** (24 hours)
  - [ ] Define TypeScript interfaces
  - [ ] Create Workflow model
  - [ ] Create Flow model
  - [ ] Create Control model
  - [ ] Create Action model
  - [ ] Create Evidence model
  - [ ] Create Execution model
  - [ ] Add validation schemas (Zod or similar)

- [ ] **Migrate State Management** (32 hours)
  - [ ] Set up Redux/Zustand/Pinia
  - [ ] Create state slices
    - [ ] Workflow slice
    - [ ] Execution slice
    - [ ] UI slice (theme, mode, etc.)
  - [ ] Implement actions/reducers
  - [ ] Add selectors
  - [ ] Migrate existing state logic
  - [ ] Test state mutations

- [ ] **Migrate Components** (120 hours)
  - [ ] Header component (16 hours)
  - [ ] Flow selector component (8 hours)
  - [ ] Control component (24 hours)
  - [ ] Action panel component (24 hours)
  - [ ] Evidence panel component (32 hours)
  - [ ] Modal components (16 hours)
    - [ ] Import modal
    - [ ] Distribution modal
    - [ ] Filter modal
    - [ ] Attachment modals
  - [ ] Tag component (8 hours)
  - [ ] Progress bar component (8 hours)

- [ ] **Migrate Event Handlers** (24 hours)
  - [ ] Click handlers
  - [ ] Change handlers
  - [ ] Input handlers
  - [ ] Form handlers
  - [ ] Keyboard handlers

- [ ] **Migrate API Layer** (16 hours)
  - [ ] Create API client
  - [ ] Implement loadWorkflow()
  - [ ] Implement saveWorkflow()
  - [ ] Implement loadExecution()
  - [ ] Implement saveExecution()
  - [ ] Add error handling
  - [ ] Add retry logic

- [ ] **Set Up Database** (40 hours)
  - [ ] Choose database (PostgreSQL recommended)
  - [ ] Design schema
  - [ ] Create migrations
  - [ ] Set up connection pool
  - [ ] Implement data access layer
  - [ ] Migrate data from JSON to database
  - [ ] Test database operations

- [ ] **Build REST API** (40 hours)
  - [ ] Set up Node.js + Express
  - [ ] Implement authentication middleware
  - [ ] Implement routes
    - [ ] GET /api/flows
    - [ ] POST /api/flows
    - [ ] GET /api/flows/:id
    - [ ] PATCH /api/flows/:id
    - [ ] DELETE /api/flows/:id
    - [ ] GET /api/flows/:id/controls
    - [ ] POST /api/executions
  - [ ] Add validation
  - [ ] Add error handling
  - [ ] Write API tests

**Total Months 4-6**: 320 hours

---

## 🚀 Month 7-9: Advanced Features

### Nice to Have - LOWER PRIORITY 🟢
**Estimated Time**: 200+ hours

- [ ] **Reporting Dashboard** (32 hours)
  - [ ] Design dashboard layout
  - [ ] Implement Chart.js integration
  - [ ] Build completion chart (donut)
  - [ ] Build flow progress chart (bar)
  - [ ] Build timeline chart (line)
  - [ ] Build tags cloud
  - [ ] Add export dashboard to PDF
  - [ ] Add email scheduling (optional)

- [ ] **Templates System** (24 hours)
  - [ ] Design template schema
  - [ ] Implement saveAsTemplate()
  - [ ] Implement createFromTemplate()
  - [ ] Build template library UI
  - [ ] Add template variables
  - [ ] Add template categories/tags
  - [ ] Add template sharing

- [ ] **Mobile Optimization** (48 hours)
  - [ ] Make UI responsive
  - [ ] Add mobile-specific gestures
  - [ ] Optimize for touch targets
  - [ ] Add bottom navigation
  - [ ] Implement PWA
    - [ ] Add manifest.json
    - [ ] Add service worker
    - [ ] Add offline support
  - [ ] Test on various devices

- [ ] **Real-Time Collaboration** (96+ hours)
  - [ ] Set up WebSocket server
  - [ ] Implement Socket.io
  - [ ] Add presence detection
  - [ ] Add conflict resolution
  - [ ] Show live cursors (optional)
  - [ ] Add collaborative editing
  - [ ] Test with multiple users

**Total Months 7-9**: 200+ hours

---

## ✅ Completion Criteria

### Week 1 Complete When:
- [ ] All XSS vulnerabilities fixed
- [ ] Basic authentication working
- [ ] Input validation added
- [ ] Top functions documented
- [ ] No critical security issues remain

### Month 1 Complete When:
- [ ] Code split into modules
- [ ] Test coverage ≥ 50%
- [ ] Shared index cached
- [ ] Text inputs debounced
- [ ] Error logging active
- [ ] High priority bugs fixed

### Months 2-3 Complete When:
- [ ] Search working across all flows
- [ ] Export to Excel/PDF working
- [ ] Import from Excel working
- [ ] Undo/redo functional
- [ ] Audit log recording all changes
- [ ] Auto-save implemented

### Months 4-6 Complete When:
- [ ] Migrated to modern framework
- [ ] Database operational
- [ ] REST API functional
- [ ] State management refactored
- [ ] Test coverage ≥ 80%
- [ ] Performance targets met

---

## 📊 Progress Tracking

### Use this template to track progress:

```markdown
## Week [X] Progress Report

**Date**: [Start] to [End]
**Hours Worked**: [X] / [Planned]
**Items Completed**: [X] / [Total]

### Completed Items:
- [x] Item 1
- [x] Item 2

### In Progress:
- [ ] Item 3 (50% complete)

### Blocked:
- [ ] Item 4 (Waiting for: [reason])

### Next Week Focus:
1. Priority item 1
2. Priority item 2

### Challenges:
- Challenge 1
- Challenge 2

### Wins:
- Win 1
- Win 2
```

---

## 🎯 Key Milestones

- [ ] **Milestone 1**: Security Patched (Week 1)
- [ ] **Milestone 2**: Code Stabilized (Month 1)
- [ ] **Milestone 3**: Essential Features Complete (Month 3)
- [ ] **Milestone 4**: Modern Architecture (Month 6)
- [ ] **Milestone 5**: Production Ready (Month 9)

---

## 📝 Notes

- Update this checklist as you complete items
- Mark blocked items and note reasons
- Add new items as they're discovered
- Review weekly with team
- Celebrate milestones! 🎉

**Last Updated**: October 28, 2025
