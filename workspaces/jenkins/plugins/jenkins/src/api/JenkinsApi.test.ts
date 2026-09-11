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

import { DiscoveryApi, FetchApi } from '@backstage/core-plugin-api';
import { JenkinsClient } from './JenkinsApi';

describe('JenkinsClient', () => {
  const baseUrl = 'http://backstage.example.com/api/jenkins';
  const entity = {
    kind: 'Component',
    namespace: 'default',
    name: 'my-service',
  };
  let discoveryApi: jest.Mocked<Pick<DiscoveryApi, 'getBaseUrl'>>;
  let fetchApi: jest.Mocked<Pick<FetchApi, 'fetch'>>;
  let client: JenkinsClient;

  beforeEach(() => {
    discoveryApi = {
      getBaseUrl: jest.fn().mockResolvedValue(baseUrl),
    };
    fetchApi = {
      fetch: jest.fn().mockResolvedValue({
        ok: true,
        json: async () => ({}),
      } as Response),
    };
    client = new JenkinsClient({
      discoveryApi: discoveryApi as unknown as DiscoveryApi,
      fetchApi: fetchApi as unknown as FetchApi,
    });
  });

  it('keeps identical job names associated with their source instance', async () => {
    const project = {
      fullName: 'folder/shared-job',
      fullDisplayName: 'folder » shared-job',
      displayName: 'shared-job',
      inQueue: false,
      status: 'SUCCESS',
      lastBuild: { number: 12 },
    };
    fetchApi.fetch.mockResolvedValueOnce({
      ok: true,
      json: async () => ({
        projects: [
          { ...project, instanceName: 'prod' },
          { ...project, instanceName: 'dev' },
        ],
      }),
    } as Response);

    const projects = await client.getProjects({ entity, filter: {} });
    await projects[1].onRestartClick();

    expect(projects.map(p => [p.instanceName, p.fullName])).toEqual([
      ['prod', 'folder/shared-job'],
      ['dev', 'folder/shared-job'],
    ]);
    expect(fetchApi.fetch.mock.calls[1][0].toString()).toBe(
      `${baseUrl}/v1/entity/default/Component/my-service/job/folder%2Fshared-job/12?instanceName=dev`,
    );
    expect(fetchApi.fetch.mock.calls[1][1]).toEqual({ method: 'POST' });
  });

  it('passes instanceName to build, history, and console requests', async () => {
    await client.getBuild({
      entity,
      jobFullName: 'folder/shared-job',
      buildNumber: '12',
      instanceName: 'prod',
    });
    await client.getJobBuilds({
      entity,
      jobFullName: 'folder/shared-job',
      instanceName: 'prod',
    });
    await client.getBuildConsoleText({
      entity,
      jobFullName: 'folder/shared-job',
      buildNumber: '12',
      instanceName: 'prod',
    });

    expect(fetchApi.fetch.mock.calls.map(call => call[0].toString())).toEqual([
      `${baseUrl}/v1/entity/default/Component/my-service/job/folder%2Fshared-job/12?instanceName=prod`,
      `${baseUrl}/v1/entity/default/Component/my-service/job/folder%2Fshared-job?instanceName=prod`,
      `${baseUrl}/v1/entity/default/Component/my-service/job/folder%2Fshared-job/12/consoleText?instanceName=prod`,
    ]);
  });
});
