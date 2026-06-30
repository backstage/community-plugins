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
import Alert from '@material-ui/lab/Alert';
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
import { getTrendForCoverage } from '../../utils/coverageTrend';
import { TrendIcon } from '../../utils/TrendIcon';

import { Progress, ResponseErrorPanel } from '@backstage/core-components';
import { useApi } from '@backstage/core-plugin-api';

import { DateTime } from 'luxon';

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

  const [oldestCoverage] = valueHistory.history.slice(-1);
  const latestCoverage = valueHistory.history[0];

  const lineTrend = getTrendForCoverage(latestCoverage, oldestCoverage, 'line');
  const branchTrend = getTrendForCoverage(
    latestCoverage,
    oldestCoverage,
    'branch',
  );

  return (
    <Card>
      <CardHeader title="History" />
      <CardContent>
        <Box px={6} display="flex">
          <Box display="flex" mr={4}>
            <TrendIcon trend={lineTrend} />
            <Typography>
              Current line: {latestCoverage.line.percentage}%<br />(
              {Math.floor(lineTrend)}% change over {valueHistory.history.length}{' '}
              builds)
            </Typography>
          </Box>
          <Box display="flex">
            <TrendIcon trend={branchTrend} />
            <Typography>
              Current branch: {latestCoverage.branch.percentage}%<br />(
              {Math.floor(branchTrend)}% change over{' '}
              {valueHistory.history.length} builds)
            </Typography>
          </Box>
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
            <YAxis dataKey="line.percentage" />
            <YAxis dataKey="branch.percentage" />
            <Tooltip labelFormatter={formatDateToHuman} />
            <Legend />
            <Line
              type="monotone"
              dataKey="branch.percentage"
              stroke="#8884d8"
            />
            <Line type="monotone" dataKey="line.percentage" stroke="#82ca9d" />
          </LineChart>
        </ResponsiveContainer>
      </CardContent>
    </Card>
  );
};
