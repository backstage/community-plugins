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
import { Box, makeStyles } from '@material-ui/core';
import { PieChart } from '@mui/x-charts';
import { Chart } from './Chart';
import { LanguagesBreakdownTable } from '../Table/LanguagesBreakdownTable';
import {
  getLanguageStats,
  getTopLanguagesByAcceptanceRate,
  getTopLanguagesByAcceptedPrompts,
} from '../../utils';
import { ChartsProps } from '../../types';

const useStyles = makeStyles(theme => ({
  main: {
    display: 'flex',
    flexDirection: 'column',
    gap: theme.spacing(3),
  },
  row: {
    display: 'flex',
    flexDirection: 'row',
    gap: theme.spacing(3),
  },
}));

export const LanguageCharts = ({ metrics }: PropsWithChildren<ChartsProps>) => {
  const classes = useStyles();

  const languageStats = getLanguageStats(metrics);

  const topFiveLanguagesByAcceptedPrompts = getTopLanguagesByAcceptedPrompts(
    metrics,
    5,
  );
  const topFiveLanguagesByAcceptanceRate = getTopLanguagesByAcceptanceRate(
    metrics,
    5,
  );

  return (
    <Box className={classes.main}>
      <Box className={classes.row}>
        <Chart title="Top 5 Languages By Accepted Prompts">
          <PieChart
            series={[
              {
                data: topFiveLanguagesByAcceptedPrompts.map(lan => ({
                  id: lan.language,
                  value: lan.totalAcceptances,
                  label: lan.language,
                })),
              },
            ]}
            height={300}
          />
        </Chart>
        <Chart title="Top 5 Languages By Acceptance Rate">
          <PieChart
            series={[
              {
                data: topFiveLanguagesByAcceptanceRate.map(lan => ({
                  id: lan.language,
                  value: lan.acceptanceRate * 100,
                  label: lan.language,
                })),
                valueFormatter: item => {
                  return `${item.value.toFixed(2)}%`;
                },
              },
            ]}
            height={300}
          />
        </Chart>
      </Box>
      <Chart title="Languages Breakdown">
        <LanguagesBreakdownTable rows={languageStats} />
      </Chart>
    </Box>
  );
};
