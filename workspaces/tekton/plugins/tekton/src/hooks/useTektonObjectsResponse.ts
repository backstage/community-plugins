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
import { useState, useRef, useEffect, useCallback } from 'react';

import { useEntity } from '@backstage/plugin-catalog-react';

import { isEqual } from 'lodash';

import { ComputedStatus } from '@janus-idp/shared-react';

import { useKubernetesObjects } from '@backstage/plugin-kubernetes-react';
import { TektonResourcesContextData, TektonResponseData } from '../types/types';
import { useAllWatchResources } from './useAllWatchResources';
import { useResourcesClusters } from './useResourcesClusters';
import { useDebounceCallback } from './useDebounceCallback';
import { useDeepCompareMemoize } from './useDeepCompareMemoize';

export const useTektonObjectsResponse = (
  watchedResource: string[],
): TektonResourcesContextData => {
  const { entity } = useEntity();
  const { kubernetesObjects, loading, error } = useKubernetesObjects(entity);
  const [selectedCluster, setSelectedCluster] = useState<number>(0);
  const [selectedStatus, setSelectedStatus] = useState<ComputedStatus>(
    'All' as ComputedStatus,
  );
  const [isExpanded, setIsExpanded] = useState<boolean>(false);
  const [loaded, setLoaded] = useState<boolean>(false);
  const [errorState, setErrorState] = useState<string>();
  const [pipelinesData, setPipelinesData] = useState<
    TektonResponseData | undefined
  >();

  const mounted = useRef(false);

  useEffect(() => {
    mounted.current = true;
    return () => {
      mounted.current = false;
    };
  }, []);

  const watchResourcesData = useAllWatchResources(
    { kubernetesObjects, loading, error },
    selectedCluster,
    watchedResource,
  );

  const resourcesClusters = useResourcesClusters({
    kubernetesObjects,
    loading,
    error,
  });

  const updateResults = useCallback(
    (
      resData: TektonResponseData,
      isLoading: boolean,
      errorData: string | undefined,
    ) => {
      if (!isLoading && !errorData && mounted.current) {
        setLoaded(true);
        setPipelinesData(prevPipelinesData => {
          if (isEqual(prevPipelinesData, resData)) {
            return prevPipelinesData;
          }
          return resData;
        });
      } else if (errorData && mounted.current) {
        setLoaded(true);
        setErrorState(errorData);
      }
    },
    [setLoaded, setPipelinesData, setErrorState],
  );

  const debouncedUpdateResources = useDebounceCallback(updateResults, 250);

  useEffect(() => {
    debouncedUpdateResources?.(watchResourcesData, loading, error);
  }, [debouncedUpdateResources, watchResourcesData, loading, error]);

  return useDeepCompareMemoize({
    watchResourcesData: pipelinesData,
    loaded,
    responseError: errorState,
    selectedClusterErrors: resourcesClusters?.errors?.[selectedCluster] ?? [],
    clusters: resourcesClusters?.clusters || [],
    selectedCluster,
    setSelectedCluster,
    selectedStatus,
    setSelectedStatus,
    isExpanded,
    setIsExpanded,
  });
};
