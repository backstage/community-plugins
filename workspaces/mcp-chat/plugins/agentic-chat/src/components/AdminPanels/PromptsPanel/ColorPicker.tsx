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
import React, { useCallback } from 'react';
import Box from '@mui/material/Box';
import TextField from '@mui/material/TextField';
import Tooltip from '@mui/material/Tooltip';

export interface ColorPickerProps {
  readonly value: string | undefined;
  readonly onChange: (color: string) => void;
}

const PRESET_COLORS = [
  '#1976d2',
  '#388e3c',
  '#f57c00',
  '#d32f2f',
  '#7b1fa2',
  '#00838f',
  '#5d4037',
  '#455a64',
] as const;

const SWATCHES_SX = {
  display: 'flex',
  gap: 0.5,
  flexWrap: 'wrap',
} as const;

const ROW_SX = {
  display: 'flex',
  flexDirection: 'column',
  gap: 0.75,
} as const;

function swatchSx(color: string, selected: boolean) {
  return {
    width: 20,
    height: 20,
    borderRadius: '50%',
    backgroundColor: color,
    cursor: 'pointer',
    border: selected ? '2px solid' : '1px solid',
    borderColor: selected ? 'text.primary' : 'divider',
    transition: 'transform 0.1s',
    '&:hover': { transform: 'scale(1.2)' },
    flexShrink: 0,
  } as const;
}

export const ColorPicker: React.FC<ColorPickerProps> = ({
  value,
  onChange,
}) => {
  const handleInputChange = useCallback(
    (e: React.ChangeEvent<HTMLInputElement>) => onChange(e.target.value),
    [onChange],
  );

  return (
    <Box sx={ROW_SX}>
      <TextField
        label="Color"
        size="small"
        value={value || ''}
        onChange={handleInputChange}
        placeholder="#1976d2"
        sx={{ width: 120 }}
      />
      <Box sx={SWATCHES_SX}>
        {PRESET_COLORS.map(color => (
          <Tooltip key={color} title={color} placement="top">
            <Box
              component="button"
              type="button"
              aria-label={`Select color ${color}`}
              sx={swatchSx(color, value === color)}
              onClick={() => onChange(color)}
            />
          </Tooltip>
        ))}
      </Box>
    </Box>
  );
};
