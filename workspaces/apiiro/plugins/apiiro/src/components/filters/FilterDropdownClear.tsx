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
import Link from '@mui/material/Link';
import Box from '@mui/material/Box';
import { useTheme } from '@mui/material/styles';

interface FilterDropdownClearProps {
  disabled: boolean;
  label: string;
  onClear: () => void;
}

export const FilterDropdownClear = ({
  disabled,
  label,
  onClear,
}: FilterDropdownClearProps) => {
  const theme = useTheme();
  const { text, action } = theme.palette;

  return (
    <Box sx={{ px: 2, py: 1.5 }}>
      <Link
        component="button"
        type="button"
        underline="hover"
        onClick={event => {
          event.preventDefault();
          if (!disabled) {
            onClear();
          }
        }}
        sx={{
          fontSize: 14,
          fontWeight: 500,
          color: disabled ? text.disabled : action.active,
          textDecoration: 'underline',
          textUnderlineOffset: '2px',
          pointerEvents: disabled ? 'none' : 'auto',
          cursor: disabled ? 'default' : 'pointer',
          display: 'block',
          textAlign: 'left',
          width: '100%',
          px: 0, // Remove horizontal padding to align with container
        }}
      >
        {label}
      </Link>
    </Box>
  );
};
