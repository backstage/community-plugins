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

import { renderHook, act } from '@testing-library/react';
import { useApiRequest } from './useApiRequest';
import { ChatResponse } from '../types';

const mockResponse: ChatResponse = {
  messages: [],
  conversationId: 'conv-1',
};

describe('useApiRequest', () => {
  it('starts with isTyping false', () => {
    const { result } = renderHook(() => useApiRequest());
    expect(result.current.isTyping).toBe(false);
  });

  it('sets isTyping true during execute and false after success', async () => {
    const { result } = renderHook(() => useApiRequest());
    const onSuccess = jest.fn();

    let resolveApi: (v: ChatResponse) => void;
    const apiCall = jest.fn(
      () =>
        new Promise<ChatResponse>(r => {
          resolveApi = r;
        }),
    );

    let executePromise: Promise<void>;
    act(() => {
      executePromise = result.current.execute(apiCall, onSuccess);
    });

    expect(result.current.isTyping).toBe(true);

    await act(async () => {
      resolveApi!(mockResponse);
      await executePromise!;
    });

    expect(result.current.isTyping).toBe(false);
    expect(onSuccess).toHaveBeenCalledWith(mockResponse);
  });

  it('passes AbortSignal to apiCall', async () => {
    const { result } = renderHook(() => useApiRequest());
    const apiCall = jest.fn().mockResolvedValue(mockResponse);

    await act(async () => {
      await result.current.execute(apiCall, jest.fn());
    });

    expect(apiCall).toHaveBeenCalledWith(expect.any(AbortSignal));
  });

  it('calls onError on failure', async () => {
    const { result } = renderHook(() => useApiRequest());
    const onError = jest.fn();
    const error = new Error('boom');
    const apiCall = jest.fn().mockRejectedValue(error);

    await act(async () => {
      await result.current.execute(apiCall, jest.fn(), onError);
    });

    expect(result.current.isTyping).toBe(false);
    expect(onError).toHaveBeenCalledWith(error);
  });

  it('logs to console when onError not provided', async () => {
    const consoleSpy = jest.spyOn(console, 'error').mockImplementation();
    const { result } = renderHook(() => useApiRequest());
    const apiCall = jest.fn().mockRejectedValue(new Error('fail'));

    await act(async () => {
      await result.current.execute(apiCall, jest.fn());
    });

    expect(consoleSpy).toHaveBeenCalledWith(
      'API request failed:',
      expect.any(Error),
    );
    consoleSpy.mockRestore();
  });

  it('silently handles AbortError', async () => {
    const consoleSpy = jest.spyOn(console, 'error').mockImplementation();
    const { result } = renderHook(() => useApiRequest());
    const abortError = new DOMException('Aborted', 'AbortError');
    const apiCall = jest.fn().mockRejectedValue(abortError);
    const onError = jest.fn();

    await act(async () => {
      await result.current.execute(apiCall, jest.fn(), onError);
    });

    expect(onError).not.toHaveBeenCalled();
    expect(consoleSpy).toHaveBeenCalledWith('Request was cancelled');
    consoleSpy.mockRestore();
  });

  it('cancelOngoingRequest aborts and resets typing', async () => {
    const { result } = renderHook(() => useApiRequest());

    const apiCall = jest.fn(() => new Promise<ChatResponse>(() => {}));

    act(() => {
      result.current.execute(apiCall, jest.fn());
    });

    expect(result.current.isTyping).toBe(true);

    act(() => {
      result.current.cancelOngoingRequest();
    });

    expect(result.current.isTyping).toBe(false);
  });

  it('aborts previous request when execute called again', async () => {
    const { result } = renderHook(() => useApiRequest());

    const firstCall = jest.fn(() => new Promise<ChatResponse>(() => {}));
    const secondCall = jest.fn().mockResolvedValue(mockResponse);
    const onSuccess = jest.fn();

    act(() => {
      result.current.execute(firstCall, jest.fn());
    });

    await act(async () => {
      await result.current.execute(secondCall, onSuccess);
    });

    expect((firstCall.mock.calls as any)[0][0].aborted).toBe(true);
    expect(onSuccess).toHaveBeenCalledWith(mockResponse);
  });
});
