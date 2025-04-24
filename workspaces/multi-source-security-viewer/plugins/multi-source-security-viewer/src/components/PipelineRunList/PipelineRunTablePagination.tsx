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
import type { FC, ChangeEvent } from 'react';

import { useState, useMemo, useEffect, Fragment } from 'react';
import {
  Box,
  IconButton,
  MenuItem,
  Select,
  TextField,
  Typography,
  makeStyles,
} from '@material-ui/core';
import {
  FirstPage,
  LastPage,
  NavigateBefore,
  NavigateNext,
} from '@mui/icons-material';

type PipelineRunTablePaginationProps = {
  count: number;
  page: number;
  rowSize: number[];
  rowsPerPage: number;
  handleChangePage: (newPage: number) => void;
  handleChangeRowsPerPage: (rows: number) => void;
};

const useStyles = makeStyles(() => ({
  actionsBox: {
    display: 'flex',
    alignItems: 'center',
  },
  typography: {
    fontSize: '1rem',
  },
}));

export const PipelineRunTablePagination: FC<
  PipelineRunTablePaginationProps
> = ({
  count,
  page,
  rowSize,
  rowsPerPage,
  handleChangePage,
  handleChangeRowsPerPage,
}) => {
  const classes = useStyles();
  const [pageInput, setPageInput] = useState('1');

  const handleRowsChange = (event: ChangeEvent<{ value: any }>) => {
    handleChangeRowsPerPage(parseInt(event.target.value, 10));
  };

  const totalPages = useMemo(
    () => Math.ceil(count / rowsPerPage),
    [count, rowsPerPage],
  );

  const previousPage = useMemo(() => page - 1, [page]);
  const nextPage = useMemo(() => page + 1, [page]);
  const firstPage = useMemo(() => 0, []);
  const lastPage = useMemo(() => totalPages - 1, [totalPages]);
  const isFirstPage = useMemo(() => page === 0, [page]);
  const isLastPage = useMemo(() => page === totalPages - 1, [totalPages, page]);

  const selectItemText = useMemo(() => {
    // display for ex: 1 - 10 of 100
    return `${page === 0 ? 1 : page * rowsPerPage + 1} - ${
      rowsPerPage * (page + 1) > count ? count : rowsPerPage * (page + 1)
    } of ${count}`;
  }, [count, page, rowsPerPage]);

  const handleInputChange = (value: string) => {
    const newPage = parseInt(value, 10);
    if (newPage > 0 && newPage <= totalPages) {
      handleChangePage(newPage - 1); // -1 as page is 0-indexed
    }
    setPageInput(isNaN(newPage) ? '' : newPage.toString());
  };

  useEffect(() => {
    setPageInput((page + 1).toString());
  }, [page]);

  return (
    <Fragment>
      <Box className={classes.actionsBox} data-testid="pipeline-run-pagination">
        <Select
          variant="standard"
          renderValue={() => selectItemText}
          value={rowsPerPage}
          aria-label="rows per page"
          data-testid="rows-per-page"
          autoWidth
          disableUnderline
          displayEmpty
          onChange={handleRowsChange}
          inputProps={{
            style: { minWidth: 0, padding: 0 },
          }}
        >
          {rowSize.map(size => (
            <MenuItem key={size} value={size}>
              {size} per page
            </MenuItem>
          ))}
        </Select>

        <IconButton
          onClick={() => handleChangePage(firstPage)}
          disabled={isFirstPage}
          aria-label="first page"
          data-testid="first-page"
          size="small"
        >
          <FirstPage />
        </IconButton>
        <IconButton
          onClick={() => handleChangePage(previousPage)}
          disabled={isFirstPage}
          aria-label="previous page"
          data-testid="previous-page"
          size="small"
        >
          <NavigateBefore />
        </IconButton>
        <TextField
          size="small"
          value={pageInput}
          variant="outlined"
          aria-label="page number"
          aria-describedby="page-number"
          id="page-number-input"
          data-testid="page-number"
          style={{ marginRight: '0.5rem' }}
          onChange={e => handleInputChange(e.target.value)}
          inputProps={{
            style: { textAlign: 'center', width: '2rem' },
          }}
        />
        <Typography variant="body2" style={{ fontSize: '1rem' }}>
          of {totalPages}
        </Typography>
        <IconButton
          onClick={() => handleChangePage(nextPage)}
          disabled={isLastPage}
          aria-label="next page"
          data-testid="next-page"
          size="small"
        >
          <NavigateNext />
        </IconButton>
        <IconButton
          onClick={() => handleChangePage(lastPage)}
          disabled={isLastPage}
          aria-label="last page"
          data-testid="last-page"
          size="small"
        >
          <LastPage />
        </IconButton>
      </Box>
    </Fragment>
  );
};
