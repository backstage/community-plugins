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
import { V2CustomizationMetricRow } from '@backstage-community/plugin-copilot-common';

type Props = {
  data: V2CustomizationMetricRow[];
};

export function CustomizationUsageDonutChart({ data }: Readonly<Props>) {
  if (data.length === 0) {
    return (
      <div style={{ padding: 16, textAlign: 'center', color: '#888' }}>
        No customization data available
      </div>
    );
  }

  const totals = new Map<string, number>();
  for (const row of data) {
    if (row.interaction_count <= 0) {
      continue;
    }

    totals.set(
      row.item_name,
      (totals.get(row.item_name) ?? 0) + row.interaction_count,
    );
  }

  const total = [...totals.values()].reduce((sum, value) => sum + value, 0);
  if (total === 0) {
    return (
      <div style={{ padding: 16, textAlign: 'center', color: '#888' }}>
        No customization data available
      </div>
    );
  }

  const pieData = [...totals.entries()]
    .sort(([, left], [, right]) => right - left)
    .map(([itemName, value], id) => ({
      id,
      label: itemName,
      value,
      valueFormatter: () =>
        total > 0
          ? `${value.toLocaleString()} (${((value / total) * 100).toFixed(1)}%)`
          : '0',
    }));

  return (
    <PieChart
      enableKeyboardNavigation
      series={[
        {
          data: pieData,
          innerRadius: 60,
          paddingAngle: 2,
          cornerRadius: 4,
        },
      ]}
      slotProps={{ legend: { direction: 'horizontal' } }}
      height={250}
    />
  );
}
