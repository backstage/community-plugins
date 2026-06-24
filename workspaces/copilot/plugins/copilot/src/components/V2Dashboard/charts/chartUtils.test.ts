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
  filterChatRows,
  filterLocRowsByMode,
  getChatModelTotals,
  getMostUsedChatModel,
  isAgentCodeChangeFeature,
} from './chartUtils';

describe('chartUtils', () => {
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
