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
import { createGetBuildLogsAction } from './createGetBuildLogsAction';
import { JenkinsInfoProvider } from '../service/jenkinsInfoProvider';
import { JenkinsApiImpl } from '../service/jenkinsApi';

describe('createGetBuildLogsAction', () => {
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
      getBuildConsoleText: jest
        .fn()
        .mockResolvedValue('Started by user admin\nFinished: SUCCESS\n'),
    } as any;

    createGetBuildLogsAction({
      actionsRegistry: mockActionsRegistry as any,
      jenkinsInfoProvider: mockJenkinsInfoProvider,
      jenkinsApi: mockJenkinsApi,
    });
  });

  it('registers the get-build-logs action', () => {
    expect(mockActionsRegistry.register).toHaveBeenCalledTimes(1);
    const registration = mockActionsRegistry.register.mock.calls[0][0];
    expect(registration.name).toBe('get-build-logs');
    expect(registration.attributes.readOnly).toBe(true);
  });

  it('returns console text for a build', async () => {
    const registration = mockActionsRegistry.register.mock.calls[0][0];
    const credentials = mockCredentials.user();

    const result = await registration.action({
      input: {
        name: 'my-service',
        kind: 'Component',
        namespace: 'default',
        jobFullName: 'my-pipeline/main',
        buildNumber: 7,
      },
      credentials,
      logger: mockServices.logger.mock(),
    });

    expect(mockJenkinsApi.getBuildConsoleText).toHaveBeenCalledWith(
      expect.any(Object),
      ['my-pipeline', 'main'],
      7,
    );
    expect(result.output.consoleText).toBe(
      'Started by user admin\nFinished: SUCCESS\n',
    );
  });

  it('applies default kind and namespace', async () => {
    const registration = mockActionsRegistry.register.mock.calls[0][0];
    const credentials = mockCredentials.user();

    await registration.action({
      input: { name: 'svc', jobFullName: 'pipeline', buildNumber: 1 },
      credentials,
      logger: mockServices.logger.mock(),
    });

    expect(mockJenkinsInfoProvider.getInstance).toHaveBeenCalledWith({
      entityRef: { kind: 'Component', namespace: 'default', name: 'svc' },
      credentials,
    });
  });
});
