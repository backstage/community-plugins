import React from 'react';
import {
  makeStyles,
  TableCell,
  TableHead,
  TableRow,
  TableSortLabel,
} from '@material-ui/core';

import { ResourcesColumnHeaders } from './ResourcesColumnHeader';
import { Order } from '../../../../types/application';

interface ResourcesTableHeaderProps {
  onRequestSort: (
    event: React.MouseEvent<unknown>,
    property: string,
    id: string,
  ) => void;
  order: Order;
  orderBy: string | null;
  orderById: string | null;
}

const useStyles = makeStyles(theme => ({
  header: {
    padding: theme.spacing(1, 2, 1),
    fontWeight: 'bold',
    color: theme.palette.text.primary,
  },
  expander: {
    width: '80px',
  },
}));

export const ResourcesTableHeader: React.FC<ResourcesTableHeaderProps> = ({
  order,
  orderBy,
  orderById,
  onRequestSort,
}) => {
  const classes = useStyles();

  const createSortHandler =
    (property: string, id: string) => (event: React.MouseEvent<unknown>) => {
      onRequestSort(event, property, id);
    };

  return (
    <TableHead>
      <TableRow>
        {ResourcesColumnHeaders.map((headCell, index) => {
          return (
            <TableCell
              key={headCell.id as string}
              align="left"
              padding="normal"
              sortDirection={orderBy === headCell.title ? order : false}
              className={
                headCell.id !== 'expander' ? classes.header : classes.expander
              }
            >
              {headCell.title && (
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
              )}
            </TableCell>
          );
        })}
      </TableRow>
    </TableHead>
  );
};
