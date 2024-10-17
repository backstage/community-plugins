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
import { Model } from '@patternfly/react-topology';

import { K8sResponseData } from '../types/types';
import { getWorkloadResources } from '../utils/topology-utils';
import { baseDataModelGetter } from './data-transformer';

export const updateTopologyDataModel = (
  resources: K8sResponseData,
): Promise<{ loaded: boolean; loadError: string; model: Model | null }> => {
  if (!resources) {
    return Promise.resolve({ loaded: false, loadError: '', model: null });
  }

  const workloadResources = getWorkloadResources(resources);
  const topologyModel: Model = {
    nodes: [],
    edges: [],
  };

  const fullModel = baseDataModelGetter(
    topologyModel,
    resources,
    workloadResources,
  );

  return Promise.resolve({ loaded: true, loadError: '', model: fullModel });
};
