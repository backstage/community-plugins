/*
 * Copyright 2024 The Backstage Authors
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
import { createDevApp } from '@backstage/dev-utils';
import { TestApiProvider } from '@backstage/test-utils';
import { Page, Header, TabbedLayout } from '@backstage/core-components';
import { EntityProvider } from '@backstage/plugin-catalog-react';

import { mockAcrTagsData } from '../src/__fixtures__/acrTagsObject';
import { mockEntity } from '../src/__fixtures__/mockEntity';
import {
  AzureContainerRegistryApiRef,
  AzureContainerRegistryApiV1,
} from '../src/api';
import { AcrImagesEntityContent, acrPlugin } from '../src/plugin';
import { TagsResponse } from '../src/types';

class MockAzureContainerRegistryApiClient
  implements AzureContainerRegistryApiV1
{
  readonly resources;

  constructor(fixtureData: any) {
    this.resources = fixtureData;
  }

  async getTags(_repo: any): Promise<TagsResponse> {
    return this.resources;
  }
}

createDevApp()
  .registerPlugin(acrPlugin)
  .addPage({
    element: (
      <TestApiProvider
        apis={[
          [
            AzureContainerRegistryApiRef,
            new MockAzureContainerRegistryApiClient(mockAcrTagsData),
          ],
        ]}
      >
        <EntityProvider entity={mockEntity}>
          <Page themeId="service">
            <Header type="component — service" title="ACR demo application" />
            <TabbedLayout>
              <TabbedLayout.Route path="/" title="ACR images">
                <AcrImagesEntityContent />
              </TabbedLayout.Route>
            </TabbedLayout>
          </Page>
        </EntityProvider>
      </TestApiProvider>
    ),
    title: 'ACR',
    path: '/acr',
  })
  .render();
