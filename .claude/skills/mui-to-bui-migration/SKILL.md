---
name: mui-to-bui-migration
description: Migrate Backstage plugins from Material-UI (MUI) to Backstage UI (BUI). Use this skill when migrating components, updating imports, replacing styling patterns, or converting MUI components to their BUI equivalents.
---

# MUI to BUI Migration Skill

This skill helps migrate Backstage plugins from Material-UI (@material-ui/core, @material-ui/icons, @material-ui/lab) to Backstage UI (@backstage/ui).

## Prerequisites

Before starting migration:

1. Install the BUI package:

   ```bash
   yarn add @backstage/ui
   ```

2. If using icons, add `@remixicon/react` pinned below 4.9.0 (the 4.9.0 release changed its license):

   ```json
   "@remixicon/react": ">=4.6.0 <4.9.0"
   ```

3. If the workspace has a full dev app under `packages/app`, add the CSS import to `packages/app/src/index.tsx`:

   ```typescript
   import '@backstage/ui/css/styles.css';
   ```

   Skip this for workspaces whose plugins use `createDevApp` from `@backstage/dev-utils` instead; it loads the stylesheet automatically. The plugin package itself should never import the stylesheet.

## Available BUI Components

### Layout Components

- `Box` - Basic layout container with spacing and sizing props
- `Container` - Centered content container with max-width
- `Grid` - CSS Grid-based layout (`Grid.Root`, `Grid.Item`)
- `Flex` - Flexbox layout component (`direction`, `align`, `justify`, `gap`)
- `FullPage` - Fills the viewport below the page `Header`; content scrolls independently

### UI Components

- `Accordion` - Collapsible content panels (`Accordion`, `AccordionTrigger`, `AccordionPanel`, `AccordionGroup`)
- `Alert` - Status banners (`status="info" | "success" | "warning" | "danger"`, replaces MUI lab Alert)
- `Avatar` - User/entity avatars (`src` and `name` are required)
- `Badge` - Small status/count indicator (`icon`, `size`)
- `Button` - Primary action buttons (`variant="primary" | "secondary" | "tertiary"`, `isDisabled`, `isPending`, `destructive`, `iconStart`, `iconEnd`)
- `ButtonIcon` - Icon-only buttons (`icon`, `onPress`, `variant`, requires `aria-label`)
- `ButtonLink` - Link styled as button (`href`)
- `Card` - Content cards (`Card`, `CardHeader`, `CardBody`, `CardFooter`)
- `Checkbox` - Checkbox input (`isSelected`, `isIndeterminate`, `onChange` receives a boolean)
- `CheckboxGroup` - Grouped checkboxes with a shared label (`value: string[]`, `onChange`)
- `Combobox` - Typeahead input with a filtered option list (replaces MUI lab Autocomplete)
- `DatePicker` / `DateRangePicker` - Date inputs (values from `@internationalized/date`)
- `Dialog` - Modal dialogs (`DialogTrigger`, `Dialog`, `DialogHeader`, `DialogBody`, `DialogFooter`)
- `FieldLabel` - Standalone label/description block for custom form fields
- `Link` - Navigation links (router-aware)
- `List` / `ListRow` - Interactive lists with keyboard navigation, selection, and row actions (replaces MUI List)
- `Menu` - Dropdown menus (`MenuTrigger`, `Menu`, `MenuItem`, `MenuSection`, `MenuSeparator`, `SubmenuTrigger`; `MenuAutocomplete`/`MenuAutocompleteListbox` and `MenuListBox`/`MenuListBoxItem` for filterable and listbox-flavored variants)
- `NumberField` - Numeric input (`value`/`onChange` use numbers, `minValue`, `maxValue`, `step`)
- `PasswordField` - Password input with visibility toggle
- `Popover` - Popover overlays (pair with `DialogTrigger`)
- `RadioGroup` / `Radio` - Radio button groups
- `SearchAutocomplete` - Search input with suggestion items (`SearchAutocompleteItem`)
- `SearchField` - Search input with built-in clear button
- `Select` - Dropdown select (options-driven: `options={[{ id, label }]}`, `value`, `onChange`; `SelectItem`/`SelectItemText`/`SelectItemProfile` for custom option content, same family exists for `Combobox`)
- `Skeleton` - Loading skeleton (`width`, `height`)
- `Slider` - Slider input; pass a `number[]` value for a range slider
- `Switch` - Toggle switch (`isSelected`, `onChange` receives a boolean)
- `Table` - Data tables (see the Table pattern below; includes `TablePagination`, `TableBodySkeleton`, the low-level `TableRoot`/`TableHeader`/`TableBody`/`Column`/`Row`/`Cell` parts, and the `useTable` hook)
- `Tabs` - Tab navigation (`Tabs`, `TabList`, `Tab`, `TabPanel`)
- `Tag` - Tag/chip component (replaces MUI Chip)
- `TagGroup` - Tag groups with selection and removal (`onRemove`)
- `Text` - Typography component (`variant`, `color`, `weight`, `as`)
- `TextField` - Text input (`isRequired`, `onChange` receives string directly)
- `TextAreaField` - Multiline text input (`rows`)
- `ToggleButton` / `ToggleButtonGroup` - Toggle buttons
- `Tooltip` / `TooltipTrigger` - Tooltip overlays (both imported from `@backstage/ui`)
- `VisuallyHidden` - Accessibility helper
- `BUIProvider` / `BgProvider` - Optional providers for wiring analytics and nested surface backgrounds

