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
import { V2MetricsByLanguageFeatureRow } from '@backstage-community/plugin-copilot-common';
import {
  compactNumber,
  filterLocRowsByMode,
  aggregateLocTotals,
  USER_LOC_COLORS,
} from './chartUtils';

const DROPPED_LANGUAGES = new Set(['others']);

interface Props {
  data: V2MetricsByLanguageFeatureRow[];
}

const NO_DATA = (
  <div style={{ padding: 16, textAlign: 'center', color: '#888' }}>
    No data available
  </div>
);

export function UserLOCByLanguageChart({ data }: Readonly<Props>) {
  if (data.length === 0) return NO_DATA;

  const filtered = filterLocRowsByMode(data, 'user').filter(
    row => !DROPPED_LANGUAGES.has(row.language.toLowerCase()),
  );
  if (filtered.length === 0) return NO_DATA;

  const totals = aggregateLocTotals(filtered, r => r.language);
  const languages = [...totals.keys()].sort(
    (a, b) =>
      totals.get(b)!.suggested +
      totals.get(b)!.added -
      (totals.get(a)!.suggested + totals.get(a)!.added),
  );

  return (
    <BarChart
      xAxis={[{ data: languages, scaleType: 'band' }]}
      series={[
        {
          data: languages.map(l => totals.get(l)!.suggested),
          label: 'Suggested',
          color: USER_LOC_COLORS.suggested,
        },
        {
          data: languages.map(l => totals.get(l)!.added),
          label: 'Added',
          color: USER_LOC_COLORS.added,
        },
      ]}
      yAxis={[{ valueFormatter: compactNumber }]}
      height={260}
    />
  );
}
