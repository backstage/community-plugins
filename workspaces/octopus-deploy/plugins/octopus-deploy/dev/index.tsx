/*
 * Copyright 2023 The Backstage Authors
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
import { octopusDeployPlugin } from '../src/plugin';
import { EntityPageOctopusDeploy } from '../src/components/EntityPageOctopusDeploy';
import { EntityProvider } from '@backstage/plugin-catalog-react';
import { Header, Page, TabbedLayout } from '@backstage/core-components';
import { Entity } from '@backstage/catalog-model';
import {
  OctopusDeployApi,
  octopusDeployApiRef,
  OctopusPluginConfig,
  OctopusProgression,
  OctopusProject,
  OctopusProjectGroup,
} from '../src/api';
import { ProjectReference } from '../src';
import { TestApiProvider } from '@backstage/test-utils';

const mockEntity: Entity = {
  apiVersion: 'backstage.io/v1alpha1',
  kind: 'Component',
  metadata: {
    name: 'backstage',
    description: 'backstage.io',
    annotations: {
      'octopus.com/project-id': 'Project-123',
    },
  },
  spec: {
    lifecycle: 'production',
    type: 'service',
    owner: 'user:guest',
  },
};

class MockOctopusDeployApiClient implements OctopusDeployApi {
  readonly resources;

  constructor(fixtureData: any) {
    this.resources = fixtureData;
  }

  async getReleaseProgression(_: {
    projectReference: ProjectReference;
    releaseHistoryCount: number;
  }): Promise<OctopusProgression> {
    return {
      Environments: [
        {
          Id: 'Environments-123',
          Name: 'Development',
        },
        {
          Id: 'Environments-456',
          Name: 'UAT',
        },
        {
          Id: 'Environments-789',
          Name: 'Production',
        },
      ],
      Releases: [
        {
          Release: {
            Id: 'Releases-123',
            Version: '1.0.0',
            Links: {
              Self: 'https://octopus.com/api/space/machines/machines-123',
              Web: 'https://octopus.com/app#/Spaces-123/projects/Project-123/releases/Releases-123',
            },
          },
          Deployments: {
            'Environments-123': [
              {
                State: 'Success',
              },
            ],
            'Environments-456': [
              {
                State: 'Executing',
              },
            ],
            'Environments-789': [
              {
                State: 'Queued',
              },
            ],
          },
        },
      ],
    };
  }
  async getProjectInfo(_: ProjectReference): Promise<OctopusProject> {
    return {
      Name: 'Backstage',
      Slug: 'backstage',
      Links: {
        Self: 'https://octopus.com/api/space/projects/Project-123',
        Web: 'https://octopus.com/app#/Spaces-123/projects/Project-123',
      },
    };
  }

  async getProjectGroups(): Promise<OctopusProjectGroup[]> {
    return [
      {
        Id: 'ProjectGroups-123',
        Name: 'Default Project Group',
        Description: 'The default project group',
      },
    ];
  }

  async getConfig(): Promise<OctopusPluginConfig> {
    return {
      WebUiBaseUrl: 'https://octopus.com/app',
    };
  }
}

createDevApp()
  .registerPlugin(octopusDeployPlugin)
  .addPage({
    element: (
      <TestApiProvider
        apis={[[octopusDeployApiRef, new MockOctopusDeployApiClient({})]]}
      >
        <EntityProvider entity={mockEntity}>
          <Page themeId="service">
            <Header
              type="component — service"
              title="Octopus Deploy Demo Application"
            />
            <TabbedLayout>
              <TabbedLayout.Route path="/" title="Octopus Deploy">
                <EntityPageOctopusDeploy />
              </TabbedLayout.Route>
            </TabbedLayout>
          </Page>
        </EntityProvider>
      </TestApiProvider>
    ),
    title: 'Octopus Deploy Demo Application',
    path: '/octopus-deploy',
  })
  .render();