### Headers

- `Header` - The page header: title, description, tags, metadata (`HeaderMetadataUsers`, `HeaderMetadataStatus` render metadata values), and nav tabs. Successor of `HeaderPage`, which still exists but is deprecated.
- `PluginHeader` - Toolbar-style header with icon, breadcrumbs, and route tabs. This component was called `Header` in early BUI versions, so older migrated code using `Header` as a toolbar should now use `PluginHeader`.

### Hooks

- `useBreakpoint` - Responsive breakpoint hook (`{ breakpoint, up, down }`)
- `useTable` - Data/pagination/sort state management for `Table`
- `useAsyncList` - Async option loading for `Select`/`Combobox` (re-exported from react-stately)
- `useAnalytics`, `useBgConsumer`/`useBgProvider`, `getNodeText` - Analytics and surface-tracking utilities; rarely needed in migrations

## Migration Patterns

### 1. Import Changes

**Remove MUI imports:**

```typescript
// REMOVE these imports
import { Box, Typography, Tooltip, Paper } from '@material-ui/core';
import { makeStyles, Theme } from '@material-ui/core/styles';
import SomeIcon from '@material-ui/icons/SomeIcon';
```

**Add BUI imports:**

```typescript
// ADD these imports
import { Box, Flex, Text, Tooltip, TooltipTrigger, Card } from '@backstage/ui';
import { RiSomeIcon } from '@remixicon/react';
import styles from './MyComponent.module.css';
```

### 2. Styling: makeStyles to CSS Modules

Create a `.module.css` file alongside your component using BUI CSS variables.

**Before (MUI makeStyles):**

```typescript
// MyComponent.tsx
import { makeStyles, Theme } from '@material-ui/core/styles';

const useStyles = makeStyles((theme: Theme) => ({
  container: {
    padding: theme.spacing(2),
    backgroundColor: theme.palette.background.paper,
    borderRadius: theme.shape.borderRadius,
  },
  title: {
    marginBottom: theme.spacing(1),
    color: theme.palette.text.primary,
  },
  listItem: {
    display: 'flex',
    alignItems: 'center',
  },
  icon: {
    minWidth: 56,
    color: theme.palette.text.secondary,
  },
}));

function MyComponent() {
  const classes = useStyles();
  return (
    <div className={classes.container}>
      <Typography className={classes.title}>Title</Typography>
      <div className={classes.listItem}>
        <div className={classes.icon}>
          <SomeIcon />
        </div>
        <span>Content</span>
      </div>
    </div>
  );
}
```

**After (CSS Modules with BUI variables):**

```css
/* MyComponent.module.css */
@layer components {
  .container {
    padding: var(--bui-space-4);
    background-color: var(--bui-bg-neutral-1);
    border-radius: var(--bui-radius-2);
  }

  .title {
    margin-bottom: var(--bui-space-2);
    color: var(--bui-fg-primary);
  }

  .listItem {
    display: flex;
    align-items: center;
    padding: var(--bui-space-2) 0;
  }

  .icon {
    min-width: 56px;
    display: flex;
    align-items: center;
    justify-content: center;
    color: var(--bui-fg-secondary);
  }
}
```

