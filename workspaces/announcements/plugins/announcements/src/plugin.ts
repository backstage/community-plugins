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
