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

import { createGetBuildConsoleTextAction } from './createGetBuildConsoleTextAction';
import { actionsRegistryServiceMock } from '@backstage/backend-test-utils/alpha';
import { JenkinsService } from '../service/jenkinsService';

describe('createGetBuildConsoleTextAction', () => {
  const mockJenkinsService = {
    getBuildConsoleText: jest.fn(),
  } as unknown as jest.Mocked<JenkinsService>;

  it('should return console text', async () => {
    const mockActionsRegistry = actionsRegistryServiceMock();

    mockJenkinsService.getBuildConsoleText.mockResolvedValueOnce({
      consoleText: 'Build started\nBuild finished',
    });

    createGetBuildConsoleTextAction({
      actionsRegistry: mockActionsRegistry,
      jenkinsService: mockJenkinsService,
    });

    const result = await mockActionsRegistry.invoke({
      id: 'test:get-build-console-text',
      input: { name: 'my-entity', jobFullName: 'my-job', buildNumber: 10 },
    });

    const output = result.output as { consoleText: string };
    expect(output.consoleText).toBe('Build started\nBuild finished');
  });

  it('should pass all params to service', async () => {
    const mockActionsRegistry = actionsRegistryServiceMock();

    mockJenkinsService.getBuildConsoleText.mockResolvedValueOnce({
      consoleText: '',
    });

    createGetBuildConsoleTextAction({
      actionsRegistry: mockActionsRegistry,
      jenkinsService: mockJenkinsService,
    });

    await mockActionsRegistry.invoke({
      id: 'test:get-build-console-text',
      input: {
        name: 'svc',
        kind: 'Component',
        namespace: 'ns',
        jobFullName: 'folder/job',
        buildNumber: 3,
      },
    });

    expect(mockJenkinsService.getBuildConsoleText).toHaveBeenCalledWith(
      expect.objectContaining({
        entityRef: { name: 'svc', kind: 'Component', namespace: 'ns' },
        jobFullName: 'folder/job',
        buildNumber: 3,
      }),
    );
  });
});
