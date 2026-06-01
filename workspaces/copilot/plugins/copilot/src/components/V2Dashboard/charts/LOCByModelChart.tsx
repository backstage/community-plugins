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
import { compactNumber } from './chartUtils';

interface Props {
  data: V2MetricsByModelFeatureRow[];
  /** 'user' shows Suggested vs Added; 'agent' shows Added vs Deleted */
  mode: 'user' | 'agent';
}

function isAgentFeature(feature: string): boolean {
  return feature === 'agent_edit' || feature === 'copilot_cli';
}

const DROPPED_FEATURES = new Set([
  'chat_panel_unknown_mode',
  'chat_panel_plan_mode',
  'others',
]);

const DROPPED_MODELS = new Set(['others']);

const NO_DATA = (
  <div style={{ padding: 16, textAlign: 'center', color: '#888' }}>
    No model data available yet
  </div>
);

export function LOCByModelChart({ data, mode }: Props) {
  if (data.length === 0) return NO_DATA;

  const filtered = data.filter(
    r =>
      !DROPPED_FEATURES.has(r.feature) &&
      !DROPPED_MODELS.has(r.model_id.toLowerCase()) &&
      (mode === 'agent'
        ? isAgentFeature(r.feature)
        : !isAgentFeature(r.feature)),
  );
  if (filtered.length === 0) return NO_DATA;

  // Aggregate per model, sorted by added desc
  const totals = new Map<
    string,
    { suggested: number; added: number; deleted: number }
  >();
  for (const row of filtered) {
    const existing = totals.get(row.model_id) ?? {
      suggested: 0,
      added: 0,
      deleted: 0,
    };
    totals.set(row.model_id, {
      suggested: existing.suggested + (row.loc_suggested_to_add_sum ?? 0),
      added: existing.added + (row.loc_added_sum ?? 0),
      deleted: existing.deleted + (row.loc_deleted_sum ?? 0),
    });
  }
  const models = [...totals.keys()].sort(
    (a, b) =>
      totals.get(b)!.suggested +
      totals.get(b)!.added -
      (totals.get(a)!.suggested + totals.get(a)!.added),
  );

  if (mode === 'user') {
    return (
      <BarChart
        xAxis={[
          { data: models, scaleType: 'band', tickLabelStyle: { fontSize: 11 } },
        ]}
        series={[
          {
            data: models.map(m => totals.get(m)!.suggested),
            label: 'Suggested',
            color: '#81C784',
          },
          {
            data: models.map(m => totals.get(m)!.added),
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
      xAxis={[
        { data: models, scaleType: 'band', tickLabelStyle: { fontSize: 11 } },
      ]}
      series={[
        {
          data: models.map(m => totals.get(m)!.added),
          label: 'Added',
          color: '#CE93D8',
        },
        {
          data: models.map(m => totals.get(m)!.deleted),
          label: 'Deleted',
          color: '#7B1FA2',
        },
      ]}
      yAxis={[{ valueFormatter: compactNumber }]}
      height={260}
    />
  );
}
