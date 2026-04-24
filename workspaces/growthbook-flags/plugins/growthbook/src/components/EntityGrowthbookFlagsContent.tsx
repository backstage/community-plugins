/*
 * Copyright 2026 The Backstage Authors
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
import { useMemo, useState } from 'react';
import { useEntity } from '@backstage/plugin-catalog-react';
import { useApi } from '@backstage/core-plugin-api';
import { Progress, ResponseErrorPanel } from '@backstage/core-components';
import useAsync from 'react-use/lib/useAsync';
import {
  Box,
  Button,
  ButtonGroup,
  Chip,
  Dialog,
  DialogContent,
  DialogTitle,
  IconButton,
  makeStyles,
  Paper,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Tooltip,
  Typography,
} from '@material-ui/core';
import CloseIcon from '@material-ui/icons/Close';
import { growthbookFlagsApiRef } from '../api';
import type {
  FlagRow,
  FlagType,
} from '@backstage-community/plugin-growthbook-common';

const ALL_PROJECTS = 'All';

const TYPE_COLOURS: Record<FlagType, 'default' | 'primary' | 'secondary'> = {
  boolean: 'primary',
  number: 'secondary',
  string: 'default',
  json: 'default',
  null: 'default',
};

const useStyles = makeStyles(theme => ({
  table: {
    minWidth: 600,
  },
  clickableRow: {
    cursor: 'pointer',
    '&:hover': {
      backgroundColor: theme.palette.action.hover,
    },
  },
  mono: {
    fontFamily: 'monospace',
    fontSize: '0.82rem',
  },
  preBlock: {
    backgroundColor: theme.palette.background.default,
    padding: theme.spacing(2),
    borderRadius: theme.spacing(0.5),
    overflowX: 'auto',
    fontFamily: 'monospace',
    fontSize: '0.82rem',
    margin: 0,
  },
  closeButton: {
    position: 'absolute',
    right: theme.spacing(1),
    top: theme.spacing(1),
  },
  emptyRow: {
    padding: theme.spacing(3),
    textAlign: 'center',
  },
  toolbar: {
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: theme.spacing(2),
    flexWrap: 'wrap',
    gap: theme.spacing(1),
  },
  activeBtn: {
    backgroundColor: theme.palette.primary.main,
    color: theme.palette.primary.contrastText,
    '&:hover': {
      backgroundColor: theme.palette.primary.dark,
    },
  },
}));

function FlagDetailDialog({
  flag,
  open,
  onClose,
}: {
  flag: FlagRow | null;
  open: boolean;
  onClose: () => void;
}) {
  const classes = useStyles();
  if (!flag) return null;

  return (
    <Dialog open={open} onClose={onClose} maxWidth="md" fullWidth>
      <DialogTitle>
        {flag.key}
        <IconButton
          className={classes.closeButton}
          onClick={onClose}
          size="small"
          aria-label="Close dialog"
        >
          <CloseIcon />
        </IconButton>
      </DialogTitle>
      <DialogContent dividers>
        <Typography variant="subtitle2" gutterBottom>
          Type:{' '}
          <Chip
            size="small"
            label={flag.type}
            color={TYPE_COLOURS[flag.type]}
          />
        </Typography>
        <Typography variant="subtitle2" gutterBottom>
          Default value:
        </Typography>
        <pre className={classes.preBlock}>
          {flag.valuePretty ?? flag.valuePreview}
        </pre>
      </DialogContent>
    </Dialog>
  );
}

/** @public */
export const GROWTHBOOK_ENABLED_ANNOTATION = 'growthbook.io/enabled';
/** @public */
export const GROWTHBOOK_ENV_ANNOTATION = 'growthbook.io/env';
/** @public */
export const GROWTHBOOK_PROJECT_ANNOTATION = 'growthbook.io/project';

/** @public */
export function isGrowthbookAvailable(entity: {
  metadata: { annotations?: Record<string, string> };
}) {
  return (
    entity.metadata.annotations?.[GROWTHBOOK_ENABLED_ANNOTATION] === 'true'
  );
}

