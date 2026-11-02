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

import { usePodLogs } from './usePodLogs';

jest.mock('@backstage/core-plugin-api', () => ({
  ...jest.requireActual('@backstage/core-plugin-api'),
  useApi: jest.fn(),
}));

const podScope = {
  podName: 'node-ex-git-er56',
  podNamespace: 'sample-app',
  containerName: 'node-ex-git',
  clusterName: 'OCP',
};

const mockGetPodLogs = jest.fn();

describe('usePodLogs', () => {
  beforeEach(() => {
    mockGetPodLogs.mockResolvedValue({ text: 'log data...' });
    (useApi as jest.Mock).mockReturnValue({
      getPodLogs: mockGetPodLogs,
    });
  });

  it('should return loading as true and value as undefined initially', () => {
    const { result } = renderHook(() =>
      usePodLogs({
        stopPolling: true,
        podScope,
        intervalMs: 500,
      }),
    );

    expect(result.current.loading).toEqual(true);
    expect(result.current.value).toBeUndefined();
  });

  it('should return value as log text', async () => {
    const { result } = renderHook(() =>
      usePodLogs({
        stopPolling: true,
        podScope,
        intervalMs: 500,
      }),
    );

    await waitFor(() => {
      expect(result.current.value).toEqual({ text: 'log data...' });
    });

    expect(mockGetPodLogs).toHaveBeenCalledWith({
      podName: podScope.podName,
      namespace: podScope.podNamespace,
      containerName: podScope.containerName,
      clusterName: podScope.clusterName,
    });
  });
});
