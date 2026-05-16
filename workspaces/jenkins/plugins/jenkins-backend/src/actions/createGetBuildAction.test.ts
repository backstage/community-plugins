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

import { mockCredentials, mockServices } from '@backstage/backend-test-utils';
import { NotFoundError } from '@backstage/errors';
import { createGetBuildAction } from './createGetBuildAction';
import { JenkinsInfoProvider } from '../service/jenkinsInfoProvider';
import { JenkinsApiImpl } from '../service/jenkinsApi';

const mockBuild = {
  number: 42,
  url: 'http://jenkins/job/my-pipeline/42/',
  displayName: '#42',
  fullDisplayName: 'my-pipeline #42',
  result: 'SUCCESS',
  building: false,
  status: 'SUCCESS',
  timestamp: 1700000000000,
  duration: 120000,
  tests: { passed: 10, skipped: 0, failed: 0, total: 10, testUrl: '' },
  source: { branchName: 'main', commit: { hash: 'abc1234' } },
};

describe('createGetBuildAction', () => {
  let mockActionsRegistry: { register: jest.Mock };
  let mockJenkinsInfoProvider: jest.Mocked<JenkinsInfoProvider>;
  let mockJenkinsApi: jest.Mocked<JenkinsApiImpl>;

  beforeEach(() => {
    mockActionsRegistry = { register: jest.fn() };

    mockJenkinsInfoProvider = {
      getInstance: jest.fn().mockResolvedValue({
        baseUrl: 'http://jenkins',
        fullJobNames: ['my-pipeline'],
        projectCountLimit: 50,
      }),
    } as any;

    mockJenkinsApi = {
      getBuild: jest.fn().mockResolvedValue(mockBuild),
    } as any;

    createGetBuildAction({
      actionsRegistry: mockActionsRegistry as any,
      jenkinsInfoProvider: mockJenkinsInfoProvider,
      jenkinsApi: mockJenkinsApi,
    });
  });

  it('registers the get-build action', () => {
    expect(mockActionsRegistry.register).toHaveBeenCalledTimes(1);
    const registration = mockActionsRegistry.register.mock.calls[0][0];
    expect(registration.name).toBe('get-build');
    expect(registration.attributes.readOnly).toBe(true);
  });

  it('returns build details', async () => {
    const registration = mockActionsRegistry.register.mock.calls[0][0];
    const credentials = mockCredentials.user();

    const result = await registration.action({
      input: {
        name: 'my-service',
        kind: 'Component',
        namespace: 'default',
        jobFullName: 'my-folder/my-pipeline',
        buildNumber: 42,
      },
      credentials,
      logger: mockServices.logger.mock(),
    });

    expect(mockJenkinsApi.getBuild).toHaveBeenCalledWith(
      expect.any(Object),
      ['my-folder', 'my-pipeline'],
      42,
    );
    expect(result.output).toMatchObject({
      number: 42,
      result: 'SUCCESS',
      building: false,
      status: 'SUCCESS',
    });
  });

  it('splits jobFullName on "/" when passing to API', async () => {
    const registration = mockActionsRegistry.register.mock.calls[0][0];
    const credentials = mockCredentials.user();

    await registration.action({
      input: {
        name: 'my-service',
        jobFullName: 'folder/sub-folder/pipeline/main',
        buildNumber: 1,
      },
      credentials,
      logger: mockServices.logger.mock(),
    });

    expect(mockJenkinsApi.getBuild).toHaveBeenCalledWith(
      expect.any(Object),
      ['folder', 'sub-folder', 'pipeline', 'main'],
      1,
    );
  });

  it('throws NotFoundError when build is not found', async () => {
    mockJenkinsApi.getBuild.mockRejectedValue(new Error('404 Not Found'));
    const registration = mockActionsRegistry.register.mock.calls[0][0];
    const credentials = mockCredentials.user();

    await expect(
      registration.action({
        input: {
          name: 'my-service',
          jobFullName: 'my-pipeline',
          buildNumber: 999,
        },
        credentials,
        logger: mockServices.logger.mock(),
      }),
    ).rejects.toThrow(NotFoundError);
  });
});
