/*
 * Copyright 2025 The Backstage Authors
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
import { NotAllowedError } from '@backstage/errors';
import { AuthorizeResult } from '@backstage/plugin-permission-common';
import { createGetRevisionDetailsAction } from './createGetRevisionDetailsAction';
import { ArgoCDService } from '@backstage-community/plugin-argocd-node';

const mockRevision = {
  author: 'alice <alice@example.com>',
  date: new Date('2024-06-01T12:00:00.000Z'),
  message: 'fix: update deployment config',
  revisionID: 'abc123',
};

describe('createGetRevisionDetailsAction', () => {
  let mockActionsRegistry: { register: jest.Mock };
  let mockArgoCDService: jest.Mocked<ArgoCDService>;
  let mockPermissions: {
    authorize: jest.Mock;
    authorizeConditional: jest.Mock;
  };

  beforeEach(() => {
    mockActionsRegistry = { register: jest.fn() };

    mockArgoCDService = {
      getRevisionDetails: jest.fn().mockResolvedValue(mockRevision),
    } as any;

    mockPermissions = {
      authorize: jest
        .fn()
        .mockResolvedValue([{ result: AuthorizeResult.ALLOW }]),
      authorizeConditional: jest.fn(),
    };

    createGetRevisionDetailsAction({
      actionsRegistry: mockActionsRegistry as any,
      argoCDService: mockArgoCDService,
      permissions: mockPermissions as any,
    });
  });

  it('registers the argocd:get-revision-details action', () => {
    expect(mockActionsRegistry.register).toHaveBeenCalledTimes(1);
    const reg = mockActionsRegistry.register.mock.calls[0][0];
    expect(reg.name).toBe('argocd:get-revision-details');
    expect(reg.attributes.readOnly).toBe(true);
    expect(reg.attributes.destructive).toBe(false);
    expect(reg.attributes.idempotent).toBe(true);
  });

  it('returns revision details with ISO date string', async () => {
    const reg = mockActionsRegistry.register.mock.calls[0][0];
    const credentials = mockCredentials.user();

    const result = await reg.action({
      input: {
        instanceName: 'prod',
        appName: 'my-app',
        revisionID: 'abc123',
      },
      credentials,
      logger: mockServices.logger.mock(),
    });

    expect(mockArgoCDService.getRevisionDetails).toHaveBeenCalledWith(
      'prod',
      'my-app',
      'abc123',
      { appNamespace: undefined },
    );
    expect(result.output.author).toBe('alice <alice@example.com>');
    expect(result.output.date).toBe('2024-06-01T12:00:00.000Z');
    expect(result.output.message).toBe('fix: update deployment config');
    expect(result.output.revisionID).toBe('abc123');
  });

  it('passes optional appNamespace', async () => {
    const reg = mockActionsRegistry.register.mock.calls[0][0];
    const credentials = mockCredentials.user();

    await reg.action({
      input: {
        instanceName: 'prod',
        appName: 'my-app',
        revisionID: 'abc123',
        appNamespace: 'my-ns',
      },
      credentials,
      logger: mockServices.logger.mock(),
    });

    expect(mockArgoCDService.getRevisionDetails).toHaveBeenCalledWith(
      'prod',
      'my-app',
      'abc123',
      { appNamespace: 'my-ns' },
    );
  });

  it('throws NotAllowedError when permission is denied', async () => {
    mockPermissions.authorize.mockResolvedValue([
      { result: AuthorizeResult.DENY },
    ]);
    const reg = mockActionsRegistry.register.mock.calls[0][0];
    const credentials = mockCredentials.user();

    await expect(
      reg.action({
        input: { instanceName: 'prod', appName: 'my-app', revisionID: 'abc' },
        credentials,
        logger: mockServices.logger.mock(),
      }),
    ).rejects.toThrow(NotAllowedError);
  });
});
