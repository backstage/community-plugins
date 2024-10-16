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
import CheckCircleIcon from '@mui/icons-material/CheckCircle';
import AssessmentIcon from '@mui/icons-material/Assessment';
import ThumbUpIcon from '@mui/icons-material/ThumbUp';
import CodeIcon from '@mui/icons-material/Code';
import Box from '@mui/material/Box';
import { Card } from './Card';
import { CardsProps } from '../../types';
import { styled } from '@mui/material/styles';

const CardBox = styled(Box)(() => ({
  flex: '1 1 0',
}));

export const EnterpriseCards = ({
  metrics,
  startDate,
  endDate,
}: PropsWithChildren<CardsProps>) => {
  const total_suggestions_count = metrics.reduce((acc, m) => {
    return acc + m.total_suggestions_count;
  }, 0);

  const total_acceptances_count = metrics.reduce((acc, m) => {
    return acc + m.total_acceptances_count;
  }, 0);

  const total_lines_accepted = metrics.reduce((acc, m) => {
    return acc + m.total_lines_accepted;
  }, 0);

  return (
    <Box display="flex" flexWrap="wrap" gap={2}>
      <CardBox flex={1} minWidth="384px">
        <Card
          title="Acceptance Rate Average"
          value={
            metrics.length
              ? ((total_acceptances_count / total_suggestions_count) * 100)
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
      </CardBox>
      <CardBox flex={1} minWidth="384px">
        <Card
          title="Nº of Suggestions"
          value={metrics.length ? total_suggestions_count : 'N/A'}
          startDate={startDate}
          endDate={endDate}
          icon={() => (
            <AssessmentIcon style={{ color: '#2196F3' }} fontSize="large" />
          )}
        />
      </CardBox>
      <CardBox flex={1} minWidth="384px">
        <Card
          title="Nº of Accepted Prompts"
          value={metrics.length ? total_acceptances_count : 'N/A'}
          startDate={startDate}
          endDate={endDate}
          icon={() => (
            <ThumbUpIcon style={{ color: '#FF9800' }} fontSize="large" />
          )}
        />
      </CardBox>
      <CardBox flex={1} minWidth="384px">
        <Card
          title="Nº Lines of Code Accepted"
          value={metrics.length ? total_lines_accepted : 'N/A'}
          startDate={startDate}
          endDate={endDate}
          icon={() => (
            <CodeIcon style={{ color: '#FF5722' }} fontSize="large" />
          )}
        />
      </CardBox>
    </Box>
  );
};
