/*
 * Copyright 2024 The Backstage Authors
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
import {
  FormControl,
  InputAdornment,
  makeStyles,
  MenuItem,
  Select,
  Theme,
} from '@material-ui/core';
import { Search, FilterAlt } from '@mui/icons-material';
import Input from '@mui/material/Input';
import type { ForwardedRef, FC } from 'react';
import { Fragment } from 'react';
import Grid from '@mui/material/Grid';
import { PipelineRunTablePagination } from './PipelineRunTablePagination';

type PipelineRunToolbarProps = {
  onSearch: (search: string) => void;
  searchInputRef: ForwardedRef<HTMLInputElement>;
  page: number;
  rowSize: number[];
  rowsPerPage: number;
  totalCount: number;
  handleChangePage: (newPage: number) => void;
  handleChangeRowsPerPage: (rows: number) => void;
};

const useStyles = makeStyles((theme: Theme) => ({
  formControl: {
    padding: theme.spacing(0, 2),
  },
  toolbar: {
    marginLeft: theme.spacing(0), // reset container
  },
  searchInput: {
    border: `1px solid ${theme.palette.divider}`,
    borderRadius: '4px',
    width: '200%',
    backgroundColor: theme.palette.background.paper,
    paddingBlockStart: theme.spacing(1),
    paddingBlockEnd: theme.spacing(1),
  },
  pagination: {
    padding: theme.spacing(0, 1),
    justifyContent: 'flex-end',
  },
}));

export const PipelineRunToolbar: FC<PipelineRunToolbarProps> = ({
  onSearch,
  searchInputRef,
  page,
  rowSize,
  rowsPerPage,
  totalCount,
  handleChangePage,
  handleChangeRowsPerPage,
}) => {
  const classes = useStyles();

  return (
    <Fragment>
      <Grid container className={classes.toolbar}>
        <FormControl className={classes.formControl}>
          <Grid container>
            <Grid item xs={6}>
              <Select
                fullWidth
                value="Name"
                className={classes.searchInput}
                readOnly
                startAdornment={
                  <InputAdornment position="start">
                    <FilterAlt />
                  </InputAdornment>
                }
              >
                <MenuItem value="Name">Name</MenuItem>
              </Select>
            </Grid>
            <Grid item xs={6}>
              <Input
                inputRef={searchInputRef}
                fullWidth
                className={classes.searchInput}
                aria-label="search"
                placeholder="Search by name"
                data-testid="pipeline-run-toolbar-input"
                onChange={e => onSearch(e.target.value)}
                startAdornment={
                  <InputAdornment position="start">
                    <Search />
                  </InputAdornment>
                }
              />
            </Grid>
          </Grid>
        </FormControl>
      </Grid>
      <Grid container className={classes.pagination}>
        <PipelineRunTablePagination
          count={totalCount}
          page={page}
          rowSize={rowSize}
          rowsPerPage={rowsPerPage}
          handleChangePage={handleChangePage}
          handleChangeRowsPerPage={handleChangeRowsPerPage}
        />
      </Grid>
    </Fragment>
  );
};
