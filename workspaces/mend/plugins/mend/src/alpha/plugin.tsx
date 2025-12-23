/*
 * Copyright 2025 The Backstage Authors
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
  ApiBlueprint,
  PageBlueprint,
  NavItemBlueprint,
  FrontendPlugin,
} from '@backstage/frontend-plugin-api';
import { EntityContentBlueprint } from '@backstage/plugin-catalog-react/alpha';
import { convertLegacyRouteRefs } from '@backstage/core-compat-api';
import { discoveryApiRef } from '@backstage/core-plugin-api';
import {
  compatWrapper,
  convertLegacyRouteRef,
} from '@backstage/core-compat-api';
import { mendApiRef, MendClient } from '../api';
import { rootRouteRef } from '../routes';
import { MendIcon } from '../components/Sidebar';

/**
 * An API to communicate via the proxy to an Mend Instance
 *
 * @alpha
 */
export const mendApi = ApiBlueprint.make({
  name: 'mendApi',
  params: defineParams =>
    defineParams({
      api: mendApiRef,
      deps: {
        discoveryApi: discoveryApiRef,
      },
      factory: ({ discoveryApi }) => new MendClient({ discoveryApi }),
    }),
});

/**
 * Mend Plugin Page.
 *
 * @alpha
 */
export const mendPage = PageBlueprint.make({
  params: {
    // This is the path that was previously defined in the app code.
    // It's labelled as the default one because it can be changed via configuration.
    path: '/mend',
    // You can reuse the existing routeRef by wrapping it with convertLegacyRouteRef.
    routeRef: convertLegacyRouteRef(rootRouteRef),
    // these inputs usually match the props required by the component.
    loader: () =>
      import('../App').then(m =>
        // The compatWrapper utility allows you to keep using @backstage/core-plugin-api in the
        // implementation of the component and switch to @backstage/frontend-plugin-api later.
        compatWrapper(<m.App />),
      ),
  },
});

/**
 * Mend Navigation Sidebar.
 *
 * @alpha
 */
export const mendNavItem = NavItemBlueprint.make({
  params: {
    title: 'Mend.io',
    routeRef: convertLegacyRouteRef(rootRouteRef),
    icon: MendIcon,
  },
});

/**
 * Mend.io Tab that display the findings related to that particular entity.
 *
 * @alpha
 */
export const mendTab: any = EntityContentBlueprint.make({
  name: 'acrImagesEntityContent',
  params: {
    path: 'mend',
    title: 'Mend.io',
    filter: 'kind:component',
    loader: () => import('../pages/tab/').then(m => <m.MendTab />),
  },
});

/**
 * Backstage frontend plugin.
 *
 * @alpha
 */
const mendPlugin: FrontendPlugin = createFrontendPlugin({
  pluginId: 'mend-plugin',
  extensions: [mendApi, mendPage, mendNavItem, mendTab],
  routes: convertLegacyRouteRefs({
    root: rootRouteRef,
  }),
});

export default mendPlugin;
