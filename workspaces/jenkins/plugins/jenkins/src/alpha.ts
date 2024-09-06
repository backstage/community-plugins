import { convertLegacyRouteRefs } from '@backstage/core-compat-api';
import { createPlugin } from '@backstage/frontend-plugin-api';
import {
  entityJenkinsProjects,
  entityLatestJenkinsRunCard,
  jenkinsApi,
} from './alpha/index';
import { rootRouteRef } from './plugin';

/**
 * @alpha
 */
export default createPlugin({
  id: 'jenkins',
  routes: convertLegacyRouteRefs({
    entityContent: rootRouteRef,
  }),
  extensions: [entityJenkinsProjects, entityLatestJenkinsRunCard, jenkinsApi],
});
