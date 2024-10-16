import React from 'react';

import { createDevApp } from '@backstage/dev-utils';
import { EntityProvider } from '@backstage/plugin-catalog-react';
import { TestApiProvider } from '@backstage/test-utils';

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
          <AcrPage />
        </EntityProvider>
      </TestApiProvider>
    ),
    title: 'ACR',
    path: '/acr',
  })
  .render();
