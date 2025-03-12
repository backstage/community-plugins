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
} from './metricHelpers';
import { CopilotMetrics } from '@backstage-community/plugin-copilot-common';

describe('metricHelperTest', () => {
  const metrics = [
    {
      date: '2024-01-01',
      total_engaged_users: 10,
      total_active_users: 20,
      copilot_ide_code_completions: {
        total_engaged_users: 5,
        editors: [
          {
            name: 'VSCode',
            total_engaged_users: 3,
            models: [
              {
                name: 'GPT-3',
                total_engaged_users: 2,
                languages: [
                  {
                    name: 'JavaScript',
                    total_engaged_users: 1,
                    total_code_acceptances: 10,
                    total_code_suggestions: 20,
                    total_code_lines_accepted: 30,
                    total_code_lines_suggested: 40,
                  },
                ],
              },
            ],
          },
        ],
        languages: [
          {
            name: 'JavaScript',
            total_engaged_users: 1,
          },
        ],
      },
      copilot_ide_chat: {
        total_engaged_users: 5,
        editors: [
          {
            name: 'VSCode',
            total_engaged_users: 3,
            models: [
              {
                name: 'GPT-3',
                total_engaged_users: 2,
                total_chat_copy_events: 10,
                total_chats: 20,
                total_chat_insertion_events: 30,
              },
            ],
          },
        ],
      },
    },
    {
      date: '2024-01-02',
      total_engaged_users: 15,
      total_active_users: 25,
      copilot_ide_code_completions: {
        total_engaged_users: 7,
        languages: [
          {
            name: 'TypeScript',
            total_engaged_users: 2,
          },
        ],
      },
      copilot_ide_chat: {
        total_engaged_users: 7,
      },
    },
  ] as unknown as CopilotMetrics[];

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
        editor: 'VSCode',
        model: 'GPT-3',
        total_engaged_users: 2,
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
        editor: 'VSCode',
        model: 'GPT-3',
        language: 'JavaScript',
        total_engaged_users: 1,
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
        editor: 'VSCode',
        model: 'GPT-3',
        total_engaged_users: 2,
        total_chat_copy_events: 10,
        total_chats: 20,
        total_chat_insertion_events: 30,
      },
    ]);
  });
});
