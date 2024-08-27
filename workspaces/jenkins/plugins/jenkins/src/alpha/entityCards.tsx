import React from 'react';
import { EntityCardBlueprint } from '@backstage/plugin-catalog-react/alpha';

/**
 * @alpha
 */
export const entityLatestJenkinsRunCard = EntityCardBlueprint.makeWithOverrides(
  {
    name: 'latest-run',
    config: {
      schema: {
        branch: z => z.string().default('master'),
        variant: z => z.enum(['flex', 'fullHeight', 'gridItem']).optional(),
      },
    },
    factory(originalFactory, { config }) {
      return originalFactory({
        filter: 'kind:component',
        loader: async () =>
          import('../components/Cards').then(m => (
            <m.LatestRunCard {...config} />
          )),
      });
    },
  },
);

/**
 * @alpha
 */
export const entityJobRunsTable = EntityCardBlueprint.make({
  name: 'job-runs',
  params: {
    loader: () =>
      import('../components/JobRunsTable').then(m => <m.JobRunsTable />),
  },
});
