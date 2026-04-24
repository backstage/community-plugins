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
import { Entity } from '@backstage/catalog-model';

export const mockEntity: Entity = {
  apiVersion: 'backstage.io/v1alpha1',
  kind: 'Component',
  metadata: {
    name: 'backstage',
    description: 'backstage.io',
    annotations: {
      'argocd/app-selector':
        'rht-gitops.com/janus-argocd=quarkus-app-bootstrap',
      'argocd/project-name': 'project-name',
      'argocd/instance-name': 'main',
      'backstage.io/kubernetes-id': 'quarkus-app',
    },
  },
  spec: {
    lifecycle: 'production',
    type: 'service',
    owner: 'user:guest',
  },
};

export const mockArgoMultiInstanceSelectorEntity: Entity = {
  ...mockEntity,
  metadata: {
    name: 'backstage-argocd-multi-selector',
    description: 'argocd plugin multi-instance selector',
    annotations: {
      'argocd/app-selector':
        'rht-gitops.com/janus-argocd=quarkus-app-bootstrap',
      'argocd/instance-name': 'argoInstance1,argoInstance2',
      'backstage.io/kubernetes-id': 'quarkus-app',
    },
  },
};

export const mockArgoMultiInstanceAppNameEntity: Entity = {
  ...mockEntity,
  metadata: {
    name: 'backstage-argocd-multi-app-name',
    description: 'argocd plugin multi-instance app name',
    annotations: {
      'argocd/app-name': 'quarkus-app',
      'argocd/instance-name': 'argoInstance1,argoInstance2',
      'backstage.io/kubernetes-id': 'quarkus-app',
    },
  },
};

export const mockArgoOneAppEntity: Entity = {
  ...mockEntity,
  metadata: {
    name: 'backstage-argocd-multi-one-app-name',
    description: 'argocd plugin multi-instance one app name',
    annotations: {
      'argocd/app-name': 'basic-app',
      'backstage.io/kubernetes-id': 'basic-app',
    },
  },
};
