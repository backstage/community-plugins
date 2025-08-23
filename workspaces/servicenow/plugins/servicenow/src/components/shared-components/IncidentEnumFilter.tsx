/*
 * Copyright 2024 The Backstage Authors
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

import { SelectItem } from '@backstage/core-components';
import Autocomplete from '@mui/material/Autocomplete';
import Box from '@mui/material/Box';
import Checkbox from '@mui/material/Checkbox';
import CheckBoxOutlineBlankIcon from '@mui/icons-material/CheckBoxOutlineBlank';
import CheckBoxIcon from '@mui/icons-material/CheckBox';
import ExpandMoreIcon from '@mui/icons-material/ExpandMore';
import InputLabel from '@mui/material/InputLabel';
import TextField from '@mui/material/TextField';
import {
  INCIDENT_STATE_MAP,
  PRIORITY_MAP,
  renderStatusLabel,
} from '../../utils/incidentUtils';

type SourceMap = Record<number, { label: string }>;

export interface IncidentEnumFilterProps {
  label: string;
  filterKey: string;
  dataMap: SourceMap;
  value: SelectItem[];
  onChange: (event: any, value: SelectItem[]) => void;
}

export const IncidentEnumFilter = ({
  label,
  filterKey,
  dataMap,
  value,
  onChange,
}: IncidentEnumFilterProps) => {
  const items: SelectItem[] = Object.entries(dataMap).map(
    ([key, itemValue]) => ({
      value: key,
      label: itemValue.label,
    }),
  );

  return (
    <Box sx={{ display: 'flex', flexDirection: 'column' }}>
      <InputLabel
        sx={{
          transform: 'initial',
          fontWeight: 'bold',
          fontSize: theme => theme.typography.body2.fontSize,
          fontFamily: theme => theme.typography.fontFamily,
          color: theme => theme.palette.text.primary,
        }}
      >
        {label}
      </InputLabel>
      <Autocomplete
        multiple
        disableCloseOnSelect
        aria-label={label}
        options={items}
        isOptionEqualToValue={(option, val) => option.value === val.value}
        getOptionLabel={option => option.label}
        onChange={onChange}
        renderOption={(renderProps, option, { selected }) => {
          const { key, ...optionProps } = renderProps;
          const statusData =
            filterKey === 'priority'
              ? PRIORITY_MAP[Number(option.value)]
              : INCIDENT_STATE_MAP[Number(option.value)];

          return (
            <li key={key} {...optionProps}>
              <Checkbox
                icon={<CheckBoxOutlineBlankIcon fontSize="small" />}
                checkedIcon={<CheckBoxIcon fontSize="small" />}
                checked={selected}
              />
              {renderStatusLabel(statusData)}
            </li>
          );
        }}
        size="small"
        value={value}
        popupIcon={
          <ExpandMoreIcon
            data-testid={`select-${label.toLowerCase().replace(/\s/g, '-')}`}
          />
        }
        renderInput={params => <TextField {...params} variant="outlined" />}
      />
    </Box>
  );
};
