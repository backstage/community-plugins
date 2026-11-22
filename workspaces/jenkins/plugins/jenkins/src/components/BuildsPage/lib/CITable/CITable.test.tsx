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
import { toastApiRef } from '@backstage/frontend-plugin-api';
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
      {
        instanceName: 'dev',
        fullName: 'folder/shared-job',
        fullDisplayName: 'folder » shared-job',
        displayName: 'shared-job',
        status: 'success',
        lastBuild: { timestamp: 0, status: 'success', url: 'foo', number: 12 },
      },
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
        <TestApiProvider
          apis={[
            [jenkinsApiRef, jenkinsApi],
            [toastApiRef, {}],
          ]}
        >
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
        <TestApiProvider
          apis={[
            [jenkinsApiRef, jenkinsApi],
            [toastApiRef, {}],
          ]}
        >
          <EntityProvider entity={entity}>
            <CITable title="My custom title!" />
          </EntityProvider>
        </TestApiProvider>,
        mountedRoutes,
      );
      expect(getByText('My custom title!')).toBeVisible();
    });
  });

  async function renderTable(api: Partial<JenkinsApi>) {
    return renderInTestApp(
      <TestApiProvider
        apis={[
          [jenkinsApiRef, api],
          [toastApiRef, {}],
        ]}
      >
        <EntityProvider entity={entity}>
          <CITable />
        </EntityProvider>
      </TestApiProvider>,
      mountedRoutes,
    );
  }

  it('hides the instance column when every job is on the same instance', async () => {
    const { findByText, queryByText } = await renderTable(jenkinsApi);

    expect(await findByText('folder » shared-job')).toBeInTheDocument();
    expect(queryByText('Instance')).not.toBeInTheDocument();
  });

  it('shows the instance column when jobs come from several instances', async () => {
    const project = {
      fullName: 'folder/shared-job',
      fullDisplayName: 'folder » shared-job',
      displayName: 'shared-job',
      status: 'success',
      lastBuild: { timestamp: 0, status: 'success', url: 'foo', number: 12 },
    };
    const { findByText, getByText } = await renderTable({
      getProjects: async () =>
        [
          { ...project, instanceName: 'prod' },
          { ...project, instanceName: 'dev' },
        ] as Project[],
    });

    expect(await findByText('Instance')).toBeInTheDocument();
    expect(getByText('prod')).toBeInTheDocument();
    expect(getByText('dev')).toBeInTheDocument();
  });

  it('warns about the instances that could not be loaded', async () => {
    const { findByText, getByText } = await renderTable({
      getProjectsWithErrors: async () => ({
        projects: [],
        errors: [{ instanceName: 'prod', message: 'prod is down' }],
      }),
    });

    expect(
      await findByText(
        "Warning: Couldn't load projects from Jenkins instance(s): prod",
      ),
    ).toBeInTheDocument();
    expect(getByText('prod is down')).toBeInTheDocument();
  });

  it('shows the error when no project can be loaded', async () => {
    const { findByText, getByText } = await renderTable({
      getProjects: () => Promise.reject(new Error('every instance is down')),
    });

    expect(
      await findByText("Error: Can't load Jenkins projects"),
    ).toBeInTheDocument();
    expect(getByText('every instance is down')).toBeInTheDocument();
  });

  it('keeps the Jenkins instance in build detail links', async () => {
    const { findByRole } = await renderInTestApp(
      <TestApiProvider
        apis={[
          [jenkinsApiRef, jenkinsApi],
          [toastApiRef, {}],
        ]}
      >
        <EntityProvider entity={entity}>
          <CITable />
        </EntityProvider>
      </TestApiProvider>,
      mountedRoutes,
    );

    expect(
      await findByRole('link', { name: 'folder » shared-job' }),
    ).toHaveAttribute(
      'href',
      '/builds/folder%2Fshared-job/12?instanceName=dev',
    );
  });
});
