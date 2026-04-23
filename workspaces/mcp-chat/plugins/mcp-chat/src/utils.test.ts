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

import { extractLastToolRequests } from './utils';
import { ChatMessage } from './types';

describe('extractLastToolRequests', () => {
  const meta = { id: '1', timestamp: new Date() };

  it('returns undefined for empty messages', () => {
    expect(extractLastToolRequests([])).toBeUndefined();
  });

  it('returns undefined when last message is user', () => {
    const messages: ChatMessage[] = [
      { role: 'user', content: 'hi', metadata: meta },
    ];
    expect(extractLastToolRequests(messages)).toBeUndefined();
  });

  it('returns undefined when last assistant has no tool_calls', () => {
    const messages: ChatMessage[] = [
      { role: 'assistant', content: 'hello', metadata: meta },
    ];
    expect(extractLastToolRequests(messages)).toBeUndefined();
  });

  it('returns map with approval status from metadata', () => {
    const messages: ChatMessage[] = [
      {
        role: 'assistant',
        content: null,
        tool_calls: [
          {
            id: 'c1',
            type: 'function',
            function: { name: 'search', arguments: '{}' },
            metadata: { serverId: 's1', approval_status: 'approved' },
          },
          {
            id: 'c2',
            type: 'function',
            function: { name: 'fetch', arguments: '{}' },
            metadata: { serverId: 's2', approval_status: 'rejected' },
          },
        ],
        metadata: meta,
      },
    ];

    expect(extractLastToolRequests(messages)).toEqual({
      c1: 'approved',
      c2: 'rejected',
    });
  });

  it('defaults to pending when metadata missing', () => {
    const messages: ChatMessage[] = [
      {
        role: 'assistant',
        content: null,
        tool_calls: [
          {
            id: 'c1',
            type: 'function',
            function: { name: 'search', arguments: '{}' },
          },
        ],
        metadata: meta,
      },
    ];

    expect(extractLastToolRequests(messages)).toEqual({ c1: 'pending' });
  });

  it('only looks at last message', () => {
    const messages: ChatMessage[] = [
      {
        role: 'assistant',
        content: null,
        tool_calls: [
          {
            id: 'old',
            type: 'function',
            function: { name: 'old_tool', arguments: '{}' },
            metadata: { approval_status: 'approved' },
          },
        ],
        metadata: meta,
      },
      { role: 'user', content: 'thanks', metadata: meta },
    ];

    expect(extractLastToolRequests(messages)).toBeUndefined();
  });
});
