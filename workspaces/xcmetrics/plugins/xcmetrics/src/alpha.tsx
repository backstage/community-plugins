/*
 * Copyright 2026 The Backstage Authors
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
import {
  createFrontendPlugin,
  PageBlueprint,
  ApiBlueprint,
  discoveryApiRef,
  fetchApiRef,
} from '@backstage/frontend-plugin-api';
import { rootRouteRef } from './routes';
import { xcmetricsApiRef, XcmetricsClient } from './api';

const xCMetricsPage = PageBlueprint.make({
  params: {
    path: '/xcmetrics',
    routeRef: rootRouteRef,
    loader: () =>
      import('./components/XcmetricsLayout').then(m => <m.XcmetricsLayout />),
  },
});

/**
 * @alpha
 */
export const xCRMetricsApiExtension = ApiBlueprint.make({
  name: 'xcmetrics-api',
  params: defineParams =>
    defineParams({
      api: xcmetricsApiRef,
      deps: {
        discoveryApi: discoveryApiRef,
        fetchApi: fetchApiRef,
      },
      factory({ discoveryApi, fetchApi }) {
        return new XcmetricsClient({ discoveryApi, fetchApi });
      },
    }),
});

export default createFrontendPlugin({
  pluginId: 'xcmetrics',
  extensions: [xCMetricsPage, xCRMetricsApiExtension],
  routes: {
    root: rootRouteRef,
  },
});
