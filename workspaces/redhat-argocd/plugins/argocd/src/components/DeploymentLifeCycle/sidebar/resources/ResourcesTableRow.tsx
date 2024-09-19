import React, { useMemo } from 'react';
import {
  Box,
  Collapse,
  IconButton,
  makeStyles,
  TableCell,
  TableRow,
} from '@material-ui/core';
import moment from 'moment';
import KeyboardArrowDownIcon from '@mui/icons-material/KeyboardArrowDown';
import KeyboardArrowUpIcon from '@mui/icons-material/KeyboardArrowUp';

import { ResourceSyncStatus } from './ResourcesSyncStatus';
import { ResourceHealthStatus } from './ResourcesHealthStatus';
import { Resource } from '../../../../types/application';
import ResourceMetadata from './resource/ResourceMetadata';

type ResourcesTableRowProps = {
  uid: string;
  row: Resource;
};

const useStyles = makeStyles(theme => ({
  resourceRow: {
    '& > *': { borderBottom: 'unset' },
    '&:nth-of-type(odd)': {
      backgroundColor: 'inherit',
    },
  },
  expandedRow: {
    padding: 10,
  },
  tableCell: {
    padding: theme.spacing(1, 0),
    height: 50,
  },
  icon: {
    marginLeft: theme.spacing(0.6),
    width: '0.8em',
    height: '0.8em',
  },
}));

export const ResourcesTableRow: React.FC<ResourcesTableRowProps> = ({
  uid,
  row,
}) => {
  const classes = useStyles();
  const [open, setOpen] = React.useState(false);

  const formattedTimestamp = useMemo(
    () => moment.utc(row?.createTimestamp).local().format('MM/DD/YYYY hh:mm a'),
    [row?.createTimestamp],
  );

  return (
    <>
      <TableRow className={classes.resourceRow}>
        <TableCell>
          <IconButton
            data-testid={`expander-${uid}`}
            aria-label="expand row"
            size="small"
            onClick={() => setOpen(!open)}
          >
            {open ? <KeyboardArrowUpIcon /> : <KeyboardArrowDownIcon />}
          </IconButton>
        </TableCell>
        <TableCell className={classes.tableCell} align="left">
          {row.name}
        </TableCell>
        <TableCell className={classes.tableCell} align="left">
          {row.kind}
        </TableCell>
        <TableCell className={classes.tableCell} align="left">
          {row?.createTimestamp ? formattedTimestamp : <>-</>}
        </TableCell>
        <TableCell className={classes.tableCell} align="left">
          {row.status && <ResourceSyncStatus syncStatus={row.status} />}
        </TableCell>
        <TableCell className={classes.tableCell} align="left">
          {row.health?.status && (
            <ResourceHealthStatus healthStatus={row.health?.status} />
          )}
        </TableCell>
      </TableRow>
      <TableRow className={classes.expandedRow}>
        <TableCell style={{ paddingBottom: 0, paddingTop: 0 }} colSpan={6}>
          <Collapse in={open} timeout="auto" unmountOnExit>
            <Box sx={{ margin: 10 }}>
              <ResourceMetadata resource={row} />
            </Box>
          </Collapse>
        </TableCell>
      </TableRow>
    </>
  );
};
