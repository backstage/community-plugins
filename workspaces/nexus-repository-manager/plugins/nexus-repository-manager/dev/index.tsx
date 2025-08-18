import { createDevApp } from '@backstage/dev-utils';
import { EntityProvider } from '@backstage/plugin-catalog-react';
import { TestApiProvider } from '@backstage/test-utils';

import {
  entityMock,
  NexusRepositoryManagerApiClientMock,
} from '../src/__fixtures__/mocks';
import { NexusRepositoryManagerApiRef } from '../src/api';
import {
  NexusRepositoryManagerPage,
  nexusRepositoryManagerPlugin,
} from '../src/plugin';

createDevApp()
  .registerPlugin(nexusRepositoryManagerPlugin)
  .addPage({
    element: (
      <TestApiProvider
        apis={[
          [
            NexusRepositoryManagerApiRef,
            new NexusRepositoryManagerApiClientMock(
              require('../src/__fixtures__/components/all.json'),
            ),
          ],
        ]}
      >
        <EntityProvider entity={entityMock}>
          <NexusRepositoryManagerPage />
        </EntityProvider>
      </TestApiProvider>
    ),
    title: 'Root Page',
    path: '/nexus-repository-manager',
  })
  .render();
