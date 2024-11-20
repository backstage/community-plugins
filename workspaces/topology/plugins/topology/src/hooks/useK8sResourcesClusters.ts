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

import { ClusterErrors } from '../types/types';
import { getClusters } from '../utils/topology-utils';

export const useK8sResourcesClusters = (
  k8sObjectsResponse: KubernetesObjects,
) => {
  const { kubernetesObjects, loading, error } = k8sObjectsResponse;
  const [clusters, setClusters] = useState<{
    clusters: string[];
    errors: ClusterErrors[];
  }>({ clusters: [], errors: [] });

  useEffect(() => {
    if (!loading && kubernetesObjects && !error) {
      const k8sResourcesClusters = getClusters(kubernetesObjects);
      if (k8sResourcesClusters) {
        setClusters(k8sResourcesClusters);
      }
    }
  }, [loading, kubernetesObjects, error]);

  return clusters;
};