```typescript
// MyComponent.tsx
import { Box, Text } from '@backstage/ui';
import { RiSomeIcon } from '@remixicon/react';
import styles from './MyComponent.module.css';

function MyComponent() {
  return (
    <Box className={styles.container}>
      <Text className={styles.title}>Title</Text>
      <div className={styles.listItem}>
        <div className={styles.icon}>
          <RiSomeIcon size={24} />
        </div>
        <span>Content</span>
      </div>
    </Box>
  );
}
```

### 3. Layout: Box with display to Flex

**Before (MUI Box with display prop):**

```typescript
<Box
  display="flex"
  flexDirection="column"
  alignItems="center"
  justifyContent="space-between"
>
  <Box display="flex" flexDirection="row" gap={2}>
    {children}
  </Box>
</Box>
```

**After (BUI Flex component):**

```typescript
<Flex direction="column" align="center" justify="between">
  <Flex direction="row" gap="4">
    {children}
  </Flex>
</Flex>
```

Note: BUI Flex uses `justify="between"` not `justify="space-between"`. `gap` takes BUI space steps as strings (`gap="4"` is 16px, the same as MUI `gap={2}`).

### 4. Grid Layout

**Before (MUI Grid):**

```typescript
<Grid container spacing={3}>
  <Grid item xs={12} md={6}>
    {content}
  </Grid>
</Grid>
```

**After (BUI Grid):**

```typescript
<Grid.Root columns={{ sm: '12' }} gap="6">
  <Grid.Item colSpan={{ sm: '12', md: '6' }}>{content}</Grid.Item>
</Grid.Root>
```

Note: `columns` and `colSpan` take string literals (`'12'`), not numbers.

### 5. Typography to Text

**Before (MUI Typography):**

```typescript
<Typography variant="h1">Heading</Typography>
<Typography variant="h6">Subheading</Typography>
<Typography variant="body1">Body text</Typography>
<Typography variant="body2" color="textSecondary">Secondary text</Typography>
```

**After (BUI Text):**

```typescript
<Text as="h1" variant="title-large">Heading</Text>
<Text as="h2" variant="title-small">Subheading</Text>
<Text variant="body-medium">Body text</Text>
<Text variant="body-small" color="secondary">Secondary text</Text>
```

Valid Text variants: `title-large`, `title-medium`, `title-small`, `title-x-small`, `body-large`, `body-medium`, `body-small`, `body-x-small`

Note: `Text` does not infer the HTML element from the variant. Pass `as` explicitly for headings so the document outline survives the migration.

### 6. Tooltip Pattern

**Before (MUI Tooltip):**

```typescript
import { Tooltip, Typography } from '@material-ui/core';

<Tooltip title={<Typography>Tooltip content</Typography>}>
  <span>Hover me</span>
</Tooltip>;
```

**After (BUI TooltipTrigger pattern):**

```typescript
import { Button, Tooltip, TooltipTrigger } from '@backstage/ui';

<TooltipTrigger>
  <Button>Hover me</Button>
  <Tooltip>Tooltip content</Tooltip>
</TooltipTrigger>;
```

Both `Tooltip` and `TooltipTrigger` come from `@backstage/ui`. The trigger child must be focusable (BUI `Button`, `ButtonIcon`, and `ButtonLink` all work). To use a plain element as the trigger, wrap it in `Focusable` (also exported from `@backstage/ui`):

```typescript
import { Focusable, Tooltip, TooltipTrigger } from '@backstage/ui';

<TooltipTrigger delay={600}>
  <Focusable>
    <span>Hover me</span>
  </Focusable>
  <Tooltip>Tooltip content</Tooltip>
</TooltipTrigger>;
```

Note: the tooltip open delay defaults to 1500ms; pass `delay` on `TooltipTrigger` to shorten it.

### 7. Dialog Pattern

**Before (MUI Dialog):**

```typescript
import { Dialog, DialogTitle, DialogActions, Button } from '@material-ui/core';

<Dialog open={isOpen} onClose={onClose}>
  <DialogTitle>Title</DialogTitle>
  <DialogActions>
    <Button onClick={onClose}>Cancel</Button>
    <Button onClick={onConfirm} color="primary">
      Confirm
    </Button>
  </DialogActions>
</Dialog>;
```

