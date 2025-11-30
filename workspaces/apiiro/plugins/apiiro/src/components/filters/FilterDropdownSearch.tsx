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
import InputAdornment from '@mui/material/InputAdornment';
import TextField from '@mui/material/TextField';
import IconButton from '@mui/material/IconButton';
import SearchIcon from '@mui/icons-material/Search';
import ClearIcon from '@mui/icons-material/Clear';
import { alpha, useTheme } from '@mui/material/styles';

interface FilterDropdownSearchProps {
  value: string;
  onChange: (value: string) => void;
  placeholder: string;
}

export const FilterDropdownSearch = ({
  value,
  onChange,
  placeholder,
}: FilterDropdownSearchProps) => {
  const theme = useTheme();

  const handleClear = () => {
    onChange('');
  };

  return (
    <TextField
      fullWidth
      value={value}
      onChange={event => onChange(event.target.value)}
      placeholder={placeholder}
      size="small"
      InputProps={{
        startAdornment: (
          <InputAdornment position="start">
            <SearchIcon
              sx={{
                fontSize: 18,
                color: theme.palette.text.secondary,
              }}
            />
          </InputAdornment>
        ),
        endAdornment: value ? (
          <InputAdornment position="end">
            <IconButton
              onClick={handleClear}
              size="small"
              sx={{ color: '#9e9e9e' }}
            >
              <ClearIcon fontSize="small" />
            </IconButton>
          </InputAdornment>
        ) : null,
        sx: {
          borderRadius: '10px',
          backgroundColor: alpha(theme.palette.background.default, 0.6),
          '& .MuiOutlinedInput-notchedOutline': {
            borderColor: alpha(theme.palette.divider, 0.6),
          },
          '&:hover .MuiOutlinedInput-notchedOutline': {
            borderColor: alpha(theme.palette.primary.main, 0.4),
          },
          '&.Mui-focused .MuiOutlinedInput-notchedOutline': {
            borderColor: theme.palette.primary.main,
          },
        },
      }}
      inputProps={{ sx: { fontSize: 14 } }}
    />
  );
};
