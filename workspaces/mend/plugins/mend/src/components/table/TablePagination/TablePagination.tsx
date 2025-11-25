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
import type { MouseEvent, ChangeEventHandler } from 'react';
import MaterialTablePagination from '@mui/material/TablePagination';
import { useTheme } from '@mui/material/styles';
import { TablePaginationActions } from './TablePaginationActions';

type TablePaginationProps = {
  rowsPerPageOptions?: Array<number | { value: number; label: string }>;
  colSpan: number;
  count: number;
  rowsPerPage: number;
  page: number;
  onPageChange: (
    event: MouseEvent<HTMLButtonElement> | null,
    page: number,
  ) => void;
  onRowsPerPageChange: ChangeEventHandler<
    HTMLTextAreaElement | HTMLInputElement
  >;
};

export const TablePagination = ({
  rowsPerPageOptions,
  colSpan,
  count,
  rowsPerPage,
  page,
  onPageChange,
  onRowsPerPageChange,
}: TablePaginationProps) => {
  const theme = useTheme();
  return (
    <MaterialTablePagination
      component="div"
      sx={{
        color: theme.palette.mode === 'light' ? '#232F3E' : 'white',
        backgroundColor:
          theme.palette.mode === 'light'
            ? 'white'
            : theme.palette.background.default,
        '& .MuiTablePagination-input': {
          marginRight: 'auto',
        },
        '& .MuiTablePagination-spacer': {
          flex: 'none',
        },
        '& .MuiTablePagination-selectIcon': {
          color: theme.palette.mode === 'light' ? '#232F3E' : 'white',
        },
      }}
      rowsPerPageOptions={rowsPerPageOptions}
      colSpan={colSpan}
      count={count}
      rowsPerPage={rowsPerPage}
      page={page}
      onPageChange={onPageChange}
      SelectProps={{
        inputProps: { 'aria-label': 'per page' },
      }}
      onRowsPerPageChange={onRowsPerPageChange}
      ActionsComponent={TablePaginationActions}
      labelDisplayedRows={({ from, to }) => `${from}-${to} of ${count}`}
    />
  );
};
