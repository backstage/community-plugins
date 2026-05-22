/*
 * Copyright 2024 The Backstage Authors
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

import { createMockActionContext } from '@backstage/plugin-scaffolder-node-test-utils';
import { createSonarCloudSetNewCodeDefinitionAction } from './setNewCodeDefinition';

describe('sonarcloud:set-new-code-definition', () => {
  const action = createSonarCloudSetNewCodeDefinitionAction();
  let fetchSpy: jest.SpyInstance;

  beforeEach(() => {
    jest.resetAllMocks();
    fetchSpy = jest.spyOn(global, 'fetch');
  });

  const mockContext = createMockActionContext();

  const baseInput = {
    projectKey: 'my-proj',
    token: 'tok',
  };

  it('should reset both keys for previous_version (inherit org default)', async () => {
    fetchSpy.mockResolvedValueOnce(
      new Response(JSON.stringify({}), { status: 200 }),
    );

    await action.handler({
      ...mockContext,
      input: {
        ...baseInput,
        type: 'previous_version' as const,
      },
    });

    expect(fetchSpy).toHaveBeenCalledTimes(1);

    const body = new URLSearchParams(
      (fetchSpy.mock.calls[0][1] as RequestInit).body as string,
    );
    expect(body.get('keys')).toBe('sonar.leak.period,sonar.leak.period.type');

    expect(mockContext.output).toHaveBeenCalledWith('type', 'previous_version');
    expect(mockContext.output).not.toHaveBeenCalledWith(
      'value',
      expect.anything(),
    );
  });

  it('should set number_of_days with value via two settings calls', async () => {
    fetchSpy
      .mockResolvedValueOnce(new Response(JSON.stringify({}), { status: 200 }))
      .mockResolvedValueOnce(new Response(JSON.stringify({}), { status: 200 }));

    await action.handler({
      ...mockContext,
      input: {
        ...baseInput,
        type: 'number_of_days' as const,
        value: '30',
      },
    });

    expect(fetchSpy).toHaveBeenCalledTimes(2);

    const typeBody = new URLSearchParams(
      (fetchSpy.mock.calls[0][1] as RequestInit).body as string,
    );
    expect(typeBody.get('key')).toBe('sonar.leak.period.type');
    expect(typeBody.get('value')).toBe('days');

    const valBody = new URLSearchParams(
      (fetchSpy.mock.calls[1][1] as RequestInit).body as string,
    );
    expect(valBody.get('key')).toBe('sonar.leak.period');
    expect(valBody.get('value')).toBe('30');

    expect(mockContext.output).toHaveBeenCalledWith('type', 'number_of_days');
    expect(mockContext.output).toHaveBeenCalledWith('value', '30');
  });

  it('should set reference_branch with value via two settings calls', async () => {
    fetchSpy
      .mockResolvedValueOnce(new Response(JSON.stringify({}), { status: 200 }))
      .mockResolvedValueOnce(new Response(JSON.stringify({}), { status: 200 }));

    await action.handler({
      ...mockContext,
      input: {
        ...baseInput,
        type: 'reference_branch' as const,
        value: 'develop',
      },
    });

    expect(fetchSpy).toHaveBeenCalledTimes(2);

    expect(mockContext.output).toHaveBeenCalledWith('type', 'reference_branch');
    expect(mockContext.output).toHaveBeenCalledWith('value', 'develop');
  });

  it('should throw validation error when number_of_days has no value', async () => {
    await expect(
      action.handler({
        ...mockContext,
        input: {
          ...baseInput,
          type: 'number_of_days' as const,
        },
      }),
    ).rejects.toThrow(/value.*required.*number_of_days/i);

    expect(fetchSpy).not.toHaveBeenCalled();
  });

  it('should throw validation error when number_of_days has non-numeric value', async () => {
    await expect(
      action.handler({
        ...mockContext,
        input: {
          ...baseInput,
          type: 'number_of_days' as const,
          value: 'not-a-number',
        },
      }),
    ).rejects.toThrow(/positive integer/);

    expect(fetchSpy).not.toHaveBeenCalled();
  });

  it('should throw validation error when reference_branch has no value', async () => {
    await expect(
      action.handler({
        ...mockContext,
        input: {
          ...baseInput,
          type: 'reference_branch' as const,
        },
      }),
    ).rejects.toThrow(/value.*required.*reference_branch/i);

    expect(fetchSpy).not.toHaveBeenCalled();
  });

  it('should succeed on idempotent overwrite', async () => {
    fetchSpy
      .mockResolvedValueOnce(new Response(JSON.stringify({}), { status: 200 }))
      .mockResolvedValueOnce(new Response(JSON.stringify({}), { status: 200 }));

    await expect(
      action.handler({
        ...mockContext,
        input: {
          ...baseInput,
          type: 'number_of_days' as const,
          value: '7',
        },
      }),
    ).resolves.not.toThrow();
  });
});