**After (BUI Dialog, controlled):**

```typescript
import {
  Button,
  Dialog,
  DialogBody,
  DialogFooter,
  DialogHeader,
} from '@backstage/ui';

<Dialog
  isOpen={isOpen}
  onOpenChange={open => {
    if (!open) onClose();
  }}
  isDismissable
>
  <DialogHeader>Title</DialogHeader>
  <DialogBody>Content</DialogBody>
  <DialogFooter>
    <Button variant="secondary" onPress={onClose}>
      Cancel
    </Button>
    <Button variant="primary" onPress={onConfirm}>
      Confirm
    </Button>
  </DialogFooter>
</Dialog>;
```

If the dialog is opened by a button you also own, prefer the uncontrolled `DialogTrigger` pattern and drop the open state entirely:

```typescript
<DialogTrigger>
  <Button>Open</Button>
  <Dialog isDismissable>
    <DialogHeader>Title</DialogHeader>
    <DialogBody>Content</DialogBody>
  </Dialog>
</DialogTrigger>
```

### 8. Button Changes

**Before (MUI Button):**

```typescript
<Button variant="contained" color="primary" disabled={loading} onClick={handleClick}>
  Submit
</Button>
<IconButton onClick={handleDelete} disabled={!canDelete}>
  <DeleteIcon />
</IconButton>
```

**After (BUI Button):**

```typescript
<Button variant="primary" isDisabled={loading} onPress={handleClick}>
  Submit
</Button>
<ButtonIcon
  aria-label="delete"
  isDisabled={!canDelete}
  onPress={handleDelete}
  icon={<RiDeleteBinLine size={16} />}
  variant="secondary"
/>
```

Prop mapping:

| MUI                         | BUI                                                |
| --------------------------- | -------------------------------------------------- |
| `variant="contained"`       | `variant="primary"`                                |
| `variant="outlined"`        | `variant="secondary"`                              |
| `variant="text"`            | `variant="tertiary"`                               |
| red/error styling           | `destructive` (boolean, combines with any variant) |
| `disabled`                  | `isDisabled`                                       |
| `onClick`                   | `onPress`                                          |
| `startIcon` / `endIcon`     | `iconStart` / `iconEnd`                            |
| lab `LoadingButton loading` | `isPending`                                        |

There is no `danger` variant; use `destructive`:

```typescript
<Button
  variant="primary"
  destructive
  isPending={deleting}
  onPress={handleDelete}
>
  Delete
</Button>
```

### 9. Form Field Changes

**Before (MUI TextField):**

```typescript
<TextField
  required
  name="title"
  label="Title"
  value={value}
  onChange={e => setValue(e.target.value)}
  fullWidth
/>
```

**After (BUI TextField):**

```typescript
<TextField
  isRequired
  name="title"
  label="Title"
  value={value}
  onChange={newValue => setValue(newValue)} // receives string directly!
/>
```

Note: BUI form fields call `onChange` with the value directly, not an event object. `TextField` and `TextAreaField` pass a string, `NumberField` a number, and `Checkbox`/`Switch` a boolean.

**Checkbox and Switch:**

```typescript
<Checkbox
  isSelected={checked}
  isIndeterminate={someSelected}
  onChange={(isSelected) => setChecked(isSelected)}
>
  Label
</Checkbox>
<Switch label="Enabled" isSelected={enabled} onChange={setEnabled} />
```

Prop mapping: `checked` → `isSelected`, `indeterminate` → `isIndeterminate`, `disabled` → `isDisabled`. There are no `error`/`helperText` props on BUI fields; use `isInvalid` and `validate` instead.

### 10. Tabs Pattern

**Before (MUI Tabs):**

```typescript
import { Tab } from '@material-ui/core';
import { TabContext, TabList, TabPanel } from '@material-ui/lab';

<TabContext value={tab}>
  <TabList onChange={handleChange}>
    <Tab label="Tab 1" value="tab1" />
    <Tab label="Tab 2" value="tab2" />
  </TabList>
  <TabPanel value="tab1">Content 1</TabPanel>
  <TabPanel value="tab2">Content 2</TabPanel>
</TabContext>;
```

**After (BUI Tabs):**