/** @public */
export function EntityGrowthbookFlagsContent() {
  const classes = useStyles();
  const { entity } = useEntity();
  const api = useApi(growthbookFlagsApiRef);
  const [selectedFlag, setSelectedFlag] = useState<FlagRow | null>(null);

  const env =
    entity.metadata.annotations?.[GROWTHBOOK_ENV_ANNOTATION] ?? 'prod';
  const annotationProject =
    entity.metadata.annotations?.[GROWTHBOOK_PROJECT_ANNOTATION];

  const [selectedProject, setSelectedProject] = useState<string>(
    annotationProject ?? ALL_PROJECTS,
  );

  const { value: projects } = useAsync(() => api.getProjects(), []);

  const hasProjectSupport = projects && projects.length > 0;

  const projectFilter = hasProjectSupport
    ? annotationProject ??
      (selectedProject === ALL_PROJECTS ? undefined : selectedProject)
    : undefined;

  const {
    value: flags,
    loading,
    error,
  } = useAsync(() => api.getFlags(env, projectFilter), [env, projectFilter]);

  const sortedFlags = useMemo(
    () => (flags ? [...flags].sort((a, b) => a.key.localeCompare(b.key)) : []),
    [flags],
  );

  const projectOptions = [ALL_PROJECTS, ...(projects ?? [])];

  if (loading) return <Progress />;
  if (error) return <ResponseErrorPanel error={error} />;

  return (
    <>
      <div className={classes.toolbar}>
        <Box display="flex" alignItems="center" gridGap={8} flexWrap="wrap">
          {hasProjectSupport && (
            <>
              <Typography variant="body2" color="textSecondary">
                Project:
              </Typography>
              {annotationProject ? (
                <Typography variant="body2">
                  <strong>{annotationProject}</strong>
                </Typography>
              ) : (
                <ButtonGroup size="small" variant="outlined">
                  {projectOptions.map(p => (
                    <Button
                      key={p}
                      className={
                        selectedProject === p ? classes.activeBtn : undefined
                      }
                      onClick={() => setSelectedProject(p)}
                    >
                      {p}
                    </Button>
                  ))}
                </ButtonGroup>
              )}
            </>
          )}
        </Box>
        <Typography variant="body2" color="textSecondary">
          {sortedFlags.length} flag{sortedFlags.length !== 1 ? 's' : ''}
        </Typography>
      </div>

      <TableContainer component={Paper}>
        <Table className={classes.table} size="small">
          <TableHead>
            <TableRow>
              <TableCell>
                <strong>Key</strong>
              </TableCell>
              <TableCell>
                <strong>Type</strong>
              </TableCell>
              <TableCell>
                <strong>Default value</strong>
              </TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {sortedFlags.length === 0 ? (
              <TableRow>
                <TableCell colSpan={3} className={classes.emptyRow}>
                  <Typography variant="body2" color="textSecondary">
                    No feature flags found
                    {selectedProject !== ALL_PROJECTS && (
                      <>
                        {' '}
                        for project <strong>{selectedProject}</strong>
                      </>
                    )}{' '}
                    in environment <strong>{env}</strong>.
                  </Typography>
                </TableCell>
              </TableRow>
            ) : (
              sortedFlags.map(flag => (
                <Tooltip
                  key={flag.key}
                  title={flag.type === 'json' ? 'Click to view full JSON' : ''}
                  placement="left"
                >
                  <TableRow
                    className={
                      flag.type === 'json' || flag.valuePretty
                        ? classes.clickableRow
                        : undefined
                    }
                    onClick={() => {
                      if (flag.type === 'json' || flag.valuePretty) {
                        setSelectedFlag(flag);
                      }
                    }}
                  >
                    <TableCell className={classes.mono}>{flag.key}</TableCell>
                    <TableCell>
                      <Chip
                        size="small"
                        label={flag.type}
                        color={TYPE_COLOURS[flag.type]}
                      />
                    </TableCell>
                    <TableCell className={classes.mono}>
                      {flag.valuePreview}
                    </TableCell>
                  </TableRow>
                </Tooltip>
              ))
            )}
          </TableBody>
        </Table>
      </TableContainer>

      <FlagDetailDialog
        flag={selectedFlag}
        open={Boolean(selectedFlag)}
        onClose={() => setSelectedFlag(null)}
      />
    </>
  );
}
