import React from 'react';
import { convertLegacyRouteRef } from '@backstage/core-compat-api';
import {
  coreExtensionData,
  createExtensionDataRef,
  createExtensionInput,
  createPlugin,
} from '@backstage/frontend-plugin-api';
import {
  createEntityCardExtension,
  createEntityContentExtension,
} from '@backstage/plugin-catalog-react/alpha';
import { rootRouteRef } from './routes';

const entityGithubActionsContent = createEntityContentExtension({
  defaultPath: 'github-actions',
  defaultTitle: 'GitHub Actions',
  name: 'entity',
  routeRef: convertLegacyRouteRef(rootRouteRef),
  loader: () => import('./components/Router').then(m => <m.Router />),
});

const branchExtensionDataRef = createExtensionDataRef<string>('master');

const entityLatestGithubActionRunCard = createEntityCardExtension({
  name: 'github-actions-latest-run-card',
  inputs: {
    props: createExtensionInput(
      {
        branch: branchExtensionDataRef,
      },
      { singleton: true, optional: true, default: 'master' },
    ),
  },
  loader: ({ inputs }) =>
    import('./components/Cards').then(m => (
      <m.LatestWorkflowRunCard branch={inputs.props?.output.branch} />
    )),
});

const entityLatestGithubActionsForBranchCard = createEntityCardExtension({
  name: 'github-actions-latest-runs-for-branch-card',
  inputs: {
    props: createExtensionInput(
      {
        branch: branchExtensionDataRef,
      },
      { singleton: true, optional: true, default: 'master' },
    ),
  },
  loader: () =>
    import('./components/Cards').then(m => <m.LatestWorkflowsForBranchCard />),
});

const entityRecentGithubActionsRunsCard = createEntityCardExtension({
  name: 'github-actions-recent-runs-card',
  loader: () =>
    import('./components/Cards').then(m => <m.RecentWorkflowRunsCard />),
});

const githubActionsPlugin = createPlugin({
  id: 'github-actions',
  extensions: [
    entityGithubActionsContent,
    entityLatestGithubActionRunCard,
    entityLatestGithubActionsForBranchCard,
    entityRecentGithubActionsRunsCard,
  ],
});

export default githubActionsPlugin;
