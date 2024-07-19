import { convertLegacyRouteRefs } from '@backstage/core-compat-api';
import { createPlugin } from '@backstage/frontend-plugin-api';
import {
  entityGithubActionsCard,
  entityGithubActionsContent,
  entityLatestGithubActionRunCard,
  entityLatestGithubActionsForBranchCard,
  entityRecentGithubActionsRunsCard,
  githubActionsApi,
} from './alpha/index';
import { rootRouteRef } from './routes';

/**
 * @alpha
 */
export default createPlugin({
  id: 'github-actions',
  routes: convertLegacyRouteRefs({
    entityContent: rootRouteRef,
  }),
  extensions: [
    entityGithubActionsContent,
    entityGithubActionsCard,
    entityLatestGithubActionRunCard,
    entityLatestGithubActionsForBranchCard,
    entityRecentGithubActionsRunsCard,
    githubActionsApi,
  ],
});
