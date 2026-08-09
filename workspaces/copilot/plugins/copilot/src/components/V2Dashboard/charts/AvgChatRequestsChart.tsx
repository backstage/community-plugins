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

import { LineChart } from '@mui/x-charts/LineChart';
import { V2DailyTotal } from '@backstage-community/plugin-copilot-common';
import { aggregateDailyTotals } from './aggregateDailyTotals';
import { formatDay, DATE_TICK_LABEL_STYLE } from './chartUtils';

interface Props {
  data: V2DailyTotal[];
}

export function AvgChatRequestsChart({ data }: Props) {
  const aggregated = aggregateDailyTotals(data);
  const days = aggregated.map(d => d.day);
  const values = aggregated.map(d =>
    d.daily_active_users > 0
      ? Math.round(
          (d.user_initiated_interaction_count / d.daily_active_users) * 10,
        ) / 10
      : 0,
  );

  if (aggregated.length === 0) {
    return (
      <div style={{ padding: 16, textAlign: 'center', color: '#888' }}>
        No data available
      </div>
    );
  }

  return (
    <LineChart
      xAxis={[
        {
          data: days,
          scaleType: 'point' as const,
          categoryGapRatio: 0,
          valueFormatter: formatDay,
          tickLabelStyle: DATE_TICK_LABEL_STYLE,
          height: 50,
        } as any,
      ]}
      series={[
        {
          data: values,
          label: 'Avg Chat Requests per Active User',
          showMark: false,
        },
      ]}
      height={200}
    />
  );
}
