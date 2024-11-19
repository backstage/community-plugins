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
import Box from '@mui/material/Box';
import { styled } from '@mui/material/styles';
import { PieChart } from '@mui/x-charts';
import { Chart } from './Chart';
import { LanguagesComparisonTables } from '../Table/LanguagesComparisonTables';
import {
  getLanguageStats,
  getTopLanguagesByAcceptanceRate,
  getTopLanguagesByAcceptedPrompts,
} from '../../utils';
import { ChartsProps } from '../../types';

const MainBox = styled(Box)(({ theme }) => ({
  display: 'flex',
  flexDirection: 'column',
  gap: theme.spacing(2),
}));

const RowBox = styled(Box)(({ theme }) => ({
  display: 'flex',
  flexDirection: 'row',
  gap: theme.spacing(2),
  width: '100%',
}));

const Fieldset = styled('fieldset')(({ theme }) => ({
  border: `1px solid ${theme.palette.divider}`,
  borderRadius: theme.shape.borderRadius,
  padding: theme.spacing(2),
  marginBottom: theme.spacing(2),
}));

const Legend = styled('legend')(({ theme }) => ({
  fontSize: theme.typography.h6.fontSize,
  padding: `0 ${theme.spacing(1)}`,
}));

const renderPieCharts = (promptsData: any[], rateData: any[]) => (
  <RowBox>
    <Chart title="Top 5 Languages By Accepted Prompts">
      <PieChart
        margin={{ right: 200 }}
        series={[
          {
            data: promptsData.map(lan => ({
              id: lan.language,
              value: lan.totalAcceptances,
              label: `${lan.language}: ${lan.totalAcceptances}`,
            })),
            highlightScope: { fade: 'global', highlight: 'item' },
            faded: { innerRadius: 30, additionalRadius: -30, color: 'gray' },
          },
        ]}
        height={300}
      />
    </Chart>
    <Chart title="Top 5 Languages By Acceptance Rate">
      <PieChart
        margin={{ right: 200 }}
        series={[
          {
            data: rateData.map(lan => ({
              id: lan.language,
              value: lan.acceptanceRate * 100,
              label: `${lan.language}: ${(lan.acceptanceRate * 100).toFixed(
                2,
              )}%`,
            })),
            highlightScope: { fade: 'global', highlight: 'item' },
            faded: { innerRadius: 30, additionalRadius: -30, color: 'gray' },
            valueFormatter: item => `${item.value.toFixed(2)}%`,
          },
        ]}
        height={300}
      />
    </Chart>
  </RowBox>
);

export const LanguageCharts = ({
  team,
  metrics,
  metricsByTeam,
}: PropsWithChildren<ChartsProps>) => {
  const languageStats = getLanguageStats(metrics);
  const languageStatsByTeam = getLanguageStats(metricsByTeam);

  const topFiveLanguagesByAcceptedPromptsOverall =
    getTopLanguagesByAcceptedPrompts(metrics, 5);
  const topFiveLanguagesByAcceptanceRateOverall =
    getTopLanguagesByAcceptanceRate(metrics, 5);
  const topFiveLanguagesByAcceptedPromptsTeam =
    getTopLanguagesByAcceptedPrompts(metricsByTeam, 5);
  const topFiveLanguagesByAcceptanceRateTeam = getTopLanguagesByAcceptanceRate(
    metricsByTeam,
    5,
  );

  return (
    <MainBox>
      {team && (
        <Fieldset>
          <Legend>{team}</Legend>
          {renderPieCharts(
            topFiveLanguagesByAcceptedPromptsTeam,
            topFiveLanguagesByAcceptanceRateTeam,
          )}
        </Fieldset>
      )}
      {team && (
        <Fieldset>
          <Legend>Overall</Legend>
          {renderPieCharts(
            topFiveLanguagesByAcceptedPromptsOverall,
            topFiveLanguagesByAcceptanceRateOverall,
          )}
        </Fieldset>
      )}
      {!team &&
        renderPieCharts(
          topFiveLanguagesByAcceptedPromptsOverall,
          topFiveLanguagesByAcceptanceRateOverall,
        )}
      <Chart title="Languages Breakdown">
        <LanguagesComparisonTables
          team={team}
          overallRows={languageStats}
          teamRows={languageStatsByTeam}
        />
      </Chart>
    </MainBox>
  );
};
