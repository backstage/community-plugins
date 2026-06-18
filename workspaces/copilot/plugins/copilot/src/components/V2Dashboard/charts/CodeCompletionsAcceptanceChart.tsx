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
import { V2MetricsByFeatureRow } from '@backstage-community/plugin-copilot-common';
import { formatDay, DATE_TICK_LABEL_STYLE } from './chartUtils';

interface Props {
  data: V2MetricsByFeatureRow[];
}

interface DayTotal {
  day: string;
  suggested: number;
  accepted: number;
}

function aggregateCodeCompletionByDay(
  data: V2MetricsByFeatureRow[],
): DayTotal[] {
  const byDay = new Map<string, DayTotal>();
  for (const row of data.filter(r => r.feature === 'code_completion')) {
    const existing = byDay.get(row.day) ?? {
      day: row.day,
      suggested: 0,
      accepted: 0,
    };
    existing.suggested += row.code_generation_activity_count ?? 0;
    existing.accepted += row.code_acceptance_activity_count ?? 0;
    byDay.set(row.day, existing);
  }
  return [...byDay.values()].sort((a, b) => a.day.localeCompare(b.day));
}

export function CodeCompletionsAcceptanceChart({ data }: Props) {
  const aggregated = aggregateCodeCompletionByDay(data);

  if (aggregated.length === 0) {
    return (
      <div style={{ padding: 16, textAlign: 'center', color: '#888' }}>
        No data available
      </div>
    );
  }

  const days = aggregated.map(d => d.day);
  const values = aggregated.map(d =>
    d.suggested > 0 ? Math.round((d.accepted / d.suggested) * 1000) / 10 : 0,
  );

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
      yAxis={[{ min: 0, max: 100 }]}
      series={[{ data: values, label: 'Acceptance Rate (%)', showMark: false }]}
      height={200}
    />
  );
}
