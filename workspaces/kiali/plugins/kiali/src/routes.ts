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
import { pluginId } from '@backstage-community/plugin-kiali-common';
import {
  createRouteRef,
  createSubRouteRef,
  SubRouteRef,
} from '@backstage/core-plugin-api';

export const rootRouteRef = createRouteRef({
  id: pluginId,
});

/* Kiali Page Routes */
export const overviewRouteRef = createSubRouteRef({
  id: 'overview',
  path: '/overview',
  parent: rootRouteRef,
});

export const workloadsRouteRef: SubRouteRef<undefined> = createSubRouteRef({
  id: 'workloads',
  path: '/workloads',
  parent: rootRouteRef,
});

export const servicesRouteRef: SubRouteRef<undefined> = createSubRouteRef({
  id: 'services',
  path: '/services',
  parent: rootRouteRef,
});

export const appsRouteRef: SubRouteRef<undefined> = createSubRouteRef({
  id: 'applications',
  path: '/applications',
  parent: rootRouteRef,
});

export const istioConfigRouteRef = createSubRouteRef({
  id: 'istio',
  parent: rootRouteRef,
  path: '/istio',
});

export const trafficGraphRouteRef = createSubRouteRef({
  id: 'kiali-traffic-graph',
  parent: rootRouteRef,
  path: '/graph',
});

export const workloadsDetailRouteRef = createSubRouteRef({
  id: `${pluginId}/workloads/details`,
  parent: rootRouteRef,
  path: '/workloads/:namespace/:workload',
});

export const servicesDetailRouteRef = createSubRouteRef({
  id: `${pluginId}/services/details`,
  parent: rootRouteRef,
  path: '/services/:namespace/:service',
});

export const appDetailRouteRef = createSubRouteRef({
  id: `${pluginId}/applications/details`,
  parent: rootRouteRef,
  path: '/applications/:namespace/:app',
});

export const istioConfigDetailRouteRef = createSubRouteRef({
  id: `${pluginId}/istio/details`,
  parent: rootRouteRef,
  path: '/istio/:namespace/:objectType/:object',
});
