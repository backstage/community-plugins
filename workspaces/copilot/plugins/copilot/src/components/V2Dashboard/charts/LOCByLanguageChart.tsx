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
import { compactNumber, filterLocRowsByMode } from './chartUtils';

interface Props {
  data: V2MetricsByLanguageFeatureRow[];
  /** 'user' shows Suggested vs Added; 'agent' shows Added vs Deleted */
  mode: 'user' | 'agent';
}

const DROPPED_LANGUAGES = new Set(['others']);

const NO_DATA = (
  <div style={{ padding: 16, textAlign: 'center', color: '#888' }}>
    No data available
  </div>
);

export function LOCByLanguageChart({ data, mode }: Readonly<Props>) {
  if (data.length === 0) return NO_DATA;

  const filtered = filterLocRowsByMode(data, mode).filter(
    row => !DROPPED_LANGUAGES.has(row.language.toLowerCase()),
  );
  if (filtered.length === 0) return NO_DATA;

  // Aggregate per language, sorted by suggested+added desc
  const totals = new Map<
    string,
    { suggested: number; added: number; deleted: number }
  >();
  for (const row of filtered) {
    const existing = totals.get(row.language) ?? {
      suggested: 0,
      added: 0,
      deleted: 0,
    };
    totals.set(row.language, {
      suggested: existing.suggested + (row.loc_suggested_to_add_sum ?? 0),
      added: existing.added + (row.loc_added_sum ?? 0),
      deleted: existing.deleted + (row.loc_deleted_sum ?? 0),
    });
  }
  const languages = [...totals.keys()].sort(
    (a, b) =>
      totals.get(b)!.suggested +
      totals.get(b)!.added -
      (totals.get(a)!.suggested + totals.get(a)!.added),
  );

  if (mode === 'user') {
    return (
      <BarChart
        xAxis={[{ data: languages, scaleType: 'band' }]}
        series={[
          {
            data: languages.map(l => totals.get(l)!.suggested),
            label: 'Suggested',
            color: '#81C784',
          },
          {
            data: languages.map(l => totals.get(l)!.added),
            label: 'Added',
            color: '#2E7D32',
          },
        ]}
        yAxis={[{ valueFormatter: compactNumber }]}
        height={260}
      />
    );
  }

  return (
    <BarChart
      xAxis={[{ data: languages, scaleType: 'band' }]}
      series={[
        {
          data: languages.map(l => totals.get(l)!.added),
          label: 'Added',
          color: '#CE93D8',
        },
        {
          data: languages.map(l => totals.get(l)!.deleted),
          label: 'Deleted',
          color: '#7B1FA2',
        },
      ]}
      yAxis={[{ valueFormatter: compactNumber }]}
      height={260}
    />
  );
}
