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

import { render, screen } from '@testing-library/react';
import { V2CustomizationMetricRow } from '@backstage-community/plugin-copilot-common';
import { CustomizationUsageByDayChart } from './CustomizationUsageByDayChart';

jest.mock('@mui/x-charts/BarChart', () => ({
  BarChart: ({
    series,
  }: {
    series: Array<{
      valueFormatter: (value: number | null) => string | null;
    }>;
  }) => (
    <>
      <output data-testid="chart-series">{JSON.stringify(series)}</output>
      <output data-testid="zero-value-formatters">
        {JSON.stringify(series.map(item => item.valueFormatter(0)))}
      </output>
    </>
  ),
}));

const BASE_ROW: V2CustomizationMetricRow = {
  day: '2026-10-22',
  metrics_type: 'organization',
  entity_id: 'org-1',
  scope: 'aggregate',
  team_slug: '',
  user_id: 0,
  user_login: '',
  category: 'mcp',
  item_name: 'docs-search',
  interaction_count: 2,
};

describe('CustomizationUsageByDayChart', () => {
  it('stacks each named customization across every day in the range', () => {
    render(
      <CustomizationUsageByDayChart
        data={[
          BASE_ROW,
          { ...BASE_ROW, day: '2026-10-24', interaction_count: 3 },
          {
            ...BASE_ROW,
            day: '2026-10-23',
            item_name: 'repository-search',
            interaction_count: 4,
          },
          {
            ...BASE_ROW,
            item_name: 'unused-server',
            interaction_count: 0,
          },
        ]}
        from="2026-10-22"
        to="2026-10-24"
      />,
    );

    expect(screen.getByTestId('chart-series')).toHaveTextContent(
      '[{"data":[2,0,3],"label":"docs-search","stack":"total"},{"data":[0,4,0],"label":"repository-search","stack":"total"}]',
    );
    expect(screen.getByTestId('zero-value-formatters')).toHaveTextContent(
      '[null,null]',
    );
  });
});
