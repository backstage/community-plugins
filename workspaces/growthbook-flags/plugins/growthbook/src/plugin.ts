import {
  createApiFactory,
  createPlugin,
  discoveryApiRef,
  fetchApiRef,
} from '@backstage/core-plugin-api';
import { growthbookFlagsApiRef, GrowthbookFlagsClient } from './api';

export const growthbookFlagsPlugin = createPlugin({
  id: 'growthbook-flags',
  apis: [
    createApiFactory({
      api: growthbookFlagsApiRef,
      deps: { discoveryApi: discoveryApiRef, fetchApi: fetchApiRef },
      factory: ({ discoveryApi, fetchApi }) =>
        new GrowthbookFlagsClient({ discoveryApi, fetchApi }),
    }),
  ],
});
