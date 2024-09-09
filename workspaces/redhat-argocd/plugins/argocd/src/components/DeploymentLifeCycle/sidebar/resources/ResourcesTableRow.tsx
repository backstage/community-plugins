import React from 'react';
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
import { OpenRowStatus, Resource } from '../../../../types/application';
import ResourceMetadata from './resource/ResourceMetadata';

type ResourcesTableRowProps = {
  row: Resource;
  createdAt: string;
  open: boolean;
  uid: string;
  setOpen: React.Dispatch<React.SetStateAction<OpenRowStatus>>;
};

const useStyles = makeStyles(theme => ({
  resourceRow: {
    '& > *': { borderBottom: 'unset' },
    '&:first-child': {
      // borderTop: `1px solid ${theme.palette.grey.A100}`,
    },
    '&:nth-of-type(odd)': {
      backgroundColor: 'inherit',
    },
    // boxShadow: '0px 0.5px 2px rgba(0, 0, 0, 0.3)',
    // borderBottom: `1px solid ${theme.palette.grey.A100}`,
  },
  expandedRow: {
    '&:first-child': {
      // borderBottom: `1px solid ${theme.palette.grey.A100}`,
    },
    padding: 10,
  },
  tableCell: {
    padding: theme.spacing(1, 2, 1),
    height: 50,
  },
}));

export const ResourcesTableRow: React.FC<ResourcesTableRowProps> = ({
  uid,
  row,
  createdAt,
}) => {
  const classes = useStyles();
  const [open, setOpen] = React.useState(false);

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
