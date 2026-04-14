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

import { createGetBuildAction } from './createGetBuildAction';
import { actionsRegistryServiceMock } from '@backstage/backend-test-utils/alpha';
import { JenkinsService } from '../service/jenkinsService';

describe('createGetBuildAction', () => {
  const mockJenkinsService = {
    getBuild: jest.fn(),
  } as unknown as jest.Mocked<JenkinsService>;

  it('should return a sanitized build', async () => {
    const mockActionsRegistry = actionsRegistryServiceMock();

    mockJenkinsService.getBuild.mockResolvedValueOnce({
      build: {
        building: false,
        displayName: '#42',
        duration: 5000,
        fullDisplayName: 'my-job #42',
        number: 42,
        result: 'SUCCESS',
        timestamp: 1000,
        url: 'https://jenkins.example.com/job/my-job/42',
        status: 'success',
        source: undefined,
        tests: undefined,
        actions: [{ _class: 'internal' }],
      },
    } as any);

    createGetBuildAction({
      actionsRegistry: mockActionsRegistry,
      jenkinsService: mockJenkinsService,
    });

    const result = await mockActionsRegistry.invoke({
      id: 'test:get-build',
      input: { name: 'my-entity', jobFullName: 'my-job', buildNumber: 42 },
    });

    const output = result.output as { build: Record<string, unknown> };
    expect(output.build.number).toBe(42);
    expect(output.build).not.toHaveProperty('actions');
  });

  it('should pass entity ref and build params to service', async () => {
    const mockActionsRegistry = actionsRegistryServiceMock();

    mockJenkinsService.getBuild.mockResolvedValueOnce({
      build: {
        building: false,
        displayName: '#1',
        duration: 0,
        fullDisplayName: '',
        number: 1,
        result: 'SUCCESS',
        timestamp: 0,
        url: '',
        status: 'success',
      },
    } as any);

    createGetBuildAction({
      actionsRegistry: mockActionsRegistry,
      jenkinsService: mockJenkinsService,
    });

    await mockActionsRegistry.invoke({
      id: 'test:get-build',
      input: {
        name: 'svc',
        kind: 'Component',
        namespace: 'prod',
        jobFullName: 'folder/job',
        buildNumber: 7,
      },
    });

    expect(mockJenkinsService.getBuild).toHaveBeenCalledWith(
      expect.objectContaining({
        entityRef: { name: 'svc', kind: 'Component', namespace: 'prod' },
        jobFullName: 'folder/job',
        buildNumber: 7,
      }),
    );
  });
});