```typescript
import { Tabs, TabList, Tab, TabPanel } from '@backstage/ui';

<Tabs defaultSelectedKey="tab1">
  <TabList>
    <Tab id="tab1">Tab 1</Tab>
    <Tab id="tab2">Tab 2</Tab>
  </TabList>
  <TabPanel id="tab1">Content 1</TabPanel>
  <TabPanel id="tab2">Content 2</TabPanel>
</Tabs>;
```

For controlled tabs use `selectedKey` and `onSelectionChange`.

### 11. Menu Pattern

**Before (MUI Menu):**

```typescript
import { IconButton, Popover, MenuList, MenuItem } from '@material-ui/core';
import MoreVertIcon from '@material-ui/icons/MoreVert';

<IconButton onClick={handleOpen}><MoreVertIcon /></IconButton>
<Popover open={open} anchorEl={anchorEl} onClose={handleClose}>
  <MenuList>
    <MenuItem onClick={handleAction}>Action</MenuItem>
  </MenuList>
</Popover>
```

**After (BUI Menu):**

```typescript
import { ButtonIcon, Menu, MenuItem, MenuTrigger } from '@backstage/ui';
import { RiMore2Line } from '@remixicon/react';

<MenuTrigger>
  <ButtonIcon aria-label="more" icon={<RiMore2Line />} variant="secondary" />
  <Menu>
    <MenuItem onAction={handleAction}>Action</MenuItem>
  </Menu>
</MenuTrigger>;
```

No anchor state needed; `MenuTrigger` manages open/close.

### 12. List Pattern

**Before (MUI List):**

```typescript
import { List, ListItem, ListItemIcon, ListItemText } from '@material-ui/core';

<List>
  <ListItem>
    <ListItemIcon>
      <SomeIcon />
    </ListItemIcon>
    <ListItemText primary="Title" secondary="Description" />
  </ListItem>
</List>;
```

**After (BUI List/ListRow):**

```typescript
import { List, ListRow } from '@backstage/ui';
import { RiSomeIcon } from '@remixicon/react';

<List aria-label="Items">
  <ListRow icon={<RiSomeIcon />} description="Description">
    Title
  </ListRow>
</List>;
```

The row's main label goes in `children` (arbitrary content is fine); `description` is the secondary line and `icon` the leading icon. `List` gives you keyboard navigation, selection (`selectionMode`, `onSelectionChange`), and row navigation (`href` on `ListRow`) for free. For a per-row dropdown menu pass `MenuItem` elements to `menuItems`; other right-side actions go in `customActions`:

```typescript
import { List, ListRow, MenuItem } from '@backstage/ui';

<List aria-label="Documents">
  {documents.map(doc => (
    <ListRow
      key={doc.id}
      id={doc.id}
      href={doc.url}
      description={doc.summary}
      menuItems={<MenuItem onAction={() => handleDelete(doc)}>Delete</MenuItem>}
    >
      {doc.title}
    </ListRow>
  ))}
</List>;
```

### 13. Chip to Tag

**Before (MUI Chip):**

```typescript
import { Chip } from '@material-ui/core';

<Chip label="Category" size="small" />;
```

**After (BUI Tag):**

```typescript
import { Tag } from '@backstage/ui';

<Tag size="small">Category</Tag>;
```

For removable chips (`onDelete`), wrap Tags with stable `id`s in a `TagGroup` and use its `onRemove` callback.

### 14. Alert Pattern

**Before (MUI lab Alert):**

```typescript
import { Alert } from '@material-ui/lab';

<Alert severity="error">Something went wrong</Alert>
<Alert severity="info">
  <strong>Heads up</strong> - the sync is still running
</Alert>
```

**After (BUI Alert):**

```typescript
import { Alert } from '@backstage/ui';

<Alert status="danger" title="Something went wrong" />
<Alert
  status="info"
  icon
  title="Heads up"
  description="The sync is still running"
/>
```

Notes:

- The prop is `status`, not `severity`, and MUI's `error` becomes `danger` (valid values: `info`, `success`, `warning`, `danger`).
- Content goes in the `title` and `description` props; `Alert` takes no children.
- `icon` renders the status icon (pass `true` for the default or a custom element).
- For MUI's `action`/`onClose`, pass buttons to `customActions`.

### 15. Table Pattern

**Before (MUI Table):**

