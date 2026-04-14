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

import { createGetProjectsAction } from './createGetProjectsAction';
import { actionsRegistryServiceMock } from '@backstage/backend-test-utils/alpha';
import { JenkinsService } from '../service/jenkinsService';

describe('createGetProjectsAction', () => {
  const mockJenkinsService = {
    getProjects: jest.fn(),
  } as unknown as jest.Mocked<JenkinsService>;

  it('should return sanitized projects', async () => {
    const mockActionsRegistry = actionsRegistryServiceMock();

    mockJenkinsService.getProjects.mockResolvedValueOnce({
      projects: [
        {
          displayName: 'my-build',
          fullDisplayName: 'my-job » my-build',
          fullName: 'my-job/my-build',
          inQueue: false,
          status: 'success',
          actions: [{ _class: 'internal' }],
          lastBuild: {
            building: false,
            displayName: '#1',
            duration: 100,
            fullDisplayName: 'my-job » my-build #1',
            number: 1,
            result: 'SUCCESS',
            timestamp: 1000,
            url: 'https://jenkins.example.com/job/my-job/1',
            status: 'success',
            source: undefined,
            tests: undefined,
            actions: [],
          },
        },
      ],
    } as any);

    createGetProjectsAction({
      actionsRegistry: mockActionsRegistry,
      jenkinsService: mockJenkinsService,
    });

    const result = await mockActionsRegistry.invoke({
      id: 'test:get-projects',
      input: { name: 'my-entity' },
    });

    const output = result.output as { projects: Record<string, unknown>[] };
    expect(output.projects).toHaveLength(1);
    expect(output.projects[0]).not.toHaveProperty('actions');
    expect(output.projects[0].displayName).toBe('my-build');
  });

  it('should split comma-separated branches', async () => {
    const mockActionsRegistry = actionsRegistryServiceMock();

    mockJenkinsService.getProjects.mockResolvedValueOnce({
      projects: [],
    } as any);

    createGetProjectsAction({
      actionsRegistry: mockActionsRegistry,
      jenkinsService: mockJenkinsService,
    });

    await mockActionsRegistry.invoke({
      id: 'test:get-projects',
      input: { name: 'my-entity', branches: 'main,develop' },
    });

    expect(mockJenkinsService.getProjects).toHaveBeenCalledWith(
      expect.objectContaining({
        branches: ['main', 'develop'],
      }),
    );
  });
});
