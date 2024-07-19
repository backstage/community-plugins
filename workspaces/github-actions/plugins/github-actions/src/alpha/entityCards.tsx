import React from 'react';
import { createSchemaFromZod } from '@backstage/frontend-plugin-api';
import { createEntityCardExtension } from '@backstage/plugin-catalog-react/alpha';

export const entityGithubActionsCard = createEntityCardExtension({
  name: 'workflow-runs',
  loader: () =>
    import('../components/Router').then(m => <m.Router view="cards" />),
});

export const entityLatestGithubActionRunCard = createEntityCardExtension({
  name: 'latest-workflow-run',
  configSchema: createSchemaFromZod(z =>
    z.object({
      branch: z.string().default('master'),
      filter: z.string().default(''),
    }),
  ),
  loader: ({ config }) =>
    import('../components/Cards').then(m => (
      <m.LatestWorkflowRunCard branch={config.branch} />
    )),
});

export const entityLatestGithubActionsForBranchCard = createEntityCardExtension(
  {
    name: 'latest-branch-workflow-runs',
    configSchema: createSchemaFromZod(z =>
      z.object({
        branch: z.string().default('master'),
        filter: z.string().default(''),
      }),
    ),
    loader: ({ config }) =>
      import('../components/Cards').then(m => (
        <m.LatestWorkflowsForBranchCard branch={config.branch} />
      )),
  },
);

export const entityRecentGithubActionsRunsCard = createEntityCardExtension({
  name: 'recent-workflow-runs',
  configSchema: createSchemaFromZod(z =>
    z.object({
      branch: z.string().default('master'),
      filter: z.string().default(''),
    }),
  ),
  loader: ({ config }) =>
    import('../components/Cards').then(m => (
      <m.RecentWorkflowRunsCard branch={config.branch} />
    )),
});
