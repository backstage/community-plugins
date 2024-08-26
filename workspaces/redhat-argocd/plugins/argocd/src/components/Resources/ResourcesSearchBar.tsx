import React from 'react';
import { InputAdornment, TextField } from '@material-ui/core';
import SearchIcon from '@material-ui/icons/Search';
import ClearIcon from '@material-ui/icons/Clear';

type ResourcesSearchBarProps = {
  value: string;
  onChange: (value: any) => void;
  onSearchClear: (value: any) => void;
};

export const ResourcesSearchBar = ({
  value,
  onChange,
  onSearchClear,
}: ResourcesSearchBarProps) => {
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
