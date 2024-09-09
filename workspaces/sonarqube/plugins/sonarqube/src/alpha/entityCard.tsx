import { compatWrapper } from '@backstage/core-compat-api';
import { EntityCardBlueprint } from '@backstage/plugin-catalog-react/alpha';
import React from 'react';

/**
 * @alpha
 */
export const entitySonarQubeCard: any = EntityCardBlueprint.make({
  name: 'card',
  params: {
    filter: 'kind:component',
    loader: () =>
      import('../components/SonarQubeCard').then(m =>
        compatWrapper(<m.SonarQubeCard />),
      ),
  },
});
