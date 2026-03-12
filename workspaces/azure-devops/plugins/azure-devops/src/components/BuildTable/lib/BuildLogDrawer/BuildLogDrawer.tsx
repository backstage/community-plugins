/*
 * Copyright 2025 The Backstage Authors
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
import { useState, useEffect, useCallback } from 'react';
import Drawer from '@material-ui/core/Drawer';
import Typography from '@material-ui/core/Typography';
import LinearProgress from '@material-ui/core/LinearProgress';
import Box from '@material-ui/core/Box';
import IconButton from '@material-ui/core/IconButton';
import { makeStyles } from '@material-ui/core/styles';
import { useApi } from '@backstage/core-plugin-api';
import { azureDevOpsApiRef } from '../../../../api';
import { getAnnotationValuesFromEntity } from '@backstage-community/plugin-azure-devops-common';
import { stringifyEntityRef } from '@backstage/catalog-model';
import { useEntity } from '@backstage/plugin-catalog-react';
import { RiCloseLine } from '@remixicon/react';

const useDrawerStyles = makeStyles(theme => ({
  logDrawer: {
    width: '40%',
    minWidth: '500px',
    padding: theme.spacing(2),
  },
  header: {
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: theme.spacing(2),
    borderBottom: `1px solid ${theme.palette.divider}`,
    paddingBottom: theme.spacing(1),
  },
  content: {
    height: '100%',
    display: 'flex',
    flexDirection: 'column',
  },
  logContainer: {
    flexGrow: 1,
    overflow: 'auto',
    backgroundColor: theme.palette.background.default,
    padding: theme.spacing(2),
    borderRadius: theme.shape.borderRadius,
    marginTop: theme.spacing(2),
    fontFamily: theme.typography.fontFamily,
    fontSize: theme.typography.fontSize,
  },
}));

type BuildLogDrawerProps = {
  buildId?: number;
  open: boolean;
  onClose: () => void;
  logsCache: Record<number, string[]>;
  updateCache: (buildId: number, logs: string[]) => void;
};

export const BuildLogDrawer = ({
  buildId,
  open,
  onClose,
  logsCache,
  updateCache,
}: BuildLogDrawerProps) => {
  const [loading, setLoading] = useState(false);
  const [logs, setLogs] = useState<string[]>([]);
  const [error, setError] = useState<Error | undefined>();
  const { entity } = useEntity();
  const azureApi = useApi(azureDevOpsApiRef);
  const classes = useDrawerStyles();

  const fetchLogs = useCallback(async () => {
    if (!buildId) {
      setError(new Error('Missing ID for build'));
      return;
    }

    setLoading(true);
    setError(undefined);
    setLogs([]);

    try {
      const { project, host, org } = getAnnotationValuesFromEntity(entity);
      const response = await azureApi.getBuildRunLog(
        project,
        stringifyEntityRef(entity),
        buildId,
        host,
        org,
      );

      setLogs(response.log);
      updateCache(buildId, response.log);
    } catch (err) {
      setError(err as Error);
    } finally {
      setLoading(false);
    }
  }, [buildId, entity, azureApi, updateCache]);

  // Reset logs when a different build is selected
  useEffect(() => {
    if (buildId && open) {
      // Check logs in cache first
      if (logsCache[buildId]) {
        setLogs(logsCache[buildId]);
      } else {
        fetchLogs();
      }
    }
  }, [buildId, open, fetchLogs, logsCache]);

  return (
    <Drawer
      anchor="right"
      open={open}
      onClose={onClose}
      classes={{
        paper: classes.logDrawer,
      }}
    >
      <div className={classes.content}>
        <div className={classes.header}>
          <Typography variant="h6">
            Build Logs {buildId ? `(Build #${buildId})` : ''}
          </Typography>
          <IconButton onClick={onClose} aria-label="close">
            <RiCloseLine />
          </IconButton>
        </div>

        {loading && <LinearProgress />}

        {error && (
          <Typography color="error">
            Error loading logs: {error.message}
          </Typography>
        )}

        {!loading && !error && logs.length === 0 && (
          <Typography>No logs available</Typography>
        )}

        {!loading && !error && logs.length > 0 && (
          <Box component="pre" className={classes.logContainer}>
            {logs.join('\n')}
          </Box>
        )}
      </div>
    </Drawer>
  );
};
