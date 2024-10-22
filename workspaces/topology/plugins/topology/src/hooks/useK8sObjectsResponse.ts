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
import { useState } from 'react';

import { useEntity } from '@backstage/plugin-catalog-react';

import { useKubernetesObjects } from '@janus-idp/shared-react';

import {
  K8sResourcesContextData,
  kubernetesApiRef,
  kubernetesAuthProvidersApiRef,
} from '../types/types';
import { useAllWatchResources } from './useAllWatchResources';
import { useK8sResourcesClusters } from './useK8sResourcesClusters';

export const useK8sObjectsResponse = (
  watchedResource: string[],
): K8sResourcesContextData => {
  const { entity } = useEntity();
  const { kubernetesObjects, loading, error } = useKubernetesObjects(
    entity,
    kubernetesApiRef,
    kubernetesAuthProvidersApiRef,
  );
  const [selectedCluster, setSelectedCluster] = useState<number>(0);
  const watchResourcesData = useAllWatchResources(
    watchedResource,
    { kubernetesObjects, loading, error },
    selectedCluster,
  );
  const { clusters, errors: clusterErrors } = useK8sResourcesClusters({
    kubernetesObjects,
    loading,
    error,
  });
  return {
    watchResourcesData,
    loading,
    responseError: error,
    selectedClusterErrors: clusterErrors?.[selectedCluster] ?? [],
    clusters,
    setSelectedCluster,
    selectedCluster,
  };
};
