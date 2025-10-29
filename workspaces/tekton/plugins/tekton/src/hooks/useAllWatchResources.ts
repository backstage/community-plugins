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
import { useEffect, useMemo, useState } from 'react';

import { KubernetesObjects } from '@backstage/plugin-kubernetes-react';

import { useDeepCompareMemoize } from './useDeepCompareMemoize';
import { TektonResponseData } from '../types/types';
import { getTektonResources } from '../utils/tekton-utils';

export const useAllWatchResources = (
  k8sObjectsResponse: KubernetesObjects,
  cluster: number,
  watchedResource: string[] = [],
): TektonResponseData => {
  const { kubernetesObjects, loading, error } = k8sObjectsResponse;
  const [resources, setResources] = useState<TektonResponseData>({});

  useEffect(() => {
    let isMounted = true;
    if (isMounted && !loading && kubernetesObjects && !error) {
      const tektonResources: TektonResponseData = getTektonResources(
        cluster,
        kubernetesObjects,
      );
      if (tektonResources) {
        setResources(tektonResources);
      }
    }
    return () => {
      isMounted = false;
    };
  }, [loading, kubernetesObjects, error, cluster]);

  const watchResourcesData = useMemo(() => {
    return watchedResource.reduce((acc: TektonResponseData, resKind) => {
      if (resources[resKind]) {
        acc[resKind] = resources[resKind];
      }
      return acc;
    }, {});
  }, [watchedResource, resources]);

  return useDeepCompareMemoize(watchResourcesData);
};
