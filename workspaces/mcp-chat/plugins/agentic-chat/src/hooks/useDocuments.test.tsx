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
import { useDocuments } from './useDocuments';
import { createApiTestWrapper } from '../test-utils/renderWithApi';
import { DocumentInfo } from '../types';

const mockDocuments: DocumentInfo[] = [
  {
    id: 'doc-1',
    fileName: 'README.md',
    format: 'text' as DocumentInfo['format'],
    fileSize: 1024,
    uploadedAt: '2025-01-01T00:00:00Z',
    status: 'completed',
  },
  {
    id: 'doc-2',
    fileName: 'guide.pdf',
    format: 'text' as DocumentInfo['format'],
    fileSize: 2048,
    uploadedAt: '2025-01-02T00:00:00Z',
    status: 'completed',
  },
];

describe('useDocuments', () => {
  it('returns empty list when no vectorStoreId is provided', async () => {
    const api = {
      listDocumentsForStore: jest.fn(),
    };

    const { result } = renderHook(() => useDocuments(), {
      wrapper: createApiTestWrapper(api),
    });

    await waitFor(() => expect(result.current.loading).toBe(false));

    expect(result.current.documents).toEqual([]);
    expect(api.listDocumentsForStore).not.toHaveBeenCalled();
  });

  it('returns empty list when vectorStoreId is null', async () => {
    const api = {
      listDocumentsForStore: jest.fn(),
    };

    const { result } = renderHook(() => useDocuments(null), {
      wrapper: createApiTestWrapper(api),
    });

    await waitFor(() => expect(result.current.loading).toBe(false));

    expect(result.current.documents).toEqual([]);
    expect(api.listDocumentsForStore).not.toHaveBeenCalled();
  });

  it('loads documents for a specific store', async () => {
    const api = {
      listDocumentsForStore: jest.fn().mockResolvedValue(mockDocuments),
    };

    const { result } = renderHook(() => useDocuments('vs_test'), {
      wrapper: createApiTestWrapper(api),
    });

    await waitFor(() => expect(result.current.loading).toBe(false));

    expect(result.current.documents).toEqual(mockDocuments);
    expect(result.current.error).toBeNull();
    expect(api.listDocumentsForStore).toHaveBeenCalledWith('vs_test');
  });

  it('handles errors', async () => {
    const api = {
      listDocumentsForStore: jest
        .fn()
        .mockRejectedValue(new Error('Network failure')),
    };

    const { result } = renderHook(() => useDocuments('vs_test'), {
      wrapper: createApiTestWrapper(api),
    });

    await waitFor(() => expect(result.current.loading).toBe(false));

    expect(result.current.error).toBe('Network failure');
    expect(result.current.documents).toEqual([]);
  });

  it('refresh reloads data', async () => {
    const api = {
      listDocumentsForStore: jest
        .fn()
        .mockResolvedValueOnce([])
        .mockResolvedValueOnce(mockDocuments),
    };

    const { result } = renderHook(() => useDocuments('vs_test'), {
      wrapper: createApiTestWrapper(api),
    });

    await waitFor(() => expect(result.current.loading).toBe(false));
    expect(result.current.documents).toEqual([]);

    await act(async () => {
      await result.current.refresh();
    });

    expect(result.current.documents).toEqual(mockDocuments);
    expect(api.listDocumentsForStore).toHaveBeenCalledTimes(2);
  });
});
