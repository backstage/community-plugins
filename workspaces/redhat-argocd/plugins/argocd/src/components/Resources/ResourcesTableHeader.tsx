import React from 'react';
import {
  makeStyles,
  TableCell,
  TableHead,
  TableRow,
  TableSortLabel,
} from '@material-ui/core';

import { ResourcesColumnHeaders } from './ResourcesColumnHeader';
import { Order } from '../../types';

type ResourcesTableProps = {
  onRequestSort: (
    event: React.MouseEvent<unknown>,
    property: string,
    id: string,
  ) => void;
  order: Order;
  orderBy: string | null;
  orderById: string | null;
};

const useStyles = makeStyles(theme => ({
  header: {
    padding: theme.spacing(1, 2, 1, 0),
    fontWeight: 'bold',
    color: theme.palette.text.primary,
  },
  expander: {
    width: '80px',
  },
}));

export const ResourcesTableHeader = ({
  order,
  orderBy,
  orderById,
  onRequestSort,
}: ResourcesTableProps) => {
  const createSortHandler =
    (property: string, id: string) => (event: React.MouseEvent<unknown>) => {
      onRequestSort(event, property, id);
    };
  const classes = useStyles();

  return (
    <TableHead>
      <TableRow>
        {ResourcesColumnHeaders.map((headCell, index) => {
          return (
            <TableCell
              className={
                headCell.id !== 'expander' ? classes.header : classes.expander
              }
              key={headCell.id as string}
              align="left"
              padding="normal"
              sortDirection={
                orderBy === headCell.title ? headCell.defaultSort : false
              }
            >
              {headCell.title ? (
                <TableSortLabel
                  active={
                    orderBy === headCell.title && orderById === headCell.id
                  }
                  direction={order}
                  onClick={createSortHandler(
                    headCell.title as string,
                    index.toString() as string,
                  )}
                >
                  {headCell.title}
                </TableSortLabel>
              ) : (
                <></>
              )}
            </TableCell>
          );
        })}
      </TableRow>
    </TableHead>
  );
};
