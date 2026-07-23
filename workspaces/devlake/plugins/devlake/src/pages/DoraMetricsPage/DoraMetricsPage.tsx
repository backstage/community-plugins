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

import { useCallback, useEffect, useState } from 'react';
import { Grid, makeStyles } from '@material-ui/core';
import {
  Content,
  ContentHeader,
  Header,
  HeaderLabel,
  Page,
  Progress,
  ResponseErrorPanel,
} from '@backstage/core-components';
import { useApi } from '@backstage/core-plugin-api';
import {
  DoraMetrics,
  DoraMetricsTrend,
  DoraTeam,
  TimeRangePreset,
  DORA_LEVEL_COLORS,
} from '@backstage-community/plugin-devlake-common';
import { devlakeApiRef } from '../../api';
import { MetricCard } from '../../components/MetricCard';
import { MetricChart } from '../../components/MetricChart';
import { TeamSelector } from '../../components/TeamSelector';
import { TimeRangeSelector } from '../../components/TimeRangeSelector';

const useStyles = makeStyles(theme => ({
  controls: {
    display: 'flex',
    alignItems: 'center',
    gap: theme.spacing(2),
    flexWrap: 'wrap',
  },
  emptyState: {
    textAlign: 'center',
    padding: theme.spacing(4),
    color: theme.palette.text.secondary,
  },
}));

/** @internal */
export const DoraMetricsPage = () => {
  const classes = useStyles();
  const api = useApi(devlakeApiRef);

  const [teams, setTeams] = useState<DoraTeam[]>([]);
  const [selectedTeam, setSelectedTeam] = useState<string>('');
  const [preset, setPreset] = useState<TimeRangePreset | undefined>('30d');
  const [customFrom, setCustomFrom] = useState<string | undefined>();
  const [customTo, setCustomTo] = useState<string | undefined>();

  const [metrics, setMetrics] = useState<DoraMetrics | undefined>();
  const [trend, setTrend] = useState<DoraMetricsTrend | undefined>();
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<Error | undefined>();

  useEffect(() => {
    api
      .getTeams()
      .then(result => {
        setTeams(result);
        if (result.length > 0) {
          setSelectedTeam(result[0].name);
        }
      })
      .catch(err => setError(err));
  }, [api]);

  const fetchData = useCallback(async () => {
    if (!selectedTeam) return;

    setLoading(true);
    setError(undefined);

    try {
      const opts = {
        team: selectedTeam,
        ...(preset ? { preset } : { from: customFrom, to: customTo }),
      };

      const [metricsResult, trendResult] = await Promise.all([
        api.getDoraMetrics(opts),
        api.getDoraTrend(opts),
      ]);

      setMetrics(metricsResult);
      setTrend(trendResult);
    } catch (err) {
      setError(err as Error);
    } finally {
      setLoading(false);
    }
  }, [api, selectedTeam, preset, customFrom, customTo]);

  useEffect(() => {
    fetchData();
  }, [fetchData]);

  const handlePresetChange = (newPreset: TimeRangePreset) => {
    setPreset(newPreset);
    setCustomFrom(undefined);
    setCustomTo(undefined);
  };

  const handleCustomRangeChange = (from: string, to: string) => {
    setPreset(undefined);
    setCustomFrom(from);
    setCustomTo(to);
  };

  return (
    <Page themeId="tool">
      <Header title="DORA Metrics" subtitle="Powered by Apache DevLake">
        <HeaderLabel label="Source" value="DevLake" />
      </Header>
      <Content>
        <ContentHeader title="">
          <div className={classes.controls}>
            <TeamSelector
              teams={teams}
              selectedTeam={selectedTeam}
              onTeamChange={setSelectedTeam}
            />
            <TimeRangeSelector
              preset={preset}
              from={customFrom}
              to={customTo}
              onPresetChange={handlePresetChange}
              onCustomRangeChange={handleCustomRangeChange}
            />
          </div>
        </ContentHeader>

        {error && <ResponseErrorPanel error={error} />}
        {loading && <Progress />}

        {!loading && !error && metrics && (
          <>
            <Grid container spacing={3}>
              <Grid item xs={12} sm={6} md={3}>
                <MetricCard
                  title="Deployment Frequency"
                  metric={metrics.deploymentFrequency}
                />
              </Grid>
              <Grid item xs={12} sm={6} md={3}>
                <MetricCard
                  title="Lead Time for Changes"
                  metric={metrics.leadTimeForChanges}
                  invertTrend
                />
              </Grid>
              <Grid item xs={12} sm={6} md={3}>
                <MetricCard
                  title="Change Failure Rate"
                  metric={metrics.changeFailureRate}
                  invertTrend
                />
              </Grid>
              <Grid item xs={12} sm={6} md={3}>
                <MetricCard
                  title="Mean Time to Recovery"
                  metric={metrics.meanTimeToRecovery}
                  invertTrend
                />
              </Grid>
            </Grid>

            {trend && (
              <Grid container spacing={3} style={{ marginTop: 16 }}>
                <Grid item xs={12} md={6}>
                  <MetricChart
                    title="Deployment Frequency"
                    data={trend.deploymentFrequency}
                    color={DORA_LEVEL_COLORS[metrics.deploymentFrequency.level]}
                    unit="deploys/day"
                  />
                </Grid>
                <Grid item xs={12} md={6}>
                  <MetricChart
                    title="Lead Time for Changes"
                    data={trend.leadTimeForChanges}
                    color={DORA_LEVEL_COLORS[metrics.leadTimeForChanges.level]}
                    unit="hours"
                  />
                </Grid>
                <Grid item xs={12} md={6}>
                  <MetricChart
                    title="Change Failure Rate"
                    data={trend.changeFailureRate}
                    color={DORA_LEVEL_COLORS[metrics.changeFailureRate.level]}
                    unit="%"
                  />
                </Grid>
                <Grid item xs={12} md={6}>
                  <MetricChart
                    title="Mean Time to Recovery"
                    data={trend.meanTimeToRecovery}
                    color={DORA_LEVEL_COLORS[metrics.meanTimeToRecovery.level]}
                    unit="hours"
                  />
                </Grid>
              </Grid>
            )}
          </>
        )}

        {!loading && !error && !metrics && (
          <div className={classes.emptyState}>
            No data available for this time range
          </div>
        )}
      </Content>
    </Page>
  );
};
