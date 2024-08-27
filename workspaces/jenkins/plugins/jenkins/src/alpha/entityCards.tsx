import React from 'react';
import { createSchemaFromZod } from '@backstage/frontend-plugin-api';
import { createEntityCardExtension } from '@backstage/plugin-catalog-react/alpha';

/**
 * @alpha
 */
export const entityLatestJenkinsRunCard = createEntityCardExtension({
  name: 'latest-run',
  filter: 'kind:component',
  configSchema: createSchemaFromZod(z =>
    z.object({
      props: z
        .object({
          branch: z.string().default('master'),
          varaint: z.string().optional(),
        })
        .default({}),
      filter: z.string().optional(),
    }),
  ),
  loader: ({ config }) =>
    import('../components/Cards').then(m => (
      <m.LatestRunCard {...config.props} />
    )),
});

/**
 * @alpha
 */
export const entityJobRunsTable = createEntityCardExtension({
  name: 'job-runs',
  loader: () =>
    import('../components/JobRunsTable').then(m => <m.JobRunsTable />),
});
