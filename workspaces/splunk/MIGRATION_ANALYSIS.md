# Splunk On-Call Plugin - MUI to BUI Migration Analysis

## Current Status

The Splunk On-Call plugin is heavily dependent on Material-UI v4 components and needs a complete migration to Backstage UI (BUI).

## Package Dependencies Issues

### In `package.json`:

```json
"@material-ui/core": "^4.12.2",
"@material-ui/icons": "^4.9.1",
"@material-ui/lab": "4.0.0-alpha.61",
```

**Action**: These dependencies should be removed after migration and replaced with:

- `@backstage/ui` (for components)
- `@remixicon/react` (for icons)
- `react-aria-components` (for complex interactions like Tooltip, Menu, Dialog)

---

## Files Requiring Migration (9 Component Files + 59 MUI imports)

### 1. **EntitySplunkOnCallCard.tsx** (6 MUI imports)

**MUI Components Used:**

- Card, CardContent, CardHeader → BUI Card
- Divider → CSS divider
- Typography → BUI Text
- makeStyles → CSS Modules
- AlarmAddIcon (MUI Icons) → RiAlarmAddLine (Remix Icons)
- WebIcon → RiGlobalLine
- Alert (Lab) → BUI Alert

**Actions:**

- Replace imports with BUI equivalents
- Create EntitySplunkOnCallCard.module.css
- Update IconButton props to use BUI ButtonIcon

---

### 2. **SplunkOnCallPage.tsx** (Already Migrated ✅)

- Imports: Grid → Box/Flex, Button, Card/CardContent → Box/Flex
- Status: **COMPLETE**

---

### 3. **TriggerDialog/TriggerDialog.tsx** (13 MUI imports)

**MUI Components Used:**

- Dialog, DialogTitle, DialogContent, DialogActions → BUI Dialog pattern
- TextField → BUI TextField
- Select, MenuItem, FormControl, InputLabel → BUI Select
- Button → BUI Button
- CircularProgress → BUI Skeleton (for loading)
- Typography → BUI Text
- makeStyles → CSS Modules
- Alert (Lab) → BUI Alert

**Special Handling:**

- TextField onChange event handling differs (receives string directly in BUI)
- Dialog pattern requires DialogTrigger wrapper

---

### 4. **Escalation/EscalationPolicy.tsx** (3 MUI imports)

**MUI Components Used:**

- List, ListSubheader → Custom HTML list with CSS
- makeStyles → CSS Modules
- Alert (Lab) → BUI Alert

**Children:** EscalationUser.tsx

---

### 5. **Escalation/EscalationUser.tsx** (10 MUI imports)

**MUI Components Used:**

- ListItem, ListItemIcon, ListItemSecondaryAction, ListItemText → HTML list structure with CSS
- Tooltip → BUI Tooltip with TooltipTrigger
- IconButton → BUI ButtonIcon
- Typography → BUI Text
- Avatar → BUI Avatar
- makeStyles → CSS Modules
- EmailIcon → RiMailLine

---

### 6. **Escalation/EscalationUsersEmptyState.tsx** (4 MUI imports)

**MUI Components Used:**

- ListItem, ListItemIcon, ListItemText → HTML list
- makeStyles → CSS Modules

---

### 7. **Incident/Incidents.tsx** (4 MUI imports)

**MUI Components Used:**

- List, ListSubheader → Custom HTML list
- makeStyles → CSS Modules
- Alert → BUI Alert

**Children:** IncidentListItem.tsx

---

### 8. **Incident/IncidentListItem.tsx** (11 MUI imports)

**MUI Components Used:**

- ListItem, ListItemIcon, ListItemSecondaryAction, ListItemText → HTML list
- Tooltip → BUI Tooltip
- IconButton → BUI ButtonIcon
- Typography → BUI Text
- makeStyles → CSS Modules
- DoneIcon → RiCheckLine
- DoneAllIcon → RiCheckDoubleLine
- OpenInBrowserIcon → RiExternalLinkLine

---

### 9. **Incident/IncidentEmptyState.tsx** (2 MUI imports)

**MUI Components Used:**

- Grid → Box/Flex
- Typography → BUI Text

---

### 10. **Errors/MissingApiKeyOrApiIdError.tsx** (1 MUI import)

**MUI Components Used:**

- Button → BUI Button

---

## Icon Mapping (Material-UI to Remix Icons)

| MUI Icon      | Remix Icon         |
| ------------- | ------------------ |
| AlarmAdd      | RiAlarmAddLine     |
| Web           | RiGlobalLine       |
| Email         | RiMailLine         |
| Done          | RiCheckLine        |
| DoneAll       | RiCheckDoubleLine  |
| OpenInBrowser | RiExternalLinkLine |

---

## CSS Variable Reference for Styling

### From MUI to BUI CSS Variables:

```css
/* Spacing */
theme.spacing(1) → var(--bui-space-2)
theme.spacing(2) → var(--bui-space-4)
theme.spacing(3) → var(--bui-space-6)

/* Colors */
theme.palette.text.primary → var(--bui-fg-primary)
theme.palette.text.secondary → var(--bui-fg-secondary)
theme.palette.background.paper → var(--bui-bg-surface-1)
theme.palette.divider → var(--bui-border)

/* Typography */
variant="h6" → variant="title-small"
variant="body1" → variant="body-medium"
variant="body2" → variant="body-small"
```

---

## Migration Strategy

### Phase 1: Setup

- [ ] Install @backstage/ui
- [ ] Install @remixicon/react
- [ ] Install react-aria-components
- [ ] Update tsconfig.json if needed

### Phase 2: Core Components (Priority Order)

1. **MissingApiKeyOrApiIdError.tsx** (simplest, 1 import)
2. **IncidentEmptyState.tsx** (2 imports)
3. **TriggerDialog.tsx** (13 imports, but critical for functionality)
4. **EntitySplunkOnCallCard.tsx** (6 imports)
5. **Escalation components** (EscalationPolicy, EscalationUser, EscalationUsersEmptyState)
6. **Incident components** (Incidents, IncidentListItem)

### Phase 3: Cleanup

- [ ] Remove MUI dependencies from package.json
- [ ] Update tests to use BUI components
- [ ] Test entire plugin flow

---

## Key Challenges & Solutions

### 1. List Component Migration

**Challenge:** MUI List/ListItem/ListItemIcon don't have direct BUI equivalent
**Solution:** Replace with semantic HTML (`<ul>`, `<li>`) + CSS styling with BUI variables

### 2. Dialog Pattern Change

**Challenge:** MUI Dialog vs BUI Dialog have different APIs
**Solution:** Wrap with DialogTrigger, use new props (isOpen, isDismissable, onOpenChange)

### 3. TextField onChange

**Challenge:** MUI passes event object, BUI passes string directly
**Solution:** Update handlers like: `onChange={(value) => setState(value)}`

### 4. Styling: makeStyles to CSS Modules

**Challenge:** All components use makeStyles with theme access
**Solution:** Create .module.css files, replace theme values with BUI CSS variables

### 5. Icon Library

**Challenge:** Different icon naming and sizing between MUI and Remix
**Solution:** Use Remix Icons with size prop instead of fontSize

---

## Estimated Effort

- **Total Components:** 10 files
- **Total MUI Imports:** 59
- **Complexity:** Medium-High (dialogs, forms, lists need careful migration)
- **Estimated Time:** 2-3 hours for experienced developer

---

## Notes

- Each component may have test files that also need updating
- Some complex patterns (Dialog with form) may require additional dependencies
- BUI components use react-aria under the hood for accessibility
- CSS Modules provide better style isolation than makeStyles
