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
import Box from '@mui/material/Box';
import TextField from '@mui/material/TextField';
import InputAdornment from '@mui/material/InputAdornment';

const HEX_RE = /^#[0-9a-fA-F]{6}$/;

export interface ColorInputProps {
  label: string;
  value: string;
  onChange: (value: string) => void;
  defaultValue?: string;
}

export const ColorInput = ({
  label,
  value,
  onChange,
  defaultValue,
}: ColorInputProps) => {
  const isValid = HEX_RE.test(value);
  const displayColor = isValid ? value : defaultValue ?? '#000000';

  return (
    <TextField
      label={label}
      size="small"
      value={value}
      onChange={e => onChange(e.target.value)}
      error={!!value && !isValid}
      helperText={
        value && !isValid ? 'Must be a hex color (e.g. #1e40af)' : undefined
      }
      sx={{ width: 180 }}
      InputProps={{
        startAdornment: (
          <InputAdornment position="start">
            <Box
              sx={{
                width: 20,
                height: 20,
                borderRadius: '4px',
                backgroundColor: displayColor,
                border: '1px solid',
                borderColor: 'divider',
              }}
            />
          </InputAdornment>
        ),
      }}
    />
  );
};
