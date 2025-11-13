# 🚀 Dynamic Workflow Templates - Quick Start Guide

**Version 7.0** | **Status: Production Ready** ✅

---

## What's New?

Your compliance workflow system is now **fully dynamic**! Instead of the hardcoded 3-level structure (Rules → Actions → Evidences), you can now:

- ✨ Create workflow **templates** with **any number of levels** (2, 3, 4, 5... unlimited!)
- 🎛️ Customize which features appear at each level (icons, grades, tags, attachments, etc.)
- 📊 Use **cumulative grading** (parent grades auto-sum from children)
- 📈 See **progress bars** on any parent unit showing % completion
- 📋 **Copy workflows** to reuse structures
- 🎯 **Export to boards** for project management

---

## 🎬 Getting Started (3 Steps)

### Step 1: Create a Template (or Use the Default)

1. Open `index.html` in your browser
2. Switch to **Creation Mode** (toggle at top)
3. Click **"Templates"** link in the header (new!)
4. You'll see the **"Classic Compliance (3-Level)"** template already created
5. **Option A:** Use this template as-is
6. **Option B:** Create your own template:
   - Click **"Create New Template"**
   - Name it (e.g., "Risk Assessment 4-Level")
   - Add levels (e.g., Domains → Processes → Controls → Tasks)
   - Configure what properties each level has
   - Save template

### Step 2: Create a Workflow from Template

1. Go back to main app (`index.html`)
2. Ensure you're in **Creation Mode**
3. Click **"New"** button
4. Select **"From Template"**
5. Choose your template
6. Name your workflow
7. Click **"Create Workflow"**
8. Start adding units using **"Add [Level Name]"** buttons

### Step 3: Execute & Track

1. Switch to **Execution Mode** (toggle switch)
2. Check off completed items (if "Done" checkbox enabled)
3. See progress bars update automatically
4. Filter by tags (click any tag)
5. Export units to project boards (click "Board" button)

---

## 📚 Key Concepts

### Templates
- **Blueprints** for workflows
- Define structure, levels, and features
- Reusable across multiple workflows
- Located in: `/data/templates.json`

### Workflows
- **Instances** created from templates
- Each workflow is independent
- Changes to template don't affect existing workflows (by design)
- Located in: `/data/workflows.json`

### Levels
- **Layers** in your workflow hierarchy
- Each level has a name (e.g., "Controls", "Actions", "Tasks")
- Each level can have different properties enabled

### Units
- **Items** at any level
- Properties depend on level configuration
- Can have: icon, ID, name, description, tags, done checkbox, grade, progress bar, attachments

---

## 🎯 Common Use Cases

### Use Case 1: Recreate the Classic Workflow

The **"Classic Compliance (3-Level)"** template is already created for you!

**Structure:**
- **Level 1: Rules** (with progress bars, tags, icons)
- **Level 2: Actions** (with progress bars, tags, icons, descriptions, done checkboxes)
- **Level 3: Evidences** (with everything: grades, tags, links, images, notes, comments)

**To use:**
1. New → From Template → Classic Compliance
2. Name it (e.g., "NIST CSF 2025")
3. Start adding Rules, then Actions, then Evidences

### Use Case 2: Create a 4-Level Risk Assessment

**Template Structure:**
- **Level 1: Risk Categories** (icon, name, progress bar)
- **Level 2: Risk Areas** (icon, name, description, progress bar)
- **Level 3: Controls** (icon, name, description, tags, done, progress bar)
- **Level 4: Tasks** (icon, ID, name, description, tags, done, grade, links, notes)

**Steps:**
1. Templates → Create New Template → "Risk Assessment 4-Level"
2. Add 4 levels as described above
3. Save template
4. Create workflow from this template

### Use Case 3: Copy an Existing Workflow

**Scenario:** You have a "Q1 2025 Audit" workflow and want "Q2 2025 Audit"

**Steps:**
1. New → Copy Existing Workflow
2. Select "Q1 2025 Audit" as source
3. Name it "Q2 2025 Audit"
4. All structure, units, and execution states copied
5. Modify as needed

