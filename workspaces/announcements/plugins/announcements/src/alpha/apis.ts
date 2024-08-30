import {
  createApiExtension,
  createApiFactory,
  discoveryApiRef,
  errorApiRef,
  fetchApiRef,
  identityApiRef,
} from '@backstage/frontend-plugin-api';
import { announcementsApiRef } from '@backstage-community/plugin-announcements-react';
import { AnnouncementsClient } from '../api';

/**
 * @alpha
 */
export const announcementsApiExtension = createApiExtension({
  factory: createApiFactory({
    api: announcementsApiRef,
    deps: {
      discoveryApi: discoveryApiRef,
      identityApi: identityApiRef,
      fetchApi: fetchApiRef,
      errorApi: errorApiRef,
    },
    factory: ({ discoveryApi, identityApi, fetchApi, errorApi }) =>
      new AnnouncementsClient({
        discoveryApi,
        identityApi,
        fetchApi,
        errorApi,
      }),
  }),
});
