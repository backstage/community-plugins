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
import React, { useCallback, useId } from 'react';
import Box from '@mui/material/Box';
import FormControl from '@mui/material/FormControl';
import InputLabel from '@mui/material/InputLabel';
import Select from '@mui/material/Select';
import MenuItem from '@mui/material/MenuItem';
import type { SelectChangeEvent } from '@mui/material/Select';
import { ICON_NAMES, getIconForName } from '../../WelcomeScreen/iconUtils';

export interface IconPickerProps {
  readonly value: string | undefined;
  readonly onChange: (icon: string) => void;
  readonly label?: string;
  readonly size?: 'small' | 'medium';
  readonly sx?: object;
}

const OPTION_SX = {
  display: 'flex',
  alignItems: 'center',
  gap: 1,
  '& svg': { fontSize: 18 },
} as const;

const RENDER_SX = {
  display: 'flex',
  alignItems: 'center',
  gap: 0.75,
  '& svg': { fontSize: 16 },
} as const;

export const IconPicker: React.FC<IconPickerProps> = ({
  value,
  onChange,
  label = 'Icon',
  size = 'small',
  sx,
}) => {
  const labelId = useId();

  const handleChange = useCallback(
    (e: SelectChangeEvent<string>) => onChange(e.target.value),
    [onChange],
  );

  const renderValue = useCallback(
    (selected: string) => (
      <Box sx={RENDER_SX}>
        {getIconForName(selected)}
        {selected}
      </Box>
    ),
    [],
  );

  return (
    <FormControl size={size} sx={sx}>
      <InputLabel id={labelId}>{label}</InputLabel>
      <Select
        labelId={labelId}
        value={value || ''}
        onChange={handleChange}
        label={label}
        renderValue={renderValue}
      >
        {ICON_NAMES.map(name => (
          <MenuItem key={name} value={name}>
            <Box sx={OPTION_SX}>
              {getIconForName(name)}
              {name}
            </Box>
          </MenuItem>
        ))}
      </Select>
    </FormControl>
  );
};
