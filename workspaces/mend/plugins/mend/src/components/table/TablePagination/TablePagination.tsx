import type { MouseEvent, ChangeEventHandler } from 'react';
import MaterialTablePagination from '@mui/material/TablePagination';
import type { Theme } from '@mui/material/styles';
import { makeStyles } from '@mui/styles';
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

const useStyles = makeStyles<Theme>(theme => ({
  root: {
    color: theme.palette.mode === 'light' ? '#232F3E' : 'white',
    backgroundColor:
      theme.palette.mode === 'light'
        ? 'white'
        : theme.palette.background.default,
  },
  input: {
    marginRight: 'auto',
  },
  spacer: {
    flex: 'none',
  },
  selectIcon: {
    color: theme.palette.mode === 'light' ? '#232F3E' : 'white',
  },
}));

export const TablePagination = ({
  rowsPerPageOptions,
  colSpan,
  count,
  rowsPerPage,
  page,
  onPageChange,
  onRowsPerPageChange,
}: TablePaginationProps) => {
  const classes = useStyles();
  return (
    <MaterialTablePagination
      component="div"
      classes={classes}
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
