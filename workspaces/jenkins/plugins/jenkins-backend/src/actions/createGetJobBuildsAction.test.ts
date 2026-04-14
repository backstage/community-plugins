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

import { createGetJobBuildsAction } from './createGetJobBuildsAction';
import { actionsRegistryServiceMock } from '@backstage/backend-test-utils/alpha';
import { JenkinsService } from '../service/jenkinsService';

const makeBuild = (number: number) => ({
  building: false,
  displayName: `#${number}`,
  duration: 100,
  fullDisplayName: `my-job #${number}`,
  number,
  result: 'SUCCESS',
  timestamp: 1000,
  url: `https://jenkins.example.com/job/my-job/${number}`,
  status: 'success',
});

describe('createGetJobBuildsAction', () => {
  const mockJenkinsService = {
    getJobBuilds: jest.fn(),
  } as unknown as jest.Mocked<JenkinsService>;

  it('should return sanitized builds when result is an array', async () => {
    const mockActionsRegistry = actionsRegistryServiceMock();

    mockJenkinsService.getJobBuilds.mockResolvedValueOnce({
      builds: [makeBuild(1), makeBuild(2)],
    } as any);

    createGetJobBuildsAction({
      actionsRegistry: mockActionsRegistry,
      jenkinsService: mockJenkinsService,
    });

    const result = await mockActionsRegistry.invoke({
      id: 'test:get-job-builds',
      input: { name: 'my-entity', jobFullName: 'my-job' },
    });

    const output = result.output as { builds: Record<string, unknown>[] };
    expect(output.builds).toHaveLength(2);
    expect(output.builds[0].number).toBe(1);
  });

  it('should handle nested builds object', async () => {
    const mockActionsRegistry = actionsRegistryServiceMock();

    mockJenkinsService.getJobBuilds.mockResolvedValueOnce({
      builds: { builds: [makeBuild(3)] },
    } as any);

    createGetJobBuildsAction({
      actionsRegistry: mockActionsRegistry,
      jenkinsService: mockJenkinsService,
    });

    const result = await mockActionsRegistry.invoke({
      id: 'test:get-job-builds',
      input: { name: 'my-entity', jobFullName: 'my-job' },
    });

    const output = result.output as { builds: Record<string, unknown>[] };
    expect(output.builds).toHaveLength(1);
    expect(output.builds[0].number).toBe(3);
  });
});
