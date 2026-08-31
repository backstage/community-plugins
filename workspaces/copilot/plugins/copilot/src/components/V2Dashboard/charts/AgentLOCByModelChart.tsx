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
import {
  compactNumber,
  DROPPED_LOC_FEATURES,
  isOthersValue,
  isAgentModelFeature,
  aggregateLocTotals,
  AGENT_LOC_COLORS,
} from './chartUtils';

interface Props {
  data: V2MetricsByModelFeatureRow[];
}

const NO_DATA = (
  <div style={{ padding: 16, textAlign: 'center', color: '#888' }}>
    No model data available yet
  </div>
);

export function AgentLOCByModelChart({ data }: Readonly<Props>) {
  if (data.length === 0) return NO_DATA;

  const filtered = data.filter(
    r =>
      !DROPPED_LOC_FEATURES.has(r.feature) &&
      !isOthersValue(r.model_id) &&
      isAgentModelFeature(r.feature),
  );
  if (filtered.length === 0) return NO_DATA;

  const totals = aggregateLocTotals(filtered, r => r.model_id);
  const models = [...totals.keys()].sort(
    (a, b) =>
      totals.get(b)!.suggested +
      totals.get(b)!.added -
      (totals.get(a)!.suggested + totals.get(a)!.added),
  );

  return (
    <BarChart
      xAxis={[
        { data: models, scaleType: 'band', tickLabelStyle: { fontSize: 11 } },
      ]}
      series={[
        {
          data: models.map(m => totals.get(m)!.added),
          label: 'Added',
          color: AGENT_LOC_COLORS.added,
        },
        {
          data: models.map(m => totals.get(m)!.deleted),
          label: 'Deleted',
          color: AGENT_LOC_COLORS.deleted,
        },
      ]}
      yAxis={[{ valueFormatter: compactNumber }]}
      height={260}
    />
  );
}
