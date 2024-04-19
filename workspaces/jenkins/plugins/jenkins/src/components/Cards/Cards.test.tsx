/*
 * Copyright 2020 The Backstage Authors
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

import React from 'react';
import { renderInTestApp, TestApiProvider } from '@backstage/test-utils';
import { LatestRunCard } from './Cards';
import { EntityProvider } from '@backstage/plugin-catalog-react';
import { JenkinsApi, jenkinsApiRef } from '../../api';
import { Project } from '../../api/JenkinsApi';

describe('<LatestRunCard />', () => {
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

  it('should show success status of latest build', async () => {
    const { getByText } = await renderInTestApp(
      <TestApiProvider apis={[[jenkinsApiRef, jenkinsApi]]}>
        <EntityProvider entity={entity}>
          <LatestRunCard branch="master" />
        </EntityProvider>
      </TestApiProvider>,
    );

    expect(getByText('Completed')).toBeInTheDocument();
  });

  it('should show the appropriate error in case of a connection error', async () => {
    const jenkinsApiWithError: Partial<JenkinsApi> = {
      getProjects: () => Promise.reject(new Error('Unauthorized')),
    };

    const { getByText } = await renderInTestApp(
      <TestApiProvider apis={[[jenkinsApiRef, jenkinsApiWithError]]}>
        <EntityProvider entity={entity}>
          <LatestRunCard branch="master" />
        </EntityProvider>
      </TestApiProvider>,
    );

    expect(getByText("Error: Can't connect to Jenkins")).toBeInTheDocument();
    expect(getByText('Unauthorized')).toBeInTheDocument();
  });

  it('should show the appropriate error in case Jenkins project is not found', async () => {
    const jenkinsApiWithError: Partial<JenkinsApi> = {
      getProjects: () =>
        Promise.reject({
          notFound: true,
          message: 'jenkins-project not found',
        }),
    };

    const { getByText } = await renderInTestApp(
      <TestApiProvider apis={[[jenkinsApiRef, jenkinsApiWithError]]}>
        <EntityProvider entity={entity}>
          <LatestRunCard branch="master" />
        </EntityProvider>
      </TestApiProvider>,
    );

    expect(getByText("Error: Can't find Jenkins project")).toBeInTheDocument();
    expect(getByText('jenkins-project not found')).toBeInTheDocument();
  });
});
