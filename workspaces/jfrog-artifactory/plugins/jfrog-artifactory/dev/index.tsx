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
import { Entity } from '@backstage/catalog-model';
import { createDevApp } from '@backstage/dev-utils';
import { EntityProvider } from '@backstage/plugin-catalog-react';

import { JfrogArtifactoryPage, jfrogArtifactoryPlugin } from '../src/plugin';
import { jfrogArtifactoryApiRef, JfrogArtifactoryApiV1 } from '../src/api';
import { mockTags } from '../src/__fixtures__/mockTags';
import { TagsResponse } from '../src/types';
import { TestApiProvider } from '@backstage/test-utils';

const mockEntity: Entity = {
  apiVersion: 'backstage.io/v1alpha1',
  kind: 'Component',
  metadata: {
    name: 'backstage',
    description: 'backstage.io',
    annotations: {
      'jfrog-artifactory/image-name': 'backstage',
    },
  },
  spec: {
    lifecycle: 'production',
    type: 'service',
    owner: 'user:guest',
  },
};

class MockJfrogArtifactoryApi implements JfrogArtifactoryApiV1 {
  async getTags(_repo: string): Promise<TagsResponse> {
    return Promise.resolve(mockTags as TagsResponse);
  }
}
const mockJfrogArtifactoryApi = new MockJfrogArtifactoryApi();

createDevApp()
  .registerPlugin(jfrogArtifactoryPlugin)
  .addPage({
    element: (
      <TestApiProvider
        apis={[[jfrogArtifactoryApiRef, mockJfrogArtifactoryApi]]}
      >
        <EntityProvider entity={mockEntity}>
          <JfrogArtifactoryPage />
        </EntityProvider>
      </TestApiProvider>
    ),
    title: 'Root Page',
    path: '/artifactory',
  })
  .render();
