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
import { useContext } from 'react';
import { useQuery } from '@tanstack/react-query';
import { kubernetesProxyApiRef } from '@backstage/plugin-kubernetes-react';
import { useApi } from '@backstage/core-plugin-api';
import { V1Container, V1Pod } from '@kubernetes/client-node';

import { TektonResourcesContextData } from '../types/types';
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
  const kubernetesProxyApi = useApi(kubernetesProxyApiRef);
  const { clusters, selectedCluster } = useContext<TektonResourcesContextData>(
    TektonResourcesContext,
  );
  const currCluster =
    (clusters.length > 0 && clusters[selectedCluster || 0]) || '';
  const containersList = pod?.spec?.containers || [];

  const podKey = pod?.metadata?.name;
  const stopPolling =
    pod?.status?.phase === 'Succeeded' || pod?.status?.phase === 'Failed';

  const { data, error, isLoading, isFetching } = useQuery({
    queryKey: ['podLogs', podKey, currCluster],
    queryFn: async () => {
      const requests = containersList
        .map((container: V1Container) => {
          if (pod?.metadata?.name && pod?.metadata?.namespace && container) {
            return kubernetesProxyApi.getPodLogs({
              podName: pod.metadata.name,
              namespace: pod.metadata.namespace,
              containerName: container.name,
              clusterName: currCluster,
            });
          }

          return Promise.resolve({ text: '' });
        })
        .filter(Boolean);

      return Promise.all(requests);
    },
    enabled: !!pod?.metadata?.name && containersList.length > 0,
    refetchInterval: stopPolling ? false : intervalMs,
    staleTime: 60000, // Keep the data fresh for 1 minute instead of constantly refetching.
  });

  return {
    value: data,
    error,
    loading: isLoading || isFetching,
  };
};
