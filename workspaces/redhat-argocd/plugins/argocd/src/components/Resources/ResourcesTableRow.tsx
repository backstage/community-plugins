import React from 'react';
import { IconButton, makeStyles, TableCell, TableRow } from '@material-ui/core';
import moment from 'moment';
import KeyboardArrowDown from '@material-ui/icons/KeyboardArrowDown';
import KeyboardArrowRight from '@material-ui/icons/KeyboardArrowRight';

import { ResourceSyncStatus } from './ResourcesSyncStatus';
import { ResourceHealthStatus } from './ResourcesHealthStatus';
import { OpenRowStatus } from '../../types';
// import { ResourcesKebabMenuOptions } from './ResourcesKebabMenuOptions';

type ResourcesTableRowProps = {
  row: any;
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

export const ResourcesTableRow = ({
  row,
  createdAt,
  open,
  uid,
  setOpen,
}: ResourcesTableRowProps) => {
  const classes = useStyles();

  const expandCollapseClickHandler = () => {
    setOpen((val: OpenRowStatus) => {
      return {
        ...val,
        ...(uid && {
          [uid]: !val[uid],
        }),
      };
    });
  };

  return (
    <TableRow className={classes.resourceRow}>
      <TableCell>
        <IconButton
          aria-label="expand row"
          size="small"
          onClick={expandCollapseClickHandler}
        >
          {open ? (
            <KeyboardArrowDown fontSize="small" />
          ) : (
            <KeyboardArrowRight fontSize="small" />
          )}
        </IconButton>
      </TableCell>
      <TableCell className={classes.tableCell} align="left">
        {row?.kind}
      </TableCell>
      <TableCell className={classes.tableCell} align="left">
        --
      </TableCell>
      <TableCell className={classes.tableCell} align="left">
        {moment(createdAt).format('MM/DD/YYYY hh:mm A')}
      </TableCell>
      <TableCell className={classes.tableCell} align="left">
        <ResourceSyncStatus syncStatus={row?.status} />
      </TableCell>
      <TableCell className={classes.tableCell} align="left">
        <ResourceHealthStatus healthStatus={row?.health?.status} />
      </TableCell>
      {/* <TableCell>
        <ResourcesKebabMenuOptions />
      </TableCell> */}
    </TableRow>
  );
};
