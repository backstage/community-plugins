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
import React from 'react';
import useAsyncRetry from 'react-use/lib/useAsyncRetry';
import useInterval from 'react-use/lib/useInterval';

import { useApi } from '@backstage/core-plugin-api';

import { V1Container, V1Pod } from '@kubernetes/client-node';

import {
  kubernetesProxyApiRef,
  TektonResourcesContextData,
} from '../types/types';
import { TektonResourcesContext } from './TektonResourcesContext';

export interface ContainerScope {
  podName: string;
  podNamespace: string;
  clusterName: string;
  containerName: string;
}

interface PodLogsOptions {
  pod: V1Pod;
  intervalMs?: number;
}

export const usePodLogsOfPipelineRun = ({
  pod,
  intervalMs = 5000,
}: PodLogsOptions) => {
  const [loadingData, setLoadingData] = React.useState<boolean>(true);
  const [, setPodInfo] = React.useState<string>(pod?.metadata?.name ?? '');
  const kubernetesProxyApi = useApi(kubernetesProxyApiRef);
  const { clusters, selectedCluster } =
    React.useContext<TektonResourcesContextData>(TektonResourcesContext);
  const currCluster =
    (clusters.length > 0 && clusters[selectedCluster || 0]) || '';
  const containersList = pod?.spec?.containers || [];
  const getLogs = React.useCallback(
    async (podScope: ContainerScope): Promise<{ text: string }> => {
      const { podName, podNamespace, containerName, clusterName } = podScope;
      return await kubernetesProxyApi.getPodLogs({
        podName: podName,
        namespace: podNamespace,
        containerName: containerName,
        clusterName: clusterName,
      });
    },
    [kubernetesProxyApi],
  );

  const { value, error, loading, retry } = useAsyncRetry(async () => {
    const requests: Promise<{
      text: string;
    }>[] = [];
    containersList.map((container: V1Container, _idx: any) => {
      if (pod?.metadata?.name && pod?.metadata?.namespace && container) {
        const podScope = {
          containerName: container.name,
          podName: pod.metadata.name,
          podNamespace: pod.metadata.namespace,
          clusterName: currCluster,
        };
        requests.push(getLogs(podScope));
      }
    });
    return requests.length > 0 ? Promise.all(requests) : [];
  }, [containersList, pod, getLogs]);

  const stopPolling =
    pod?.status?.phase === 'Succeeded' || pod?.status?.phase === 'Failed';

  useInterval(() => retry(), stopPolling ? null : intervalMs);

  React.useEffect(() => {
    let mounted = true;
    if (!loading && mounted) {
      setPodInfo(prevState => {
        if (prevState === pod?.metadata?.name) {
          setLoadingData(false);
          return prevState;
        }
        setLoadingData(true);
        return pod?.metadata?.name || '';
      });
    }
    return () => {
      mounted = false;
    };
  }, [loading, pod]);

  return { value, error, loading: loadingData };
};
