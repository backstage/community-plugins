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
import { createListApplicationsAction } from './createListApplicationsAction';
import { ArgoCDService } from '@backstage-community/plugin-argocd-node';

const mockApp = {
  metadata: { name: 'my-app', namespace: 'production' },
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
  },
};

describe('createListApplicationsAction', () => {
  let mockActionsRegistry: { register: jest.Mock };
  let mockArgoCDService: jest.Mocked<ArgoCDService>;
  let mockPermissions: {
    authorize: jest.Mock;
    authorizeConditional: jest.Mock;
  };

  beforeEach(() => {
    mockActionsRegistry = { register: jest.fn() };

    mockArgoCDService = {
      listArgoApps: jest.fn().mockResolvedValue({ items: [mockApp] }),
    } as any;

    mockPermissions = {
      authorize: jest
        .fn()
        .mockResolvedValue([{ result: AuthorizeResult.ALLOW }]),
      authorizeConditional: jest.fn(),
    };

    createListApplicationsAction({
      actionsRegistry: mockActionsRegistry as any,
      argoCDService: mockArgoCDService,
      permissions: mockPermissions as any,
    });
  });

  it('registers the argocd:list-applications action', () => {
    expect(mockActionsRegistry.register).toHaveBeenCalledTimes(1);
    const reg = mockActionsRegistry.register.mock.calls[0][0];
    expect(reg.name).toBe('argocd:list-applications');
    expect(reg.attributes.readOnly).toBe(true);
    expect(reg.attributes.destructive).toBe(false);
    expect(reg.attributes.idempotent).toBe(true);
  });

  it('returns list of applications', async () => {
    const reg = mockActionsRegistry.register.mock.calls[0][0];
    const credentials = mockCredentials.user();

    const result = await reg.action({
      input: { instanceName: 'prod' },
      credentials,
      logger: mockServices.logger.mock(),
    });

    expect(mockArgoCDService.listArgoApps).toHaveBeenCalledWith('prod', {
      selector: undefined,
      project: undefined,
      appNamespace: undefined,
    });
    expect(result.output.totalCount).toBe(1);
    expect(result.output.applications).toHaveLength(1);
    const app = result.output.applications[0];
    expect(app.name).toBe('my-app');
    expect(app.namespace).toBe('production');
    expect(app.project).toBe('default');
    expect(app.syncStatus).toBe('Synced');
    expect(app.healthStatus).toBe('Healthy');
    expect(app.revision).toBe('abc123');
    expect(app.destination.server).toBe('https://kubernetes.default.svc');
    expect(app.destination.namespace).toBe('production');
  });

  it('passes optional filters to listArgoApps', async () => {
    const reg = mockActionsRegistry.register.mock.calls[0][0];
    const credentials = mockCredentials.user();

    await reg.action({
      input: {
        instanceName: 'prod',
        selector: 'app=my-app',
        project: 'my-project',
        appNamespace: 'ns',
      },
      credentials,
      logger: mockServices.logger.mock(),
    });

    expect(mockArgoCDService.listArgoApps).toHaveBeenCalledWith('prod', {
      selector: 'app=my-app',
      project: 'my-project',
      appNamespace: 'ns',
    });
  });

  it('returns zero totalCount when no applications found', async () => {
    mockArgoCDService.listArgoApps.mockResolvedValue({ items: [] });
    const reg = mockActionsRegistry.register.mock.calls[0][0];
    const credentials = mockCredentials.user();

    const result = await reg.action({
      input: { instanceName: 'prod' },
      credentials,
      logger: mockServices.logger.mock(),
    });

    expect(result.output.totalCount).toBe(0);
    expect(result.output.applications).toHaveLength(0);
  });

  it('throws NotAllowedError when permission is denied', async () => {
    mockPermissions.authorize.mockResolvedValue([
      { result: AuthorizeResult.DENY },
    ]);
    const reg = mockActionsRegistry.register.mock.calls[0][0];
    const credentials = mockCredentials.user();

    await expect(
      reg.action({
        input: { instanceName: 'prod' },
        credentials,
        logger: mockServices.logger.mock(),
      }),
    ).rejects.toThrow(NotAllowedError);
  });
});
