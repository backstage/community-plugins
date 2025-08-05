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
import { ObjectsByEntityResponse } from '@backstage/plugin-kubernetes-common';

import { mockKubernetesPlrResponse } from './1-pipelinesData';

export const kubernetesObjects: ObjectsByEntityResponse = {
  items: [
    {
      cluster: {
        name: 'minikube',
      },
      podMetrics: [],
      resources: [
        {
          type: 'customresources',
          resources: mockKubernetesPlrResponse.pipelineruns,
        },
        {
          type: 'customresources',
          resources: [],
        },
      ],
      errors: [],
    },
    {
      cluster: {
        name: 'ocp',
      },
      podMetrics: [],
      resources: [
        {
          type: 'customresources',
          resources: [],
        },
        {
          type: 'customresources',
          resources: [],
        },
      ],
      errors: [],
    },
  ],
};
