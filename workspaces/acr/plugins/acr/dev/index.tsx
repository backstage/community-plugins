import React from 'react';

import { createDevApp } from '@backstage/dev-utils';
import { TestApiProvider } from '@backstage/test-utils';
import { Page, Header, TabbedLayout } from '@backstage/core-components';
import { EntityProvider } from '@backstage/plugin-catalog-react';

import { getAllThemes } from '@redhat-developer/red-hat-developer-hub-theme';

import { mockAcrTagsData } from '../src/__fixtures__/acrTagsObject';
import { mockEntity } from '../src/__fixtures__/mockEntity';
import {
  AzureContainerRegistryApiRef,
  AzureContainerRegistryApiV1,
} from '../src/api';
import { AcrPage, acrPlugin } from '../src/plugin';
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
  .addThemes(getAllThemes())
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
              <TabbedLayout.Route path="/" title="ACR">
                <AcrPage />
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
