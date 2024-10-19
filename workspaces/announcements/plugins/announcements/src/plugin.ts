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
  errorApiRef,
  identityApiRef,
  fetchApiRef,
} from '@backstage/core-plugin-api';
import {
  createSearchResultListItemExtension,
  SearchResultListItemExtensionProps,
} from '@backstage/plugin-search-react';
import { AnnouncementsClient } from './api';
import { AnnouncementSearchResultProps } from './components/AnnouncementSearchResultListItem';
import { rootRouteRef } from './routes';
import { announcementsApiRef } from '@backstage-community/plugin-announcements-react';

export const announcementsPlugin = createPlugin({
  id: 'announcements',
  routes: {
    root: rootRouteRef,
  },
  apis: [
    createApiFactory({
      api: announcementsApiRef,
      deps: {
        discoveryApi: discoveryApiRef,
        identityApi: identityApiRef,
        errorApi: errorApiRef,
        fetchApi: fetchApiRef,
      },
      factory: ({ discoveryApi, identityApi, errorApi, fetchApi }) => {
        return new AnnouncementsClient({
          discoveryApi: discoveryApi,
          identityApi: identityApi,
          errorApi: errorApi,
          fetchApi: fetchApi,
        });
      },
    }),
  ],
});

export const AnnouncementsPage = announcementsPlugin.provide(
  createRoutableExtension({
    name: 'AnnouncementsPage',
    component: () => import('./components/Router').then(m => m.Router),
    mountPoint: rootRouteRef,
  }),
);

export const AnnouncementsAdminPortal = announcementsPlugin.provide(
  createRoutableExtension({
    name: 'AnnouncementsAdminPortal',
    component: () => import('./components/Admin').then(m => m.AdminPortal),
    mountPoint: rootRouteRef,
  }),
);

export const AnnouncementsTimeline = announcementsPlugin.provide(
  createComponentExtension({
    name: 'AnnouncementsTimeline',
    component: {
      lazy: () => import('./components').then(m => m.AnnouncementsTimeline),
    },
  }),
);

export const AnnouncementsCard = announcementsPlugin.provide(
  createComponentExtension({
    name: 'AnnouncementsCard',
    component: {
      lazy: () =>
        import('./components/AnnouncementsCard').then(m => m.AnnouncementsCard),
    },
  }),
);

export const NewAnnouncementBanner = announcementsPlugin.provide(
  createComponentExtension({
    name: 'NewAnnouncementBanner',
    component: {
      lazy: () =>
        import('./components/NewAnnouncementBanner').then(
          m => m.NewAnnouncementBanner,
        ),
    },
  }),
);

export const AnnouncementSearchResultListItem: (
  props: SearchResultListItemExtensionProps<AnnouncementSearchResultProps>,
) => JSX.Element | null = announcementsPlugin.provide(
  createSearchResultListItemExtension({
    name: 'AnnouncementSearchResultListItem',
    component: () =>
      import('./components/AnnouncementSearchResultListItem').then(
        m => m.AnnouncementSearchResultListItem,
      ),
    predicate: result => result.type === 'announcements',
  }),
);
