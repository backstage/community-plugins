/*
 * Copyright 2026 The Backstage Authors
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *     http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */
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
