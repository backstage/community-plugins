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
import {
  createApiFactory,
  createComponentExtension,
  createPlugin,
  createRoutableExtension,
  discoveryApiRef,
  fetchApiRef,
} from '@backstage/core-plugin-api';

import { reportPortalApiRef, ReportPortalClient } from './api';
import { entityRootRouteRef, rootRouteRef } from './routes';
import {
  createSearchResultListItemExtension,
  SearchResultListItemExtensionProps,
} from '@backstage/plugin-search-react';
import { ReportPortalSearchResultItemProps } from './components/ReportPortalSearchResultItem';

/** @public */
export const reportPortalPlugin = createPlugin({
  id: 'report-portal',
  routes: {
    root: rootRouteRef,
    entityRoot: entityRootRouteRef,
  },
  apis: [
    createApiFactory({
      api: reportPortalApiRef,
      deps: {
        discovery: discoveryApiRef,
        fetch: fetchApiRef,
      },
      factory: ({ discovery, fetch }) =>
        new ReportPortalClient(discovery, fetch),
    }),
  ],
});

/** @public */
export const ReportPortalOverviewCard = reportPortalPlugin.provide(
  createComponentExtension({
    name: 'ReportPortalOverviewCard',
    component: {
      lazy: () =>
        import('./components/ReportPortalOverviewCard').then(
          m => m.ReportPortalOverviewCard,
        ),
    },
  }),
);

/** @public */
export const ReportPortalGlobalPage = reportPortalPlugin.provide(
  createRoutableExtension({
    name: 'ReportPortalGlobalPage',
    mountPoint: rootRouteRef,
    component: () => import('./components/Router').then(m => m.Router),
  }),
);

/** React extension used to render results on Search page or modal
 * @public
 */
export const ReportPortalSearchResultItem: (
  props: SearchResultListItemExtensionProps<ReportPortalSearchResultItemProps>,
) => JSX.Element | null = reportPortalPlugin.provide(
  createSearchResultListItemExtension({
    name: 'ReportPortalSearchResultItem',
    component: () =>
      import('./components/ReportPortalSearchResultItem').then(
        m => m.ReportPortalSearchResultItem,
      ),
    predicate: result => result.type === 'report-portal',
  }),
);
