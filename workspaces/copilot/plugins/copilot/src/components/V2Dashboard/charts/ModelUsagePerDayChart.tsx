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
import { V2MetricsByModelFeatureRow } from '@backstage-community/plugin-copilot-common';
import { formatDay, DATE_TICK_LABEL_STYLE } from './chartUtils';

interface Props {
  data: V2MetricsByModelFeatureRow[];
}

export function ModelUsagePerDayChart({ data }: Props) {
  if (data.length === 0) {
    return (
      <div style={{ padding: 16, textAlign: 'center', color: '#888' }}>
        No model data available yet
      </div>
    );
  }

  const days = [...new Set(data.map(d => d.day))].sort();
  const allModels = [...new Set(data.map(d => d.model_id))];

  // Sort models by overall total descending for a sensible legend order
  const modelOverallTotals = new Map<string, number>();
  for (const model of allModels) {
    modelOverallTotals.set(
      model,
      data
        .filter(d => d.model_id === model)
        .reduce((sum, r) => sum + r.user_initiated_interaction_count, 0),
    );
  }
  const sortedModels = [...allModels].sort(
    (a, b) =>
      (modelOverallTotals.get(b) ?? 0) - (modelOverallTotals.get(a) ?? 0),
  );

  const seriesData = new Map<string, number[]>();
  for (const model of sortedModels) {
    seriesData.set(
      model,
      days.map(day =>
        data
          .filter(d => d.day === day && d.model_id === model)
          .reduce((sum, r) => sum + r.user_initiated_interaction_count, 0),
      ),
    );
  }

  const dayTotals = days.map((_, i) =>
    sortedModels.reduce(
      (sum, model) => sum + (seriesData.get(model)?.[i] ?? 0),
      0,
    ),
  );

  const series = sortedModels.map(model => ({
    data: (seriesData.get(model) ?? []).map((val, i) =>
      dayTotals[i] > 0 ? Math.round((val / dayTotals[i]) * 100) : 0,
    ),
    label: model,
    area: true,
    showMark: false,
    stack: 'total',
    valueFormatter: (v: number | null) => (v !== null ? `${v}%` : ''),
  }));

  return (
    <LineChart
      xAxis={[
        {
          data: days,
          scaleType: 'point',
          categoryGapRatio: 0,
          valueFormatter: formatDay,
          tickLabelStyle: DATE_TICK_LABEL_STYLE,
          height: 50,
        } as any,
      ]}
      yAxis={[{ min: 0, max: 100, valueFormatter: (v: number) => `${v}%` }]}
      series={series}
      height={250}
    />
  );
}
