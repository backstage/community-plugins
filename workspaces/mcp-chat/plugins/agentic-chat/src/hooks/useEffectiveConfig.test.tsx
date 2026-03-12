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
import { renderHook, waitFor } from '@testing-library/react';
import { useEffectiveConfig } from './useEffectiveConfig';
import { createApiTestWrapper } from '../test-utils/renderWithApi';
import type { AgenticChatApi } from '../api';

describe('useEffectiveConfig', () => {
  it('starts in loading state', () => {
    const api: Partial<AgenticChatApi> = {
      getEffectiveConfig: jest.fn(
        () => new Promise<Record<string, unknown>>(() => {}),
      ),
    };

    const { result } = renderHook(() => useEffectiveConfig(), {
      wrapper: createApiTestWrapper(api),
    });

    expect(result.current.loading).toBe(true);
    expect(result.current.config).toBeNull();
  });

  it('loads effective config successfully', async () => {
    const mockConfig = {
      model: 'meta-llama/Llama-3.3-8B-Instruct',
      baseUrl: 'http://localhost:8321',
      systemPrompt: 'You are helpful',
      toolChoice: 'auto',
      enableWebSearch: false,
      safetyEnabled: true,
    };

    const api: Partial<AgenticChatApi> = {
      getEffectiveConfig: jest.fn().mockResolvedValue(mockConfig),
    };

    const { result } = renderHook(() => useEffectiveConfig(), {
      wrapper: createApiTestWrapper(api),
    });

    await waitFor(() => {
      expect(result.current.loading).toBe(false);
    });

    expect(result.current.config).toEqual(mockConfig);
  });

  it('getValue returns correct values', async () => {
    const mockConfig = {
      model: 'llama-3',
      enableWebSearch: true,
      threshold: 0.7,
    };

    const api: Partial<AgenticChatApi> = {
      getEffectiveConfig: jest.fn().mockResolvedValue(mockConfig),
    };

    const { result } = renderHook(() => useEffectiveConfig(), {
      wrapper: createApiTestWrapper(api),
    });

    await waitFor(() => {
      expect(result.current.loading).toBe(false);
    });

    expect(result.current.getValue('model')).toBe('llama-3');
    expect(result.current.getValue('enableWebSearch')).toBe(true);
    expect(result.current.getValue('threshold')).toBe(0.7);
    expect(result.current.getValue('missing', 'fallback')).toBe('fallback');
  });

  it('returns empty config on error', async () => {
    const api: Partial<AgenticChatApi> = {
      getEffectiveConfig: jest
        .fn()
        .mockRejectedValue(new Error('Network error')),
    };

    const { result } = renderHook(() => useEffectiveConfig(), {
      wrapper: createApiTestWrapper(api),
    });

    await waitFor(() => {
      expect(result.current.loading).toBe(false);
    });

    expect(result.current.config).toEqual({});
  });
});
