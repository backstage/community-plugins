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
import { createGetApplicationAction } from './createGetApplicationAction';
import { ArgoCDService } from '@backstage-community/plugin-argocd-node';

const mockApplication = {
  metadata: {
    name: 'my-app',
    namespace: 'production',
  },
  spec: {
    project: 'default',
    destination: {
      server: 'https://kubernetes.default.svc',
      namespace: 'production',
    },
  },
  status: {
    sync: { status: 'Synced', revision: 'abc123' },
    health: { status: 'Healthy' },
    operationState: { phase: 'Succeeded', message: 'successfully synced' },
    resources: [{ kind: 'Deployment', name: 'my-app' }],
    history: [{ revision: 'abc123' }, { revision: 'def456' }],
  },
};

describe('createGetApplicationAction', () => {
  let mockActionsRegistry: { register: jest.Mock };
  let mockArgoCDService: jest.Mocked<ArgoCDService>;
  let mockPermissions: {
    authorize: jest.Mock;
    authorizeConditional: jest.Mock;
  };

  beforeEach(() => {
    mockActionsRegistry = { register: jest.fn() };

    mockArgoCDService = {
      getApplication: jest.fn().mockResolvedValue(mockApplication),
    } as any;

    mockPermissions = {
      authorize: jest
        .fn()
        .mockResolvedValue([{ result: AuthorizeResult.ALLOW }]),
      authorizeConditional: jest.fn(),
    };

    createGetApplicationAction({
      actionsRegistry: mockActionsRegistry as any,
      argoCDService: mockArgoCDService,
      permissions: mockPermissions as any,
    });
  });

  it('registers the argocd:get-application action', () => {
    expect(mockActionsRegistry.register).toHaveBeenCalledTimes(1);
    const reg = mockActionsRegistry.register.mock.calls[0][0];
    expect(reg.name).toBe('argocd:get-application');
    expect(reg.attributes.readOnly).toBe(true);
    expect(reg.attributes.destructive).toBe(false);
    expect(reg.attributes.idempotent).toBe(true);
  });

  it('returns full application details', async () => {
    const reg = mockActionsRegistry.register.mock.calls[0][0];
    const credentials = mockCredentials.user();

    const result = await reg.action({
      input: { instanceName: 'prod', appName: 'my-app' },
      credentials,
      logger: mockServices.logger.mock(),
    });

    expect(mockArgoCDService.getApplication).toHaveBeenCalledWith('prod', {
      appName: 'my-app',
      appNamespace: undefined,
      project: undefined,
    });
    expect(result.output.name).toBe('my-app');
    expect(result.output.namespace).toBe('production');
    expect(result.output.project).toBe('default');
    expect(result.output.syncStatus).toBe('Synced');
    expect(result.output.healthStatus).toBe('Healthy');
    expect(result.output.revision).toBe('abc123');
    expect(result.output.operationPhase).toBe('Succeeded');
    expect(result.output.operationMessage).toBe('successfully synced');
    expect(result.output.resourcesCount).toBe(1);
    expect(result.output.historyCount).toBe(2);
    expect(result.output.destination.server).toBe(
      'https://kubernetes.default.svc',
    );
    expect(result.output.destination.namespace).toBe('production');
  });

  it('passes optional appNamespace and project', async () => {
    const reg = mockActionsRegistry.register.mock.calls[0][0];
    const credentials = mockCredentials.user();

    await reg.action({
      input: {
        instanceName: 'prod',
        appName: 'my-app',
        appNamespace: 'my-ns',
        project: 'my-project',
      },
      credentials,
      logger: mockServices.logger.mock(),
    });

    expect(mockArgoCDService.getApplication).toHaveBeenCalledWith('prod', {
      appName: 'my-app',
      appNamespace: 'my-ns',
      project: 'my-project',
    });
  });

  it('returns zero counts when status arrays are absent', async () => {
    mockArgoCDService.getApplication.mockResolvedValue({
      ...mockApplication,
      status: {
        sync: { status: 'Unknown', revision: undefined },
        health: { status: 'Unknown' },
      },
    } as any);
    const reg = mockActionsRegistry.register.mock.calls[0][0];
    const credentials = mockCredentials.user();

    const result = await reg.action({
      input: { instanceName: 'prod', appName: 'my-app' },
      credentials,
      logger: mockServices.logger.mock(),
    });

    expect(result.output.resourcesCount).toBe(0);
    expect(result.output.historyCount).toBe(0);
    expect(result.output.operationPhase).toBeUndefined();
  });

  it('throws NotAllowedError when permission is denied', async () => {
    mockPermissions.authorize.mockResolvedValue([
      { result: AuthorizeResult.DENY },
    ]);
    const reg = mockActionsRegistry.register.mock.calls[0][0];
    const credentials = mockCredentials.user();

    await expect(
      reg.action({
        input: { instanceName: 'prod', appName: 'my-app' },
        credentials,
        logger: mockServices.logger.mock(),
      }),
    ).rejects.toThrow(NotAllowedError);
  });
});
