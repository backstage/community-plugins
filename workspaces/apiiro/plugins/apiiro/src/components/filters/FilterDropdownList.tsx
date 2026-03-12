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
import Checkbox from '@mui/material/Checkbox';
import Divider from '@mui/material/Divider';
import List from '@mui/material/List';
import ListItemButton from '@mui/material/ListItemButton';
import ListItemIcon from '@mui/material/ListItemIcon';
import ListItemText from '@mui/material/ListItemText';
import Typography from '@mui/material/Typography';
import { alpha, useTheme } from '@mui/material/styles';
import { FilterDropdownOption } from './FilterDropdown.types';

interface FilterDropdownListProps {
  options: FilterDropdownOption[];
  selectedValues: Set<string>;
  onToggle: (value: string) => void;
  placeholder?: string;
}

export const FilterDropdownList = ({
  options,
  selectedValues,
  onToggle,
  placeholder,
}: FilterDropdownListProps) => {
  const theme = useTheme();

  return (
    <>
      <List
        disablePadding
        sx={{
          py: 1,
          maxHeight: 220,
          overflowY: 'auto',
        }}
      >
        {options.length === 0 && (
          <Box sx={{ px: 2, py: 1.5 }}>
            <Typography
              variant="body2"
              sx={{ color: theme.palette.text.secondary }}
            >
              {placeholder || 'No results'}
            </Typography>
          </Box>
        )}

        {options.map(option => {
          const checked = selectedValues.has(option.value);
          return (
            <ListItemButton
              key={option.value}
              onClick={() => onToggle(option.value)}
              sx={{
                gap: 1,
                px: 2,
                py: 1,
                '&.Mui-focusVisible': {
                  backgroundColor: 'transparent',
                },
                '&:hover': {
                  backgroundColor: alpha(theme.palette.primary.main, 0.04),
                },
                ...(checked
                  ? {
                      backgroundColor: alpha(theme.palette.primary.main, 0.08),
                    }
                  : {}),
              }}
            >
              <ListItemIcon sx={{ minWidth: 24 }}>
                <Checkbox
                  edge="start"
                  checked={checked}
                  tabIndex={-1}
                  disableRipple
                  sx={{
                    color: theme.palette.divider,
                    '&.MuiSvgIcon-root': {
                      fontSize: 20,
                    },
                    '&.Mui-checked': {
                      color: theme.palette.primary.main,
                    },
                  }}
                />
              </ListItemIcon>
              {option.icon && (
                <Box sx={{ display: 'flex', alignItems: 'center', mr: 1 }}>
                  {option.icon}
                </Box>
              )}
              <ListItemText
                primary={option.label}
                primaryTypographyProps={{
                  fontSize: 14,
                  color: theme.palette.text.primary,
                  fontWeight: 400,
                }}
              />
            </ListItemButton>
          );
        })}
      </List>
      <Divider sx={{ borderColor: theme.palette.divider }} />
    </>
  );
};
