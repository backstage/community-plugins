import React from 'react';
import { compatWrapper } from '@backstage/core-compat-api';
import { EntityCardBlueprint } from '@backstage/plugin-catalog-react/alpha';

/**
 * @alpha
 */
export const entitySentryCard = EntityCardBlueprint.make({
  name: 'sentry-issues',
  params: {
    filter: 'kind:component',
    loader: () =>
      import('../components/SentryIssuesWidget').then(m =>
        compatWrapper(<m.SentryIssuesWidgetCard />),
      ),
  },
});
