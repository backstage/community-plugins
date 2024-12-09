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
import LanguageIcon from '@mui/icons-material/Language';
import Box from '@mui/material/Box';
import { Card } from './Card';
import { getLanguageStats } from '../../utils';
import { CardsProps } from '../../types';
import { styled } from '@mui/material/styles';

const CardBox = styled(Box)({
  flex: '1 1 calc(50% - 10px)',
  minWidth: 300,
  maxWidth: 'calc(50% - 10px)',
  boxSizing: 'border-box',
});

export const LanguageCards = ({
  team,
  metrics,
  metricsByTeam,
  startDate,
  endDate,
}: PropsWithChildren<CardsProps>) => {
  const overallLanguageStats =
    metrics.length > 0 ? getLanguageStats(metrics) : [];
  const teamLanguageStats =
    metricsByTeam.length > 0 ? getLanguageStats(metricsByTeam) : [];

  return (
    <Box display="flex" flexWrap="wrap" gap={1} justifyContent="space-between">
      <CardBox>
        <Card
          team={team}
          title="Nº of Languages"
          primaryValue={
            team
              ? teamLanguageStats.length || 'N/A'
              : overallLanguageStats.length || 'N/A'
          }
          secondaryValue={
            team ? overallLanguageStats.length || 'N/A' : undefined
          }
          startDate={startDate}
          endDate={endDate}
          icon={() => (
            <LanguageIcon style={{ color: '#007acc' }} fontSize="large" />
          )}
        />
      </CardBox>
    </Box>
  );
};
