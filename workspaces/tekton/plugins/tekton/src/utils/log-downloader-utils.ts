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
import { V1Container, V1Pod } from '@kubernetes/client-node';

import { ContainerScope } from '../hooks/usePodLogsOfPipelineRun';

export async function getPodLogs(
  pods: V1Pod[] | [],
  podLogsGetter: (podScope: ContainerScope) => Promise<{ text: string }>,
  currentClusterName: string,
): Promise<string> {
  const containersList = pods.map((pod: V1Pod) => pod?.spec?.containers ?? []);
  const isPodAndContainerAvailable = (
    pod: V1Pod,
    container: V1Container,
  ): boolean => !!(pod && container);

  const requests: Promise<{ text: string }>[] = [];
  containersList.forEach((containers: V1Container[], _idx: number) => {
    containers.forEach((container: V1Container) => {
      const pod: V1Pod = pods[_idx];
      if (isPodAndContainerAvailable(pod, container)) {
        const podScope: ContainerScope = {
          containerName: container.name,
          podName: pod.metadata?.name ?? '',
          podNamespace: pod.metadata?.namespace ?? '',
          clusterName: currentClusterName,
        };

        requests.push(podLogsGetter(podScope));
      }
    });
  });
  return Promise.all(requests).then(response => {
    const containerFlatList = containersList.flat(1);
    return response.reduce(
      (acc: string, r: { text: string }, idx) => {
        const container: V1Container = containerFlatList[idx];
        return acc
          .concat(`${container?.name.toLocaleUpperCase('en-US')}\n${r?.text}`)
          .concat(idx === containersList.length - 1 ? '' : '\n');
      },

      '',
    );
  });
}
