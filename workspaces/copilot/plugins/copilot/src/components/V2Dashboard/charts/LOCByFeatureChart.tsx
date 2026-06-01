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
import { V2MetricsByFeatureRow } from '@backstage-community/plugin-copilot-common';
import { compactNumber } from './chartUtils';

interface Props {
  data: V2MetricsByFeatureRow[];
  /** 'user' shows Suggested vs Added; 'agent' shows Added vs Deleted */
  mode: 'user' | 'agent';
}

/** Features driven by agents performing autonomous edits (not chat) */
function isAgentFeature(feature: string): boolean {
  return feature === 'agent_edit';
}

/** Features to exclude from all LOC-by-feature charts */
const DROPPED_FEATURES = new Set([
  'chat_panel_unknown_mode',
  'chat_panel_plan_mode',
  'others',
]);

/** Human-readable label for a feature name */
function featureLabel(feature: string): string {
  const labels: Record<string, string> = {
    chat_inline: 'Inline',
    chat_panel_edit_mode: 'Edit',
    chat_panel_ask_mode: 'Ask',
    chat_panel_plan_mode: 'Plan',
    chat_panel_agent_mode: 'Agent',
    chat_panel_custom_mode: 'Custom',
    code_completion: 'Completions',
    copilot_cli: 'CLI',
    agent_edit: 'Agent',
  };
  return labels[feature] ?? feature;
}

const NO_DATA = (
  <div style={{ padding: 16, textAlign: 'center', color: '#888' }}>
    No data available
  </div>
);

export function LOCByFeatureChart({ data, mode }: Props) {
  if (data.length === 0) return NO_DATA;

  // Aggregate all days together per feature
  const totals = new Map<
    string,
    { suggested: number; added: number; deleted: number }
  >();
  for (const row of data) {
    if (DROPPED_FEATURES.has(row.feature)) continue;
    const isAgent = isAgentFeature(row.feature);
    if (mode === 'agent' && !isAgent) continue;
    if (mode === 'user' && isAgent) continue;

    const existing = totals.get(row.feature) ?? {
      suggested: 0,
      added: 0,
      deleted: 0,
    };
    totals.set(row.feature, {
      suggested: existing.suggested + (row.loc_suggested_to_add_sum ?? 0),
      added: existing.added + (row.loc_added_sum ?? 0),
      deleted: existing.deleted + (row.loc_deleted_sum ?? 0),
    });
  }

  if (totals.size === 0) return NO_DATA;

  const features = [...totals.keys()].sort(
    (a, b) =>
      totals.get(b)!.suggested +
      totals.get(b)!.added -
      (totals.get(a)!.suggested + totals.get(a)!.added),
  );
  const labels = features.map(featureLabel);

  if (mode === 'user') {
    return (
      <BarChart
        xAxis={[{ data: labels, scaleType: 'band' }]}
        series={[
          {
            data: features.map(f => totals.get(f)!.suggested),
            label: 'Suggested',
            color: '#81C784',
          },
          {
            data: features.map(f => totals.get(f)!.added),
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
      xAxis={[{ data: labels, scaleType: 'band' }]}
      series={[
        {
          data: features.map(f => totals.get(f)!.added),
          label: 'Added',
          color: '#CE93D8',
        },
        {
          data: features.map(f => totals.get(f)!.deleted),
          label: 'Deleted',
          color: '#7B1FA2',
        },
      ]}
      yAxis={[{ valueFormatter: compactNumber }]}
      height={260}
    />
  );
}
