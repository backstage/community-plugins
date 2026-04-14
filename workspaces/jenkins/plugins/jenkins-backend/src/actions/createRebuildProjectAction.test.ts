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

import { createRebuildProjectAction } from './createRebuildProjectAction';
import { actionsRegistryServiceMock } from '@backstage/backend-test-utils/alpha';
import { JenkinsService } from '../service/jenkinsService';

describe('createRebuildProjectAction', () => {
  const mockJenkinsService = {
    rebuildProject: jest.fn(),
  } as unknown as jest.Mocked<JenkinsService>;

  it('should return success on rebuild', async () => {
    const mockActionsRegistry = actionsRegistryServiceMock();

    mockJenkinsService.rebuildProject.mockResolvedValueOnce({
      status: 'success',
      message: 'Rebuild triggered',
    });

    createRebuildProjectAction({
      actionsRegistry: mockActionsRegistry,
      jenkinsService: mockJenkinsService,
    });

    const result = await mockActionsRegistry.invoke({
      id: 'test:rebuild-project',
      input: { name: 'my-entity', jobFullName: 'my-job', buildNumber: 5 },
    });

    expect(result.output).toEqual({
      status: 'success',
      message: 'Rebuild triggered',
    });
  });

  it('should return denied when permission is denied', async () => {
    const mockActionsRegistry = actionsRegistryServiceMock();

    mockJenkinsService.rebuildProject.mockResolvedValueOnce({
      status: 'denied',
      message: 'Not allowed',
    });

    createRebuildProjectAction({
      actionsRegistry: mockActionsRegistry,
      jenkinsService: mockJenkinsService,
    });

    const result = await mockActionsRegistry.invoke({
      id: 'test:rebuild-project',
      input: { name: 'my-entity', jobFullName: 'my-job', buildNumber: 5 },
    });

    const output = result.output as { status: string; message: string };
    expect(output.status).toBe('denied');
  });
});
