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
import { renderHook, waitFor, act } from '@testing-library/react';
import { useModels } from './useModels';
import { createApiTestWrapper } from '../test-utils/renderWithApi';
import type { AgenticChatApi } from '../api';

describe('useModels', () => {
  it('starts in loading state', () => {
    const api: Partial<AgenticChatApi> = {
      listModels: jest.fn(() => new Promise(() => {})),
    };

    const { result } = renderHook(() => useModels(), {
      wrapper: createApiTestWrapper(api),
    });

    expect(result.current.loading).toBe(true);
    expect(result.current.models).toEqual([]);
  });

  it('loads models successfully', async () => {
    const mockModels = [
      { id: 'llama-3', owned_by: 'meta' },
      { id: 'qwen-14b' },
    ];

    const api: Partial<AgenticChatApi> = {
      listModels: jest.fn().mockResolvedValue(mockModels),
    };

    const { result } = renderHook(() => useModels(), {
      wrapper: createApiTestWrapper(api),
    });

    await waitFor(() => {
      expect(result.current.loading).toBe(false);
    });

    expect(result.current.models).toEqual(mockModels);
    expect(result.current.error).toBeNull();
  });

  it('handles error gracefully', async () => {
    const api: Partial<AgenticChatApi> = {
      listModels: jest.fn().mockRejectedValue(new Error('Connection refused')),
    };

    const { result } = renderHook(() => useModels(), {
      wrapper: createApiTestWrapper(api),
    });

    await waitFor(() => {
      expect(result.current.loading).toBe(false);
    });

    expect(result.current.models).toEqual([]);
    expect(result.current.error).toBe('Connection refused');
  });

  it('refresh re-fetches models', async () => {
    let callCount = 0;
    const api: Partial<AgenticChatApi> = {
      listModels: jest.fn().mockImplementation(() => {
        callCount++;
        if (callCount === 1) {
          return Promise.resolve([{ id: 'model-a' }]);
        }
        return Promise.resolve([{ id: 'model-a' }, { id: 'model-b' }]);
      }),
    };

    const { result } = renderHook(() => useModels(), {
      wrapper: createApiTestWrapper(api),
    });

    await waitFor(() => {
      expect(result.current.loading).toBe(false);
    });

    expect(result.current.models).toHaveLength(1);

    await act(async () => {
      await result.current.refresh();
    });

    expect(result.current.models).toHaveLength(2);
    expect(api.listModels).toHaveBeenCalledTimes(2);
  });
});
