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
import { V2DailyTotal } from '@backstage-community/plugin-copilot-common';
import { IDEActiveUsersChart } from './IDEActiveUsersChart';

jest.mock('@mui/x-charts/LineChart', () => ({
  LineChart: ({ series }: { series: Array<{ data: unknown }> }) => (
    <output data-testid="chart-series">{JSON.stringify(series[0].data)}</output>
  ),
}));

const BASE_ROW: V2DailyTotal = {
  day: '',
  metrics_type: 'organization',
  entity_id: 'org-1',
  team_slug: '',
  daily_active_users: 1,
  code_acceptance_activity_count: 0,
  code_generation_activity_count: 0,
  loc_added_sum: 0,
  loc_deleted_sum: 0,
  loc_suggested_to_add_sum: 0,
  loc_suggested_to_delete_sum: 0,
  user_initiated_interaction_count: 0,
};

describe('IDEActiveUsersChart', () => {
  it('renders missing organization rolling values as chart gaps', () => {
    render(
      <IDEActiveUsersChart
        data={[
          { ...BASE_ROW, day: '2026-08-07', weekly_active_users: 10 },
          { ...BASE_ROW, day: '2026-08-09', weekly_active_users: 12 },
        ]}
        variant="weekly"
        from="2026-08-07"
        to="2026-08-09"
      />,
    );

    expect(screen.getByTestId('chart-series')).toHaveTextContent(
      '[10,null,12]',
    );
  });

  it('keeps unavailable team rolling values at zero', () => {
    render(
      <IDEActiveUsersChart
        data={[
          { ...BASE_ROW, team_slug: 'platform', day: '2026-08-07' },
          { ...BASE_ROW, team_slug: 'platform', day: '2026-08-09' },
        ]}
        variant="weekly"
        from="2026-08-07"
        to="2026-08-09"
      />,
    );

    expect(screen.getByTestId('chart-series')).toHaveTextContent('[0,0,0]');
  });
});
