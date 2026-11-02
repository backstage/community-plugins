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
import { Entity } from '@backstage/catalog-model';
import { coreExtensionData } from '@backstage/frontend-plugin-api';
import {
  createExtensionTester,
  renderInTestApp,
} from '@backstage/frontend-test-utils';
import { EntityProvider } from '@backstage/plugin-catalog-react';
import { EntityContentBlueprint } from '@backstage/plugin-catalog-react/alpha';
import { screen } from '@testing-library/react';

import { AzureContainerRegistryApiRef } from './api';
import { mockAcrTagsData } from './__fixtures__/acrTagsObject';
import { mockEntity } from './__fixtures__/mockEntity';
import nfsPlugin, { acrImagesEntityContent } from './alpha';
import { TagsResponse } from './types';

/** The fixture carries ISO strings where the API returns Dates. */
const tagsResponse: TagsResponse = {
  imageName: mockAcrTagsData.imageName,
  registry: mockAcrTagsData.registry,
  tags: mockAcrTagsData.tags.map(tag => ({
    ...tag,
    createdTime: new Date(tag.createdTime),
    lastUpdateTime: new Date(tag.lastUpdateTime),
  })),
};

describe('alpha (new frontend system)', () => {
  it('declares the tab the catalog renders, and which entities get it', () => {
    const tester = createExtensionTester(acrImagesEntityContent);

    expect(tester.get(EntityContentBlueprint.dataRefs.title)).toBe(
      'ACR images',
    );
    expect(tester.get(coreExtensionData.routePath)).toBe('acr-images');

    const filter = tester.get(EntityContentBlueprint.dataRefs.filterFunction);
    if (!filter) throw new Error('the entity content declares no filter');
    const withoutAnnotation: Entity = {
      ...mockEntity,
      metadata: { ...mockEntity.metadata, annotations: {} },
    };
    expect(filter(mockEntity)).toBe(true);
    expect(filter(withoutAnnotation)).toBe(false);
  });

  it('is registered by the plugin under the id the app resolves', () => {
    // Not covered by anything else here: createExtensionTester instantiates an
    // extension in isolation, so removing it from the plugin's `extensions`
    // leaves every other assertion in this file green while the tab disappears.
    expect(
      nfsPlugin.getExtension('entity-content:acr/acrImagesEntityContent'),
    ).toBeDefined();
    expect(nfsPlugin.getExtension('api:acr/acrApi')).toBeDefined();
  });

  it('renders the registry through the extension', async () => {
    // Through the blueprint's own loader, which the component's own test cannot
    // reach - renaming the component leaves the assertions above green.
    renderInTestApp(
      <EntityProvider entity={mockEntity}>
        {createExtensionTester(acrImagesEntityContent).reactElement()}
      </EntityProvider>,
      {
        apis: [
          [AzureContainerRegistryApiRef, { getTags: async () => tagsResponse }],
        ],
      },
    );

    expect(
      await screen.findByText(tagsResponse.tags[0].name),
    ).toBeInTheDocument();
  });
});
