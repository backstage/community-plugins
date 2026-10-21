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
import {
  compactNumber,
  formatDay,
  DATE_TICK_LABEL_STYLE,
  fillDateRange,
} from './chartUtils';

interface Props {
  data: V2MetricsByFeatureRow[];
  from: string;
  to: string;
}

interface DayTotal {
  day: string;
  suggested: number;
  accepted: number;
}

function aggregateCodeCompletionByDay(
  data: V2MetricsByFeatureRow[],
): Map<string, DayTotal> {
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
  return byDay;
}

export function CodeCompletionsChart({ data, from, to }: Props) {
  const byDay = aggregateCodeCompletionByDay(data);
  const days = fillDateRange(from, to);

  if (days.length === 0 && byDay.size === 0) {
    return (
      <div style={{ padding: 16, textAlign: 'center', color: '#888' }}>
        No data available
      </div>
    );
  }

  if (byDay.size === 0) {
    return (
      <div style={{ padding: 16, textAlign: 'center', color: '#888' }}>
        No data available
      </div>
    );
  }

  const ZERO: DayTotal = { day: '', suggested: 0, accepted: 0 };

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
          data: days.map(d => (byDay.get(d) ?? ZERO).suggested),
          label: 'Suggested',
          showMark: false,
        },
        {
          data: days.map(d => (byDay.get(d) ?? ZERO).accepted),
          label: 'Accepted',
          showMark: false,
        },
      ]}
      yAxis={[{ valueFormatter: compactNumber }]}
      height={200}
    />
  );
}
