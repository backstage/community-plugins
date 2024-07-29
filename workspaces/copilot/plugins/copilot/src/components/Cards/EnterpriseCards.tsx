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
import React, { PropsWithChildren } from 'react';
import CheckCircleIcon from '@material-ui/icons/CheckCircle';
import AssessmentIcon from '@material-ui/icons/Assessment';
import ThumbUpIcon from '@material-ui/icons/ThumbUp';
import CodeIcon from '@material-ui/icons/Code';
import { Grid } from '@material-ui/core';
import { Card } from './Card';
import { CardsProps } from '../../types';

export const EnterpriseCards = ({
  metrics,
  startDate,
  endDate,
}: PropsWithChildren<CardsProps>) => {
  const lines_suggested = metrics.reduce((acc, m) => {
    const rate =
      m.total_lines_suggested !== 0
        ? m.total_lines_accepted / m.total_lines_suggested
        : 0;
    return acc + rate;
  }, 0);

  const total_suggestions_count = metrics.reduce((acc, m) => {
    return acc + m.total_suggestions_count ?? 0;
  }, 0);

  const total_acceptances_count = metrics.reduce((acc, m) => {
    return acc + m.total_acceptances_count ?? 0;
  }, 0);

  const total_lines_accepted = metrics.reduce((acc, m) => {
    return acc + m.total_lines_accepted ?? 0;
  }, 0);

  return (
    <Grid container justifyContent="space-between">
      <Grid xs={6} item>
        <Card
          title="Acceptance Rate Average"
          value={
            metrics.length
              ? ((lines_suggested / metrics.length) * 100)
                  .toFixed(2)
                  .concat('%')
              : 'N/A'
          }
          startDate={startDate}
          endDate={endDate}
          icon={() => (
            <CheckCircleIcon style={{ color: '#4CAF50' }} fontSize="large" />
          )}
        />
      </Grid>
      <Grid xs={6} item>
        <Card
          title="Nº of Suggestions"
          value={metrics.length ? total_suggestions_count : 'N/A'}
          startDate={startDate}
          endDate={endDate}
          icon={() => (
            <AssessmentIcon style={{ color: '#2196F3' }} fontSize="large" />
          )}
        />
      </Grid>
      <Grid xs={6} item>
        <Card
          title="Nº of Accepted Prompts"
          value={metrics.length ? total_acceptances_count : 'N/A'}
          startDate={startDate}
          endDate={endDate}
          icon={() => (
            <ThumbUpIcon style={{ color: '#FF9800' }} fontSize="large" />
          )}
        />
      </Grid>
      <Grid xs={6} item>
        <Card
          title="Nº Lines of Code Accepted"
          value={metrics.length ? total_lines_accepted : 'N/A'}
          startDate={startDate}
          endDate={endDate}
          icon={() => (
            <CodeIcon style={{ color: '#FF5722' }} fontSize="large" />
          )}
        />
      </Grid>
    </Grid>
  );
};
