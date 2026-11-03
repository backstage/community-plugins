/*
 * Copyright 2020 The Backstage Authors
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

import { useEntity } from '@backstage/plugin-catalog-react';
import Box from '@material-ui/core/Box';
import Card from '@material-ui/core/Card';
import CardContent from '@material-ui/core/CardContent';
import CardHeader from '@material-ui/core/CardHeader';
import Typography from '@material-ui/core/Typography';
import { makeStyles } from '@material-ui/core/styles';
import TrendingDownIcon from '@material-ui/icons/TrendingDown';
import TrendingFlatIcon from '@material-ui/icons/TrendingFlat';
import TrendingUpIcon from '@material-ui/icons/TrendingUp';
import Alert from '@material-ui/lab/Alert';
import { ClassNameMap } from '@material-ui/styles/withStyles';
import useAsync from 'react-use/esm/useAsync';
import {
  CartesianGrid,
  Legend,
  Line,
  LineChart,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from 'recharts';
import { codeCoverageApiRef } from '../../api';
import { AggregateCoverage } from '../../types';

import { Progress, ResponseErrorPanel } from '@backstage/core-components';
import { useApi } from '@backstage/core-plugin-api';

import { DateTime } from 'luxon';

type Coverage = 'line' | 'branch' | 'function';

const useStyles = makeStyles(theme => ({
  trendDown: {
    color: theme.palette.status.warning,
  },
  trendUp: {
    color: theme.palette.status.ok,
  },
}));

const getTrendIcon = (trend: number, classes: ClassNameMap) => {
  switch (true) {
    case trend > 0:
      return <TrendingUpIcon className={classes.trendUp} />;
    case trend < 0:
      return <TrendingDownIcon className={classes.trendDown} />;
    case trend === 0:
    default:
      return <TrendingFlatIcon />;
  }
};

export const getTrendForCoverage = (
  history: AggregateCoverage[],
  type: Coverage,
) =>
  (history[0][type]?.percentage ?? 0) -
  (history[history.length - 1][type]?.percentage ?? 0);

const hasFunctionData = (h: AggregateCoverage) => !!h.function?.available;

/**
 * Function coverage of the builds that report it. `current` is undefined when
 * the latest build has no function data.
 */
export const getFunctionCoverage = (history: AggregateCoverage[]) => {
  const functionHistory = history.filter(hasFunctionData);
  return {
    history: functionHistory,
    current:
      history.length && hasFunctionData(history[0])
        ? history[0].function?.percentage
        : undefined,
    trend: functionHistory.length
      ? getTrendForCoverage(functionHistory, 'function')
      : 0,
  };
};

export const formatTrend = (trend: number) =>
  `${trend > 0 ? '+' : ''}${trend.toFixed(2)}%`;

// convert timestamp to human friendly form
function formatDateToHuman(timeStamp: string | number) {
  return DateTime.fromMillis(Number(timeStamp)).toLocaleString(
    DateTime.DATETIME_MED,
  );
}

export const CoverageHistoryChart = () => {
  const { entity } = useEntity();
  const codeCoverageApi = useApi(codeCoverageApiRef);
  const {
    loading: loadingHistory,
    error: errorHistory,
    value: valueHistory,
  } = useAsync(
    async () =>
      await codeCoverageApi.getCoverageHistoryForEntity({
        kind: entity.kind,
        namespace: entity.metadata.namespace || 'default',
        name: entity.metadata.name,
      }),
  );
  const classes = useStyles();

  if (loadingHistory) {
    return <Progress />;
  }
  if (errorHistory) {
    return <ResponseErrorPanel error={errorHistory} />;
  } else if (!valueHistory) {
    return <Alert severity="warning">No history found.</Alert>;
  }

  if (!valueHistory.history.length) {
    return (
      <Card>
        <CardHeader title="History" />
        <CardContent>No coverage history found</CardContent>
      </Card>
    );
  }

  const latestCoverage = valueHistory.history[0];
  const lineTrend = getTrendForCoverage(valueHistory.history, 'line');
  const branchTrend = getTrendForCoverage(valueHistory.history, 'branch');
  const functionCoverage = getFunctionCoverage(valueHistory.history);
  const hasFunctionHistory = functionCoverage.history.length > 0;

  return (
    <Card>
      <CardHeader title="History" />
      <CardContent>
        <Box px={6} display="flex">
          <Box display="flex" mr={4}>
            {getTrendIcon(lineTrend, classes)}
            <Typography>
              Current line: {latestCoverage.line.percentage}%<br />(
              {formatTrend(lineTrend)} over {valueHistory.history.length}{' '}
              builds)
            </Typography>
          </Box>
          <Box display="flex" mr={4}>
            {getTrendIcon(branchTrend, classes)}
            <Typography>
              Current branch: {latestCoverage.branch.percentage}%<br />(
              {formatTrend(branchTrend)} over {valueHistory.history.length}{' '}
              builds)
            </Typography>
          </Box>
          {hasFunctionHistory && (
            <Box display="flex">
              {functionCoverage.current === undefined ? (
                <>
                  <TrendingFlatIcon />
                  <Typography>
                    Current function: n/a
                    <br />
                    (no function data in the latest build)
                  </Typography>
                </>
              ) : (
                <>
                  {getTrendIcon(functionCoverage.trend, classes)}
                  <Typography>
                    Current function: {functionCoverage.current}%<br />(
                    {formatTrend(functionCoverage.trend)} over{' '}
                    {functionCoverage.history.length} builds)
                  </Typography>
                </>
              )}
            </Box>
          )}
        </Box>
        <ResponsiveContainer width="100%" height={300}>
          <LineChart
            data={valueHistory.history}
            margin={{ right: 48, top: 32 }}
          >
            <CartesianGrid strokeDasharray="3 3" />
            <XAxis
              dataKey="timestamp"
              tickFormatter={formatDateToHuman}
              reversed
            />
            <YAxis domain={[0, 100]} unit="%" />
            <Tooltip
              labelFormatter={formatDateToHuman}
              formatter={value => `${value}%`}
            />
            <Legend />
            <Line
              type="monotone"
              dataKey="branch.percentage"
              name="Branch"
              stroke="#8884d8"
            />
            <Line
              type="monotone"
              dataKey="line.percentage"
              name="Line"
              stroke="#82ca9d"
            />
            {hasFunctionHistory && (
              <Line
                type="monotone"
                dataKey={(h: AggregateCoverage) =>
                  h.function?.available ? h.function.percentage : null
                }
                name="Function"
                stroke="#7cb5ec"
              />
            )}
          </LineChart>
        </ResponsiveContainer>
      </CardContent>
    </Card>
  );
};