### Use Case 4: Export to Project Board

**Scenario:** You want to track a control's actions as Kanban tasks

**Steps:**
1. Switch to **Execution Mode**
2. Find the control (parent unit) you want to export
3. Click **"Board"** button in its header
4. Confirm export
5. New tab opens with Kanban board
6. All child units → cards with metadata

### Use Case 5: Tag-Based Board Export

**Scenario:** Export all items tagged "Q1-2025" to a board

**Steps:**
1. Click any tag in the workflow (e.g., "Q1-2025")
2. View filters to show only tagged items
3. Tag filter banner appears with **"Create Board"** button
4. Click **"Create Board"**
5. All tagged items across all levels → one board

---

## 🎨 Template Builder Tips

### Level Configuration
- **Order matters:** Levels are hierarchical (0 = root, 1 = children of root, etc.)
- **Use descriptive names:** "Controls" is clearer than "Level 2"
- **Singular/Plural:** "Control" / "Controls" - used in UI buttons and labels
- **Colors:** Choose distinct colors for each level (visual hierarchy)

### Unit Configuration
- **Enable only what you need:** Fewer options = cleaner UI
- **Cumulative Grading:** Enable for parent levels, disable for leaf levels
- **Progress Bars:** Only makes sense for parents with "done" enabled on children
- **Attachments:** Usually only needed at leaf levels (where work happens)

### Validation
The template builder validates 20+ rules:
- Required fields
- Unique level names
- Consistent singular/plural names
- Logical dependencies (e.g., progress bar needs child done checkboxes)
- If validation fails, error messages explain what to fix

---

## 🔧 Advanced Features

### Cumulative Grading

**How it works:**
1. Enable "Grade" for multiple levels
2. Check "Cumulative" for parent levels
3. In workflow:
   - **Leaf units:** Enter grades manually (e.g., Evidence grade = 85)
   - **Parent units:** Grade = Σ(children grades) automatically
   - **Read-only:** Cumulative grades show with "Σ" symbol, can't be edited

**Example:**
```
Control (grade: 170, cumulative)
├── Action 1 (grade: 90, cumulative)
│   ├── Evidence 1 (grade: 45, manual)
│   └── Evidence 2 (grade: 45, manual)
└── Action 2 (grade: 80, cumulative)
    ├── Evidence 3 (grade: 40, manual)
    └── Evidence 4 (grade: 40, manual)
```

### Progress Bars

**How it works:**
1. Enable "Progress Bar" on parent level
2. Enable "Done" checkbox on child level
3. Progress = (completed children / total children) × 100%
4. Updates in real-time when you check boxes

**Visual:**
```
Control [████████░░] 80%
├── Action 1 ✓ (done)
├── Action 2 ✓ (done)
├── Action 3 ✓ (done)
├── Action 4 ✓ (done)
└── Action 5 ☐ (not done)
```

### Tag Filtering

**Usage:**
1. Click any tag badge in the workflow
2. View filters to show only units with that tag
3. Applies to all levels (shows parents if children match)
4. Click "Clear" to remove filter
5. Click "Create Board" to export filtered items

---

## 📂 File Structure

```
/workspace/
├── index.html                    # Main workflow app
├── template-builder.html         # Template management
├── script.js                     # Dynamic workflow engine (NEW!)
├── template-builder.js           # Template builder logic
├── style.css                     # Dynamic styles (UPDATED!)
├── template-builder.css          # Template builder styles
│
├── data/                         # All JSON data
│   ├── templates.json            # Workflow templates
│   ├── workflows.json            # Workflow instances
│   ├── executions.json           # Completion states
│   ├── workflow-links.json       # Workflow relationships
│   ├── ppm-boards.json           # Project boards
│   └── ppm-users.json            # User data
│
├── save_*.php                    # Backend APIs
│   ├── save_templates.php        # Save templates
│   ├── save_workflow.php         # Save workflows
│   ├── save_executions.php       # Save execution states
│   ├── save_board.php            # Save PPM boards
│   └── ...
│
├── icons/                        # Icon library (50+ icons)
│   ├── search.png
│   ├── document-find.png
│   └── ...
│
└── dynamic-workspace/            # Documentation
    ├── 00-ANALYSIS-AND-DESIGN.md
    ├── 01-IMPLEMENTATION-PLAN.md
    └── 02-IMPLEMENTATION-COMPLETE.md
```

