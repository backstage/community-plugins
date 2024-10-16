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
import { useEffect, useState } from 'react';

import { KubernetesObjects } from '@backstage/plugin-kubernetes-react';

import { K8sResponseData } from '../types/types';
import { getK8sResources } from '../utils/topology-utils';

export const useAllWatchResources = (
  watchedResource: string[] = [],
  k8sObjectsResponse: KubernetesObjects,
  cluster: number,
): K8sResponseData => {
  const { kubernetesObjects, loading, error } = k8sObjectsResponse;
  const [resources, setResources] = useState<K8sResponseData>({});

  useEffect(() => {
    if (!loading && kubernetesObjects && !error) {
      const k8sResources: K8sResponseData = getK8sResources(
        cluster,
        kubernetesObjects,
      );
      if (k8sResources) {
        setResources(k8sResources);
      }
    }
  }, [loading, kubernetesObjects, error, cluster]);

  const watchResourcesData = watchedResource.reduce(
    (acc: K8sResponseData, resKind) => {
      if (resources[resKind]) {
        acc[resKind] = resources[resKind];
      }
      return acc;
    },
    {},
  );

  return watchResourcesData;
};
