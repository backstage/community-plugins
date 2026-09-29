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

import { BarChart } from '@mui/x-charts/BarChart';
import { XAxis } from '@mui/x-charts/models';
import { V2DailyTotal } from '@backstage-community/plugin-copilot-common';
import { aggregateDailyTotals } from './aggregateDailyTotals';
import { compactNumber, formatDay, DATE_TICK_LABEL_STYLE } from './chartUtils';

interface Props {
  data: V2DailyTotal[];
}

const NO_DATA = (
  <div style={{ padding: 16, textAlign: 'center', color: '#888' }}>
    No data available
  </div>
);

/**
 * Renders the daily AI credits consumed for the selected team over the
 * selected timeframe. AI credits are only available from per-user data, so
 * this chart is only meaningful for team-scoped views.
 */
export function AiCreditsConsumptionChart({ data }: Props) {
  const aggregated = aggregateDailyTotals(data);
  if (
    aggregated.length === 0 ||
    !aggregated.some(row => row.total_ai_credits_used !== undefined)
  ) {
    return NO_DATA;
  }

  const days = aggregated.map(d => d.day);
  const xAxis: XAxis<'band', string>[] = [
    {
      data: days,
      scaleType: 'band',
      valueFormatter: formatDay,
      tickLabelStyle: DATE_TICK_LABEL_STYLE,
      height: 50,
    },
  ];

  return (
    <BarChart
      xAxis={xAxis}
      series={[
        {
          data: aggregated.map(d => d.total_ai_credits_used ?? null),
          label: 'AI credits used',
          color: '#1E88E5',
        },
      ]}
      yAxis={[{ valueFormatter: compactNumber }]}
      height={260}
    />
  );
}