---

## 🐛 Troubleshooting

### Issue: "No templates available" when creating workflow
**Solution:** Go to Template Builder and create at least one template first.

### Issue: Grade field is read-only
**Cause:** Cumulative grading is enabled for this level.  
**Solution:** Enter grades at child level; parent auto-sums.

### Issue: Progress bar not showing
**Cause:** Either no children exist, or children don't have "done" checkbox enabled.  
**Solution:** Check template configuration for child level.

### Issue: Can't add units
**Cause:** You're in Execution Mode.  
**Solution:** Switch to Creation Mode (toggle at top).

### Issue: Export to board not working
**Cause:** Missing PPM data files.  
**Solution:** Ensure `data/ppm-boards.json` and `data/ppm-users.json` exist.

### Issue: Data not saving
**Cause:** PHP can't write to `/data/` folder.  
**Solution:** Set folder permissions: `chmod 777 /workspace/data/`

---

## 📖 Full Documentation

For complete technical documentation, see:

- **`/dynamic-workspace/00-ANALYSIS-AND-DESIGN.md`** - Architecture & design decisions
- **`/dynamic-workspace/01-IMPLEMENTATION-PLAN.md`** - Implementation phases & details
- **`/dynamic-workspace/02-IMPLEMENTATION-COMPLETE.md`** - Completion report & validation

---

## 🎓 Pro Tips

1. **Start with Classic Template:** Use it to understand the system before creating custom templates
2. **Test Templates:** Create a test workflow to verify template configuration before full deployment
3. **Name Conventions:** Use consistent naming (e.g., all plural: "Controls", "Actions", "Tasks")
4. **Color Scheme:** Use gradient colors for visual hierarchy (darker → lighter as you go deeper)
5. **Enable Progressively:** Start with basic features, add complexity as needed
6. **Tag Strategy:** Define tag taxonomy upfront (e.g., "Q1-2025", "critical", "audit")
7. **Copy for Variations:** Instead of creating many templates, copy and modify workflows
8. **Export Regularly:** Use board export for team collaboration and project tracking
9. **Document Templates:** Use template description field to explain when to use each template
10. **Backup Data:** Keep backups of `/data/` folder before major changes

---

## ✅ Quick Checklist

Before going live:

- [ ] Create at least one template (or use Classic Compliance)
- [ ] Test workflow creation from template
- [ ] Test adding units at all levels
- [ ] Test mode switching (creation ↔ execution)
- [ ] Test save functionality (structure & execution)
- [ ] Test copy workflow
- [ ] Test export to board
- [ ] Test tag filtering
- [ ] Test cumulative grading (if enabled)
- [ ] Test progress bars
- [ ] Verify mobile responsiveness
- [ ] Set proper file permissions on `/data/`
- [ ] Backup existing data (if migrating)

---

## 🆘 Need Help?

### For Users
- Check this Quick Start Guide
- Review full documentation in `/dynamic-workspace/`
- Experiment with the Classic Compliance template first

### For Developers
- Architecture: See `00-ANALYSIS-AND-DESIGN.md`
- Implementation: See `01-IMPLEMENTATION-PLAN.md`
- Schemas: See `02-IMPLEMENTATION-COMPLETE.md`
- Code: All logic is well-commented in `script.js` and `template-builder.js`

---

## 🎉 You're Ready!

The dynamic workflow templates system is **complete, tested, and ready to use**. 

Start by exploring the Template Builder, create a workflow from the Classic Compliance template, and experience the power of fully customizable workflows!

**Happy workflow building! 🚀**

---

*Version 7.0 | Dynamic Templates | Production Ready*
