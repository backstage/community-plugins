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

import type { ReactNode } from 'react';
import { fetchApiRef, discoveryApiRef } from '@backstage/core-plugin-api';
import { TestApiProvider, mockApis } from '@backstage/test-utils';
import { renderHook, waitFor, act } from '@testing-library/react';
import { useArgoWorkflows } from './useArgoWorkflows';

const BASE_URL = 'http://localhost:7007';

function rawWorkflow(name: string, uid: string, namespace = 'default') {
  return {
    metadata: {
      name,
      namespace,
      uid,
      creationTimestamp: '2024-01-01T00:00:00Z',
    },
    status: { phase: 'Succeeded' },
  };
}

/**
 * Builds a fetchApi mock whose `fetch` implementation is driven by the
 * `instanceName` query parameter, so each instance can be scripted
 * independently (success, empty, or failure).
 */
function createFetchApi(
  handlers: Record<
    string,
    { ok: true; workflows: unknown[] } | { ok: false; status: number }
  >,
) {
  const fetch = jest.fn(async (input: RequestInfo | URL) => {
    const url = new URL(String(input));
    const instanceName = url.searchParams.get('instanceName') ?? '';
    const handler = handlers[instanceName];

    if (!handler) {
      throw new Error(`No handler configured for instance "${instanceName}"`);
    }

    if (!handler.ok) {
      return {
        ok: false,
        status: handler.status,
        statusText: 'Error',
        text: async () => 'boom',
      } as unknown as Response;
    }

    return {
      ok: true,
      status: 200,
      json: async () => ({ workflows: handler.workflows }),
    } as unknown as Response;
  });

  return { fetch };
}

function renderUseArgoWorkflows(
  fetchApi: { fetch: jest.Mock },
  options: Parameters<typeof useArgoWorkflows>[0],
) {
  const discoveryApi = mockApis.discovery({ baseUrl: BASE_URL });

  const wrapper = ({ children }: { children: ReactNode }) => (
    <TestApiProvider
      apis={[
        [fetchApiRef, fetchApi],
        [discoveryApiRef, discoveryApi],
      ]}
    >
      {children}
    </TestApiProvider>
  );

  return renderHook(props => useArgoWorkflows(props), {
    initialProps: options,
    wrapper,
  });
}

describe('useArgoWorkflows', () => {
  it('merges workflows fetched from multiple instances', async () => {
    const fetchApi = createFetchApi({
      main: {
        ok: true,
        workflows: [rawWorkflow('wf-main', 'uid-main')],
      },
      secondary: {
        ok: true,
        workflows: [rawWorkflow('wf-secondary', 'uid-secondary')],
      },
    });

    const { result } = renderUseArgoWorkflows(fetchApi, {
      labelSelector: 'app=test',
      instanceNames: ['main', 'secondary'],
    });

    expect(result.current.loading).toBe(true);

    await waitFor(() => {
      expect(result.current.loading).toBe(false);
    });

    expect(result.current.error).toBeUndefined();
    expect(result.current.workflows).toHaveLength(2);
    expect(result.current.workflows.map(wf => wf.metadata.uid).sort()).toEqual([
      'uid-main',
      'uid-secondary',
    ]);
    expect(
      result.current.workflows.find(wf => wf.metadata.uid === 'uid-main')
        ?.sourceInstance,
    ).toBe('main');
    expect(
      result.current.workflows.find(wf => wf.metadata.uid === 'uid-secondary')
        ?.sourceInstance,
    ).toBe('secondary');
  });

  it('deduplicates workflows sharing the same uid across instances', async () => {
    const fetchApi = createFetchApi({
      main: {
        ok: true,
        workflows: [rawWorkflow('wf-shared', 'uid-shared')],
      },
      secondary: {
        ok: true,
        // Same uid returned by a second instance (e.g. mirrored cluster)
        workflows: [rawWorkflow('wf-shared', 'uid-shared')],
      },
    });

    const { result } = renderUseArgoWorkflows(fetchApi, {
      labelSelector: 'app=test',
      instanceNames: ['main', 'secondary'],
    });

    await waitFor(() => {
      expect(result.current.loading).toBe(false);
    });

    expect(result.current.error).toBeUndefined();
    expect(result.current.workflows).toHaveLength(1);
    expect(result.current.workflows[0].metadata.uid).toBe('uid-shared');
  });

  it('surfaces an error when every instance fails', async () => {
    const fetchApi = createFetchApi({
      main: { ok: false, status: 500 },
      secondary: { ok: false, status: 503 },
    });

    const { result } = renderUseArgoWorkflows(fetchApi, {
      labelSelector: 'app=test',
      instanceNames: ['main', 'secondary'],
    });

    await waitFor(() => {
      expect(result.current.loading).toBe(false);
    });

    expect(result.current.error).toBeInstanceOf(Error);
    expect(result.current.error?.message).toMatch(/Failed to fetch workflows/);
    expect(result.current.workflows).toEqual([]);
  });

  it('tolerates a single failing instance and returns data from the others', async () => {
    const fetchApi = createFetchApi({
      main: {
        ok: true,
        workflows: [rawWorkflow('wf-main', 'uid-main')],
      },
      broken: { ok: false, status: 500 },
    });

    const { result } = renderUseArgoWorkflows(fetchApi, {
      labelSelector: 'app=test',
      instanceNames: ['main', 'broken'],
    });

    await waitFor(() => {
      expect(result.current.loading).toBe(false);
    });

    expect(result.current.error).toBeUndefined();
    expect(result.current.workflows).toHaveLength(1);
    expect(result.current.workflows[0].metadata.uid).toBe('uid-main');
  });

  it('refetches when retry() is called', async () => {
    const fetchApi = createFetchApi({
      main: { ok: false, status: 500 },
    });

    const { result } = renderUseArgoWorkflows(fetchApi, {
      labelSelector: 'app=test',
      instanceNames: ['main'],
    });

    await waitFor(() => {
      expect(result.current.loading).toBe(false);
      expect(result.current.error).toBeInstanceOf(Error);
    });

    const callsBeforeRetry = fetchApi.fetch.mock.calls.length;

    // Instance recovers before the retry
    fetchApi.fetch.mockImplementation(async (input: RequestInfo | URL) => {
      const url = new URL(String(input));
      expect(url.searchParams.get('instanceName')).toBe('main');
      return {
        ok: true,
        status: 200,
        json: async () => ({
          workflows: [rawWorkflow('wf-main', 'uid-main')],
        }),
      } as unknown as Response;
    });

    act(() => {
      result.current.retry();
    });

    await waitFor(() => {
      expect(result.current.loading).toBe(false);
      expect(result.current.error).toBeUndefined();
    });

    expect(fetchApi.fetch.mock.calls.length).toBeGreaterThan(callsBeforeRetry);
    expect(result.current.workflows).toHaveLength(1);
    expect(result.current.workflows[0].metadata.uid).toBe('uid-main');
  });
});
