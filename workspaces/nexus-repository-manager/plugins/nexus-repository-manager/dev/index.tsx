import { Content, Header, Page } from '@backstage/core-components';
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
import { nexusRepositoryManagerTranslations } from '../src/translations';

createDevApp()
  .registerPlugin(nexusRepositoryManagerPlugin)
  .addTranslationResource(nexusRepositoryManagerTranslations)
  .setAvailableLanguages(['en', 'de', 'fr', 'it', 'es', 'ja'])
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
        <Page themeId="tool">
          <Header title={entityMock.metadata.name} />
          <Content>
            <EntityProvider entity={entityMock}>
              <NexusRepositoryManagerPage />
            </EntityProvider>
          </Content>
        </Page>
      </TestApiProvider>
    ),
    title: 'Root Page',
    path: '/nexus-repository-manager',
  })
  .render();
