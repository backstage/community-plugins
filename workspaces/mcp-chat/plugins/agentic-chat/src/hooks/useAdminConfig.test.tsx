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
import { TestApiProvider } from '@backstage/test-utils';
import { useAdminConfig } from './useAdminConfig';
import { agenticChatApiRef, type AgenticChatApi } from '../api';

function createWrapper(api: Partial<AgenticChatApi>) {
  return ({ children }: { children: React.ReactNode }) => (
    <TestApiProvider apis={[[agenticChatApiRef, api as AgenticChatApi]]}>
      {children}
    </TestApiProvider>
  );
}

describe('useAdminConfig', () => {
  it('starts in loading state', () => {
    const api: Partial<AgenticChatApi> = {
      getAdminConfig: jest.fn(
        () => new Promise<{ entry: null; source: 'default' }>(() => {}),
      ),
    };

    const { result } = renderHook(() => useAdminConfig('swimLanes'), {
      wrapper: createWrapper(api),
    });

    expect(result.current.loading).toBe(true);
    expect(result.current.entry).toBeNull();
    expect(result.current.error).toBeNull();
  });

  it('loads config entry successfully', async () => {
    const mockEntry = {
      configKey: 'swimLanes' as const,
      configValue: [{ id: 'l1', title: 'Lane 1', cards: [] }],
      updatedAt: '2025-01-01T00:00:00Z',
      updatedBy: 'user:default/admin',
    };

    const api = {
      getAdminConfig: jest
        .fn()
        .mockResolvedValue({ entry: mockEntry, source: 'database' }),
    };

    const { result } = renderHook(() => useAdminConfig('swimLanes'), {
      wrapper: createWrapper(api),
    });

    await waitFor(() => {
      expect(result.current.loading).toBe(false);
    });

    expect(result.current.entry).toEqual(mockEntry);
    expect(result.current.source).toBe('database');
    expect(result.current.error).toBeNull();
  });

  it('returns default source when no entry', async () => {
    const api = {
      getAdminConfig: jest
        .fn()
        .mockResolvedValue({ entry: null, source: 'default' }),
    };

    const { result } = renderHook(() => useAdminConfig('swimLanes'), {
      wrapper: createWrapper(api),
    });

    await waitFor(() => {
      expect(result.current.loading).toBe(false);
    });

    expect(result.current.entry).toBeNull();
    expect(result.current.source).toBe('default');
  });

  it('handles load errors', async () => {
    const api = {
      getAdminConfig: jest.fn().mockRejectedValue(new Error('Network error')),
    };

    const { result } = renderHook(() => useAdminConfig('swimLanes'), {
      wrapper: createWrapper(api),
    });

    await waitFor(() => {
      expect(result.current.loading).toBe(false);
    });

    expect(result.current.error).toBe('Network error');
    expect(result.current.entry).toBeNull();
  });

  it('save calls API and refreshes', async () => {
    const api = {
      getAdminConfig: jest
        .fn()
        .mockResolvedValue({ entry: null, source: 'default' }),
      setAdminConfig: jest.fn().mockResolvedValue({ warnings: undefined }),
    };

    const { result } = renderHook(() => useAdminConfig('systemPrompt'), {
      wrapper: createWrapper(api),
    });

    await waitFor(() => {
      expect(result.current.loading).toBe(false);
    });

    await act(async () => {
      await result.current.save('Hello world');
    });

    expect(api.setAdminConfig).toHaveBeenCalledWith(
      'systemPrompt',
      'Hello world',
    );
    // Should have refreshed (getAdminConfig called again)
    expect(api.getAdminConfig).toHaveBeenCalledTimes(2);
  });

  it('reset calls deleteAdminConfig and refreshes', async () => {
    const api = {
      getAdminConfig: jest
        .fn()
        .mockResolvedValue({ entry: null, source: 'default' }),
      deleteAdminConfig: jest.fn().mockResolvedValue({ deleted: true }),
    };

    const { result } = renderHook(() => useAdminConfig('branding'), {
      wrapper: createWrapper(api),
    });

    await waitFor(() => {
      expect(result.current.loading).toBe(false);
    });

    await act(async () => {
      await result.current.reset();
    });

    expect(api.deleteAdminConfig).toHaveBeenCalledWith('branding');
    expect(api.getAdminConfig).toHaveBeenCalledTimes(2);
  });

  it('save error sets error state', async () => {
    const api = {
      getAdminConfig: jest
        .fn()
        .mockResolvedValue({ entry: null, source: 'default' }),
      setAdminConfig: jest.fn().mockRejectedValue(new Error('Save failed')),
    };

    const { result } = renderHook(() => useAdminConfig('swimLanes'), {
      wrapper: createWrapper(api),
    });

    await waitFor(() => {
      expect(result.current.loading).toBe(false);
    });

    await act(async () => {
      try {
        await result.current.save([]);
      } catch {
        // expected
      }
    });

    expect(result.current.error).toBe('Save failed');
    expect(result.current.saving).toBe(false);
  });
});
