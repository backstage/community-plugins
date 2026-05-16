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
import { NotAllowedError } from '@backstage/errors';
import { createTriggerBuildAction } from './createTriggerBuildAction';
import { JenkinsInfoProvider } from '../service/jenkinsInfoProvider';
import { JenkinsApiImpl } from '../service/jenkinsApi';

describe('createTriggerBuildAction', () => {
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
      rebuildProject: jest.fn().mockResolvedValue(201),
    } as any;

    createTriggerBuildAction({
      actionsRegistry: mockActionsRegistry as any,
      jenkinsInfoProvider: mockJenkinsInfoProvider,
      jenkinsApi: mockJenkinsApi,
    });
  });

  it('registers the trigger-build action', () => {
    expect(mockActionsRegistry.register).toHaveBeenCalledTimes(1);
    const registration = mockActionsRegistry.register.mock.calls[0][0];
    expect(registration.name).toBe('trigger-build');
    expect(registration.attributes.readOnly).toBe(false);
    expect(registration.attributes.destructive).toBe(false);
    expect(registration.attributes.idempotent).toBe(false);
  });

  it('triggers a build and returns the status', async () => {
    const registration = mockActionsRegistry.register.mock.calls[0][0];
    const credentials = mockCredentials.user();

    const result = await registration.action({
      input: {
        name: 'my-service',
        kind: 'Component',
        namespace: 'default',
        jobFullName: 'my-folder/my-pipeline/main',
        buildNumber: 42,
      },
      credentials,
      logger: mockServices.logger.mock(),
    });

    expect(mockJenkinsApi.rebuildProject).toHaveBeenCalledWith(
      expect.any(Object),
      ['my-folder', 'my-pipeline', 'main'],
      42,
      'component:default/my-service',
      { credentials },
    );
    expect(result.output.status).toBe(201);
  });

  it('throws NotAllowedError when permissions are denied (status 403)', async () => {
    mockJenkinsApi.rebuildProject.mockResolvedValue(403);
    const registration = mockActionsRegistry.register.mock.calls[0][0];
    const credentials = mockCredentials.user();

    await expect(
      registration.action({
        input: {
          name: 'my-service',
          jobFullName: 'my-pipeline/main',
          buildNumber: 1,
        },
        credentials,
        logger: mockServices.logger.mock(),
      }),
    ).rejects.toThrow(NotAllowedError);
  });

  it('has readOnly=false and idempotent=false attributes', () => {
    const registration = mockActionsRegistry.register.mock.calls[0][0];
    expect(registration.attributes.readOnly).toBe(false);
    expect(registration.attributes.idempotent).toBe(false);
    expect(registration.attributes.destructive).toBe(false);
  });
});
