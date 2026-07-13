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
import { V2MetricsByLanguageModelRow } from '@backstage-community/plugin-copilot-common';

interface Props {
  data: V2MetricsByLanguageModelRow[];
}

export function ModelUsagePerLanguageChart({ data }: Props) {
  if (data.length === 0) {
    return (
      <div style={{ padding: 16, textAlign: 'center', color: '#888' }}>
        No model data available yet
      </div>
    );
  }

  const grandTotal = data.reduce((sum, r) => sum + r.request_count, 0);

  // Aggregate by (model, language)
  const agg = new Map<string, number>();
  for (const row of data) {
    const key = `${row.model_id}::${row.language}`;
    agg.set(key, (agg.get(key) ?? 0) + row.request_count);
  }

  // Sort languages by their total descending (x-axis)
  const allLanguages = [...new Set(data.map(d => d.language))];
  const langTotals = new Map<string, number>();
  for (const lang of allLanguages) {
    langTotals.set(
      lang,
      data
        .filter(d => d.language === lang)
        .reduce((sum, r) => sum + r.request_count, 0),
    );
  }
  const sortedLangs = [...allLanguages].sort(
    (a, b) => (langTotals.get(b) ?? 0) - (langTotals.get(a) ?? 0),
  );

  // Sort models by their total descending (one series per model = one colour per segment)
  const allModels = [...new Set(data.map(d => d.model_id))];
  const modelTotals = new Map<string, number>();
  for (const model of allModels) {
    modelTotals.set(
      model,
      data
        .filter(d => d.model_id === model)
        .reduce((sum, r) => sum + r.request_count, 0),
    );
  }
  const sortedModels = [...allModels].sort(
    (a, b) => (modelTotals.get(b) ?? 0) - (modelTotals.get(a) ?? 0),
  );

  // Each segment value = % of grand total across all languages and models
  const series = sortedModels.map(model => ({
    data: sortedLangs.map(lang =>
      grandTotal > 0
        ? Math.round(
            ((agg.get(`${model}::${lang}`) ?? 0) / grandTotal) * 100 * 10,
          ) / 10
        : 0,
    ),
    label: model,
    stack: 'total',
    valueFormatter: (v: number | null) => (v !== null ? `${v}%` : ''),
  }));

  return (
    <BarChart
      xAxis={[
        {
          data: sortedLangs,
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
