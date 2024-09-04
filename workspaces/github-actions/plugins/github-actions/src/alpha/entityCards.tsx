import React from 'react';
import { EntityCardBlueprint } from '@backstage/plugin-catalog-react/alpha';

/**
 * @alpha
 */
export const entityGithubActionsCard = EntityCardBlueprint.make({
  name: 'workflow-runs',
  params: {
    filter: 'kind:component',
    loader: () =>
      import('../components/Router').then(m => <m.Router view="cards" />),
  },
});

/**
 * @alpha
 */
export const entityLatestGithubActionRunCard =
  EntityCardBlueprint.makeWithOverrides({
    name: 'latest-workflow-run',
    config: {
      schema: {
        props: z =>
          z
            .object({
              branch: z.string().default('master'),
            })
            .default({}),
      },
    },
    factory(originalFactory, { config }) {
      return originalFactory({
        filter: 'kind:component',
        loader: async () =>
          import('../components/Cards').then(m => (
            <m.LatestWorkflowRunCard {...config.props} />
          )),
      });
    },
  });

/**
 * @alpha
 */
export const entityLatestGithubActionsForBranchCard =
  EntityCardBlueprint.makeWithOverrides({
    name: 'latest-branch-workflow-runs',
    config: {
      schema: {
        props: z =>
          z
            .object({
              branch: z.string().default('master'),
            })
            .default({}),
      },
    },
    factory(originalFactory, { config }) {
      return originalFactory({
        filter: 'kind:component',
        loader: async () =>
          import('../components/Cards').then(m => (
            <m.LatestWorkflowsForBranchCard {...config.props} />
          )),
      });
    },
  });

/**
 * @alpha
 */
export const entityRecentGithubActionsRunsCard =
  EntityCardBlueprint.makeWithOverrides({
    name: 'recent-workflow-runs',
    config: {
      schema: {
        props: z =>
          z
            .object({
              branch: z.string().default('master'),
              dense: z.boolean().default(false),
              limit: z.number().default(5).optional(),
            })
            .default({}),
      },
    },
    factory(originalFactory, { config }) {
      return originalFactory({
        filter: 'kind:component',
        loader: async () =>
          import('../components/Cards').then(m => (
            <m.RecentWorkflowRunsCard {...config.props} />
          )),
      });
    },
  });
