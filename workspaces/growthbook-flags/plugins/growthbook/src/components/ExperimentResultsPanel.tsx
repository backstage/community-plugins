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
import { Progress, ResponseErrorPanel } from '@backstage/core-components';
import useAsync from 'react-use/lib/useAsync';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableRow,
  Typography,
} from '@material-ui/core';
import type { ExperimentRow } from '@backstage-community/plugin-growthbook-common';
import { growthbookFlagsApiRef } from '../api';

const percent = (value: number | undefined, digits: number, signed = false) =>
  value === undefined
    ? '—'
    : `${signed && value > 0 ? '+' : ''}${(value * 100).toFixed(digits)}%`;

export function ExperimentResultsPanel({
  experiment,
}: {
  experiment: ExperimentRow;
}) {
  const api = useApi(growthbookFlagsApiRef);
  const { value, loading, error } = useAsync(
    () => api.getExperimentResults(experiment.id),
    [api, experiment.id],
  );

  if (loading) return <Progress />;
  if (error) return <ResponseErrorPanel error={error} />;
  if (!value?.available) {
    return (
      <Typography variant="body2" color="textSecondary">
        Results not available
      </Typography>
    );
  }

  return (
    <>
      {value.metricName && (
        <Typography variant="subtitle2" gutterBottom>
          Primary metric: {value.metricName}
        </Typography>
      )}
      <Table size="small">
        <TableHead>
          <TableRow>
            <TableCell>Variation</TableCell>
            <TableCell align="right">Users</TableCell>
            <TableCell align="right">Change</TableCell>
            <TableCell align="right">95% interval</TableCell>
            <TableCell align="right">Chance to beat control</TableCell>
          </TableRow>
        </TableHead>
        <TableBody>
          {value.variations.map(v => (
            <TableRow key={v.id}>
              <TableCell>{v.name}</TableCell>
              <TableCell align="right">
                {v.users === undefined ? '—' : v.users.toLocaleString('en-US')}
              </TableCell>
              <TableCell align="right">
                {percent(v.percentChange, 2, true)}
              </TableCell>
              <TableCell align="right">
                {v.ciLow === undefined || v.ciHigh === undefined
                  ? '—'
                  : `${percent(v.ciLow, 1, true)} to ${percent(
                      v.ciHigh,
                      1,
                      true,
                    )}`}
              </TableCell>
              <TableCell align="right">
                {percent(v.chanceToBeatControl, 1)}
              </TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>
    </>
  );
}
