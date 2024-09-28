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
} from '@backstage/frontend-test-utils';
import * as content from './entityContent';
import { ApiBlueprint, createApiFactory } from '@backstage/frontend-plugin-api';
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
  const mockJenkinsApi = ApiBlueprint.make({
    name: 'jenkins',
    params: {
      factory: createApiFactory({
        api: jenkinsApiRef,
        deps: {},
        factory: () =>
          ({
            getProjects: jest.fn(),
            getBuild: jest.fn(),
            getJobBuilds: jest.fn(),
            retry: () => null,
          } as unknown as JenkinsApi),
      }),
    },
  });

  it('should render Jenkins projects table', async () => {
    renderInTestApp(
      createExtensionTester(content.entityJenkinsProjects)
        .add(mockJenkinsApi)
        .reactElement(),
    );

    await waitFor(
      () => {
        expect(screen.getByText('Projects')).toBeInTheDocument();
      },
      { timeout: 5000 },
    );
  });
});
