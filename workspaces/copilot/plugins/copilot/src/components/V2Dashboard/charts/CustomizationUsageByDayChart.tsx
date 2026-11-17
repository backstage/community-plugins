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
import { V2CustomizationMetricRow } from '@backstage-community/plugin-copilot-common';
import {
  compactNumber,
  DATE_TICK_LABEL_STYLE,
  fillDateRange,
  formatDay,
} from './chartUtils';

type Props = {
  data: V2CustomizationMetricRow[];
  from: string;
  to: string;
};

export function CustomizationUsageByDayChart({
  data,
  from,
  to,
}: Readonly<Props>) {
  if (data.length === 0) {
    return (
      <div style={{ padding: 16, textAlign: 'center', color: '#888' }}>
        No customization data available
      </div>
    );
  }

  const days = fillDateRange(from, to);
  const totalsByItem = new Map<string, number>();
  const valuesByItemAndDay = new Map<string, number>();
  for (const row of data) {
    if (row.interaction_count <= 0) {
      continue;
    }

    totalsByItem.set(
      row.item_name,
      (totalsByItem.get(row.item_name) ?? 0) + row.interaction_count,
    );
    const key = `${row.item_name}\u0000${row.day}`;
    valuesByItemAndDay.set(
      key,
      (valuesByItemAndDay.get(key) ?? 0) + row.interaction_count,
    );
  }

  const items = [...totalsByItem.keys()].sort(
    (left, right) =>
      (totalsByItem.get(right) ?? 0) - (totalsByItem.get(left) ?? 0),
  );
  if (items.length === 0) {
    return (
      <div style={{ padding: 16, textAlign: 'center', color: '#888' }}>
        No customization data available
      </div>
    );
  }

  const series = items.map(itemName => ({
    data: days.map(
      day => valuesByItemAndDay.get(`${itemName}\u0000${day}`) ?? 0,
    ),
    label: itemName,
    stack: 'total',
    valueFormatter: (value: number | null) =>
      value && value > 0 ? value.toLocaleString() : null,
  }));

  return (
    <BarChart
      enableKeyboardNavigation
      xAxis={[
        {
          data: days,
          scaleType: 'band',
          valueFormatter: formatDay,
          tickLabelStyle: DATE_TICK_LABEL_STYLE,
          height: 50,
        } as any,
      ]}
      yAxis={[{ valueFormatter: compactNumber }]}
      series={series}
      height={250}
    />
  );
}
