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
import { renderInTestApp, TestApiProvider } from '@backstage/test-utils';
import { EntityProvider } from '@backstage/plugin-catalog-react';
import { CITable } from './CITable';
import { JenkinsApi, jenkinsApiRef } from '../../../../api';
import { Project } from '../../../../api/JenkinsApi';
import { rootRouteRef } from '../../../../plugin';

jest.mock('@backstage/plugin-catalog-react/alpha', () => ({
  useEntityPermission: () => {
    return { loading: false, allowed: true };
  },
}));

const entity = {
  apiVersion: 'v1',
  kind: 'Component',
  metadata: {
    name: 'software',
    description: 'This is the description',
    annotations: { JENKINS_ANNOTATION: 'jenkins' },
  },
};
const jenkinsApi: Partial<JenkinsApi> = {
  getProjects: () =>
    Promise.resolve([
      { lastBuild: { timestamp: 0, status: 'success', url: 'foo' } },
    ] as Project[]),
};

const mountedRoutes = {
  mountedRoutes: {
    '/': rootRouteRef,
  },
};

describe('<CITable />', () => {
  describe('when the title is undefined', () => {
    it('should render the default text', async () => {
      const { getByText } = await renderInTestApp(
        <TestApiProvider apis={[[jenkinsApiRef, jenkinsApi]]}>
          <EntityProvider entity={entity}>
            <CITable />
          </EntityProvider>
        </TestApiProvider>,
        mountedRoutes,
      );
      expect(getByText('Projects')).toBeVisible();
    });
  });

  describe('when title is defined', () => {
    it('should render the text', async () => {
      const { getByText } = await renderInTestApp(
        <TestApiProvider apis={[[jenkinsApiRef, jenkinsApi]]}>
          <EntityProvider entity={entity}>
            <CITable title="My custom title!" />
          </EntityProvider>
        </TestApiProvider>,
        mountedRoutes,
      );
      expect(getByText('My custom title!')).toBeVisible();
    });
  });
});
