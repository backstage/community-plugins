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
import { V2MetricsByFeatureRow } from '@backstage-community/plugin-copilot-common';
import {
  chatFeatureLabel,
  filterChatRows,
  compactNumber,
  formatDay,
  DATE_TICK_LABEL_STYLE,
} from './chartUtils';

interface Props {
  data: V2MetricsByFeatureRow[];
}

export function RequestsByChatModeChart({ data }: Readonly<Props>) {
  if (data.length === 0) {
    return (
      <div style={{ padding: 16, textAlign: 'center', color: '#888' }}>
        No data available
      </div>
    );
  }

  const filtered = filterChatRows(data);

  const days = [...new Set(filtered.map(d => d.day))].sort((a, b) =>
    a.localeCompare(b),
  );
  const features = [...new Set(filtered.map(d => d.feature))].sort((a, b) =>
    a.localeCompare(b),
  );

  const series = features.map(feature => ({
    data: days.map(day => {
      const row = filtered.find(d => d.day === day && d.feature === feature);
      return row?.user_initiated_interaction_count ?? 0;
    }),
    label: chatFeatureLabel(feature),
    stack: 'total',
  }));

  if (series.length === 0) {
    return (
      <div style={{ padding: 16, textAlign: 'center', color: '#888' }}>
        No data available
      </div>
    );
  }

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
      series={series}
      yAxis={[{ valueFormatter: compactNumber }]}
      height={250}
    />
  );
}
