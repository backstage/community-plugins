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
import { SummaryCards } from './SummaryCards';

describe('SummaryCards', () => {
  it('shows loading placeholder when loading is true', () => {
    render(<SummaryCards totals={[]} loading />);

    expect(screen.getAllByText('…')).toHaveLength(4);
  });

  it('shows formatted values from totals', () => {
    render(
      <SummaryCards
        loading={false}
        totals={[
          {
            day: '2026-05-20',
            metrics_type: 'enterprise',
            entity_id: 'ent-1',
            team_slug: '',
            daily_active_users: 10,
            weekly_active_users: 12,
            monthly_active_users: 100,
            code_acceptance_activity_count: 2,
            code_generation_activity_count: 4,
            loc_added_sum: 100,
            loc_deleted_sum: 3,
            loc_suggested_to_add_sum: 200,
            loc_suggested_to_delete_sum: 2,
            user_initiated_interaction_count: 1,
          },
          {
            day: '2026-05-21',
            metrics_type: 'enterprise',
            entity_id: 'ent-1',
            team_slug: '',
            daily_active_users: 25,
            weekly_active_users: 28,
            monthly_active_users: 200,
            code_acceptance_activity_count: 3,
            code_generation_activity_count: 5,
            loc_added_sum: 300,
            loc_deleted_sum: 6,
            loc_suggested_to_add_sum: 400,
            loc_suggested_to_delete_sum: 4,
            user_initiated_interaction_count: 2,
          },
        ]}
      />,
    );

    expect(screen.getByText('25')).toBeInTheDocument();
    expect(screen.getByText('200')).toBeInTheDocument();
    expect(screen.getByText('400')).toBeInTheDocument();
  });

  it('calculates acceptance rate correctly', () => {
    render(
      <SummaryCards
        loading={false}
        totals={[
          {
            day: '2026-05-20',
            metrics_type: 'enterprise',
            entity_id: 'ent-1',
            team_slug: '',
            daily_active_users: 12,
            weekly_active_users: 14,
            monthly_active_users: 99,
            code_acceptance_activity_count: 2,
            code_generation_activity_count: 4,
            loc_added_sum: 50,
            loc_deleted_sum: 0,
            loc_suggested_to_add_sum: 100,
            loc_suggested_to_delete_sum: 0,
            user_initiated_interaction_count: 1,
          },
        ]}
      />,
    );

    expect(screen.getByText('50.0%')).toBeInTheDocument();
  });
});
