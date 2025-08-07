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
import { useState, useCallback, useEffect } from 'react';
import useAsyncRetry from 'react-use/lib/useAsyncRetry';
import useInterval from 'react-use/lib/useInterval';
import { kubernetesProxyApiRef } from '@backstage/plugin-kubernetes-react';
import { useApi } from '@backstage/core-plugin-api';

import { ContainerScope } from '../components/Topology/TopologySideBar/PodLogs/types';

interface PodLogsOptions {
  podScope: ContainerScope;
  stopPolling: boolean;
  intervalMs?: number;
}

export const usePodLogs = ({
  podScope,
  stopPolling,
  intervalMs = 5000,
}: PodLogsOptions) => {
  const [loadingData, setLoadingData] = useState<boolean>(true);
  const kubernetesProxyApi = useApi(kubernetesProxyApiRef);
  const getLogs = useCallback(async (): Promise<{ text: string }> => {
    const { podName, podNamespace, containerName, clusterName } = podScope;
    return await kubernetesProxyApi.getPodLogs({
      podName: podName,
      namespace: podNamespace,
      containerName: containerName,
      clusterName: clusterName,
    });
  }, [kubernetesProxyApi, podScope]);

  const { value, error, loading, retry } = useAsyncRetry(
    () => getLogs(),
    [getLogs],
  );

  useInterval(() => retry(), stopPolling ? null : intervalMs);

  useEffect(() => {
    let mounted = true;
    if (!loading && mounted) {
      setLoadingData(prevState => {
        if (prevState) {
          return false;
        }
        return prevState;
      });
    }
    return () => {
      mounted = false;
    };
  }, [loading]);

  return { value, error, loading: loadingData };
};
