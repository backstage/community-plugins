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
import { InputError, NotAllowedError } from '@backstage/errors';
import { AuthorizeResult } from '@backstage/plugin-permission-common';
import { createGetEntityInsightsAction } from './createGetEntityInsightsAction';
import { createGetEntityScorecardAction } from './createGetEntityScorecardAction';

describe('entity report actions', () => {
  const register = jest.fn();
  const getEntityByRef = jest.fn().mockResolvedValue({
    apiVersion: 'backstage.io/v1alpha1',
    kind: 'Component',
    metadata: { name: 'service', namespace: 'default' },
  });
  const getChecks = jest.fn().mockResolvedValue([
    {
      id: 'ownership',
      type: 'json-rules-engine',
      name: 'Has owner',
      description: 'The entity has an owner',
      factIds: [],
      metadata: { category: 'Ownership' },
    },
  ]);
  const runChecks = jest
    .fn()
    .mockResolvedValue([
      { check: { id: 'ownership' }, facts: {}, result: true },
    ]);
  const authorize = jest
    .fn()
    .mockResolvedValue([{ result: AuthorizeResult.ALLOW }]);

  const setup = (createAction: typeof createGetEntityInsightsAction) => {
    jest.clearAllMocks();
    authorize.mockResolvedValue([{ result: AuthorizeResult.ALLOW }]);
    createAction({
      actionsRegistry: { register } as any,
      catalog: { getEntityByRef } as any,
      factChecker: { getChecks, runChecks } as any,
      permissions: { authorize } as any,
    });
    return register.mock.calls[0][0].action;
  };

  it('returns checks and results from the insights action', async () => {
    const action = setup(createGetEntityInsightsAction);

    await expect(
      action({
        input: { kind: 'Component', namespace: 'default', name: 'service' },
        credentials: {},
      }),
    ).resolves.toMatchObject({
      output: {
        entity: { metadata: { name: 'service' } },
        checks: [{ id: 'ownership' }],
        results: [{ check: { id: 'ownership' }, result: true }],
      },
    });
    expect(runChecks).toHaveBeenCalledWith('component:default/service', [
      'ownership',
    ]);
  });

  it('returns categorized results from the scorecard action', async () => {
    const action = setup(createGetEntityScorecardAction);

    await expect(
      action({
        input: { kind: 'Component', namespace: 'default', name: 'service' },
        credentials: {},
      }),
    ).resolves.toEqual({
      output: {
        entity: 'component:default/service',
        categories: [
          {
            name: 'Ownership',
            checks: [{ name: 'Has owner', result: 'PASS' }],
          },
        ],
      },
    });
  });

  it('rejects invalid entity input before checks are run', async () => {
    const action = setup(createGetEntityInsightsAction);

    await expect(
      action({
        input: { kind: ' ', namespace: 'default', name: 'service' },
        credentials: {},
      }),
    ).rejects.toThrow(InputError);
    expect(runChecks).not.toHaveBeenCalled();
  });

  it('denies scorecard execution without check-run permission', async () => {
    const action = setup(createGetEntityScorecardAction);
    authorize.mockResolvedValueOnce([{ result: AuthorizeResult.ALLOW }]);
    authorize.mockResolvedValueOnce([{ result: AuthorizeResult.ALLOW }]);
    authorize.mockResolvedValueOnce([{ result: AuthorizeResult.DENY }]);

    await expect(
      action({
        input: { kind: 'Component', namespace: 'default', name: 'service' },
        credentials: {},
      }),
    ).rejects.toThrow(NotAllowedError);
    expect(runChecks).not.toHaveBeenCalled();
  });
});
