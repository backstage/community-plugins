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

import type { V2DailyTotal } from '@backstage-community/plugin-copilot-common';
import { aggregateDailyTotals } from './aggregateDailyTotals';

function makeRow(overrides: Partial<V2DailyTotal> = {}): V2DailyTotal {
  return {
    day: '2026-08-07',
    metrics_type: 'organization',
    entity_id: 'myorg',
    team_slug: 'team-a',
    daily_active_users: 1,
    daily_active_cli_users: 0,
    daily_active_vscode_agent_users: 0,
    monthly_active_agent_users: 0,
    monthly_active_chat_users: 0,
    code_acceptance_activity_count: 0,
    code_generation_activity_count: 0,
    loc_added_sum: 0,
    loc_deleted_sum: 0,
    loc_suggested_to_add_sum: 0,
    loc_suggested_to_delete_sum: 0,
    user_initiated_interaction_count: 0,
    ...overrides,
  };
}

describe('aggregateDailyTotals', () => {
  it('sums daily_active_vscode_agent_users across duplicate day rows', () => {
    const rows = [
      makeRow({
        team_slug: 'team-a',
        daily_active_vscode_agent_users: 3,
      }),
      makeRow({
        team_slug: 'team-b',
        daily_active_vscode_agent_users: 5,
      }),
    ];

    const result = aggregateDailyTotals(rows);

    expect(result).toHaveLength(1);
    expect(result[0].daily_active_vscode_agent_users).toBe(8);
  });

  it('treats missing daily_active_vscode_agent_users as zero', () => {
    const rows = [
      makeRow({ team_slug: 'team-a', daily_active_vscode_agent_users: 4 }),
      makeRow({
        team_slug: 'team-b',
        daily_active_vscode_agent_users: undefined,
      }),
    ];

    const result = aggregateDailyTotals(rows);

    expect(result[0].daily_active_vscode_agent_users).toBe(4);
  });

  it('passes through a single row unaggregated', () => {
    const result = aggregateDailyTotals([
      makeRow({ daily_active_vscode_agent_users: 7 }),
    ]);

    expect(result[0].daily_active_vscode_agent_users).toBe(7);
  });
});
