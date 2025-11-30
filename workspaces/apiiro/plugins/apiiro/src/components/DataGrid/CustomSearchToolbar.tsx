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
import { useState, useEffect } from 'react';
import Box from '@mui/material/Box';
import TextField from '@mui/material/TextField';
import InputAdornment from '@mui/material/InputAdornment';
import SearchIcon from '@mui/icons-material/Search';
import ClearIcon from '@mui/icons-material/Clear';
import IconButton from '@mui/material/IconButton';
import { CustomSearchToolbarProps } from './types';

export function CustomSearchToolbar({
  apiRef,
  placeholder,
  customFilters,
}: CustomSearchToolbarProps) {
  // Get initial search value from URL parameter
  const getInitialSearchValue = (): string => {
    if (typeof window !== 'undefined') {
      const urlParams = new URLSearchParams(window.location.search);
      return urlParams.get('search') || '';
    }
    return '';
  };

  const [searchText, setSearchText] = useState<string>(getInitialSearchValue);

  // Initialize search from URL on component mount
  useEffect(() => {
    const initialSearch = getInitialSearchValue();
    if (initialSearch) {
      setSearchText(initialSearch);
      apiRef?.current?.setQuickFilterValues([initialSearch]);
    }
  }, [apiRef]);

  const updateURL = (searchValue: string) => {
    if (typeof window !== 'undefined') {
      const url = new URL(window.location.href);
      if (searchValue) {
        url.searchParams.set('search', searchValue);
      } else {
        url.searchParams.delete('search');
      }
      window.history.replaceState({}, '', url.toString());
    }
  };

  // Debounced URL update effect
  useEffect(() => {
    const handler = setTimeout(() => {
      // Update URL only after 300ms of inactivity
      updateURL(searchText);
    }, 300);

    return () => clearTimeout(handler);
  }, [searchText]);

  const handleSearchChange = (value: string) => {
    setSearchText(value);
    // Use MUI's built-in quick filter API (immediate)
    apiRef?.current?.setQuickFilterValues([value]);
    // URL update is now debounced via useEffect
  };

  const handleClearSearch = () => {
    setSearchText('');
    apiRef?.current?.setQuickFilterValues(['']);
    // URL parameter will be cleared by debounced effect
  };

  return (
    <Box sx={{ py: 2 }}>
      <Box sx={{ display: 'flex', flexDirection: 'column', gap: 1.5 }}>
        <TextField
          placeholder={placeholder}
          value={searchText}
          onChange={e => handleSearchChange(e.target.value)}
          variant="outlined"
          size="small"
          InputProps={{
            sx: {
              borderRadius: '40px !important',
            },
            startAdornment: (
              <InputAdornment position="start">
                <SearchIcon sx={{ color: '#9e9e9e' }} />
              </InputAdornment>
            ),
            endAdornment: searchText && (
              <InputAdornment position="end">
                <IconButton
                  onClick={handleClearSearch}
                  size="small"
                  sx={{ color: '#9e9e9e' }}
                >
                  <ClearIcon fontSize="small" />
                </IconButton>
              </InputAdornment>
            ),
          }}
          sx={{
            minWidth: 300,
            maxWidth: 400,
            '& .MuiOutlinedInput-root': {
              backgroundColor: '#fafafa',
              '& fieldset': {
                borderColor: '#e0e0e0',
              },
              '&:hover fieldset': {
                borderColor: '#bdbdbd',
              },
              '&.Mui-focused fieldset': {
                borderColor: '#1976d2',
              },
            },
          }}
        />
        {customFilters && (
          <Box
            sx={{
              display: 'flex',
              gap: 1,
              alignItems: 'center',
              flexWrap: 'wrap',
            }}
          >
            {customFilters}
          </Box>
        )}
      </Box>
    </Box>
  );
}
