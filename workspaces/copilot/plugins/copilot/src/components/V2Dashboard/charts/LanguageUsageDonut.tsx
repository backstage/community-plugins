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

import { PieChart } from '@mui/x-charts/PieChart';
import { V2MetricsByLanguageFeatureRow } from '@backstage-community/plugin-copilot-common';

interface Props {
  data: V2MetricsByLanguageFeatureRow[];
}

export function LanguageUsageDonut({ data }: Props) {
  if (data.length === 0) {
    return (
      <div style={{ padding: 16, textAlign: 'center', color: '#888' }}>
        No data available
      </div>
    );
  }

  const totals = new Map<string, number>();
  for (const row of data) {
    totals.set(
      row.language,
      (totals.get(row.language) ?? 0) + (row.loc_suggested_to_add_sum ?? 0),
    );
  }

  const total = [...totals.values()].reduce((sum, v) => sum + v, 0);

  const pieData = [...totals.entries()]
    .sort((a, b) => b[1] - a[1])
    .map(([label, value], id) => ({
      id,
      label,
      value: total > 0 ? Math.round((value / total) * 1000) / 10 : 0,
    }));

  return (
    <PieChart
      series={[
        {
          data: pieData,
          innerRadius: 60,
          paddingAngle: 2,
          cornerRadius: 4,
          valueFormatter: item => `${item.value}%`,
        },
      ]}
      slotProps={{
        legend: {
          direction: 'horizontal',
        },
      }}
      height={250}
    />
  );
}
