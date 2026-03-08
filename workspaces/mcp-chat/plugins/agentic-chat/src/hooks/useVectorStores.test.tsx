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
import { useVectorStores } from './useVectorStores';
import { createApiTestWrapper } from '../test-utils/renderWithApi';

const mockStores = [
  {
    id: 'vs_1',
    name: 'store-1',
    status: 'completed',
    fileCount: 5,
    createdAt: 1700000000,
    active: true,
  },
  {
    id: 'vs_2',
    name: 'store-2',
    status: 'completed',
    fileCount: 3,
    createdAt: 1700001000,
    active: true,
  },
];

describe('useVectorStores', () => {
  it('loads stores on mount and auto-selects first', async () => {
    const api = {
      listActiveVectorStores: jest
        .fn()
        .mockResolvedValue({ stores: mockStores }),
    };

    const { result } = renderHook(() => useVectorStores(), {
      wrapper: createApiTestWrapper(api),
    });

    await waitFor(() => expect(result.current.loading).toBe(false));

    expect(result.current.stores).toHaveLength(2);
    expect(result.current.selectedStoreId).toBe('vs_1');
    expect(result.current.error).toBeNull();
  });

  it('handles empty store list', async () => {
    const api = {
      listActiveVectorStores: jest.fn().mockResolvedValue({ stores: [] }),
    };

    const { result } = renderHook(() => useVectorStores(), {
      wrapper: createApiTestWrapper(api),
    });

    await waitFor(() => expect(result.current.loading).toBe(false));

    expect(result.current.stores).toHaveLength(0);
    expect(result.current.selectedStoreId).toBeNull();
  });

  it('removes a store (disconnect) and refreshes', async () => {
    const api = {
      listActiveVectorStores: jest
        .fn()
        .mockResolvedValueOnce({ stores: mockStores })
        .mockResolvedValueOnce({ stores: [mockStores[1]] }),
      removeVectorStore: jest.fn().mockResolvedValue({
        removed: 'vs_1',
        permanent: false,
        filesDeleted: 0,
        activeVectorStoreIds: ['vs_2'],
      }),
    };

    const { result } = renderHook(() => useVectorStores(), {
      wrapper: createApiTestWrapper(api),
    });

    await waitFor(() => expect(result.current.loading).toBe(false));

    await act(async () => {
      await result.current.removeStore('vs_1');
    });

    expect(api.removeVectorStore).toHaveBeenCalledWith('vs_1', undefined);
  });

  it('permanently deletes a store and refreshes', async () => {
    const api = {
      listActiveVectorStores: jest
        .fn()
        .mockResolvedValueOnce({ stores: mockStores })
        .mockResolvedValueOnce({ stores: [mockStores[1]] }),
      removeVectorStore: jest.fn().mockResolvedValue({
        removed: 'vs_1',
        permanent: true,
        filesDeleted: 5,
        activeVectorStoreIds: ['vs_2'],
      }),
    };

    const { result } = renderHook(() => useVectorStores(), {
      wrapper: createApiTestWrapper(api),
    });

    await waitFor(() => expect(result.current.loading).toBe(false));

    await act(async () => {
      await result.current.removeStore('vs_1', true);
    });

    expect(api.removeVectorStore).toHaveBeenCalledWith('vs_1', true);
  });

  it('handles API errors gracefully', async () => {
    const api = {
      listActiveVectorStores: jest
        .fn()
        .mockRejectedValue(new Error('Network error')),
    };

    const { result } = renderHook(() => useVectorStores(), {
      wrapper: createApiTestWrapper(api),
    });

    await waitFor(() => expect(result.current.loading).toBe(false));

    expect(result.current.error).toBe('Network error');
    expect(result.current.stores).toHaveLength(0);
  });

  it('allows manual store selection', async () => {
    const api = {
      listActiveVectorStores: jest
        .fn()
        .mockResolvedValue({ stores: mockStores }),
    };

    const { result } = renderHook(() => useVectorStores(), {
      wrapper: createApiTestWrapper(api),
    });

    await waitFor(() => expect(result.current.loading).toBe(false));
    expect(result.current.selectedStoreId).toBe('vs_1');

    act(() => {
      result.current.setSelectedStoreId('vs_2');
    });

    expect(result.current.selectedStoreId).toBe('vs_2');
  });

  it('clears error via clearError', async () => {
    const api = {
      listActiveVectorStores: jest.fn().mockRejectedValue(new Error('Failed')),
    };

    const { result } = renderHook(() => useVectorStores(), {
      wrapper: createApiTestWrapper(api),
    });

    await waitFor(() => expect(result.current.error).toBe('Failed'));

    act(() => {
      result.current.clearError();
    });

    expect(result.current.error).toBeNull();
  });
});
