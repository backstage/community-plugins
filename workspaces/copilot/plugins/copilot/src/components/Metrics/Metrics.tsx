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
import React from 'react';
import Box from '@mui/material/Box';
import { styled, useTheme } from '@mui/material/styles';
import { Calendar } from 'simple-date-range-calendar';
import { useMetrics } from '../../hooks';
import { CardsProps, ChartsProps } from '../../types';
import { Progress } from '@backstage/core-components';
import { useSharedDateRange } from '../../contexts';

type MetricsProps = {
  Cards: React.ElementType<CardsProps>;
  Charts: React.ElementType<ChartsProps>;
};

const MainBox = styled(Box)(({ theme }) => ({
  display: 'flex',
  flexDirection: 'column',
  gap: theme.spacing(2),
}));

export const RenderCharts = ({ Charts }: Omit<MetricsProps, 'Cards'>) => {
  const [state] = useSharedDateRange();
  const { items, loading } = useMetrics(state.startDate, state.endDate);

  if (loading) {
    return <Progress />;
  }

  return <Charts metrics={items || []} />;
};

export const RenderCards = ({ Cards }: Omit<MetricsProps, 'Charts'>) => {
  const [state] = useSharedDateRange();
  const { items, loading } = useMetrics(state.startDate, state.endDate);

  if (loading) {
    return <Progress />;
  }

  return (
    <Cards
      startDate={state.startDate}
      endDate={state.endDate}
      metrics={items || []}
    />
  );
};

export const Metrics = ({ Cards, Charts }: MetricsProps) => {
  const [state, setState] = useSharedDateRange();
  const theme = useTheme();

  const onDateRangeIsSelected = (start: Date, end: Date) => {
    setState({ startDate: start, endDate: end });
  };

  return (
    <MainBox>
      <Box display="flex" gap={2}>
        <Box flex={1} maxWidth={300}>
          <Calendar
            theme={theme.palette.mode}
            startDate={state.startDate}
            endDate={state.endDate}
            onDateRangeIsSelected={onDateRangeIsSelected}
          />
        </Box>
        <Box flex={2}>
          <RenderCards Cards={Cards} />
        </Box>
      </Box>
      <RenderCharts Charts={Charts} />
    </MainBox>
  );
};
