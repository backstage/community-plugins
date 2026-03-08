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

import { createMockLogger } from '../../test-utils/mocks';
import {
  walkResponseChain,
  fetchResponsesFromApi,
  type ResponseListApiResult,
} from './ResponseChainWalker';
import type { ConversationDetails } from './conversationTypes';
import type { ConversationClientAccessor } from './conversationTypes';

describe('walkResponseChain', () => {
  const logger = createMockLogger();

  it('returns empty array when getConversation returns null', async () => {
    const getConversation = jest.fn().mockResolvedValue(null);
    const result = await walkResponseChain('resp-1', getConversation, logger);
    expect(result).toEqual([]);
    expect(getConversation).toHaveBeenCalledWith('resp-1');
  });

  it('returns single user+assistant pair for one response', async () => {
    const response: ConversationDetails = {
      id: 'resp-1',
      model: 'test',
      status: 'completed',
      createdAt: new Date(),
      input: [{ type: 'message', role: 'user', content: 'Hello' }],
      output: [
        {
          type: 'message',
          role: 'assistant',
          content: [{ type: 'output_text', text: 'Hi there' }],
        },
      ],
    };
    const getConversation = jest.fn().mockResolvedValue(response);
    const result = await walkResponseChain('resp-1', getConversation, logger);
    expect(result).toEqual([
      { role: 'user', text: 'Hello' },
      { role: 'assistant', text: 'Hi there' },
    ]);
  });

  it('walks chain via previousResponseId', async () => {
    const resp1: ConversationDetails = {
      id: 'resp-1',
      model: 'test',
      status: 'completed',
      createdAt: new Date(),
      input: [{ type: 'input_text', text: 'Second message' }],
      output: [
        {
          type: 'message',
          role: 'assistant',
          content: [{ type: 'output_text', text: 'Second reply' }],
        },
      ],
      previousResponseId: 'resp-0',
    };
    const resp0: ConversationDetails = {
      id: 'resp-0',
      model: 'test',
      status: 'completed',
      createdAt: new Date(),
      input: [{ type: 'input_text', text: 'First message' }],
      output: [
        {
          type: 'message',
          role: 'assistant',
          content: [{ type: 'output_text', text: 'First reply' }],
        },
      ],
    };
    const getConversation = jest
      .fn()
      .mockResolvedValueOnce(resp1)
      .mockResolvedValueOnce(resp0)
      .mockResolvedValue(null);
    const result = await walkResponseChain('resp-1', getConversation, logger);
    expect(result).toEqual([
      { role: 'user', text: 'First message' },
      { role: 'assistant', text: 'First reply' },
      { role: 'user', text: 'Second message' },
      { role: 'assistant', text: 'Second reply' },
    ]);
  });

  it('stops on cycle and logs warning', async () => {
    const resp: ConversationDetails = {
      id: 'resp-1',
      model: 'test',
      status: 'completed',
      createdAt: new Date(),
      input: [{ type: 'input_text', text: 'Hi' }],
      output: [
        {
          type: 'message',
          role: 'assistant',
          content: [{ type: 'output_text', text: 'Hello' }],
        },
      ],
      previousResponseId: 'resp-1',
    };
    const getConversation = jest.fn().mockResolvedValue(resp);
    const result = await walkResponseChain('resp-1', getConversation, logger);
    expect(logger.warn).toHaveBeenCalledWith(
      expect.stringContaining('Cycle detected'),
    );
    expect(result).toHaveLength(2);
  });

  it('stops on fetch error and logs debug', async () => {
    const getConversation = jest
      .fn()
      .mockResolvedValueOnce({
        id: 'resp-1',
        model: 'test',
        status: 'completed',
        createdAt: new Date(),
        input: [],
        output: [
          {
            type: 'message',
            role: 'assistant',
            content: [{ type: 'output_text', text: 'Ok' }],
          },
        ],
        previousResponseId: 'resp-0',
      })
      .mockRejectedValue(new Error('Network error'));
    const result = await walkResponseChain('resp-1', getConversation, logger);
    expect(logger.debug).toHaveBeenCalledWith(
      expect.stringContaining('fetch error'),
    );
    expect(result).toHaveLength(1);
  });

  it('skips empty user/assistant text', async () => {
    const response: ConversationDetails = {
      id: 'resp-1',
      model: 'test',
      status: 'completed',
      createdAt: new Date(),
      input: [],
      output: [
        {
          type: 'message',
          role: 'assistant',
          content: [{ type: 'output_text', text: '   ' }],
        },
      ],
    };
    const getConversation = jest.fn().mockResolvedValue(response);
    const result = await walkResponseChain('resp-1', getConversation, logger);
    expect(result).toEqual([]);
  });
});

describe('fetchResponsesFromApi', () => {
  const logger = createMockLogger();

  it('fetches responses with correct params', async () => {
    const mockResult: ResponseListApiResult = {
      data: [
        {
          id: 'resp-1',
          model: 'test',
          status: 'completed',
          created_at: 1234567890,
          input: [],
          output: [],
        },
      ],
      has_more: false,
    };
    const requestMock = jest.fn().mockResolvedValue(mockResult);
    const clientAccessor: ConversationClientAccessor = {
      getClient: () =>
        ({
          request: requestMock,
        } as unknown as ConversationClientAccessor['getClient'] extends () => infer C
          ? C
          : never),
      getModel: () => 'test-model',
    };

    const result = await fetchResponsesFromApi(
      clientAccessor,
      10,
      'desc',
      undefined,
      logger,
    );

    expect(result).toEqual(mockResult);
    expect(requestMock).toHaveBeenCalledWith(
      '/v1/openai/v1/responses?limit=10&order=desc',
      { method: 'GET' },
    );
  });

  it('includes after param when provided', async () => {
    const mockResult: ResponseListApiResult = {
      data: [],
      has_more: false,
    };
    const requestMock = jest.fn().mockResolvedValue(mockResult);
    const clientAccessor: ConversationClientAccessor = {
      getClient: () =>
        ({
          request: requestMock,
        } as unknown as ConversationClientAccessor['getClient'] extends () => infer C
          ? C
          : never),
      getModel: () => 'test-model',
    };

    await fetchResponsesFromApi(
      clientAccessor,
      20,
      'asc',
      'last-id-123',
      logger,
    );

    expect(requestMock).toHaveBeenCalledWith(
      '/v1/openai/v1/responses?limit=20&order=asc&after=last-id-123',
      { method: 'GET' },
    );
  });

  it('throws on request error', async () => {
    const requestMock = jest.fn().mockRejectedValue(new Error('Network error'));
    const clientAccessor: ConversationClientAccessor = {
      getClient: () =>
        ({
          request: requestMock,
        } as unknown as ConversationClientAccessor['getClient'] extends () => infer C
          ? C
          : never),
      getModel: () => 'test-model',
    };

    await expect(
      fetchResponsesFromApi(clientAccessor, 10, 'desc', undefined, logger),
    ).rejects.toThrow('Network error');
    expect(logger.error).toHaveBeenCalledWith(
      expect.stringContaining('Failed to fetch conversations'),
    );
  });
});
