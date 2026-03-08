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
import TextField from '@mui/material/TextField';
import ToggleButton from '@mui/material/ToggleButton';
import ToggleButtonGroup from '@mui/material/ToggleButtonGroup';
import InputAdornment from '@mui/material/InputAdornment';
import IconButton from '@mui/material/IconButton';
import PersonIcon from '@mui/icons-material/Person';
import PeopleIcon from '@mui/icons-material/People';
import SearchIcon from '@mui/icons-material/Search';
import ClearIcon from '@mui/icons-material/Clear';
import { alpha, useTheme } from '@mui/material/styles';

export interface SessionSearchBarProps {
  /** Current search query */
  searchQuery: string;
  /** Update search query */
  onSearchQueryChange: (value: string) => void;
  /** Whether to show all users' conversations (admin only) */
  showAllUsers: boolean;
  /** Toggle show all users (admin only) */
  onShowAllUsersChange: (value: boolean) => void;
  /** Whether the current user has admin privileges */
  isAdmin: boolean;
  /** Whether to show the search field (e.g., when sessions exist) */
  showSearch: boolean;
}

export function SessionSearchBar({
  searchQuery,
  onSearchQueryChange,
  showAllUsers,
  onShowAllUsersChange,
  isAdmin,
  showSearch,
}: SessionSearchBarProps) {
  const theme = useTheme();

  return (
    <>
      {/* Admin toggle: My / All Conversations */}
      {isAdmin && (
        <ToggleButtonGroup
          value={showAllUsers ? 'all' : 'mine'}
          exclusive
          onChange={(_, val) => {
            if (val) onShowAllUsersChange(val === 'all');
          }}
          size="small"
          sx={{
            mb: 1,
            width: '100%',
            '&.MuiToggleButtonGroup-root .MuiToggleButton-root': {
              flex: 1,
              fontSize: '0.7rem',
              textTransform: 'none',
              padding: '3px 8px',
              borderColor: alpha(theme.palette.divider, 0.3),
              '&.Mui-selected': {
                backgroundColor: alpha(theme.palette.primary.main, 0.12),
                color: theme.palette.primary.main,
                fontWeight: 600,
              },
            },
          }}
        >
          <ToggleButton value="mine" aria-label="My conversations">
            <PersonIcon sx={{ fontSize: 14, mr: 0.5 }} />
            Mine
          </ToggleButton>
          <ToggleButton value="all" aria-label="All users' conversations">
            <PeopleIcon sx={{ fontSize: 14, mr: 0.5 }} />
            All Users
          </ToggleButton>
        </ToggleButtonGroup>
      )}

      {/* Search */}
      {showSearch && (
        <TextField
          size="small"
          placeholder="Search conversations..."
          value={searchQuery}
          onChange={e => onSearchQueryChange(e.target.value)}
          fullWidth
          variant="outlined"
          InputProps={{
            startAdornment: (
              <InputAdornment position="start">
                <SearchIcon
                  sx={{ fontSize: 16, color: theme.palette.text.secondary }}
                />
              </InputAdornment>
            ),
            endAdornment: searchQuery ? (
              <InputAdornment position="end">
                <IconButton
                  size="small"
                  onClick={() => onSearchQueryChange('')}
                  aria-label="Clear search"
                  sx={{ p: 0.3 }}
                >
                  <ClearIcon sx={{ fontSize: 14 }} />
                </IconButton>
              </InputAdornment>
            ) : null,
          }}
          sx={{
            mb: 1,
            '& .MuiOutlinedInput-root': {
              fontSize: '0.75rem',
              borderRadius: 2,
              height: 32,
              backgroundColor: alpha(theme.palette.background.default, 0.5),
            },
          }}
        />
      )}
    </>
  );
}
