# Linked Workflows - Data Storage Setup

## ✅ DATA STRUCTURE ALREADY EXISTS

Good news! The linked workflows feature uses existing data infrastructure from V6. No new setup required.

---

## 📁 FILES INVOLVED:

### 1. **data/workflow-links.json** ✅ EXISTS
**Location:** `/workspace/data/workflow-links.json`
**Purpose:** Stores link group relationships between workflows
**Current Status:** Already exists (initialized with empty structure)

**Structure:**
```json
{
  "links": [
    {
      "groupId": "link-1234567890-abc12",
      "workflows": ["flow-xxx", "flow-yyy", "flow-zzz"]
    }
  ]
}
```

**What it stores:**
- Link groups (each group = set of synchronized workflows)
- Workflow IDs belonging to each group
- Automatically managed by the system

---

### 2. **save_workflow_links.php** ✅ EXISTS
**Location:** `/workspace/save_workflow_links.php`
**Purpose:** API endpoint to persist link data
**Current Status:** Already exists and functional

**Functionality:**
- Receives link group data from frontend
- Validates data structure
- Saves to `data/workflow-links.json`
- Returns success/error response

---

## 🔄 HOW IT WORKS:

### When You Create a Linked Workflow:
1. User creates "Workflow B" linked to "Workflow A"
2. System creates/updates link group:
   ```javascript
   {
     groupId: "link-timestamp-random",
     workflows: ["workflow-a-id", "workflow-b-id"]
   }
   ```
3. Saves to `workflow-links.json` via PHP endpoint
4. Both workflows now show "Linked" badge

### When You Edit a Linked Workflow:
1. User edits "Workflow A" structure in Creation Mode
2. Clicks "Save Structure"
3. System calls `propagateToLinkedWorkflows()`
4. Finds all workflows in same link group
5. Copies structure to "Workflow B" (and any others)
6. Preserves execution states independently
7. Saves `workflows.json` with all updated structures

### When You Unlink a Workflow:
1. User clicks "Unlink" button
2. System removes workflow ID from link group
3. If group has < 2 workflows, deletes the group
4. Saves updated `workflow-links.json`
5. Workflow becomes independent

---

## 📊 DATA SEPARATION:

The system maintains **3 separate data files**:

| File | What It Stores | Updated When |
|------|----------------|--------------|
| `workflows.json` | Workflow structures (units, names, etc.) | Save Structure |
| `executions.json` | Completion states per workflow | Save Execution |
| `workflow-links.json` | Link group relationships | Create/Unlink |

**Why separate?**
- **workflows.json:** Shared structures sync via links
- **executions.json:** Independent progress per workflow
- **workflow-links.json:** Link metadata only

---

## 🔍 CURRENT STATE:

### Checked Files:
```
✅ data/workflow-links.json      - EXISTS (18 bytes, empty structure)
✅ save_workflow_links.php       - EXISTS (47 lines, functional)
✅ data/workflows.json           - EXISTS (workflow data)
✅ data/executions.json          - EXISTS (execution data)
```

### Initialization Status:
```json
// Current content of workflow-links.json:
{
  "links": []
}
```

**Status:** ✅ Ready to use (empty array = no linked workflows yet)

---

## 🚀 WHAT YOU NEED TO DO:

**Answer: NOTHING!** 

All data files and API endpoints already exist. The linked workflows feature will:
- ✅ Load `workflow-links.json` on startup
- ✅ Save link groups when you create linked workflows
- ✅ Update automatically when you unlink
- ✅ Persist across sessions

---

## 🧪 TESTING DATA PERSISTENCE:

### Test 1: Create Linked Workflow
1. Create two linked workflows
2. Check `data/workflow-links.json`
3. Should see:
   ```json
   {
     "links": [{
       "groupId": "link-...",
       "workflows": ["flow-id-1", "flow-id-2"]
     }]
   }
   ```

### Test 2: Verify Sync
1. Edit one linked workflow
2. Save structure
3. Check other workflow → should update

### Test 3: Unlink
1. Unlink a workflow
2. Check `workflow-links.json`
3. Should see workflow removed from group

---

## 📝 SUMMARY:

**Data Changes Required:** ✅ NONE - All infrastructure exists
**Files to Create:** ✅ NONE - Already in place
**Configuration Needed:** ✅ NONE - Ready to use
**Manual Setup:** ✅ NONE - Automatic

**Conclusion:** The linked workflows feature uses existing V6 data structure that was already present in your V7 codebase. I only restored the **code logic** - the data layer was already there!

