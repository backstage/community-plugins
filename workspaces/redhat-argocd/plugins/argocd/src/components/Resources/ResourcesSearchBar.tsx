import React from 'react';
import { InputAdornment, TextField } from '@material-ui/core';
import SearchIcon from '@material-ui/icons/Search';
import ClearIcon from '@material-ui/icons/Clear';

interface ResourcesSearchBarProps {
  value: string;
  onChange: (event: React.ChangeEvent<HTMLInputElement>) => void;
  onSearchClear: () => void;
}

export const ResourcesSearchBar: React.FC<ResourcesSearchBarProps> = ({
  value,
  onChange,
  onSearchClear,
}) => {
  return (
    <TextField
      size="small"
      variant="outlined"
      placeholder="Search by kind"
      value={value}
      onChange={onChange}
      style={{ marginLeft: '15px' }}
      InputProps={{
        startAdornment: (
          <InputAdornment position="start">
            <SearchIcon />
          </InputAdornment>
        ),
        endAdornment: (
          <InputAdornment
            position="end"
            aria-label="clear search"
            data-testid="clear-search"
            style={{
              display: value === '' ? 'none' : 'flex',
              cursor: 'pointer',
            }}
            onClick={onSearchClear}
          >
            <ClearIcon />
          </InputAdornment>
        ),
      }}
    />
  );
};
