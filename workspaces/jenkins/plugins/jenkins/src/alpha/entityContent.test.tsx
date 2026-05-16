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
import { screen, waitFor } from '@testing-library/react';
import {
  createExtensionTester,
  renderInTestApp,
  TestApiProvider,
} from '@backstage/frontend-test-utils';
import * as content from './entityContent';
import { EntityProvider } from '@backstage/plugin-catalog-react';
import { JenkinsApi, jenkinsApiRef } from '../api';
import { sampleEntity } from '../__fixtures__/entity';

jest.mock('@backstage/plugin-catalog-react', () => ({
  ...jest.requireActual('@backstage/plugin-catalog-react'),
  useEntity: () => sampleEntity,
}));

jest.mock('@backstage/core-plugin-api', () => ({
  ...jest.requireActual('@backstage/core-plugin-api'),
  useRouteRef: () => () => '/jenkins',
}));

describe('Entity content extensions', () => {
  const mockJenkinsApi = {
    getProjects: jest.fn(),
    getBuild: jest.fn(),
    getJobBuilds: jest.fn(),
    retry: () => null,
  } as unknown as JenkinsApi;

  const mockedEntity = {
    apiVersion: 'backstage.io/v1alpha1',
    kind: 'Component',
    metadata: {
      name: 'backstage',
      description: 'backstage.io',
    },
    spec: {
      lifecycle: 'production',
      type: 'service',
      owner: 'user:guest',
    },
  };

  it('should render Jenkins projects table', async () => {
    renderInTestApp(
      <TestApiProvider apis={[[jenkinsApiRef, mockJenkinsApi]] as const}>
        <EntityProvider entity={mockedEntity}>
          {createExtensionTester(content.entityJenkinsProjects).reactElement()}
        </EntityProvider>
      </TestApiProvider>,
    );
    await waitFor(
      () => {
        expect(screen.getByText('Projects')).toBeInTheDocument();
      },
      { timeout: 5000 },
    );
  });
});
