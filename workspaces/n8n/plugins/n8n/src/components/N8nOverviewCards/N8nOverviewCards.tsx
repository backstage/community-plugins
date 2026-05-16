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

import { useApi } from '@backstage/core-plugin-api';
import { useEntity } from '@backstage/plugin-catalog-react';
import Box from '@material-ui/core/Box';
import Grid from '@material-ui/core/Grid';
import Paper from '@material-ui/core/Paper';
import Typography from '@material-ui/core/Typography';
import { makeStyles } from '@material-ui/core/styles';
import CheckCircleOutlineIcon from '@material-ui/icons/CheckCircleOutline';
import ErrorOutlineIcon from '@material-ui/icons/ErrorOutline';
import PlayCircleOutlineIcon from '@material-ui/icons/PlayCircleOutline';
import TimelineIcon from '@material-ui/icons/Timeline';
import useAsyncRetry from 'react-use/esm/useAsyncRetry';
import { n8nApiRef } from '../../api';
import { N8N_ANNOTATION } from '../../constants';
import { useWorkflows } from '../../hooks/useWorkflows';

const useStyles = makeStyles(theme => ({
  card: {
    padding: theme.spacing(2, 3),
    display: 'flex',
    alignItems: 'center',
    gap: theme.spacing(2),
  },
  iconBox: {
    borderRadius: theme.spacing(1),
    padding: theme.spacing(1),
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
  },
  icon: {
    fontSize: '2rem',
  },
  value: {
    fontSize: '1.5rem',
    fontWeight: 700,
    lineHeight: 1.2,
  },
  label: {
    color: theme.palette.text.secondary,
    fontSize: '0.75rem',
    textTransform: 'uppercase',
    letterSpacing: '0.5px',
  },
}));

/** @public */
export const N8nOverviewCards = () => {
  const classes = useStyles();
  const { workflows, loading: wfLoading } = useWorkflows();
  const api = useApi(n8nApiRef);
  const { entity } = useEntity();

  const workflowIds =
    entity.metadata.annotations?.[N8N_ANNOTATION]?.split(',').map(id =>
      id.trim(),
    ) ?? [];

  const { value: executions = [], loading: exLoading } =
    useAsyncRetry(async () => {
      if (workflowIds.length === 0) return [];
      const results = await Promise.all(
        workflowIds.map(id => api.getExecutions(id, 50)),
      );
      return results.flat();
    }, [workflowIds.join(',')]);

  const loading = wfLoading || exLoading;

  if (loading) {
    return null;
  }

  const active = workflows.filter(w => w.active).length;
  const successCount = executions.filter(e => e.status === 'success').length;
  const errorCount = executions.filter(e => e.status === 'error').length;
  const successRate =
    executions.length > 0
      ? Math.round((successCount / executions.length) * 100)
      : 0;

  function rateColor(rate: number): string {
    if (rate >= 80) return '#388e3c';
    if (rate >= 50) return '#f57c00';
    return '#d32f2f';
  }

  function rateBgColor(rate: number): string {
    if (rate >= 80) return '#e8f5e9';
    if (rate >= 50) return '#fff3e0';
    return '#ffebee';
  }

  const stats = [
    {
      label: 'Workflows',
      value: workflows.length,
      color: '#1976d2',
      bgColor: '#e3f2fd',
      icon: (
        <TimelineIcon className={classes.icon} style={{ color: '#1976d2' }} />
      ),
    },
    {
      label: 'Active',
      value: active,
      color: '#388e3c',
      bgColor: '#e8f5e9',
      icon: (
        <CheckCircleOutlineIcon
          className={classes.icon}
          style={{ color: '#388e3c' }}
        />
      ),
    },
    {
      label: 'Success Rate',
      value: `${successRate}%`,
      color: rateColor(successRate),
      bgColor: rateBgColor(successRate),
      icon: (
        <PlayCircleOutlineIcon
          className={classes.icon}
          style={{ color: rateColor(successRate) }}
        />
      ),
    },
    {
      label: 'Errors',
      value: errorCount,
      color: errorCount > 0 ? '#d32f2f' : '#388e3c',
      bgColor: errorCount > 0 ? '#ffebee' : '#e8f5e9',
      icon: (
        <ErrorOutlineIcon
          className={classes.icon}
          style={{ color: errorCount > 0 ? '#d32f2f' : '#388e3c' }}
        />
      ),
    },
  ];

  return (
    <Grid container spacing={2}>
      {stats.map(stat => (
        <Grid item xs={6} sm={3} key={stat.label}>
          <Paper className={classes.card} variant="outlined">
            <Box
              className={classes.iconBox}
              style={{ backgroundColor: stat.bgColor }}
            >
              {stat.icon}
            </Box>
            <Box>
              <Typography
                className={classes.value}
                style={{ color: stat.color }}
              >
                {stat.value}
              </Typography>
              <Typography className={classes.label}>{stat.label}</Typography>
            </Box>
          </Paper>
        </Grid>
      ))}
    </Grid>
  );
};