```typescript
import {
  Paper,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
} from '@material-ui/core';

<TableContainer component={Paper}>
  <Table>
    <TableHead>
      <TableRow>
        <TableCell>Name</TableCell>
        <TableCell>Owner</TableCell>
      </TableRow>
    </TableHead>
    <TableBody>
      {items.map(item => (
        <TableRow key={item.id}>
          <TableCell>{item.name}</TableCell>
          <TableCell>{item.owner}</TableCell>
        </TableRow>
      ))}
    </TableBody>
  </Table>
</TableContainer>;
```

**After (BUI Table):**

BUI's `Table` is configuration-driven: describe the columns once and pass the data. Rows need an `id` field.

```typescript
import { CellText, Table } from '@backstage/ui';

const columns = [
  {
    id: 'name',
    label: 'Name',
    cell: (item: Item) => <CellText title={item.name} />,
  },
  {
    id: 'owner',
    label: 'Owner',
    cell: (item: Item) => <CellText title={item.owner} color="secondary" />,
  },
];

<Table columnConfig={columns} data={items} pagination={{ type: 'none' }} />;
```

Notes:

- `pagination` is required; `{ type: 'none' }` renders all rows.
- Each `cell` must return a `Cell`, `CellText`, or `CellProfile` element (bare text breaks the layout). `CellText` takes `title`/`description`/`href`; `CellProfile` renders an avatar with `name`/`src`.
- Row links and clicks go through `rowConfig` (`getHref`, `onClick`); selection through `selection`.

**Pagination and sorting via `useTable`:**

Paginated tables no longer need MUI lab. Let `useTable` manage pagination, sorting, and loading state, and spread its `tableProps`:

```typescript
import { CellText, Table, useTable } from '@backstage/ui';

const { tableProps } = useTable({
  mode: 'complete',
  data: items,
  paginationOptions: { pageSize: 10 },
});

<Table columnConfig={columns} {...tableProps} />;
```

Mark columns with `isSortable: true` to get sort headers. For server-side data use `mode: 'offset'` or `mode: 'cursor'` with a `getData` callback; `useTable` handles the page state and passes `offset`/`cursor` to you. A standalone `TablePagination` component exists for fully custom tables built from the low-level parts (`TableRoot`, `TableHeader`, `TableBody`, `Column`, `Row`, `Cell`).

### 16. Autocomplete to Combobox

**Before (MUI lab Autocomplete):**

```typescript
import { Autocomplete } from '@material-ui/lab';
import { TextField } from '@material-ui/core';

<Autocomplete
  options={users}
  getOptionLabel={option => option.name}
  value={selected}
  onChange={(_event, newValue) => setSelected(newValue)}
  renderInput={params => <TextField {...params} label="User" />}
/>;
```

**After (BUI Combobox):**

```typescript
import { useState } from 'react';
import { Combobox, type Key } from '@backstage/ui';

const [selectedId, setSelectedId] = useState<Key | null>(null);

<Combobox
  label="User"
  options={users.map(user => ({ id: user.id, label: user.name }))}
  value={selectedId}
  onChange={id => setSelectedId(id)}
/>;
```

Notes:

- No `renderInput`; the input is built in and labeled via `label`/`placeholder`.
- Options are `{ id, label }` objects (plus optional `description`, `leadingIcon`, `disabled`); `value`/`onChange` work with the selected option's `id`, not the option object.
- Type the selection state as `Key | null` with `Key` imported from `@backstage/ui`; React's own `Key` type includes `bigint` and does not typecheck here.
- For async options, pass the result of `useAsyncList` (re-exported from `@backstage/ui`) as `options`, or use `search: { mode: 'server', ... }` for server-side filtering.
- `Select` follows the same options-driven API; use `Select` when the user picks from a fixed list without typing.

### 17. Icons: MUI Icons to Remix Icons

**Before (MUI Icons):**

```typescript
import CloseIcon from '@material-ui/icons/Close';
import SearchIcon from '@material-ui/icons/Search';

<CloseIcon />
<SearchIcon fontSize="small" />
```

**After (Remix Icons):**

```typescript
import { RiCloseLine, RiSearchLine } from '@remixicon/react';

<RiCloseLine />
<RiSearchLine size={16} />
```

Common icon mappings:

