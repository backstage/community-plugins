import React from 'react';
import { createSchemaFromZod } from '@backstage/frontend-plugin-api';
import { createEntityCardExtension } from '@backstage/plugin-catalog-react/alpha';

/**
 * @alpha
 */
export const entityGithubActionsCard = createEntityCardExtension({
  name: 'workflow-runs',
  loader: () =>
    import('../components/Router').then(m => <m.Router view="cards" />),
});

/**
 * @alpha
 */
export const entityLatestGithubActionRunCard = createEntityCardExtension({
  name: 'latest-workflow-run',
  configSchema: createSchemaFromZod(z =>
    z.object({
      props: z
        .object({
          branch: z.string().default('master'),
        })
        .default({}),
      filter: z.string().optional(),
    }),
  ),
  loader: ({ config }) =>
    import('../components/Cards').then(m => (
      <m.LatestWorkflowRunCard {...config.props} />
    )),
});

/**
 * @alpha
 */
export const entityLatestGithubActionsForBranchCard = createEntityCardExtension(
  {
    name: 'latest-branch-workflow-runs',
    configSchema: createSchemaFromZod(z =>
      z.object({
        props: z
          .object({
            branch: z.string().default('master'),
          })
          .default({}),
        filter: z.string().optional(),
      }),
    ),
    loader: ({ config }) =>
      import('../components/Cards').then(m => (
        <m.LatestWorkflowsForBranchCard {...config.props} />
      )),
  },
);

/**
 * @alpha
 */
export const entityRecentGithubActionsRunsCard = createEntityCardExtension({
  name: 'recent-workflow-runs',
  configSchema: createSchemaFromZod(z =>
    z.object({
      props: z
        .object({
          branch: z.string().default('master'),
          dense: z.boolean().default(false),
          limit: z.number().default(5).optional(),
        })
        .default({}),
      filter: z.string().optional(),
    }),
  ),
  loader: ({ config }) =>
    import('../components/Cards').then(m => (
      <m.RecentWorkflowRunsCard {...config.props} />
    )),
});
