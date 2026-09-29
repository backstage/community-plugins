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
import {
  filterChatRows,
  filterLocRowsByMode,
  formatDay,
  fillDateRange,
  getChatModelTotals,
  getMostUsedChatModel,
  isAgentCodeChangeFeature,
} from './chartUtils';
import { fillDailyTotalsGaps } from './aggregateDailyTotals';

describe('chartUtils', () => {
  describe('formatDay', () => {
    it('formats a plain YYYY-MM-DD string', () => {
      expect(formatDay('2026-05-26')).toBe('May 26');
    });

    it('formats a full ISO timestamp string as returned by an unnormalized Postgres date column (regression test for #9540)', () => {
      expect(formatDay('2026-05-26T00:00:00.000Z')).toBe('May 26');
    });
  });

  it('classifies agent code change features consistently', () => {
    expect(isAgentCodeChangeFeature('agent_edit')).toBe(true);
    expect(isAgentCodeChangeFeature('chat_panel_edit_mode')).toBe(true);
    expect(isAgentCodeChangeFeature('chat_panel_agent_mode')).toBe(true);
    expect(isAgentCodeChangeFeature('chat_panel_custom_mode')).toBe(true);
    expect(isAgentCodeChangeFeature('copilot_cli')).toBe(false);
    expect(isAgentCodeChangeFeature('chat_panel_ask_mode')).toBe(false);
  });

  it('filters LOC rows by user and agent mode using the shared buckets', () => {
    const rows = [
      { feature: 'code_completion' },
      { feature: 'chat_panel_agent_mode' },
      { feature: 'chat_panel_edit_mode' },
      { feature: 'chat_panel_plan_mode' },
      { feature: 'copilot_cli' },
    ];

    expect(filterLocRowsByMode(rows, 'agent')).toEqual([
      { feature: 'chat_panel_agent_mode' },
      { feature: 'chat_panel_edit_mode' },
    ]);
    expect(filterLocRowsByMode(rows, 'user')).toEqual([
      { feature: 'code_completion' },
      { feature: 'copilot_cli' },
    ]);
  });

  it('filters chat rows and derives chat model totals from chat-only features', () => {
    const rows = [
      {
        feature: 'chat_panel_ask_mode',
        model_id: 'gpt-4.1',
        user_initiated_interaction_count: 8,
      },
      {
        feature: 'chat_panel_agent_mode',
        model_id: 'gpt-4.1',
        user_initiated_interaction_count: 3,
      },
      {
        feature: 'code_completion',
        model_id: 'completion-model',
        user_initiated_interaction_count: 50,
      },
      {
        feature: 'chat_inline',
        model_id: 'others',
        user_initiated_interaction_count: 9,
      },
    ];

    expect(filterChatRows(rows)).toHaveLength(3);
    expect([...getChatModelTotals(rows).entries()]).toEqual([['gpt-4.1', 11]]);
    expect(getMostUsedChatModel(rows)).toBe('gpt-4.1');
  });
});

describe('fillDateRange', () => {
  it('generates every calendar day between from and to inclusive', () => {
    expect(fillDateRange('2026-08-07', '2026-08-10')).toEqual([
      '2026-08-07',
      '2026-08-08',
      '2026-08-09',
      '2026-08-10',
    ]);
  });

  it('returns a single-element array when from equals to', () => {
    expect(fillDateRange('2026-08-07', '2026-08-07')).toEqual(['2026-08-07']);
  });

  it('returns an empty array when from is after to', () => {
    expect(fillDateRange('2026-08-10', '2026-08-07')).toEqual([]);
  });

  it('handles ISO timestamp inputs by slicing to the date portion', () => {
    expect(
      fillDateRange('2026-08-07T00:00:00Z', '2026-08-09T23:59:59Z'),
    ).toEqual(['2026-08-07', '2026-08-08', '2026-08-09']);
  });

  it('crosses month boundaries correctly', () => {
    expect(fillDateRange('2026-01-30', '2026-02-02')).toEqual([
      '2026-01-30',
      '2026-01-31',
      '2026-02-01',
      '2026-02-02',
    ]);
  });
});

const ZERO_ROW: V2DailyTotal = {
  day: '',
  metrics_type: 'organization',
  entity_id: 'myorg',
  team_slug: '',
  daily_active_users: 1,
  daily_active_cli_users: 0,
  monthly_active_agent_users: 0,
  monthly_active_chat_users: 0,
  code_acceptance_activity_count: 5,
  code_generation_activity_count: 10,
  loc_added_sum: 20,
  loc_deleted_sum: 3,
  loc_suggested_to_add_sum: 25,
  loc_suggested_to_delete_sum: 0,
  user_initiated_interaction_count: 4,
  total_ai_credits_used: 100,
};

function makeRow(
  day: string,
  overrides: Partial<V2DailyTotal> = {},
): V2DailyTotal {
  return { ...ZERO_ROW, day, ...overrides };
}

describe('fillDailyTotalsGaps', () => {
  it('inserts zero-value rows for days missing from the data', () => {
    const data = [makeRow('2026-08-07'), makeRow('2026-08-11')];
    const result = fillDailyTotalsGaps(data, '2026-08-07', '2026-08-11');

    expect(result.map(r => r.day)).toEqual([
      '2026-08-07',
      '2026-08-08',
      '2026-08-09',
      '2026-08-10',
      '2026-08-11',
    ]);
  });

  it('preserves existing rows as-is', () => {
    const row = makeRow('2026-08-07', { loc_added_sum: 42 });
    const result = fillDailyTotalsGaps([row], '2026-08-07', '2026-08-07');
    expect(result[0].loc_added_sum).toBe(42);
  });

  it('fills gap rows with zero numeric metrics', () => {
    const data = [makeRow('2026-08-07'), makeRow('2026-08-09')];
    const result = fillDailyTotalsGaps(data, '2026-08-07', '2026-08-09');
    const gap = result[1]; // 2026-08-08
    expect(gap.day).toBe('2026-08-08');
    expect(gap.daily_active_users).toBe(0);
    expect(gap.loc_added_sum).toBe(0);
    expect(gap.user_initiated_interaction_count).toBe(0);
    expect(gap.total_ai_credits_used).toBe(0);
  });

  it('inherits metadata fields from the first data row for gap rows', () => {
    const data = [makeRow('2026-08-07'), makeRow('2026-08-09')];
    const result = fillDailyTotalsGaps(data, '2026-08-07', '2026-08-09');
    const gap = result[1]; // 2026-08-08
    expect(gap.metrics_type).toBe('organization');
    expect(gap.entity_id).toBe('myorg');
    expect(gap.team_slug).toBe('');
  });

  it('returns an empty array when the input data is empty', () => {
    expect(fillDailyTotalsGaps([], '2026-08-07', '2026-08-10')).toEqual([]);
  });
});