| MUI Icon          | Remix Icon           |
| ----------------- | -------------------- |
| `Close`           | `RiCloseLine`        |
| `Search`          | `RiSearchLine`       |
| `Settings`        | `RiSettingsLine`     |
| `Add`             | `RiAddLine`          |
| `Delete`          | `RiDeleteBinLine`    |
| `Edit`            | `RiEditLine`         |
| `Check`           | `RiCheckLine`        |
| `Error`           | `RiErrorWarningLine` |
| `Warning`         | `RiAlertLine`        |
| `Info`            | `RiInformationLine`  |
| `ExpandMore`      | `RiArrowDownSLine`   |
| `ExpandLess`      | `RiArrowUpSLine`     |
| `ChevronRight`    | `RiArrowRightSLine`  |
| `ChevronLeft`     | `RiArrowLeftSLine`   |
| `Menu`            | `RiMenuLine`         |
| `MoreVert`        | `RiMore2Line`        |
| `Visibility`      | `RiEyeLine`          |
| `VisibilityOff`   | `RiEyeOffLine`       |
| `NewReleases`     | `RiMegaphoneLine`    |
| `RecordVoiceOver` | `RiMegaphoneLine`    |
| `Description`     | `RiFileTextLine`     |

Find more icons at: https://remixicon.com/

## CSS Variable Reference

### Spacing

| MUI theme.spacing()  | BUI CSS Variable     |
| -------------------- | -------------------- |
| `theme.spacing(0.5)` | `var(--bui-space-1)` |
| `theme.spacing(1)`   | `var(--bui-space-2)` |
| `theme.spacing(1.5)` | `var(--bui-space-3)` |
| `theme.spacing(2)`   | `var(--bui-space-4)` |
| `theme.spacing(3)`   | `var(--bui-space-6)` |
| `theme.spacing(4)`   | `var(--bui-space-8)` |

The scale runs `--bui-space-0_5` (2px) through `--bui-space-14` (56px) in 4px steps (half steps use an underscore: `0_5`, `1_5`).

### Colors

| MUI theme.palette    | BUI CSS Variable                                                          |
| -------------------- | ------------------------------------------------------------------------- |
| `text.primary`       | `var(--bui-fg-primary)`                                                   |
| `text.secondary`     | `var(--bui-fg-secondary)`                                                 |
| `text.disabled`      | `var(--bui-fg-disabled)`                                                  |
| `background.default` | `var(--bui-bg-app)`                                                       |
| `background.paper`   | `var(--bui-bg-neutral-1)`                                                 |
| `divider`            | `var(--bui-border-1)`                                                     |
| `primary.main`       | `var(--bui-accent-bg)`                                                    |
| `error.main`         | `var(--bui-fg-negative)` (text/icons) or `var(--bui-negative-bg)` (fills) |
| `warning.main`       | `var(--bui-fg-warning)` or `var(--bui-warning-bg)`                        |
| `success.main`       | `var(--bui-fg-positive)` or `var(--bui-positive-bg)`                      |
| `info.main`          | `var(--bui-fg-announcement)` or `var(--bui-announcement-bg)`              |

Status and accent colors come in five semantic families: `accent`, `announcement` (MUI "info"), `warning`, `negative` (MUI "error"), `positive` (MUI "success"). The status families provide `--bui-<family>-bg`, `--bui-<family>-fg`, and `--bui-<family>-border`, plus `-subdued` variants for tinted backgrounds; `-hover` and `-disabled` states exist on the `bg` tokens. The `accent` family only has `bg` and `fg` tokens (no `-border`, no `-subdued`):

| Use case                         | Token pattern               | Example                          |
| -------------------------------- | --------------------------- | -------------------------------- |
| Solid fill                       | `--bui-<family>-bg`         | `var(--bui-negative-bg)`         |
| Text on solid fill               | `--bui-<family>-fg`         | `var(--bui-negative-fg)`         |
| Tinted background                | `--bui-<family>-bg-subdued` | `var(--bui-negative-bg-subdued)` |
| Text on tinted background        | `--bui-<family>-fg-subdued` | `var(--bui-negative-fg-subdued)` |
| Border                           | `--bui-<family>-border`     | `var(--bui-negative-border)`     |
| Status text on a neutral surface | `--bui-fg-<status>`         | `var(--bui-fg-negative)`         |

Neutral surfaces: `--bui-bg-app` is the page background; `--bui-bg-neutral-1` through `--bui-bg-neutral-4` are nested surface levels (cards, panels). Borders: `--bui-border-1` (subtle, dividers) and `--bui-border-2` (strong, inputs).

