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
import { useState, useContext, useCallback, useEffect } from 'react';
import useAsync from 'react-use/esm/useAsync';

import { useApi } from '@backstage/core-plugin-api';
import { ContainerScope } from '@backstage/plugin-kubernetes-react';

import { V1Pod } from '@kubernetes/client-node';
import { kubernetesProxyApiRef } from '@backstage/plugin-kubernetes-react';
import { TektonResourcesContextData } from '../types/types';
import { TektonResourcesContext } from './TektonResourcesContext';

interface PodContainerLogsOptions {
  pod: V1Pod | undefined;
  containerName: string;
  intervalMs?: number;
}

export const usePodContainerLogs = ({
  pod,
  containerName: cName,
}: PodContainerLogsOptions) => {
  const [loadingData, setLoadingData] = useState<boolean>(true);
  const [, setPodInfo] = useState<string>(pod?.metadata?.name ?? '');
  const kubernetesProxyApi = useApi(kubernetesProxyApiRef);
  const { clusters, selectedCluster } = useContext<TektonResourcesContextData>(
    TektonResourcesContext,
  );
  const currCluster =
    (clusters.length > 0 && clusters[selectedCluster || 0]) || '';
  const getLogs = useCallback(
    async (podScope: ContainerScope): Promise<{ text: string }> => {
      const {
        podName,
        podNamespace,
        containerName,
        cluster: { name: clusterName },
      } = podScope;
      return await kubernetesProxyApi.getPodLogs({
        podName: podName,
        namespace: podNamespace,
        containerName: containerName,
        clusterName: clusterName,
      });
    },
    [kubernetesProxyApi],
  );

  const { value, error, loading } = useAsync(async () => {
    if (pod?.metadata?.name && pod?.metadata?.namespace) {
      const podScope = {
        containerName: cName,
        podName: pod.metadata.name,
        podNamespace: pod.metadata.namespace,
        cluster: { name: currCluster },
      };
      return getLogs(podScope);
    }
    return null;
  }, [pod, getLogs]);

  useEffect(() => {
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
