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
import { V2MetricsByIdeRow } from '@backstage-community/plugin-copilot-common';

interface IDEBreakdownChartProps {
  items: V2MetricsByIdeRow[];
  loading: boolean;
}

export const IDEBreakdownChart = ({
  items,
  loading,
}: IDEBreakdownChartProps) => {
  if (loading) {
    return <Progress />;
  }

  if (!items.length) {
    return <InfoCard title="IDE Breakdown">No IDE data available</InfoCard>;
  }

  const byIdeMap = new Map<string, number>();

  for (const row of items) {
    byIdeMap.set(row.ide, (byIdeMap.get(row.ide) ?? 0) + row.loc_added_sum);
  }

  const ides = Array.from(byIdeMap.entries());

  return (
    <InfoCard title="LOC Added by IDE">
      <BarChart
        xAxis={[
          {
            data: ides.map(([ide]) => ide),
            scaleType: 'band',
          },
        ]}
        series={[
          {
            label: 'LOC Added',
            data: ides.map(([, locAdded]) => locAdded),
          },
        ]}
        height={320}
      />
    </InfoCard>
  );
};
