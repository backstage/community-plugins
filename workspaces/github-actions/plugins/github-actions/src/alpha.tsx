import { convertLegacyRouteRefs } from '@backstage/core-compat-api';
import { createPlugin } from '@backstage/frontend-plugin-api';
import { rootRouteRef } from './routes';
import {
  entityGithubActionsContent,
  entityGithubActionsCard,
  entityLatestGithubActionRunCard,
  entityLatestGithubActionsForBranchCard,
  entityRecentGithubActionsRunsCard,
  githubActionsApi,
} from './alpha/index';

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
