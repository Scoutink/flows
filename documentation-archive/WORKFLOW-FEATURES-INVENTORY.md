# Workflow Features Documented in documentation.html

## Version: 6.2 (OLD STATIC VERSION)

### Core Concepts:
1. **Three-Level Structure (STATIC):**
   - Level 1: Controls (Rules)
   - Level 2: Actions
   - Level 3: Evidence
   - ⚠️ This is now DYNAMIC with templates

### Workflow Management:
2. **Selecting Workflows:** Dropdown selector
3. **Creating Workflows:**
   - Empty (blank)
   - Copy (duplicate)
   - Linked (synchronized)
   - ⚠️ NOW: Also "From Template" option
4. **Renaming Workflows:** Pen icon
5. **Deleting Workflows:** Trash icon
6. **Linked Indicator:** Badge showing link status

### UI/Layout:
7. **Two-Pane Layout:** Left (Actions) / Right (Evidence)
   - ⚠️ NOW: Dynamic based on template levels
8. **Two Modes:** Creation / Execution toggle
9. **Mode Switch:** Toggle at top

### Creation Mode Features:
10. **Adding Items:** Plus icons for Control/Action/Evidence
    - ⚠️ NOW: Dynamic "Add [Level Name]" based on template
11. **Editing Names:** Pencil icon
12. **Editing Descriptions:** Text areas
13. **Changing Grades:** Dropdown (0.5 to 5.0)
    - ⚠️ Grades now optional, cumulative option
14. **Deleting Items:** Trash icon
15. **Attachments:** Links, Images, Notes, Comments
    - ⚠️ NOW: Per-level template configuration
16. **Save Structure Button**

### Execution Mode Features:
17. **Checkboxes:** Mark tasks complete
18. **Progress Bars:** Action and Control progress
    - ⚠️ NOW: Configurable per level in template
19. **Sequential Order:** Force task order
    - ⚠️ NOW: Workflow-level template option
20. **View Attachments:** Buttons in footer
21. **Save Execution Button**

### Tags:
22. **Adding Tags:** Input field with autocomplete
23. **Removing Tags:** X button
24. **Filtering by Tags:** Click to filter
25. **Smart Tag Inheritance:** Shows parent items
26. **Tag Banner:** Active filter display

### Linked Workflows:
27. **What Syncs:** Structure, names, descriptions, grades, tags
28. **What Doesn't Sync:** Checkboxes, attachments, workflow names
29. **Creating Linked:** Via New workflow dialog
30. **Link Badge:** Visual indicator
31. **Unlinking:** Unlink button
32. **Link Groups:** Multiple workflows in group

### Project Boards (Export):
33. **Control Export:** Create board from Control
34. **Tag Export:** Create board from tag filter
35. **Board Features:** Kanban, roles, deadlines, drag-drop

### Additional Features:
36. **Grade Totals:** Warning if not equal to 5.0
    - ⚠️ NOW: Flexible, not fixed to 5.0
37. **Sequential Highlighting:** Blue border on active item
38. **Locked Items:** Gray when not available
39. **Attachment Manager:** Gear icon
40. **Rich Text Editor:** For notes (Quill.js)
41. **Link Viewer:** Embedded frame
42. **Image Gallery:** View images
43. **Theme:** Implied but not documented

## Features to Verify in Dynamic Version:

### NEW in Dynamic (Version 7.0):
- Template Builder
- Dynamic levels (1-10)
- Per-level property configuration
- Workflow-level properties (icon, description, sequential)
- Cumulative grades
- Template snapshots
- Unit icons
- Display IDs
- Flexible progress bars

### OLD Features to Check:
- Copy workflow (still works?)
- Linked workflows (still works?)
- Tags (still works?)
- Two-pane layout (how does it work with dynamic levels?)
- Export to boards (still works with dynamic?)
- All attachment types
- Sequential order
- Grade warnings

## Questions to Answer:
1. Does documentation mention templates at all? NO
2. Does documentation mention dynamic levels? NO
3. Does documentation show old fixed structure? YES
4. Is "From Template" workflow creation documented? NO
5. Are workflow-level properties (icon, desc) documented? NO
6. Are unit icons documented? NO
7. Is Display ID documented? NO
8. Are cumulative grades documented? NO
9. Does linked workflow still work? NEED TO CHECK CODE
10. Does copy workflow still work? NEED TO CHECK CODE
11. Does board export still work? NEED TO CHECK CODE
