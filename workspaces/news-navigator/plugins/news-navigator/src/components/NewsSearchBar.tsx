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
import React from 'react';
import { TextField, InputAdornment } from '@material-ui/core';
import SearchIcon from '@material-ui/icons/Search';
import CloseIcon from '@material-ui/icons/Close';
import { QueryClient } from '@tanstack/react-query';

interface NewsSearchBarProps {
  searchText: string;
  setSearchText: (text: string) => void;
  setSearchSubmitted: (submitted: boolean) => void;
  queryClient: QueryClient;
}

export const NewsSearchBar: React.FC<NewsSearchBarProps> = ({
  searchText,
  setSearchText,
  setSearchSubmitted,
  queryClient,
}) => {
  const handleKeyPress = (event: { key: string }) => {
    if (event.key === 'Enter') {
      setSearchSubmitted(true);
      queryClient.invalidateQueries({ queryKey: ['search-news'] });
    }
  };

  return (
    <TextField
      fullWidth
      placeholder="Search news"
      variant="outlined"
      size="medium"
      value={searchText}
      onChange={e => setSearchText(e.target.value)} // Update the state with the typed value
      onKeyDown={handleKeyPress} // Listen for "Enter" key press
      InputProps={{
        startAdornment: (
          <InputAdornment position="start">
            <SearchIcon />
          </InputAdornment>
        ),
        endAdornment: searchText ? (
          <InputAdornment position="end">
            <CloseIcon
              style={{ cursor: 'pointer' }}
              onClick={() => {
                setSearchText('');
                setSearchSubmitted(false);
              }}
            />
          </InputAdornment>
        ) : null,
      }}
    />
  );
};
