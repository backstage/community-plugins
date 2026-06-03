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
import { V2MetricsByModelFeatureRow } from '@backstage-community/plugin-copilot-common';
import { chatFeatureLabel, filterChatRows } from './chartUtils';

interface Props {
  data: V2MetricsByModelFeatureRow[];
}

export function ModelUsagePerChatModeChart({ data }: Readonly<Props>) {
  const filtered = filterChatRows(data);

  if (filtered.length === 0) {
    return (
      <div style={{ padding: 16, textAlign: 'center', color: '#888' }}>
        No model data available yet
      </div>
    );
  }

  const grandTotal = filtered.reduce(
    (sum, r) => sum + r.user_initiated_interaction_count,
    0,
  );

  // All models sorted by their total descending
  const allModels = [...new Set(filtered.map(d => d.model_id))];
  const modelTotals = new Map<string, number>();
  for (const model of allModels) {
    modelTotals.set(
      model,
      filtered
        .filter(d => d.model_id === model)
        .reduce((sum, r) => sum + r.user_initiated_interaction_count, 0),
    );
  }
  const displayModels = [...allModels].sort(
    (a, b) => (modelTotals.get(b) ?? 0) - (modelTotals.get(a) ?? 0),
  );

  // Aggregate by (model, feature)
  const agg = new Map<string, number>();
  for (const row of filtered) {
    const key = `${row.model_id}::${row.feature}`;
    agg.set(key, (agg.get(key) ?? 0) + row.user_initiated_interaction_count);
  }

  // One series per chat mode; each value is % of grand total
  const presentFeatures = [...new Set(filtered.map(d => d.feature))].sort(
    (a, b) => a.localeCompare(b),
  );

  const series = presentFeatures.map(feature => ({
    data: displayModels.map(model =>
      grandTotal > 0
        ? Math.round(
            ((agg.get(`${model}::${feature}`) ?? 0) / grandTotal) * 100 * 10,
          ) / 10
        : 0,
    ),
    label: chatFeatureLabel(feature),
    stack: 'total',
    valueFormatter: (v: number | null) => (v === null ? '' : `${v}%`),
  }));

  return (
    <BarChart
      xAxis={[
        {
          data: displayModels,
          scaleType: 'band',
          tickLabelStyle: { fontSize: 11 },
        },
      ]}
      yAxis={[{ valueFormatter: (v: number) => `${v}%` }]}
      series={series}
      height={250}
    />
  );
}
