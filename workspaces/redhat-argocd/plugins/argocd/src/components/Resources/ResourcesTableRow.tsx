import React from 'react';
import { IconButton, makeStyles, TableCell, TableRow } from '@material-ui/core';
import moment from 'moment';
import KeyboardArrowDown from '@material-ui/icons/KeyboardArrowDown';
import KeyboardArrowRight from '@material-ui/icons/KeyboardArrowRight';

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
  },
  tableCell: {
    padding: theme.spacing(1, 2, 1, 0),
  },
}));

export const ResourcesTableRow: React.FC<ResourcesTableRowProps> = ({
  row,
  createdAt,
  open,
  uid,
  setOpen,
}) => {
  const classes = useStyles();

  const handleExpandCollapseClick = () => {
    setOpen(prevState => ({
      ...prevState,
      [uid]: !prevState[uid],
    }));
  };

  return (
    <TableRow className={classes.resourceRow}>
      <TableCell>
        <IconButton
          aria-label="expand row"
          size="small"
          onClick={handleExpandCollapseClick}
        >
          {open ? (
            <KeyboardArrowDown fontSize="small" data-testid="down-arrow" />
          ) : (
            <KeyboardArrowRight fontSize="small" data-testid="right-arrow" />
          )}
        </IconButton>
      </TableCell>
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
