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
import {
  createExtensionTester,
  renderInTestApp,
  TestApiProvider,
} from '@backstage/frontend-test-utils';
import { EntityProvider } from '@backstage/plugin-catalog-react';
import { screen } from '@testing-library/react';
import cloudbuildPlugin from './alpha';
import { CloudbuildApi, cloudbuildApiRef } from './api';

const entity: Entity = {
  apiVersion: 'backstage.io/v1alpha1',
  kind: 'Component',
  metadata: {
    name: 'example-website',
    annotations: {
      'google.com/cloudbuild-project-slug': 'example-project',
    },
  },
};

const cloudbuildApi: CloudbuildApi = {
  listWorkflowRuns: jest.fn().mockResolvedValue({ builds: [] }),
  getWorkflow: jest.fn(),
  getWorkflowRun: jest.fn(),
  reRunWorkflow: jest.fn(),
};

describe('cloudbuild new frontend system plugin', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('registers the API and catalog entity extensions', () => {
    expect(cloudbuildPlugin.pluginId).toBe('cloudbuild');
    expect(cloudbuildPlugin.getExtension('api:cloudbuild')).toBeDefined();
    expect(
      cloudbuildPlugin.getExtension(
        'entity-content:cloudbuild/EntityCloudbuildContent',
      ),
    ).toBeDefined();
    expect(
      cloudbuildPlugin.getExtension(
        'entity-card:cloudbuild/EntityLatestCloudbuildRunCard',
      ),
    ).toBeDefined();
    expect(
      cloudbuildPlugin.getExtension(
        'entity-card:cloudbuild/EntityLatestCloudbuildsForBranchCard',
      ),
    ).toBeDefined();
  });

  it('renders the existing workflow table through the entity content extension', async () => {
    renderInTestApp(
      <TestApiProvider apis={[[cloudbuildApiRef, cloudbuildApi]]}>
        <EntityProvider entity={entity}>
          {createExtensionTester(
            cloudbuildPlugin.getExtension(
              'entity-content:cloudbuild/EntityCloudbuildContent',
            ),
          ).reactElement()}
        </EntityProvider>
      </TestApiProvider>,
    );

    await expect(
      screen.findByText('example-project'),
    ).resolves.toBeInTheDocument();
    expect(cloudbuildApi.listWorkflowRuns).toHaveBeenCalledWith({
      projectId: 'example-project',
      location: 'global',
      cloudBuildFilter: 'substitutions.REPO_NAME=example-website',
    });
  });
});
