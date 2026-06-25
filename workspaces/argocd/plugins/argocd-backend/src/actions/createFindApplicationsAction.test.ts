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
import { createFindApplicationsAction } from './createFindApplicationsAction';
import { ArgoCDService } from '@backstage-community/plugin-argocd-node';

const mockInstance = {
  name: 'prod',
  url: 'https://argocd.example.com',
  appName: ['my-app'],
  applications: [
    {
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
        resources: [],
        history: [],
        operationState: { phase: 'Succeeded', message: '' },
      },
    },
  ],
};

describe('createFindApplicationsAction', () => {
  let mockActionsRegistry: { register: jest.Mock };
  let mockArgoCDService: jest.Mocked<ArgoCDService>;
  let mockPermissions: {
    authorize: jest.Mock;
    authorizeConditional: jest.Mock;
  };

  beforeEach(() => {
    mockActionsRegistry = { register: jest.fn() };

    mockArgoCDService = {
      findApplications: jest.fn().mockResolvedValue([mockInstance]),
    } as any;

    mockPermissions = {
      authorize: jest
        .fn()
        .mockResolvedValue([{ result: AuthorizeResult.ALLOW }]),
      authorizeConditional: jest.fn(),
    };

    createFindApplicationsAction({
      actionsRegistry: mockActionsRegistry as any,
      argoCDService: mockArgoCDService,
      permissions: mockPermissions as any,
    });
  });

  it('registers the argocd:find-applications action', () => {
    expect(mockActionsRegistry.register).toHaveBeenCalledTimes(1);
    const reg = mockActionsRegistry.register.mock.calls[0][0];
    expect(reg.name).toBe('argocd:find-applications');
    expect(reg.attributes.readOnly).toBe(true);
    expect(reg.attributes.destructive).toBe(false);
    expect(reg.attributes.idempotent).toBe(true);
  });

  it('returns applications across all instances', async () => {
    const reg = mockActionsRegistry.register.mock.calls[0][0];
    const credentials = mockCredentials.user();

    const result = await reg.action({
      input: { appName: 'my-app' },
      credentials,
      logger: mockServices.logger.mock(),
    });

    expect(mockArgoCDService.findApplications).toHaveBeenCalledWith({
      appName: 'my-app',
      project: undefined,
      appNamespace: undefined,
      expand: 'applications',
    });
    expect(result.output.instances).toHaveLength(1);
    expect(result.output.instances[0].instanceName).toBe('prod');
    expect(result.output.instances[0].instanceUrl).toBe(
      'https://argocd.example.com',
    );
    expect(result.output.instances[0].applications).toHaveLength(1);
    const app = result.output.instances[0].applications[0];
    expect(app.name).toBe('my-app');
    expect(app.syncStatus).toBe('Synced');
    expect(app.healthStatus).toBe('Healthy');
    expect(app.revision).toBe('abc123');
  });

  it('passes optional filters to findApplications', async () => {
    const reg = mockActionsRegistry.register.mock.calls[0][0];
    const credentials = mockCredentials.user();

    await reg.action({
      input: { appName: 'my-app', project: 'my-project', appNamespace: 'ns' },
      credentials,
      logger: mockServices.logger.mock(),
    });

    expect(mockArgoCDService.findApplications).toHaveBeenCalledWith({
      appName: 'my-app',
      project: 'my-project',
      appNamespace: 'ns',
      expand: 'applications',
    });
  });

  it('returns empty applications array when instance has no apps', async () => {
    mockArgoCDService.findApplications.mockResolvedValue([
      { name: 'prod', url: 'https://argocd.example.com', appName: [] },
    ]);
    const reg = mockActionsRegistry.register.mock.calls[0][0];
    const credentials = mockCredentials.user();

    const result = await reg.action({
      input: { appName: 'missing-app' },
      credentials,
      logger: mockServices.logger.mock(),
    });

    expect(result.output.instances[0].applications).toHaveLength(0);
  });

  it('throws NotAllowedError when permission is denied', async () => {
    mockPermissions.authorize.mockResolvedValue([
      { result: AuthorizeResult.DENY },
    ]);
    const reg = mockActionsRegistry.register.mock.calls[0][0];
    const credentials = mockCredentials.user();

    await expect(
      reg.action({
        input: { appName: 'my-app' },
        credentials,
        logger: mockServices.logger.mock(),
      }),
    ).rejects.toThrow(NotAllowedError);
  });
});
