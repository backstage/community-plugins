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

import { V2DailyTotal } from '@backstage-community/plugin-copilot-common';
import { aggregateDailyTotals } from './aggregateDailyTotals';

const dailyTotal: V2DailyTotal = {
  day: '2026-06-19',
  metrics_type: 'enterprise',
  entity_id: 'ent-1',
  team_slug: 'platform',
  daily_active_users: 1,
  code_acceptance_activity_count: 0,
  code_generation_activity_count: 0,
  loc_added_sum: 0,
  loc_deleted_sum: 0,
  loc_suggested_to_add_sum: 0,
  loc_suggested_to_delete_sum: 0,
  user_initiated_interaction_count: 0,
};

describe('aggregateDailyTotals', () => {
  it('preserves unavailable AI credits when aggregating duplicate days', () => {
    const result = aggregateDailyTotals([
      dailyTotal,
      { ...dailyTotal, team_slug: 'another-team' },
    ]);

    expect(result[0].total_ai_credits_used).toBeUndefined();
  });

  it('sums defined AI credits while ignoring unavailable values', () => {
    const result = aggregateDailyTotals([
      { ...dailyTotal, total_ai_credits_used: 10 },
      { ...dailyTotal, team_slug: 'another-team' },
      { ...dailyTotal, team_slug: 'third-team', total_ai_credits_used: 5 },
    ]);

    expect(result[0].total_ai_credits_used).toBe(15);
  });
});
