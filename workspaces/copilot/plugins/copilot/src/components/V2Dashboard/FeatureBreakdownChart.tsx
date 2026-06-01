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

import { InfoCard, Progress } from '@backstage/core-components';
import { BarChart } from '@mui/x-charts';
import { V2MetricsByFeatureRow } from '@backstage-community/plugin-copilot-common';

interface FeatureBreakdownChartProps {
  items: V2MetricsByFeatureRow[];
  loading: boolean;
}

export const FeatureBreakdownChart = ({
  items,
  loading,
}: FeatureBreakdownChartProps) => {
  if (loading) {
    return <Progress />;
  }

  if (!items.length) {
    return (
      <InfoCard title="Feature Breakdown">No feature data available</InfoCard>
    );
  }

  const byFeatureMap = new Map<
    string,
    { acceptance: number; generation: number }
  >();

  for (const row of items) {
    const current = byFeatureMap.get(row.feature) ?? {
      acceptance: 0,
      generation: 0,
    };
    byFeatureMap.set(row.feature, {
      acceptance: current.acceptance + row.code_acceptance_activity_count,
      generation: current.generation + row.code_generation_activity_count,
    });
  }

  const features = Array.from(byFeatureMap.entries());

  return (
    <InfoCard title="Feature Breakdown">
      <BarChart
        xAxis={[
          {
            data: features.map(([feature]) => feature),
            scaleType: 'band',
          },
        ]}
        series={[
          {
            label: 'Code Acceptance Activity',
            data: features.map(([, value]) => value.acceptance),
          },
          {
            label: 'Code Generation Activity',
            data: features.map(([, value]) => value.generation),
          },
        ]}
        height={320}
      />
    </InfoCard>
  );
};
