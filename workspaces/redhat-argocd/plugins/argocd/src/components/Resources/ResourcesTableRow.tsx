import React from 'react';
import { makeStyles, TableCell, TableRow } from '@material-ui/core';
import moment from 'moment';

import { ResourceSyncStatus } from './ResourcesSyncStatus';
import { ResourceHealthStatus } from './ResourcesHealthStatus';
import { OpenRowStatus, Resource } from '../../types';

type ResourcesTableRowProps = {
  row: Resource;
  createdAt: string;
  open: boolean;
  uid: string;
  setOpen: React.Dispatch<React.SetStateAction<OpenRowStatus>>;
};

const useStyles = makeStyles(theme => ({
  resourceRow: {
    '&:nth-of-type(odd)': {
      backgroundColor: 'inherit',
    },
    boxShadow: '0px 0.5px 2px rgba(0, 0, 0, 0.3)',
    borderBottom: `1px solid ${theme.palette.grey.A100}`,
  },
  tableCell: {
    padding: theme.spacing(1, 2, 1),
    height: 50,
  },
}));

export const ResourcesTableRow: React.FC<ResourcesTableRowProps> = ({
  row,
  createdAt,
}) => {
  const classes = useStyles();

  return (
    <TableRow className={classes.resourceRow}>
      <TableCell className={classes.tableCell} align="left">
        {row.kind}
      </TableCell>
      <TableCell className={classes.tableCell} align="left">
        {moment.utc(createdAt).local().format('MM/DD/YYYY hh:mm a')}
      </TableCell>
      <TableCell className={classes.tableCell} align="left">
        <ResourceSyncStatus syncStatus={row.status} />
      </TableCell>
      <TableCell className={classes.tableCell} align="left">
        <ResourceHealthStatus healthStatus={row.health?.status} />
      </TableCell>
    </TableRow>
  );
};
