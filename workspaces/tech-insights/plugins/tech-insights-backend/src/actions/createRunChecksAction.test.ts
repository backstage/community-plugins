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
import { NotAllowedError } from '@backstage/errors';
import {
  AuthorizeResult,
  BasicPermission,
} from '@backstage/plugin-permission-common';
import {
  techInsightsCheckReadPermission,
  techInsightsCheckUpdatePermission,
  techInsightsFactRetrieverReadPermission,
} from '@backstage-community/plugin-tech-insights-common';
import { createRunChecksAction } from './createRunChecksAction';

describe('createRunChecksAction', () => {
  const register = jest.fn();
  const runChecks = jest.fn().mockResolvedValue([]);
  const permissions = {
    authorize: jest.fn(),
  };
  const input = { entity: 'component:default/service', checks: ['firstId'] };
  const credentials = {};

  beforeEach(() => {
    jest.clearAllMocks();
    permissions.authorize.mockResolvedValue([
      { result: AuthorizeResult.ALLOW },
    ]);
    createRunChecksAction({
      actionsRegistry: { register } as any,
      factChecker: { runChecks } as any,
      permissions: permissions as any,
    });
  });

  const getAction = () => register.mock.calls[0][0].action;

  it('runs checks when every required permission is allowed', async () => {
    await expect(getAction()({ input, credentials })).resolves.toEqual({
      output: { results: [] },
    });

    for (const permission of [
      techInsightsCheckUpdatePermission,
      techInsightsCheckReadPermission,
      techInsightsFactRetrieverReadPermission,
    ]) {
      expect(permissions.authorize).toHaveBeenCalledWith([{ permission }], {
        credentials,
      });
    }
    expect(runChecks).toHaveBeenCalledTimes(1);
    expect(runChecks).toHaveBeenCalledWith(input.entity, input.checks);
  });

  it.each([
    techInsightsCheckReadPermission,
    techInsightsFactRetrieverReadPermission,
    techInsightsCheckUpdatePermission,
  ])('does not run checks when $name is denied', async deniedPermission => {
    permissions.authorize.mockImplementation(
      ([{ permission }]: { permission: BasicPermission }[]) =>
        Promise.resolve([
          {
            result:
              permission.name === deniedPermission.name
                ? AuthorizeResult.DENY
                : AuthorizeResult.ALLOW,
          },
        ]),
    );

    await expect(getAction()({ input, credentials })).rejects.toThrow(
      NotAllowedError,
    );
    expect(runChecks).not.toHaveBeenCalled();
  });
});
