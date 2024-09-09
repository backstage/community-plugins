import React from 'react';
import { EntityContentBlueprint } from '@backstage/plugin-catalog-react/alpha';

/**
 * @alpha
 */
export const entitySonarQubeContent = EntityContentBlueprint.make({
  name: 'entity',
  params: {
    defaultPath: 'sonarqube',
    defaultTitle: 'SonarQube',
    filter: 'kind:component',
    loader: () =>
      import('../components/SonarQubeContentPage').then(m => (
        <m.SonarQubeContentPage />
      )),
  },
});
