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
import {
  V2UserMetricRow,
  V2UserMetricsByFeatureRow,
  V2UserMetricsByIdeRow,
  V2UserMetricsByLanguageFeatureRow,
  V2UserMetricsByModelFeatureRow,
  V2UserMetricsByLanguageModelRow,
} from '@backstage-community/plugin-copilot-common';
import {
  toDailyTotals,
  toFeatureRows,
  toIdeRows,
  toLanguageFeatureRows,
  toModelFeatureRows,
  toLanguageModelRows,
} from './toTeamShapedRows';

const baseUserRow: V2UserMetricRow = {
  day: '2026-01-01',
  metrics_type: 'organization',
  entity_id: 'my-org',
  user_id: 1,
  user_login: 'octocat',
  used_agent: true,
  used_chat: false,
  used_cli: true,
  code_acceptance_activity_count: 3,
  code_generation_activity_count: 4,
  loc_added_sum: 10,
  loc_deleted_sum: 2,
  loc_suggested_to_add_sum: 20,
  loc_suggested_to_delete_sum: 5,
  user_initiated_interaction_count: 7,
  ai_credits_used: 12,
};

describe('toDailyTotals', () => {
  it('maps user fields onto the team-shaped daily total row', () => {
    const [result] = toDailyTotals([baseUserRow]);

    expect(result.day).toBe('2026-01-01');
    expect(result.metrics_type).toBe('organization');
    expect(result.entity_id).toBe('my-org');
    expect(result.team_slug).toBe('');
    expect(result.daily_active_users).toBe(1);
    expect(result.daily_active_cli_users).toBe(1);
    expect(result.monthly_active_agent_users).toBe(1);
    expect(result.monthly_active_chat_users).toBe(0);
    expect(result.loc_added_sum).toBe(10);
    expect(result.loc_deleted_sum).toBe(2);
    expect(result.total_ai_credits_used).toBe(12);
  });

  it('reports zero active-mode users when the flags are false', () => {
    const [result] = toDailyTotals([
      { ...baseUserRow, used_agent: false, used_chat: false, used_cli: false },
    ]);

    expect(result.daily_active_users).toBe(1);
    expect(result.daily_active_cli_users).toBe(0);
    expect(result.monthly_active_agent_users).toBe(0);
    expect(result.monthly_active_chat_users).toBe(0);
  });

  it('returns an empty array for no rows', () => {
    expect(toDailyTotals([])).toEqual([]);
  });
});

describe('toFeatureRows', () => {
  const row: V2UserMetricsByFeatureRow = {
    day: '2026-01-01',
    metrics_type: 'enterprise',
    entity_id: 'my-ent',
    user_id: 1,
    user_login: 'octocat',
    feature: 'chat-panel',
    code_acceptance_activity_count: 1,
    code_generation_activity_count: 2,
    loc_added_sum: 3,
    loc_deleted_sum: 4,
    loc_suggested_to_add_sum: 5,
    loc_suggested_to_delete_sum: 6,
    user_initiated_interaction_count: 7,
  };

  it('maps user feature rows onto team-shaped feature rows', () => {
    const [result] = toFeatureRows([row]);

    expect(result.feature).toBe('chat-panel');
    expect(result.team_slug).toBe('');
    expect(result.user_initiated_interaction_count).toBe(7);
  });
});

describe('toIdeRows', () => {
  const row: V2UserMetricsByIdeRow = {
    day: '2026-01-01',
    metrics_type: 'organization',
    entity_id: 'my-org',
    user_id: 1,
    user_login: 'octocat',
    ide: 'vscode',
    code_acceptance_activity_count: 1,
    code_generation_activity_count: 2,
    loc_added_sum: 3,
    loc_deleted_sum: 4,
    loc_suggested_to_add_sum: 5,
    loc_suggested_to_delete_sum: 6,
    user_initiated_interaction_count: 7,
  };

  it('maps user IDE rows onto team-shaped IDE rows', () => {
    const [result] = toIdeRows([row]);
    expect(result.ide).toBe('vscode');
    expect(result.team_slug).toBe('');
  });
});

describe('toLanguageFeatureRows', () => {
  const row: V2UserMetricsByLanguageFeatureRow = {
    day: '2026-01-01',
    metrics_type: 'organization',
    entity_id: 'my-org',
    user_id: 1,
    user_login: 'octocat',
    language: 'typescript',
    feature: 'code-completion',
    code_acceptance_activity_count: 1,
    code_generation_activity_count: 2,
    loc_added_sum: 3,
    loc_deleted_sum: 4,
    loc_suggested_to_add_sum: 5,
    loc_suggested_to_delete_sum: 6,
  };

  it('maps user language/feature rows onto team-shaped rows', () => {
    const [result] = toLanguageFeatureRows([row]);
    expect(result.language).toBe('typescript');
    expect(result.feature).toBe('code-completion');
    expect(result.team_slug).toBe('');
  });
});

describe('toModelFeatureRows', () => {
  const row: V2UserMetricsByModelFeatureRow = {
    day: '2026-01-01',
    metrics_type: 'organization',
    entity_id: 'my-org',
    user_id: 1,
    user_login: 'octocat',
    model_id: 'gpt-4o',
    feature: 'chat-panel',
    user_initiated_interaction_count: 7,
    code_generation_activity_count: 2,
    code_acceptance_activity_count: 1,
    loc_added_sum: 3,
    loc_deleted_sum: 4,
    loc_suggested_to_add_sum: 5,
    loc_suggested_to_delete_sum: 6,
  };

  it('maps user model/feature rows onto team-shaped rows', () => {
    const [result] = toModelFeatureRows([row]);
    expect(result.model_id).toBe('gpt-4o');
    expect(result.feature).toBe('chat-panel');
    expect(result.team_slug).toBe('');
  });
});

describe('toLanguageModelRows', () => {
  const row: V2UserMetricsByLanguageModelRow = {
    day: '2026-01-01',
    metrics_type: 'organization',
    entity_id: 'my-org',
    user_id: 1,
    user_login: 'octocat',
    language: 'typescript',
    model_id: 'gpt-4o',
    request_count: 9,
    code_generation_activity_count: 2,
    code_acceptance_activity_count: 1,
    loc_added_sum: 3,
    loc_deleted_sum: 4,
    loc_suggested_to_add_sum: 5,
    loc_suggested_to_delete_sum: 6,
  };

  it('maps user language/model rows onto team-shaped rows', () => {
    const [result] = toLanguageModelRows([row]);
    expect(result.language).toBe('typescript');
    expect(result.model_id).toBe('gpt-4o');
    expect(result.request_count).toBe(9);
    expect(result.team_slug).toBe('');
  });
});
