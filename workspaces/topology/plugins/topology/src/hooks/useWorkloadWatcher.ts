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

import { Model } from '@patternfly/react-topology';

import { updateTopologyDataModel } from '../data-transforms/updateTopologyDataModel';
import { K8sResourcesContextData, K8sResponseData } from '../types/types';
import { K8sResourcesContext } from './K8sResourcesContext';
import { useDebounceCallback } from './useDebounceCallback';
import { useDeepCompareMemoize } from './useDeepCompareMemoize';

export const useWorkloadsWatcher = (): {
  loaded: boolean;
  dataModel: any;
} => {
  const [loaded, setLoaded] = useState<boolean>(false);
  const [dataModel, setDataModel] = useState<Model | null>(null);
  const k8sResponseData = useContext(K8sResourcesContext);

  const updateResults = useCallback(
    async ({
      watchResourcesData,
      loading,
      responseError,
    }: K8sResourcesContextData) => {
      if (!loading) {
        setLoaded(true);
        if (!responseError) {
          const dataModelRes = await updateTopologyDataModel(
            watchResourcesData as K8sResponseData,
          );
          if (dataModelRes.model) {
            setDataModel(dataModelRes.model);
          }
        }
      }
    },
    [setLoaded, setDataModel],
  );

  const debouncedUpdateResources = useDebounceCallback(updateResults, 250);

  useEffect(() => {
    debouncedUpdateResources(k8sResponseData);
  }, [debouncedUpdateResources, k8sResponseData]);

  return useDeepCompareMemoize({ loaded, dataModel });
};
