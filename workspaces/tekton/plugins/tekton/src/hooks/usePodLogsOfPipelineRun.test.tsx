/*
 * Copyright 2024 The Backstage Authors
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
import { useApi } from '@backstage/core-plugin-api';

import { renderHook, waitFor } from '@testing-library/react';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { mockKubernetesPlrResponse } from '../__fixtures__/1-pipelinesData';
import { usePodLogsOfPipelineRun } from './usePodLogsOfPipelineRun';
import type { ReactNode } from 'react';

jest.mock('@backstage/core-plugin-api', () => ({
  ...jest.requireActual('@backstage/core-plugin-api'),
  useApi: jest.fn(),
}));

const wrapper = ({ children }: { children: ReactNode }) => {
  const queryClient = new QueryClient({
    defaultOptions: {
      queries: {
        // Prevent timeouts during tests
        retry: false,
      },
    },
  });

  return (
    <QueryClientProvider client={queryClient}>{children}</QueryClientProvider>
  );
};

describe('usePodLogsOfPipelineRun', () => {
  const getPodLogsMock = jest.fn().mockResolvedValue({ text: 'log data...' });
  it('should return loading as true initially', async () => {
    (useApi as any).mockReturnValue({
      getPodLogs: getPodLogsMock,
    });

    const { result } = renderHook(
      () =>
        usePodLogsOfPipelineRun({
          pod: mockKubernetesPlrResponse.pods[0] as any,
          intervalMs: 500,
        }),
      { wrapper },
    );

    // Initially loading should be true
    expect(result.current.loading).toBe(true);

    // Wait for the query to complete
    await waitFor(() => {
      expect(result.current.loading).toEqual(false);
    });

    expect(getPodLogsMock).toHaveBeenCalled();
  });

  it('should return log data after successful query', async () => {
    (useApi as any).mockReturnValue({
      getPodLogs: getPodLogsMock,
    });

    const { result } = renderHook(
      () =>
        usePodLogsOfPipelineRun({
          pod: mockKubernetesPlrResponse.pods[0] as any,
          intervalMs: 500,
        }),
      { wrapper },
    );

    await waitFor(() => {
      expect(result.current.value).toEqual([{ text: 'log data...' }]);
    });

    expect(getPodLogsMock).toHaveBeenCalled();
  });

  it('should not fetch data when pod name is missing', async () => {
    const logsMock = jest.fn().mockResolvedValue({ text: 'no log data...' });
    (useApi as any).mockReturnValue({
      getPodLogs: logsMock,
    });

    const podWithoutName = {
      ...mockKubernetesPlrResponse.pods[0],
      metadata: { namespace: 'test' },
    };

    const { result } = renderHook(
      () =>
        usePodLogsOfPipelineRun({
          pod: podWithoutName as any,
          intervalMs: 500,
        }),
      { wrapper },
    );

    // Wait a bit to ensure the query doesn't run.
    await new Promise(resolve => setTimeout(resolve, 100));

    expect(logsMock).not.toHaveBeenCalled();
    expect(result.current.loading).toBe(false);
    expect(result.current.value).toBeUndefined();
  });

  it('should stop polling when pod status is Succeeded', async () => {
    (useApi as any).mockReturnValue({
      getPodLogs: getPodLogsMock,
    });

    const succeededPod = {
      ...mockKubernetesPlrResponse.pods[0],
      status: { phase: 'Succeeded' },
    };

    const { result } = renderHook(
      () =>
        usePodLogsOfPipelineRun({
          pod: succeededPod as any,
          intervalMs: 500,
        }),
      { wrapper },
    );

    // Wait for the query to complete
    await waitFor(() => {
      expect(result.current.loading).toBe(false);
    });

    expect(getPodLogsMock).toHaveBeenCalledWith(
      expect.objectContaining({
        podName: succeededPod.metadata.name,
        namespace: succeededPod.metadata.namespace,
      }),
    );
  });

  it('should stop polling when pod status is Failed', async () => {
    (useApi as any).mockReturnValue({
      getPodLogs: getPodLogsMock,
    });

    const failedPod = {
      ...mockKubernetesPlrResponse.pods[0],
      status: { phase: 'Failed' },
    };

    const { result } = renderHook(
      () =>
        usePodLogsOfPipelineRun({
          pod: failedPod as any,
          intervalMs: 500,
        }),
      { wrapper },
    );

    // Wait for the query to complete
    await waitFor(() => {
      expect(result.current.loading).toBe(false);
    });

    expect(getPodLogsMock).toHaveBeenCalledWith(
      expect.objectContaining({
        podName: failedPod.metadata.name,
        namespace: failedPod.metadata.namespace,
      }),
    );
  });
});
