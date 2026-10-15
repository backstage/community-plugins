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

import express from 'express';
import http, { Server } from 'http';
import { AddressInfo } from 'net';
import { ConfigReader } from '@backstage/config';
import { mockServices } from '@backstage/backend-test-utils';
import { JenkinsApiImpl } from './jenkinsApi';
import { JenkinsBuilder, JenkinsEnvironment } from './JenkinsBuilder';
import { JenkinsInfoProvider } from './jenkinsInfoProvider';

function httpGet(url: string): Promise<{ status: number; body: unknown }> {
  return new Promise((resolve, reject) => {
    http
      .get(url, response => {
        let body = '';
        response.on('data', chunk => {
          body += chunk;
        });
        response.on('end', () => {
          resolve({
            status: response.statusCode ?? 0,
            body: JSON.parse(body),
          });
        });
      })
      .on('error', reject);
  });
}

class TestJenkinsBuilder extends JenkinsBuilder {
  constructor(
    env: JenkinsEnvironment,
    private readonly jenkinsApi: JenkinsApiImpl,
  ) {
    super(env);
  }

  protected override createJenkinsApi(): JenkinsApiImpl {
    return this.jenkinsApi;
  }
}

describe('JenkinsBuilder', () => {
  let server: Server | undefined;
  let provider: jest.Mocked<JenkinsInfoProvider>;
  let jenkinsApi: jest.Mocked<Pick<JenkinsApiImpl, 'getProjects' | 'getBuild'>>;

  afterEach(async () => {
    if (server) {
      await new Promise<void>((resolve, reject) => {
        server?.close(error => (error ? reject(error) : resolve()));
      });
      server = undefined;
    }
  });

  async function startServer(): Promise<string> {
    const httpAuth = mockServices.httpAuth.mock();
    httpAuth.credentials.mockResolvedValue(
      await mockServices.auth().getOwnServiceCredentials(),
    );

    const builder = new TestJenkinsBuilder(
      {
        permissions: mockServices.permissions(),
        config: new ConfigReader({ jenkins: {} }),
        logger: mockServices.logger.mock(),
        jenkinsInfoProvider: provider,
        discovery: mockServices.discovery(),
        auth: mockServices.auth(),
        httpAuth,
      },
      jenkinsApi as unknown as JenkinsApiImpl,
    );
    const { router } = await builder.build();
    const app = express().use(router);

    return new Promise(resolve => {
      server = app.listen(0, () => {
        const { port } = server?.address() as AddressInfo;
        resolve(`http://localhost:${port}`);
      });
    });
  }

  beforeEach(() => {
    provider = {
      getInstance: jest.fn().mockResolvedValue({
        instanceName: 'dev',
        baseUrl: 'http://jenkins-dev',
        fullJobNames: ['folder/shared-job'],
        projectCountLimit: 50,
      }),
      getInstances: jest.fn().mockResolvedValue([
        {
          instanceName: 'prod',
          baseUrl: 'http://jenkins-prod',
          fullJobNames: ['folder/shared-job'],
          projectCountLimit: 50,
        },
        {
          instanceName: 'dev',
          baseUrl: 'http://jenkins-dev',
          fullJobNames: ['folder/shared-job'],
          projectCountLimit: 50,
        },
      ]),
    };
    jenkinsApi = {
      getProjects: jest.fn().mockResolvedValue([
        {
          fullName: 'folder/shared-job',
          fullDisplayName: 'folder » shared-job',
          displayName: 'shared-job',
          inQueue: false,
          status: 'SUCCESS',
          lastBuild: null,
        },
      ]),
      getBuild: jest.fn().mockResolvedValue({ number: 12 }),
    };
  });

  it('returns identical job names once per Jenkins instance', async () => {
    const baseUrl = await startServer();

    const response = await httpGet(
      `${baseUrl}/v1/entity/default/Component/my-service/projects`,
    );

    expect(response.status).toBe(200);
    expect(response.body).toEqual({
      projects: [
        expect.objectContaining({
          instanceName: 'prod',
          fullName: 'folder/shared-job',
        }),
        expect.objectContaining({
          instanceName: 'dev',
          fullName: 'folder/shared-job',
        }),
      ],
    });
    expect(jenkinsApi.getProjects).toHaveBeenCalledTimes(2);
  });

  it('uses instanceName when resolving a job with a duplicate full name', async () => {
    const baseUrl = await startServer();

    const response = await httpGet(
      `${baseUrl}/v1/entity/default/Component/my-service/job/${encodeURIComponent(
        'folder/shared-job',
      )}/12?instanceName=dev`,
    );

    expect(response.status).toBe(200);
    expect(provider.getInstance).toHaveBeenCalledWith(
      expect.objectContaining({
        fullJobNames: ['folder/shared-job'],
        instanceName: 'dev',
      }),
    );
    expect(jenkinsApi.getBuild).toHaveBeenCalledWith(
      expect.objectContaining({ instanceName: 'dev' }),
      ['folder', 'shared-job'],
      12,
    );
  });
});
