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
import type { FC } from 'react';

import { useState, useMemo } from 'react';
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
import { Resource } from '@backstage-community/plugin-redhat-argocd-common';
import ResourceMetadata from './resource/ResourceMetadata';
import { useTranslation } from '../../../../hooks/useTranslation';

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

export const ResourcesTableRow: FC<ResourcesTableRowProps> = ({ uid, row }) => {
  const classes = useStyles();
  const [open, setOpen] = useState(false);

  const formattedTimestamp = useMemo(
    () => moment.utc(row?.createTimestamp).local().format('MM/DD/YYYY hh:mm a'),
    [row?.createTimestamp],
  );

  const { t } = useTranslation();

  return (
    <>
      <TableRow className={classes.resourceRow}>
        <TableCell>
          <IconButton
            data-testid={`expander-${uid}`}
            aria-label={t(
              'deploymentLifecycle.sidebar.resources.resourcesTableRow.ariaLabel',
            )}
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
