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
import { createListBuildsAction } from './createListBuildsAction';
import { JenkinsInfoProvider } from '../service/jenkinsInfoProvider';
import { JenkinsApiImpl } from '../service/jenkinsApi';

const mockProject = {
  fullName: 'my-folder/my-pipeline',
  fullDisplayName: 'my-folder » my-pipeline',
  displayName: 'my-pipeline',
  status: 'SUCCESS',
  inQueue: false,
  lastBuild: {
    number: 5,
    url: 'http://jenkins/job/my-pipeline/5/',
    result: 'SUCCESS',
    building: false,
    timestamp: 1700000000000,
    duration: 60000,
    displayName: '#5',
    fullDisplayName: 'my-pipeline #5',
  },
};

describe('createListBuildsAction', () => {
  let mockActionsRegistry: { register: jest.Mock };
  let mockJenkinsInfoProvider: jest.Mocked<JenkinsInfoProvider>;
  let mockJenkinsApi: jest.Mocked<JenkinsApiImpl>;

  beforeEach(() => {
    mockActionsRegistry = { register: jest.fn() };

    mockJenkinsInfoProvider = {
      getInstance: jest.fn().mockResolvedValue({
        baseUrl: 'http://jenkins',
        fullJobNames: ['my-folder/my-pipeline'],
        projectCountLimit: 50,
      }),
    } as any;

    mockJenkinsApi = {
      getProjects: jest.fn().mockResolvedValue([mockProject]),
    } as any;

    createListBuildsAction({
      actionsRegistry: mockActionsRegistry as any,
      jenkinsInfoProvider: mockJenkinsInfoProvider,
      jenkinsApi: mockJenkinsApi,
    });
  });

  it('registers the list-builds action', () => {
    expect(mockActionsRegistry.register).toHaveBeenCalledTimes(1);
    const registration = mockActionsRegistry.register.mock.calls[0][0];
    expect(registration.name).toBe('list-builds');
    expect(registration.attributes.readOnly).toBe(true);
    expect(registration.attributes.destructive).toBe(false);
    expect(registration.attributes.idempotent).toBe(true);
  });

  it('returns builds for a catalog entity', async () => {
    const registration = mockActionsRegistry.register.mock.calls[0][0];
    const credentials = mockCredentials.user();

    const result = await registration.action({
      input: { name: 'my-service', kind: 'Component', namespace: 'default' },
      credentials,
      logger: mockServices.logger.mock(),
    });

    expect(mockJenkinsInfoProvider.getInstance).toHaveBeenCalledWith({
      entityRef: {
        kind: 'Component',
        namespace: 'default',
        name: 'my-service',
      },
      credentials,
    });
    expect(mockJenkinsApi.getProjects).toHaveBeenCalledWith(
      expect.any(Object),
      undefined,
    );
    expect(result.output.builds).toHaveLength(1);
    expect(result.output.builds[0]).toMatchObject({
      name: 'my-folder/my-pipeline',
      status: 'SUCCESS',
      inQueue: false,
      lastBuild: {
        number: 5,
        result: 'SUCCESS',
        building: false,
      },
    });
  });

  it('applies default kind and namespace when not provided', async () => {
    const registration = mockActionsRegistry.register.mock.calls[0][0];
    const credentials = mockCredentials.user();

    await registration.action({
      input: { name: 'my-service' },
      credentials,
      logger: mockServices.logger.mock(),
    });

    expect(mockJenkinsInfoProvider.getInstance).toHaveBeenCalledWith({
      entityRef: {
        kind: 'Component',
        namespace: 'default',
        name: 'my-service',
      },
      credentials,
    });
  });

  it('passes branch filter to getProjects', async () => {
    const registration = mockActionsRegistry.register.mock.calls[0][0];
    const credentials = mockCredentials.user();

    await registration.action({
      input: { name: 'my-service', branch: 'main' },
      credentials,
      logger: mockServices.logger.mock(),
    });

    expect(mockJenkinsApi.getProjects).toHaveBeenCalledWith(
      expect.any(Object),
      ['main'],
    );
  });

  it('returns null for lastBuild when no builds exist', async () => {
    mockJenkinsApi.getProjects.mockResolvedValue([
      { ...mockProject, lastBuild: null, status: 'build not found' },
    ]);
    const registration = mockActionsRegistry.register.mock.calls[0][0];
    const credentials = mockCredentials.user();

    const result = await registration.action({
      input: { name: 'my-service' },
      credentials,
      logger: mockServices.logger.mock(),
    });

    expect(result.output.builds[0].lastBuild).toBeNull();
  });
});
