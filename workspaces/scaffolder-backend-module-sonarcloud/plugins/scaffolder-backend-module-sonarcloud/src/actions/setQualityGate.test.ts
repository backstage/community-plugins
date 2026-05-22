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
import { createSonarCloudSetQualityGateAction } from './setQualityGate';
import { SonarCloudApiError } from '../lib';

describe('sonarcloud:set-quality-gate', () => {
  const action = createSonarCloudSetQualityGateAction();
  let fetchSpy: jest.SpyInstance;

  beforeEach(() => {
    jest.resetAllMocks();
    fetchSpy = jest.spyOn(global, 'fetch');
  });

  const mockContext = createMockActionContext();

  const defaultInput = {
    projectKey: 'my-proj',
    qualityGateName: 'Sonar way',
    organization: 'my-org',
    token: 'tok',
  };

  const listResponse = {
    qualitygates: [
      { id: 1, name: 'Sonar way', isDefault: true },
      { id: 2, name: 'Custom Gate' },
    ],
  };

  it('should assign the matching quality gate and output both fields', async () => {
    // First call: list quality gates (GET)
    fetchSpy.mockResolvedValueOnce(
      new Response(JSON.stringify(listResponse), { status: 200 }),
    );
    // Second call: select quality gate (POST)
    fetchSpy.mockResolvedValueOnce(
      new Response(JSON.stringify({}), { status: 200 }),
    );

    await action.handler({
      ...mockContext,
      input: defaultInput,
    });

    expect(fetchSpy).toHaveBeenCalledTimes(2);
    expect(mockContext.output).toHaveBeenCalledWith('qualityGateId', 1);
    expect(mockContext.output).toHaveBeenCalledWith(
      'qualityGateName',
      'Sonar way',
    );
  });

  it('should throw descriptive error when gate not found with available gates listed', async () => {
    fetchSpy.mockResolvedValueOnce(
      new Response(JSON.stringify(listResponse), { status: 200 }),
    );

    const err = await action
      .handler({
        ...mockContext,
        input: { ...defaultInput, qualityGateName: 'Nonexistent' },
      })
      .catch((e: unknown) => e);

    expect(err).toBeInstanceOf(Error);
    expect((err as Error).message).toMatch(/Nonexistent/);
    expect((err as Error).message).toMatch(/Available gates/);
  });

  it('should throw when list response is missing qualitygates array', async () => {
    fetchSpy.mockResolvedValueOnce(
      new Response(JSON.stringify({ something: 'else' }), { status: 200 }),
    );

    await expect(
      action.handler({
        ...mockContext,
        input: defaultInput,
      }),
    ).rejects.toThrow(/missing qualitygates array/);
  });

  it('should throw when gate has non-numeric id', async () => {
    fetchSpy.mockResolvedValueOnce(
      new Response(
        JSON.stringify({
          qualitygates: [{ id: 'bad', name: 'Sonar way' }],
        }),
        { status: 200 },
      ),
    );

    await expect(
      action.handler({
        ...mockContext,
        input: defaultInput,
      }),
    ).rejects.toThrow();
  });

  it('should throw when list API returns 500', async () => {
    fetchSpy.mockResolvedValueOnce(
      new Response(JSON.stringify({ errors: [{ msg: 'Internal error' }] }), {
        status: 500,
      }),
    );

    await expect(
      action.handler({
        ...mockContext,
        input: defaultInput,
      }),
    ).rejects.toThrow(SonarCloudApiError);
  });

  it('should throw when select API fails after successful list (no partial outputs)', async () => {
    // list succeeds
    fetchSpy.mockResolvedValueOnce(
      new Response(JSON.stringify(listResponse), { status: 200 }),
    );
    // select fails
    fetchSpy.mockResolvedValueOnce(
      new Response(JSON.stringify({ errors: [{ msg: 'Server error' }] }), {
        status: 500,
      }),
    );

    await expect(
      action.handler({
        ...mockContext,
        input: defaultInput,
      }),
    ).rejects.toThrow(SonarCloudApiError);

    // Verify no outputs were emitted (output is called only after select succeeds)
    expect(mockContext.output).not.toHaveBeenCalled();
  });

  it('should emit outputs only after both list and select succeed', async () => {
    fetchSpy.mockResolvedValueOnce(
      new Response(JSON.stringify(listResponse), { status: 200 }),
    );
    fetchSpy.mockResolvedValueOnce(
      new Response(JSON.stringify({}), { status: 200 }),
    );

    await action.handler({
      ...mockContext,
      input: defaultInput,
    });

    // Both outputs should be set
    expect(mockContext.output).toHaveBeenCalledTimes(2);
    expect(mockContext.output).toHaveBeenCalledWith('qualityGateId', 1);
    expect(mockContext.output).toHaveBeenCalledWith(
      'qualityGateName',
      'Sonar way',
    );
  });
});
