import React from 'react';
import {
  createStyles,
  InputAdornment,
  makeStyles,
  TextField,
} from '@material-ui/core';
import SearchIcon from '@material-ui/icons/Search';
import ClearIcon from '@material-ui/icons/Clear';

const useStyles = makeStyles(theme =>
  createStyles({
    searchInput: {
      border: `1px solid ${theme.palette.grey.A100}`,
      marginLeft: theme.spacing(1.875),
      borderRadius: theme.spacing(0.5),
    },
  }),
);

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
  const classes = useStyles();

  return (
    <TextField
      size="small"
      variant="outlined"
      placeholder="Search by kind"
      value={value}
      onChange={onChange}
      className={classes.searchInput}
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
