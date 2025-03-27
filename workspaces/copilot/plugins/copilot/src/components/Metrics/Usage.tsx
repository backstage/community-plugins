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
import React, { useMemo } from 'react';
import Box from '@mui/material/Box';
import Stack from '@mui/material/Stack';
import { styled } from '@mui/material/styles';
import { Calendar } from 'simple-date-range-calendar';
import {
  useEngagementMetrics,
  useEngagementMetricsByTeam,
  useTeams,
} from '../../hooks';
import {
  CardsProps,
  ChartsProps,
  EngagementCardsProps,
  EngagementChartsProps,
  FilterProps,
} from '../../types';
import { InfoCard, Progress } from '@backstage/core-components';
import { useSharedDateRange, useSharedTeam } from '../../contexts';
import { useSeatMetrics } from '../../hooks/useSeatMetrics';
import { useSeatMetricsByTeam } from '../../hooks/useSeatMetricsByTeam';

type MetricsProps = {
  Cards: React.ElementType<CardsProps>;
  Charts: React.ElementType<ChartsProps>;
  Filters: React.ElementType<FilterProps>;
};

type EngagementMetricsProps = {
  Cards: React.ElementType<EngagementCardsProps>;
  Charts: React.ElementType<EngagementChartsProps>;
  Filters: React.ElementType<FilterProps>;
};

const MainBox = styled(Box)(({ theme }) => ({
  display: 'flex',
  flexDirection: 'column',
  gap: theme.spacing(2),
}));

export const RenderFilters = ({
  Filters,
}: Omit<Omit<MetricsProps, 'Cards'>, 'Charts'>) => {
  const [state] = useSharedDateRange();
  const [team, setTeam] = useSharedTeam();
  const data = useTeams(state.startDate, state.endDate);
  const options = useMemo(
    () => data.items?.map(x => ({ label: x, value: x })) ?? [],
    [data.items],
  );

  if (!Filters) return null;

  if (data.loading) {
    return <Progress />;
  }

  return <Filters options={options} team={team} setTeam={setTeam} />;
};

export const RenderCharts = ({
  Charts,
}: Omit<Omit<EngagementMetricsProps, 'Cards'>, 'Filters'>) => {
  const [state] = useSharedDateRange();
  const [team] = useSharedTeam();
  const data = useEngagementMetrics(state.startDate, state.endDate);
  const dataPerTeam = useEngagementMetricsByTeam(
    state.startDate,
    state.endDate,
  );
  const seatData = useSeatMetrics(state.startDate, state.endDate);
  const seatDataPerTeam = useSeatMetricsByTeam(state.startDate, state.endDate);

  if (
    data.loading ||
    dataPerTeam.loading ||
    seatData.loading ||
    seatDataPerTeam.loading
  ) {
    return <Progress />;
  }

  return (
    <Charts
      team={team}
      metrics={data.items ?? []}
      metricsByTeam={dataPerTeam.items ?? []}
      seats={seatData.items ?? []}
      seatsByTeam={seatDataPerTeam.items ?? []}
    />
  );
};
export const RenderCards = ({
  Cards,
}: Omit<Omit<EngagementMetricsProps, 'Charts'>, 'Filters'>) => {
  const [state] = useSharedDateRange();
  const [team] = useSharedTeam();

  const data = useEngagementMetrics(state.startDate, state.endDate);
  const dataPerTeam = useEngagementMetricsByTeam(
    state.startDate,
    state.endDate,
  );

  const seatData = useSeatMetrics(state.startDate, state.endDate);
  const seatDataPerTeam = useSeatMetricsByTeam(state.startDate, state.endDate);

  if (
    !data.loading &&
    !dataPerTeam.loading &&
    !seatData.loading &&
    !seatDataPerTeam.loading
  ) {
    return (
      <Cards
        team={team}
        metrics={data.items ?? []}
        metricsByTeam={dataPerTeam.items ?? []}
        seats={seatData.items ?? []}
        seatsByTeam={seatDataPerTeam.items ?? []}
        startDate={state.startDate}
        endDate={state.endDate}
      />
    );
  }

  return <Progress />;
};

export const Usage = ({ Cards, Charts, Filters }: EngagementMetricsProps) => {
  const [state, setState] = useSharedDateRange();

  const onDateRangeIsSelected = (start: Date, end: Date) => {
    setState({ startDate: start, endDate: end });
  };

  return (
    <MainBox>
      <Box display="flex" gap={2}>
        <Box flex={1} maxWidth={296}>
          <InfoCard divider={false} noPadding>
            <Calendar
              styles={{ borderRadius: 4, width: 296 }}
              startDate={state.startDate}
              endDate={state.endDate}
              onDateRangeIsSelected={onDateRangeIsSelected}
            />
          </InfoCard>
        </Box>
        <Box flex={1}>
          <Stack pb={1.5}>
            <RenderFilters Filters={Filters} />
          </Stack>
          <RenderCards Cards={Cards} />
        </Box>
      </Box>
      <RenderCharts Charts={Charts} />
    </MainBox>
  );
};
