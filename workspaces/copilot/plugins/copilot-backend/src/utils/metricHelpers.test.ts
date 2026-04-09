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
