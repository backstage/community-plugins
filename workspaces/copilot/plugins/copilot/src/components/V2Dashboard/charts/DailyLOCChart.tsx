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

export function DailyLOCChart({ data }: Props) {
  const aggregated = aggregateDailyTotals(data);
  if (aggregated.length === 0) return NO_DATA;

  const days = aggregated.map(d => d.day);

  return (
    <BarChart
      xAxis={[
        {
          data: days,
          scaleType: 'band' as const,
          valueFormatter: formatDay,
          tickLabelStyle: DATE_TICK_LABEL_STYLE,
          height: 50,
        } as any,
      ]}
      series={[
        {
          data: aggregated.map(d => d.loc_added_sum ?? 0),
          label: 'Added',
          color: '#4CAF50',
        },
        {
          data: aggregated.map(d => d.loc_deleted_sum ?? 0),
          label: 'Deleted',
          color: '#7C4DFF',
        },
      ]}
      yAxis={[{ valueFormatter: compactNumber }]}
      height={260}
    />
  );
}
