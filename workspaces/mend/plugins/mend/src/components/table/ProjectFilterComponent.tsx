/*
 * Copyright 2025 The Backstage Authors
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *     http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */

import FormControl from '@mui/material/FormControl';
import InputLabel from '@mui/material/InputLabel';
import MenuItem from '@mui/material/MenuItem';
import Select from '@mui/material/Select';
import Typography from '@mui/material/Typography';
import Tooltip from '@mui/material/Tooltip';
import type { SelectItem } from '@backstage/core-components';
import type { MenuProps as MUIMenuProps } from '@mui/material/Menu';
import type { SelectChangeEvent } from '@mui/material/Select';
/**
 * Props for ProjectFilterComponent.
 *
 * projectList:
 *   List of available projects. If not provided or if options are trivial,
 *   the filter hides itself.
 * projectIdFilter:
 *   Currently selected project ID/UUID.
 * setProjectIdFilter:
 *   Callback to update the selected value in the parent component.
 * projectOptions:
 *   Options rendered in the Select dropdown.
 */
type ProjectFilterComponentProps = {
  projectList: { name: string }[] | null | undefined;
  projectIdFilter: string;
  setProjectIdFilter: (filter: string) => void;
  projectOptions: SelectItem[];
};

const ITEM_HEIGHT = 48;
const ITEM_PADDING_TOP = 8;
/**
 * MUI Menu props for consistent dropdown placement and max height.
 * anchor the menu using anchorOrigin and transformOrigin.
 */
const selectMenuProps: Partial<MUIMenuProps> = {
  PaperProps: {
    style: {
      maxHeight: ITEM_HEIGHT * 4.5 + ITEM_PADDING_TOP,
    },
  },
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
 * Renders a single-select dropdown for filtering by project name.
 * Hides itself when project data is unavailable, only one project exists, or no options available.
 */
export const ProjectFilterComponent: React.FC<ProjectFilterComponentProps> = ({
  projectList,
  projectIdFilter,
  setProjectIdFilter,
  projectOptions,
}) => {
  // If there is no project data, no options available, or only one project,
  // do not render the filter.
  if (
    !projectList ||
    projectOptions.length === 0 ||
    projectOptions.length === 1
  ) {
    return null;
  }

  /**
   * Handles changes from the MUI Select input.
   */
  const handleProjectIdChange = (event: SelectChangeEvent<string>) => {
    const selected = event.target.value;
    setProjectIdFilter(selected);
  };

  return (
    <Tooltip
      title={
        <Typography
          component="span"
          display="block"
          sx={{
            textTransform: 'none',
            lineHeight: '16px',
            fontWeight: 'revert',
            padding: '5px',
          }}
          align="center"
          variant="overline"
        >
          For this repository multiple projects exist within Mend. You can
          select a project you are interested in by project name.
          <br />
          e.g. to investigate results of a specific branch.
        </Typography>
      }
      placement="right"
    >
      <FormControl
        variant="outlined"
        margin="dense"
        style={{ minWidth: '30%' }}
        size="small"
      >
        <InputLabel id="project-filter-label">
          Filter by Project Name
        </InputLabel>
        <Select
          labelId="project-filter-label"
          id="project-filter"
          value={projectIdFilter}
          onChange={handleProjectIdChange}
          label="Filter by Project Name"
          MenuProps={selectMenuProps}
        >
          {projectOptions.map(item => (
            <MenuItem key={item.label} value={item.value}>
              {item.label}
            </MenuItem>
          ))}
        </Select>
      </FormControl>
    </Tooltip>
  );
};
