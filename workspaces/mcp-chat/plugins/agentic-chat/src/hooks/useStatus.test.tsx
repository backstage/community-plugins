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
import { useStatus } from './useStatus';
import { createApiTestWrapper } from '../test-utils/renderWithApi';
import { AgenticChatStatus } from '../types';

const mockStatus: AgenticChatStatus = {
  providerId: 'test',
  provider: {
    id: 'llamastack',
    model: 'test-model',
    baseUrl: 'https://test.example.com',
    connected: true,
  },
  vectorStore: {
    id: 'default',
    connected: true,
  },
  mcpServers: [],
  securityMode: 'none',
  timestamp: '2025-01-01T00:00:00Z',
  ready: true,
  configurationErrors: [],
};

describe('useStatus', () => {
  beforeEach(() => {
    jest.useFakeTimers();
  });

  afterEach(() => {
    jest.useRealTimers();
  });

  it('starts in loading state', () => {
    const api = {
      getStatus: jest.fn(() => new Promise<AgenticChatStatus>(() => {})),
    };

    const { result } = renderHook(() => useStatus(), {
      wrapper: createApiTestWrapper(api),
    });

    expect(result.current.loading).toBe(true);
    expect(result.current.status).toBeNull();
    expect(result.current.error).toBeNull();
  });

  it('loads status successfully', async () => {
    const api = {
      getStatus: jest.fn().mockResolvedValue(mockStatus),
    };

    const { result } = renderHook(() => useStatus(), {
      wrapper: createApiTestWrapper(api),
    });

    await waitFor(() => {
      expect(result.current.loading).toBe(false);
    });

    expect(result.current.status).toEqual(mockStatus);
    expect(result.current.error).toBeNull();
  });

  it('handles errors', async () => {
    const api = {
      getStatus: jest.fn().mockRejectedValue(new Error('Server error')),
    };

    const { result } = renderHook(() => useStatus(), {
      wrapper: createApiTestWrapper(api),
    });

    await waitFor(() => {
      expect(result.current.loading).toBe(false);
    });

    expect(result.current.error).toBe('Server error');
    expect(result.current.status).toBeNull();
  });

  it('refresh reloads data', async () => {
    const api = {
      getStatus: jest
        .fn()
        .mockResolvedValueOnce(mockStatus)
        .mockResolvedValueOnce({
          ...mockStatus,
          provider: { ...mockStatus.provider, connected: false },
        }),
    };

    const { result } = renderHook(() => useStatus(), {
      wrapper: createApiTestWrapper(api),
    });

    await waitFor(() => {
      expect(result.current.loading).toBe(false);
    });
    expect(result.current.status).toEqual(mockStatus);

    await act(async () => {
      await result.current.refresh();
    });

    expect(result.current.status?.provider.connected).toBe(false);
    expect(api.getStatus).toHaveBeenCalledTimes(2);
  });
});
