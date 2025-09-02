/**
 * ProjectFilterComponent
 *
 * A controlled multi-select filter used to filter entities by project name.
 * - Displays chips for selected projects with ability to delete individually.
 * - Includes an ALL option with mutually-exclusive selection semantics.
 * - Uses Material-UI Select with custom MenuProps for positioning and height.
 *
 * State is owned by the parent; this component receives current selections and
 * a setter via props and renders accordingly.
 */
import {
  Box,
  Checkbox,
  Chip,
  FormControl,
  InputLabel,
  ListItemText,
  MenuItem,
  OutlinedInput,
  Select,
} from '@material-ui/core';
import { SelectItem } from '@backstage/core-components';
import type { MenuProps as MUIMenuProps } from '@material-ui/core/Menu';
import type { ChangeEvent } from 'react';
/**
 * Props for ProjectFilterComponent.
 *
 * projectList:
 *   List of available projects. If not provided or if options are trivial,
 *   the filter hides itself.
 * projectNameFilter:
 *   Currently selected project names. The special ALL_OPTION.value denotes "All".
 * setProjectNameFilter:
 *   Callback to update the selected values in the parent component.
 * projectNameOptions:
 *   Options rendered in the Select dropdown.
 * ALL_OPTION:
 *   Special option representing "All Projects" with shape { label, value }.
 */
type ProjectFilterComponentProps = {
  projectList: { name: string }[] | null | undefined;
  projectNameFilter: string[];
  setProjectNameFilter: (filter: string[]) => void;
  projectNameOptions: SelectItem[];
  ALL_OPTION: { label: string; value: string };
};

const ITEM_HEIGHT = 48;
const ITEM_PADDING_TOP = 8;
/**
 * MUI Menu props for consistent dropdown placement and max height.
 * Note: getContentAnchorEl is set to null to anchor the menu to the bottom
 * edge of the select input (for MUI v4 behavior).
 */
const selectMenuProps: Partial<MUIMenuProps> = {
  PaperProps: {
    style: {
      maxHeight: ITEM_HEIGHT * 4.5 + ITEM_PADDING_TOP,
    },
  },
  // Ensure the menu appears anchored to the bottom edge of the select input
  getContentAnchorEl: null,
  anchorOrigin: {
    vertical: 'bottom',
    horizontal: 'left',
  },
  transformOrigin: {
    vertical: 'top',
    horizontal: 'left',
  },
} as const;

/**
 * Renders a multi-select dropdown for filtering by project name.
 * Hides itself when project data is unavailable or options are insufficient.
 */
export const ProjectFilterComponent: React.FC<ProjectFilterComponentProps> = ({
  projectList,
  projectNameFilter,
  setProjectNameFilter,
  projectNameOptions,
  ALL_OPTION,
}) => {
  // If there is no project data or only trivial options (e.g., ALL + placeholder),
  // do not render the filter.
  if (!projectList || projectNameOptions.length <= 2) {
    return null;
  }

  /**
   * Handles changes from the MUI Select input.
   * Normalizes the event value to a string array and enforces ALL option rules:
   * - Selecting ALL clears other selections.
   * - Selecting another value while ALL is active removes ALL.
   * - Clearing all selections reverts to ALL.
   */
  const handleProjectNameChange = (event: ChangeEvent<{ value: unknown }>) => {
    // SelectedItems can be string or string[]
    const selected = event.target.value;
    const selectedArray = Array.isArray(selected) ? selected : [selected];
    const stringArray = selectedArray.filter(
      (v): v is string => typeof v === 'string',
    );

    // If nothing is selected, set to ALL
    if (stringArray.length === 0) {
      setProjectNameFilter([ALL_OPTION.value]);
      return;
    }

    // If ALL is newly selected (was not in previous selection), set only ALL
    if (
      stringArray.includes(ALL_OPTION.value) &&
      !projectNameFilter.includes(ALL_OPTION.value)
    ) {
      setProjectNameFilter([ALL_OPTION.value]);
      return;
    }

    // If ALL is selected and there are other values, remove ALL and keep the others
    if (stringArray.includes(ALL_OPTION.value) && stringArray.length > 1) {
      setProjectNameFilter(stringArray.filter(v => v !== ALL_OPTION.value));
      return;
    }

    // Otherwise, set selected values
    setProjectNameFilter(stringArray);
  };

  /**
   * Removes a selected project chip. If the last chip is removed,
   * default back to ALL to avoid an empty selection state.
   */
  const handleChipDelete = (chipValue: string) => {
    let tempProject = projectNameFilter.filter(v => v !== chipValue);
    tempProject = tempProject.length === 0 ? [ALL_OPTION.value] : tempProject;
    setProjectNameFilter(tempProject);
  };

  return (
    <FormControl
      variant="outlined"
      margin="dense"
      style={{ minWidth: '30%' }}
      size="small"
    >
      <InputLabel id="multiple-project-filter-label">
        Filter by Project Name
      </InputLabel>
      <Select
        labelId="multiple-project-filter-label"
        id="multiple-project-filter"
        multiple
        value={projectNameFilter}
        onChange={handleProjectNameChange}
        input={
          <OutlinedInput
            id="select-multiple-project"
            label="Filter by Project Name"
          />
        }
        SelectDisplayProps={{ style: { paddingTop: 10, paddingBottom: 10 } }}
        renderValue={selected => {
          const values = Array.isArray(selected)
            ? (selected as string[])
            : [String(selected)];
          return (
            <Box display="flex" flexWrap="wrap">
              {values.map(value =>
                value === ALL_OPTION.value ? (
                  <Chip
                    key={ALL_OPTION.value}
                    label={ALL_OPTION.label}
                    style={{ margin: 2 }}
                  />
                ) : (
                  <Chip
                    key={value}
                    label={value}
                    onMouseDown={e => e.stopPropagation()}
                    onDelete={() => handleChipDelete(value)}
                    style={{ margin: 2 }}
                  />
                ),
              )}
            </Box>
          );
        }}
        MenuProps={selectMenuProps}
      >
        {projectNameOptions.map(item => (
          <MenuItem key={item.label} value={item.value}>
            <Checkbox
              checked={projectNameFilter.includes(item.value.toString())}
              color="primary"
            />
            {item.value === ALL_OPTION.value ? (
              <ListItemText primary={item.label} />
            ) : (
              <ListItemText primary={item.label} />
            )}
          </MenuItem>
        ))}
      </Select>
    </FormControl>
  );
};