Do not use `--bui-bg-surface-*`, bare `--bui-border`, `--bui-fg-link`, `--bui-fg-danger/success/info`, `--bui-bg-solid`, `--bui-bg-danger/warning/success/info`, or any `-tint` token; these are removed or deprecated. MUI's `action.hover` has no non-deprecated equivalent; prefer letting interactive BUI components render their own hover states.

### Typography

| Property                   | BUI CSS Variable                 |
| -------------------------- | -------------------------------- |
| Font family                | `var(--bui-font-regular)`        |
| Monospace font family      | `var(--bui-font-monospace)`      |
| `caption` font size (12px) | `var(--bui-font-size-2)`         |
| `body2` font size (14px)   | `var(--bui-font-size-3)`         |
| `body1` font size (16px)   | `var(--bui-font-size-4)`         |
| Font weight regular        | `var(--bui-font-weight-regular)` |
| Font weight bold           | `var(--bui-font-weight-bold)`    |

The size scale runs `--bui-font-size-1` (10px) through `--bui-font-size-10` (92px); the body default is `--bui-font-size-3` (14px).

### Other

| Property             | BUI CSS Variable         |
| -------------------- | ------------------------ |
| Border radius small  | `var(--bui-radius-2)`    |
| Border radius medium | `var(--bui-radius-3)`    |
| Border radius full   | `var(--bui-radius-full)` |

## Known Limitations

- **Timeline** (`@material-ui/lab`): No BUI equivalent exists. Keep using MUI for it.

## Migration Checklist

When migrating a plugin:

1. [ ] Add `@backstage/ui` dependency
2. [ ] Add `@remixicon/react` dependency pinned `>=4.6.0 <4.9.0` (if using icons)
3. [ ] Add CSS import to `packages/app/src/index.tsx` (only if the workspace has a full dev app; `createDevApp` workspaces need nothing)
4. [ ] Remove `@material-ui/core` imports (except components with no BUI equivalent)
5. [ ] Remove `@material-ui/icons` imports
6. [ ] Remove `@material-ui/lab` imports (Alert, Autocomplete, and Pagination all have BUI equivalents now; Timeline does not)
7. [ ] Remove `makeStyles` and related imports
8. [ ] Create `.module.css` files for component styles
9. [ ] Replace `Typography` with `Text`
10. [ ] Replace `Box display="flex"` with `Flex`
11. [ ] Replace `Grid container/item` with `Grid.Root/Grid.Item`
12. [ ] Replace `Paper` with `Card`
13. [ ] Replace MUI `Dialog` with BUI `Dialog`
14. [ ] Replace MUI `Tooltip` with BUI `TooltipTrigger` + `Tooltip`
15. [ ] Replace MUI `Tabs` with BUI `Tabs`
16. [ ] Replace MUI `Menu` with BUI `MenuTrigger` pattern
17. [ ] Replace MUI `List` with BUI `List`/`ListRow`
18. [ ] Replace MUI lab `Alert` with BUI `Alert` (`severity` → `status`, `error` → `danger`)
19. [ ] Replace MUI `Table` with BUI `Table` (`columnConfig`/`data`/`pagination`, `useTable` for paginated/sorted tables)
20. [ ] Replace MUI lab `Autocomplete` with BUI `Combobox`
21. [ ] Replace `Chip` with `Tag`
22. [ ] Replace `IconButton` with `ButtonIcon`
23. [ ] Update `Button` props (`variant="contained"` → `variant="primary"`, `disabled` → `isDisabled`, `onClick` → `onPress`, loading state → `isPending`)
24. [ ] Update `TextField` props (`required` → `isRequired`, `onChange` signature)
25. [ ] Update `Checkbox`/`Switch` props (`checked` → `isSelected`, `indeterminate` → `isIndeterminate`)
26. [ ] Replace MUI icons with Remix icons
27. [ ] Run `yarn tsc:full` to check for type errors
28. [ ] Run `yarn lint` to check for missing dependencies
29. [ ] Test component rendering and functionality

## Reference

- BUI Documentation: https://ui.backstage.io
- Remix Icons: https://remixicon.com/
- Example Migration PR: https://github.com/backstage/community-plugins/pull/10062
