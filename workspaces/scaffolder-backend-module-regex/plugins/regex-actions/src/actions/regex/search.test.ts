/*
 * Copyright 2024 The Backstage Authors
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
import { createMockActionContext } from '@backstage/plugin-scaffolder-node-test-utils';

import { createSearchAction } from './search';

describe('regex:search', () => {
  const action = createSearchAction();

  const mockContext = createMockActionContext();

  beforeEach(() => {
    jest.resetAllMocks();
  });

  it('should find the first match', async () => {
    const input = {
      objects: [
        { id: '1', text: 'The quick brown fox' },
        { id: '2', text: 'The lazy dog' },
      ],
      property: 'text',
      pattern: 'The',
      outputKey: 'match',
      firstOnly: true,
    };

    const context = {
      ...mockContext,
      input,
    };

    await action.handler(context);

    expect(context.output).toHaveBeenLastCalledWith('results', [
      { id: '1', text: 'The quick brown fox', match: 'The' },
      { id: '2', text: 'The lazy dog', match: 'The' },
    ]);
  });

  it('should find all matches', async () => {
    const input = {
      objects: [
        { id: '1', text: 'The quick brown fox jumps over the lazy dog.' },
        { id: '2', text: 'The dog is lazy.' },
      ],
      property: 'text',
      pattern: 'the',
      global: true,
      caseInsensitive: true,
      outputKey: 'matches',
      firstOnly: false,
    };

    const context = {
      ...mockContext,
      input,
    };

    await action.handler(context);

    expect(context.output).toHaveBeenLastCalledWith('results', [
      {
        id: '1',
        text: 'The quick brown fox jumps over the lazy dog.',
        matches: ['The', 'the'],
      },
      { id: '2', text: 'The dog is lazy.', matches: ['The'] },
    ]);
  });

  it('should return empty for no matches', async () => {
    const input = {
      objects: [{ id: '1', text: 'Hello world' }],
      property: 'text',
      pattern: 'fox',
      outputKey: 'match',
      firstOnly: true,
    };

    const context = {
      ...mockContext,
      input,
    };

    await action.handler(context);

    expect(context.output).toHaveBeenLastCalledWith('results', [
      { id: '1', text: 'Hello world', match: '' },
    ]);
  });

  it('should handle non-string properties', async () => {
    const input = {
      objects: [
        { id: '1', number: 123 },
        { id: '2', text: 'Hello' },
      ],
      property: 'number',
      pattern: '1',
      outputKey: 'match',
      firstOnly: true,
    };

    const context = {
      ...mockContext,
      input,
    };

    await action.handler(context);

    expect(context.output).toHaveBeenLastCalledWith('results', [
      { id: '1', number: 123, match: '' },
      { id: '2', text: 'Hello', match: '' },
    ]);
  });

  it('should handle complex regex', async () => {
    const input = {
      objects: [
        { id: '1', content: 'Email: user@example.com and admin@test.org' },
      ],
      property: 'content',
      pattern: '\\b[A-Za-z0-9._%+-]+@[A-Za-z0-9.-]+\\.[A-Z|a-z]{2,}\\b',
      global: true,
      outputKey: 'emails',
      firstOnly: false,
    };

    const context = {
      ...mockContext,
      input,
    };

    await action.handler(context);

    expect(context.output).toHaveBeenLastCalledWith('results', [
      {
        id: '1',
        content: 'Email: user@example.com and admin@test.org',
        emails: ['user@example.com', 'admin@test.org'],
      },
    ]);
  });
});
