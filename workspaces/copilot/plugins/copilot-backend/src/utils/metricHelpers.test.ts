/*
 * Copyright 2025 The Backstage Authors
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
  filterIdeCompletionEditorMetrics,
  filterIdeCompletionEditorModelMetrics,
  filterIdeCompletionEditorModelLanguageMetrics,
  filterIdeEditorMetrics,
  filterIdeChatEditorModelMetrics,
  filterIdeCompletionLanguageMetrics,
  filterNewDayTotals,
} from './metricHelpers';
import { CopilotOrgDayTotal } from '@backstage-community/plugin-copilot-common';

describe('metricHelperTest', () => {
  const metrics: CopilotOrgDayTotal[] = [
    {
      day: '2024-01-01',
      organization_id: 'org1',
      daily_active_users: 20,
      totals_by_ide: [
        {
          ide: 'VSCode',
          code_generation_activity_count: 3,
          user_initiated_interaction_count: 3,
          code_acceptance_activity_count: 2,
          loc_suggested_to_add_sum: 40,
          loc_added_sum: 30,
        },
      ],
      totals_by_language_model: [
        {
          language: 'JavaScript',
          model: 'GPT-3',
          code_generation_activity_count: 20,
          code_acceptance_activity_count: 10,
          loc_suggested_to_add_sum: 40,
          loc_added_sum: 30,
        },
      ],
      totals_by_model_feature: [
        {
          model: 'GPT-3',
          feature: 'chat_panel_agent_mode',
          user_initiated_interaction_count: 2,
          code_generation_activity_count: 5,
          code_acceptance_activity_count: 3,
        },
      ],
    },
    {
      day: '2024-01-02',
      organization_id: 'org1',
      daily_active_users: 25,
    },
  ];

  it('should handle undefined editors in filterIdeCompletionEditorMetrics', () => {
    const result = filterIdeCompletionEditorMetrics(
      metrics,
      'organization',
      'team1',
    );
    expect(result).toEqual([
      {
        day: '2024-01-01',
        type: 'organization',
        team_name: 'team1',
        editor: 'VSCode',
        total_engaged_users: 3,
      },
    ]);

    const nullTeamResult = filterIdeCompletionEditorMetrics(
      metrics,
      'organization',
      undefined,
    );
    expect(nullTeamResult).toEqual([
      {
        day: '2024-01-01',
        type: 'organization',
        team_name: '',
        editor: 'VSCode',
        total_engaged_users: 3,
      },
    ]);
  });

  it('should handle undefined languages in filterIdeCompletionLanguageMetrics', () => {
    const result = filterIdeCompletionLanguageMetrics(
      metrics,
      'organization',
      'team1',
    );
    expect(result).toEqual([
      {
        day: '2024-01-01',
        type: 'organization',
        team_name: 'team1',
        total_engaged_users: 20,
        language: 'JavaScript',
      },
    ]);

    const nullTeamResult = filterIdeCompletionLanguageMetrics(
      metrics,
      'organization',
      undefined,
    );
    expect(nullTeamResult).toEqual([
      {
        day: '2024-01-01',
        type: 'organization',
        team_name: '',
        total_engaged_users: 20,
        language: 'JavaScript',
      },
    ]);
  });

  it('should handle undefined editors in filterIdeCompletionEditorModelMetrics', () => {
    const result = filterIdeCompletionEditorModelMetrics(
      metrics,
      'organization',
      'team1',
    );
    expect(result).toEqual([
      {
        day: '2024-01-01',
        type: 'organization',
        team_name: 'team1',
        editor: 'unknown',
        model: 'GPT-3',
        total_engaged_users: 20,
      },
    ]);

    const nullTeamResult = filterIdeCompletionEditorModelMetrics(
      metrics,
      'organization',
      undefined,
    );
    expect(nullTeamResult).toEqual([
      {
        day: '2024-01-01',
        type: 'organization',
        team_name: '',
        editor: 'unknown',
        model: 'GPT-3',
        total_engaged_users: 20,
      },
    ]);
  });

  it('should handle undefined editors in filterIdeCompletionEditorModelLanguageMetrics', () => {
    const result = filterIdeCompletionEditorModelLanguageMetrics(
      metrics,
      'organization',
      'team1',
    );
    expect(result).toEqual([
      {
        day: '2024-01-01',
        type: 'organization',
        team_name: 'team1',
        editor: 'unknown',
        model: 'GPT-3',
        language: 'JavaScript',
        total_engaged_users: 20,
        total_code_acceptances: 10,
        total_code_suggestions: 20,
        total_code_lines_accepted: 30,
        total_code_lines_suggested: 40,
      },
    ]);

    const nullTeamResult = filterIdeCompletionEditorModelLanguageMetrics(
      metrics,
      'organization',
      undefined,
    );
    expect(nullTeamResult).toEqual([
      {
        day: '2024-01-01',
        type: 'organization',
        team_name: '',
        editor: 'unknown',
        model: 'GPT-3',
        language: 'JavaScript',
        total_engaged_users: 20,
        total_code_acceptances: 10,
        total_code_suggestions: 20,
        total_code_lines_accepted: 30,
        total_code_lines_suggested: 40,
      },
    ]);
  });

  it('should handle undefined editors in filterIdeEditorMetrics', () => {
    const result = filterIdeEditorMetrics(metrics, 'organization', 'team1');
    expect(result).toEqual([
      {
        day: '2024-01-01',
        type: 'organization',
        team_name: 'team1',
        editor: 'VSCode',
        total_engaged_users: 3,
      },
    ]);

    const nullTeamResult = filterIdeEditorMetrics(
      metrics,
      'organization',
      undefined,
    );
    expect(nullTeamResult).toEqual([
      {
        day: '2024-01-01',
        type: 'organization',
        team_name: '',
        editor: 'VSCode',
        total_engaged_users: 3,
      },
    ]);
  });

  it('should handle undefined editors in filterIdeChatEditorModelMetrics', () => {
    const result = filterIdeChatEditorModelMetrics(
      metrics,
      'organization',
      'team1',
    );
    expect(result).toEqual([
      {
        day: '2024-01-01',
        type: 'organization',
        team_name: 'team1',
        editor: 'unknown',
        model: 'GPT-3',
        total_engaged_users: 2,
        total_chat_copy_events: 0,
        total_chats: 2,
        total_chat_insertion_events: 0,
      },
    ]);

    const nullTeamResult = filterIdeChatEditorModelMetrics(
      metrics,
      'organization',
      undefined,
    );
    expect(nullTeamResult).toEqual([
      {
        day: '2024-01-01',
        type: 'organization',
        team_name: '',
        editor: 'unknown',
        model: 'GPT-3',
        total_engaged_users: 2,
        total_chat_copy_events: 0,
        total_chats: 2,
        total_chat_insertion_events: 0,
      },
    ]);
  });
});

describe('filterNewDayTotals', () => {
  const makeTotal = (day: string): CopilotOrgDayTotal => ({
    day,
    organization_id: 'org1',
    daily_active_users: 10,
  });

  it('should return all totals sorted by day when no lastDay is provided', () => {
    const totals = [
      makeTotal('2024-01-16'),
      makeTotal('2024-01-14'),
      makeTotal('2024-01-15'),
    ];
    const result = filterNewDayTotals(totals, undefined);
    expect(result.map(t => t.day)).toEqual([
      '2024-01-14',
      '2024-01-15',
      '2024-01-16',
    ]);
  });

  it('should return empty array when no lastDay is provided and input is empty', () => {
    expect(filterNewDayTotals([], undefined)).toEqual([]);
  });

  it('should exclude the lastDay itself (the day is already stored, not new)', () => {
    // Regression: with new Date(lastDay) + DateTime.fromJSDate, the lastDay was
    // shifted to UTC midnight which in negative-offset timezones made it appear
    // "earlier" than DateTime.fromISO(total.day) at local midnight, incorrectly
    // including the already-processed day.
    const totals = [makeTotal('2024-01-15')];
    const result = filterNewDayTotals(totals, '2024-01-15');
    expect(result).toHaveLength(0);
  });

  it('should exclude lastDay and all days before it', () => {
    const totals = [
      makeTotal('2024-01-13'),
      makeTotal('2024-01-14'),
      makeTotal('2024-01-15'),
    ];
    const result = filterNewDayTotals(totals, '2024-01-15');
    expect(result).toHaveLength(0);
  });

  it('should only include days strictly after lastDay', () => {
    const totals = [
      makeTotal('2024-01-14'),
      makeTotal('2024-01-15'),
      makeTotal('2024-01-16'),
      makeTotal('2024-01-17'),
    ];
    const result = filterNewDayTotals(totals, '2024-01-15');
    expect(result).toHaveLength(2);
    expect(result.map(t => t.day)).toEqual(['2024-01-16', '2024-01-17']);
    expect(result.map(t => t.day)).not.toContain('2024-01-15');
  });

  it('should return all totals when lastDay is earlier than all entries', () => {
    const totals = [makeTotal('2024-01-15'), makeTotal('2024-01-16')];
    const result = filterNewDayTotals(totals, '2024-01-10');
    expect(result).toHaveLength(2);
  });

  it('should return results sorted ascending by day', () => {
    const totals = [makeTotal('2024-01-17'), makeTotal('2024-01-16')];
    const result = filterNewDayTotals(totals, '2024-01-15');
    expect(result.map(t => t.day)).toEqual(['2024-01-16', '2024-01-17']);
  });
});

// ---------------------------------------------------------------------------
// Aggregation regression tests
// Each function reads from totals_by_language_model (keyed by language×model)
// or totals_by_model_feature (keyed by model×feature). Without grouping, the
// same DB conflict key appears multiple times and onConflict().ignore() silently
// drops all but the first row, losing data.
// ---------------------------------------------------------------------------

describe('filterIdeCompletionLanguageMetrics - multi-model aggregation', () => {
  it('should produce one row per language and sum counts across models', () => {
    const totals: CopilotOrgDayTotal[] = [
      {
        day: '2024-01-01',
        organization_id: 'org1',
        daily_active_users: 30,
        totals_by_language_model: [
          {
            language: 'TypeScript',
            model: 'gpt-4',
            code_generation_activity_count: 10,
          },
          {
            language: 'TypeScript',
            model: 'gpt-3.5',
            code_generation_activity_count: 5,
          },
          {
            language: 'JavaScript',
            model: 'gpt-4',
            code_generation_activity_count: 8,
          },
        ],
      },
    ];

    const result = filterIdeCompletionLanguageMetrics(
      totals,
      'organization',
      'team1',
    );

    // Must be exactly 2 rows — one per distinct language, not one per (language, model)
    expect(result).toHaveLength(2);
    const ts = result.find(r => r.language === 'TypeScript');
    const js = result.find(r => r.language === 'JavaScript');
    expect(ts?.total_engaged_users).toBe(15); // 10 + 5
    expect(js?.total_engaged_users).toBe(8);
  });

  it('should exclude languages whose summed count is zero', () => {
    const totals: CopilotOrgDayTotal[] = [
      {
        day: '2024-01-01',
        organization_id: 'org1',
        totals_by_language_model: [
          {
            language: 'Rust',
            model: 'gpt-4',
            code_generation_activity_count: 0,
          },
        ],
      },
    ];

    const result = filterIdeCompletionLanguageMetrics(
      totals,
      'organization',
      'team1',
    );
    expect(result).toHaveLength(0);
  });
});

describe('filterIdeCompletionEditorModelMetrics - multi-language aggregation', () => {
  it('should produce one row per model and sum counts across languages', () => {
    const totals: CopilotOrgDayTotal[] = [
      {
        day: '2024-01-01',
        organization_id: 'org1',
        daily_active_users: 30,
        totals_by_language_model: [
          {
            language: 'TypeScript',
            model: 'gpt-4',
            code_generation_activity_count: 10,
          },
          {
            language: 'JavaScript',
            model: 'gpt-4',
            code_generation_activity_count: 8,
          },
          {
            language: 'TypeScript',
            model: 'gpt-3.5',
            code_generation_activity_count: 5,
          },
        ],
      },
    ];

    const result = filterIdeCompletionEditorModelMetrics(
      totals,
      'organization',
      'team1',
    );

    // Must be exactly 2 rows — one per distinct model, not one per (language, model)
    expect(result).toHaveLength(2);
    const gpt4 = result.find(r => r.model === 'gpt-4');
    const gpt35 = result.find(r => r.model === 'gpt-3.5');
    expect(gpt4?.total_engaged_users).toBe(18); // 10 + 8
    expect(gpt35?.total_engaged_users).toBe(5);
  });
});

describe('filterIdeChatEditorModelMetrics - multi-feature aggregation', () => {
  it('should produce one row per model and sum counts across features', () => {
    const totals: CopilotOrgDayTotal[] = [
      {
        day: '2024-01-01',
        organization_id: 'org1',
        totals_by_model_feature: [
          {
            model: 'gpt-4',
            feature: 'chat_panel',
            user_initiated_interaction_count: 10,
          },
          {
            model: 'gpt-4',
            feature: 'inline_chat',
            user_initiated_interaction_count: 5,
          },
          {
            model: 'gpt-3.5',
            feature: 'chat_panel',
            user_initiated_interaction_count: 3,
          },
        ],
      },
    ];

    const result = filterIdeChatEditorModelMetrics(
      totals,
      'organization',
      'team1',
    );

    // Must be exactly 2 rows — one per distinct model, not one per (model, feature)
    expect(result).toHaveLength(2);
    const gpt4 = result.find(r => r.model === 'gpt-4');
    const gpt35 = result.find(r => r.model === 'gpt-3.5');
    expect(gpt4?.total_engaged_users).toBe(15); // 10 + 5
    expect(gpt4?.total_chats).toBe(15);
    expect(gpt35?.total_engaged_users).toBe(3);
  });
});
