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
import { useGeneratePrompt } from './useGeneratePrompt';
import { createApiTestWrapper } from '../test-utils/renderWithApi';
import type { AgenticChatApi } from '../api';

describe('useGeneratePrompt', () => {
  it('starts with generating=false and no error', () => {
    const api: Partial<AgenticChatApi> = {
      generateSystemPrompt: jest.fn(),
    };

    const { result } = renderHook(() => useGeneratePrompt(), {
      wrapper: createApiTestWrapper(api),
    });

    expect(result.current.generating).toBe(false);
    expect(result.current.error).toBeNull();
  });

  it('returns generated prompt on success', async () => {
    const api: Partial<AgenticChatApi> = {
      generateSystemPrompt: jest
        .fn()
        .mockResolvedValue('You are a helpful AI assistant.'),
    };

    const { result } = renderHook(() => useGeneratePrompt(), {
      wrapper: createApiTestWrapper(api),
    });

    let prompt: string | undefined;
    await act(async () => {
      prompt = await result.current.generate('Help with K8s');
    });

    expect(prompt).toBe('You are a helpful AI assistant.');
    expect(result.current.generating).toBe(false);
    expect(result.current.error).toBeNull();
    expect(api.generateSystemPrompt).toHaveBeenCalledWith(
      'Help with K8s',
      undefined,
      undefined,
    );
  });

  it('forwards optional model parameter', async () => {
    const api: Partial<AgenticChatApi> = {
      generateSystemPrompt: jest
        .fn()
        .mockResolvedValue('Generated with custom model'),
    };

    const { result } = renderHook(() => useGeneratePrompt(), {
      wrapper: createApiTestWrapper(api),
    });

    await act(async () => {
      await result.current.generate('Help with K8s', 'custom-model');
    });

    expect(api.generateSystemPrompt).toHaveBeenCalledWith(
      'Help with K8s',
      'custom-model',
      undefined,
    );
  });

  it('forwards optional capabilities parameter', async () => {
    const api: Partial<AgenticChatApi> = {
      generateSystemPrompt: jest
        .fn()
        .mockResolvedValue('Generated with capabilities'),
    };

    const { result } = renderHook(() => useGeneratePrompt(), {
      wrapper: createApiTestWrapper(api),
    });

    const caps = {
      enableWebSearch: true,
      tools: [{ name: 'get_pods', serverLabel: 'k8s' }],
    };

    await act(async () => {
      await result.current.generate('Help with K8s', 'model-a', caps);
    });

    expect(api.generateSystemPrompt).toHaveBeenCalledWith(
      'Help with K8s',
      'model-a',
      caps,
    );
  });

  it('sets error on failure', async () => {
    const api: Partial<AgenticChatApi> = {
      generateSystemPrompt: jest
        .fn()
        .mockRejectedValue(new Error('LLM unreachable')),
    };

    const { result } = renderHook(() => useGeneratePrompt(), {
      wrapper: createApiTestWrapper(api),
    });

    await act(async () => {
      try {
        await result.current.generate('Help me');
      } catch {
        // expected
      }
    });

    await waitFor(() => {
      expect(result.current.error).toBe('LLM unreachable');
    });
    expect(result.current.generating).toBe(false);
  });

  it('clears previous error on new attempt', async () => {
    let callCount = 0;
    const api: Partial<AgenticChatApi> = {
      generateSystemPrompt: jest.fn().mockImplementation(() => {
        callCount++;
        if (callCount === 1) {
          return Promise.reject(new Error('First failure'));
        }
        return Promise.resolve('Success on retry');
      }),
    };

    const { result } = renderHook(() => useGeneratePrompt(), {
      wrapper: createApiTestWrapper(api),
    });

    await act(async () => {
      try {
        await result.current.generate('attempt 1');
      } catch {
        // expected
      }
    });

    expect(result.current.error).toBe('First failure');

    await act(async () => {
      await result.current.generate('attempt 2');
    });

    expect(result.current.error).toBeNull();
    expect(result.current.generating).toBe(false);
  });
});
