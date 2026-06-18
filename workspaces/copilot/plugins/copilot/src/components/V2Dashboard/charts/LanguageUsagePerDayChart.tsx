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
import { V2MetricsByLanguageFeatureRow } from '@backstage-community/plugin-copilot-common';
import { formatDay, DATE_TICK_LABEL_STYLE } from './chartUtils';

interface Props {
  data: V2MetricsByLanguageFeatureRow[];
}

export function LanguageUsagePerDayChart({ data }: Props) {
  if (data.length === 0) {
    return (
      <div style={{ padding: 16, textAlign: 'center', color: '#888' }}>
        No data available
      </div>
    );
  }

  const days = [...new Set(data.map(d => d.day))].sort();
  const allLangs = [...new Set(data.map(d => d.language))];

  // Sort languages by overall total descending for a sensible legend order
  const langTotals = new Map<string, number>();
  for (const lang of allLangs) {
    langTotals.set(
      lang,
      data
        .filter(d => d.language === lang)
        .reduce((sum, r) => sum + (r.loc_added_sum ?? 0), 0),
    );
  }
  const sortedLangs = [...allLangs].sort(
    (a, b) => (langTotals.get(b) ?? 0) - (langTotals.get(a) ?? 0),
  );

  // Sum loc_added_sum across all features per language per day
  const rawSeriesData = new Map<string, number[]>();
  for (const lang of sortedLangs) {
    rawSeriesData.set(
      lang,
      days.map(day =>
        data
          .filter(d => d.day === day && d.language === lang)
          .reduce((sum, r) => sum + (r.loc_added_sum ?? 0), 0),
      ),
    );
  }

  const dayTotals = days.map((_, i) =>
    sortedLangs.reduce(
      (sum, lang) => sum + (rawSeriesData.get(lang)?.[i] ?? 0),
      0,
    ),
  );

  const series = sortedLangs.map(lang => ({
    data: (rawSeriesData.get(lang) ?? []).map((val, i) =>
      dayTotals[i] > 0 ? Math.round((val / dayTotals[i]) * 100 * 10) / 10 : 0,
    ),
    label: lang,
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
