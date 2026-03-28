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

import { useEffect, useState } from 'react';
import { Chip, Grid, Tooltip, makeStyles } from '@material-ui/core';
import OpenInNewIcon from '@material-ui/icons/OpenInNew';
import {
  InfoCard,
  InfoCardVariants,
  MissingAnnotationEmptyState,
  Progress,
  ResponseErrorPanel,
} from '@backstage/core-components';
import { configApiRef, useApi } from '@backstage/core-plugin-api';
import { useEntity } from '@backstage/plugin-catalog-react';
import {
  DoraMetric,
  DoraMetrics,
  DORA_LEVEL_COLORS,
  DORA_LEVEL_LABELS,
} from '@backstage-community/plugin-devlake-common';
import { devlakeApiRef } from '../../api';
import { DEVLAKE_PROJECT_NAME_ANNOTATION } from '../../constants';

/** @public */
export interface EntityDoraCardProps {
  variant?: InfoCardVariants;
}

const useStyles = makeStyles(theme => ({
  metricLabel: {
    display: 'block',
    fontSize: '0.7rem',
    color: theme.palette.text.secondary,
    textTransform: 'uppercase',
    letterSpacing: '0.05em',
  },
  metricValue: {
    fontSize: '1.4rem',
    fontWeight: 600,
    lineHeight: 1.2,
  },
  metricUnit: {
    fontSize: '0.75rem',
    fontWeight: 400,
    color: theme.palette.text.secondary,
  },
  chip: {
    height: 18,
    fontSize: '0.65rem',
    color: '#fff',
    marginTop: theme.spacing(0.5),
  },
  noData: {
    color: theme.palette.text.disabled,
    fontSize: '1.1rem',
  },
  grafanaLink: {
    display: 'flex',
    alignItems: 'center',
    gap: 4,
  },
}));

const METRIC_ENTRIES: { key: keyof DoraMetrics; label: string }[] = [
  { key: 'deploymentFrequency', label: 'Deploy Freq' },
  { key: 'leadTimeForChanges', label: 'Lead Time' },
  { key: 'changeFailureRate', label: 'Change Fail Rate' },
  { key: 'meanTimeToRecovery', label: 'MTTR' },
];

function MetricTile({ metric, label }: { metric: DoraMetric; label: string }) {
  const classes = useStyles();
  const hasData = metric.value > 0;
  return (
    <Grid item xs={6}>
      <span className={classes.metricLabel}>{label}</span>
      {hasData ? (
        <>
          <div className={classes.metricValue}>
            {metric.value}{' '}
            <span className={classes.metricUnit}>{metric.unit}</span>
          </div>
          <Chip
            className={classes.chip}
            label={DORA_LEVEL_LABELS[metric.level]}
            style={{ backgroundColor: DORA_LEVEL_COLORS[metric.level] }}
          />
        </>
      ) : (
        <div className={classes.noData}>N/A</div>
      )}
    </Grid>
  );
}

/**
 * Displays a compact DORA metrics summary card on a Backstage entity page.
 * Requires the `devlake.io/project-name` annotation on the entity.
 *
 * @public
 */
export function EntityDoraCard({ variant = 'gridItem' }: EntityDoraCardProps) {
  const classes = useStyles();
  const { entity } = useEntity();
  const devlakeApi = useApi(devlakeApiRef);
  const configApi = useApi(configApiRef);

  const projectName =
    entity.metadata.annotations?.[DEVLAKE_PROJECT_NAME_ANNOTATION];

  const [metrics, setMetrics] = useState<DoraMetrics | undefined>();
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<Error | undefined>();

  useEffect(() => {
    if (!projectName) return;
    setLoading(true);
    devlakeApi
      .getDoraMetrics({ team: projectName, preset: '30d' })
      .then(result => setMetrics(result))
      .catch(err => setError(err))
      .finally(() => setLoading(false));
  }, [devlakeApi, projectName]);

  const grafanaBaseUrl = configApi.getOptionalString('devlake.grafana.baseUrl');
  const doraDashboardPath =
    configApi.getOptionalString('devlake.grafana.doraDashboardPath') ??
    '/d/qNo8_0M4z/dora';
  const grafanaUrl = grafanaBaseUrl
    ? `${grafanaBaseUrl.replace(
        /\/$/,
        '',
      )}${doraDashboardPath}?var-project_name=${encodeURIComponent(
        projectName ?? '',
      )}`
    : undefined;

  if (!projectName) {
    return (
      <InfoCard title="DORA Metrics" variant={variant}>
        <MissingAnnotationEmptyState
          annotation={DEVLAKE_PROJECT_NAME_ANNOTATION}
        />
      </InfoCard>
    );
  }

  return (
    <InfoCard
      title="DORA Metrics"
      subheader="Last 30 days"
      variant={variant}
      deepLink={{
        title: 'View full DORA metrics',
        link: '/devlake',
      }}
      action={
        grafanaUrl ? (
          <Tooltip title="Open in Grafana">
            <a
              href={grafanaUrl}
              target="_blank"
              rel="noopener noreferrer"
              className={classes.grafanaLink}
            >
              <OpenInNewIcon fontSize="small" />
            </a>
          </Tooltip>
        ) : undefined
      }
    >
      {loading && <Progress />}
      {error && <ResponseErrorPanel error={error} />}
      {!loading && !error && metrics && (
        <Grid container spacing={2}>
          {METRIC_ENTRIES.map(({ key, label }) => (
            <MetricTile key={key} metric={metrics[key]} label={label} />
          ))}
        </Grid>
      )}
    </InfoCard>
  );
}
