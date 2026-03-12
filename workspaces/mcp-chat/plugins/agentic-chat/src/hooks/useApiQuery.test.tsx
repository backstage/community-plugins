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
import { renderHook, act, waitFor } from '@testing-library/react';
import { useApiQuery } from './useApiQuery';

describe('useApiQuery', () => {
  it('starts in loading state and resolves data', async () => {
    const fetcher = jest.fn().mockResolvedValue(['a', 'b']);
    const { result } = renderHook(() =>
      useApiQuery({ fetcher, initialValue: [] as string[] }),
    );

    expect(result.current.loading).toBe(true);
    expect(result.current.data).toEqual([]);

    await waitFor(() => expect(result.current.loading).toBe(false));

    expect(result.current.data).toEqual(['a', 'b']);
    expect(result.current.error).toBeNull();
    expect(fetcher).toHaveBeenCalledTimes(1);
  });

  it('normalizes errors to strings', async () => {
    const fetcher = jest.fn().mockRejectedValue(new Error('Network fail'));
    const { result } = renderHook(() =>
      useApiQuery({ fetcher, initialValue: null as string | null }),
    );

    await waitFor(() => expect(result.current.loading).toBe(false));

    expect(result.current.error).toBe('Network fail');
    expect(result.current.data).toBeNull();
  });

  it('handles non-Error thrown values', async () => {
    const fetcher = jest.fn().mockRejectedValue('string error');
    const { result } = renderHook(() =>
      useApiQuery({ fetcher, initialValue: [] as string[] }),
    );

    await waitFor(() => expect(result.current.loading).toBe(false));
    expect(result.current.error).toBe('string error');
  });

  it('supports manual refresh', async () => {
    const fetcher = jest
      .fn()
      .mockResolvedValueOnce('first')
      .mockResolvedValueOnce('second');

    const { result } = renderHook(() =>
      useApiQuery({ fetcher, initialValue: '' }),
    );

    await waitFor(() => expect(result.current.loading).toBe(false));
    expect(result.current.data).toBe('first');

    await act(async () => {
      await result.current.refresh();
    });

    expect(result.current.data).toBe('second');
    expect(fetcher).toHaveBeenCalledTimes(2);
  });

  it('skips fetching when skip=true', async () => {
    const fetcher = jest.fn().mockResolvedValue('data');
    const { result } = renderHook(() =>
      useApiQuery({ fetcher, initialValue: 'default', skip: true }),
    );

    await waitFor(() => expect(result.current.loading).toBe(false));

    expect(result.current.data).toBe('default');
    expect(fetcher).not.toHaveBeenCalled();
  });

  it('clears error on successful refresh after failure', async () => {
    const fetcher = jest
      .fn()
      .mockRejectedValueOnce(new Error('fail'))
      .mockResolvedValueOnce('recovered');

    const { result } = renderHook(() =>
      useApiQuery({ fetcher, initialValue: '' }),
    );

    await waitFor(() => expect(result.current.error).toBe('fail'));

    await act(async () => {
      await result.current.refresh();
    });

    expect(result.current.error).toBeNull();
    expect(result.current.data).toBe('recovered');
  });
});
