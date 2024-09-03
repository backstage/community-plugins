import { convertLegacyRouteRefs } from '@backstage/core-compat-api';
import { createFrontendPlugin } from '@backstage/frontend-plugin-api';
import {
  sentryApi,
  entitySentryCard,
  entitySentryContent,
} from './alpha/index';
import { rootRouteRef } from './plugin';

/**
 * @alpha
 */
export default createFrontendPlugin({
  id: 'sentry',
  routes: convertLegacyRouteRefs({
    entityContent: rootRouteRef,
  }),
  extensions: [sentryApi, entitySentryCard, entitySentryContent],
});
