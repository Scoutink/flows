# 🔍 Mobile Scrolling Issue - Forensic Analysis

## Issue Report
**User Report**: 
- Boards: Can only see backlog column, rest hidden
- Workflow: Can only see actions panel, evidence hidden

**Root Cause**: Vertical scrolling BLOCKED by CSS overflow constraints

---

## CRITICAL FINDINGS

### 1. BOARDS SYSTEM (ppm-style.css)

**Lines 301-306** (DESKTOP CSS):
```css
.board-container {
    padding: 2rem;
    height: calc(100vh - 80px);    ← FIXED VIEWPORT HEIGHT
    overflow-x: auto;               ← Horizontal scroll only
    overflow-y: hidden;             ← BLOCKS VERTICAL SCROLL
}
```

**Lines 888-893** (MY MOBILE CSS):
```css
.board-columns {
    flex-direction: column;         ← Stack vertically
    overflow-x: visible;
    overflow-y: auto;               ← Try to add scroll
    gap: 1.5rem;
    padding: 1rem;
}
```

**THE PROBLEM**:
- Parent (`.board-container`) has `overflow-y: hidden`
- Child (`.board-columns`) tries to add `overflow-y: auto`
- **Parent wins** - vertical scroll is blocked!
- Content stacks vertically but overflows invisible area
- User sees only first column (backlog)

**Why it fails**:
1. Desktop: `height: calc(100vh - 80px)` makes container fixed to viewport
2. Desktop: `overflow-y: hidden` prevents vertical scroll
3. Mobile: Columns stack but parent still has fixed height + hidden overflow
4. Result: Only content fitting in viewport height shows, rest is cut off

---

### 2. WORKFLOW SYSTEM (style.css)

**Lines 162** (DESKTOP CSS):
```css
.registers-container { 
    display: flex; 
    min-height: 400px; 
}
```

**No explicit height or overflow constraints on**:
- `body` (line 90-94): No height constraint ✓
- `#app-container` (line 97-101): No height constraint ✓
- `.registers-container`: Only `min-height` ✓

**Lines 398-412** (MY MOBILE CSS):
```css
.registers-container {
    flex-direction: column;
    min-height: auto;               ← Good!
}

.action-register-panel,
.evidence-register-panel {
    width: 100% !important;
    border-right: none;
    border-bottom: 2px solid var(--border-color);
}
```

**POTENTIAL PROBLEM**:
- May not be a CSS issue
- Could be JavaScript rendering issue
- Or viewport height constraint somewhere else
- Need to check if content is actually rendered in DOM

---

## THE FIX

### For BOARDS (ppm-style.css):

**On Mobile, Override Parent Container**:
```css
@media (max-width: 768px) {
    .board-container {
        height: auto !important;          ← Remove fixed height
        overflow-y: auto !important;      ← Enable vertical scroll
        overflow-x: visible !important;   ← No horizontal scroll
        min-height: calc(100vh - 150px);  ← Minimum height for UX
    }
    
    .board-columns {
        flex-direction: column;
        overflow-x: visible;
        overflow-y: visible;              ← Let parent handle scroll
        gap: 1.5rem;
        padding: 1rem;
        min-height: auto;                 ← Natural height
    }
}
```

### For WORKFLOW (style.css):

**Ensure Scrolling Works**:
```css
@media (max-width: 768px) {
    body {
        overflow-y: auto;                 ← Allow page scroll
        height: auto;                     ← Natural height
    }
    
    #app-container {
        height: auto;                     ← Natural height
        min-height: 100vh;                ← At least full viewport
    }
    
    .registers-container {
        flex-direction: column;
        min-height: auto;
        height: auto;                     ← Natural height
    }
}
```

---

## WHY THIS FIXES IT

### Boards:
1. **Before**: Parent has fixed `100vh` height, blocks scroll
2. **After**: Parent has `auto` height, expands with content
3. **Result**: Parent can scroll vertically, shows all stacked columns

### Workflow:
1. **Before**: Might have implicit height constraints
2. **After**: Explicit `auto` heights, page scrolls naturally
3. **Result**: Body scrolls, both panels visible

---

## TESTING STRATEGY

After fix:
1. Open boards on mobile
2. Scroll down → Should see all columns vertically
3. Open workflow on mobile  
4. Scroll down → Should see actions then evidence below
5. All content should be accessible via scroll

---

## LESSON LEARNED

**Key Mistake**: Fixed viewport heights + hidden overflow = content gets cut off on mobile

**Correct Approach**: 
- Desktop: Fixed heights OK (wide screen)
- Mobile: `height: auto` + `overflow-y: auto` (scrollable)
- Always test scrolling when stacking content vertically

---

## IMPLEMENTATION PRIORITY

1. **HIGH**: Fix `.board-container` overflow (boards critical)
2. **HIGH**: Fix workflow scrolling (ensure explicit auto heights)
3. **MEDIUM**: Test on multiple devices
4. **LOW**: Optimize scroll behavior

