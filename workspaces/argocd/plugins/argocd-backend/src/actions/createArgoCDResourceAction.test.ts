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
import { createArgoCDResourceAction } from './createArgoCDResourceAction';
import { ConfigReader } from '@backstage/config';
import { mockServices } from '@backstage/backend-test-utils';
import { ArgoCDService } from '@backstage-community/plugin-argocd-node';

jest.mock('@backstage-community/plugin-argocd-node');

const mockLogger = mockServices.logger.mock();

describe('createArgoCDResourceAction', () => {
  const mockConfig = new ConfigReader({
    argocd: {
      username: 'admin',
      password: 'pass',
      appLocatorMethods: [
        {
          type: 'config',
          instances: [
            {
              name: 'test-instance',
              url: 'https://argocd.example.com',
              token: 'test-token',
            },
          ],
        },
      ],
    },
  });

  let mockCreateArgoResources: jest.Mock;
  let registeredAction: any;

  beforeEach(() => {
    jest.clearAllMocks();
    mockCreateArgoResources = jest.fn().mockResolvedValue({
      applicationUrl:
        'https://argocd.example.com/applications/argocd/test-app?view=tree&resource=',
    });
    (ArgoCDService as jest.Mock).mockImplementation(() => ({
      createArgoResources: mockCreateArgoResources,
    }));

    const mockRegistry = {
      register: jest.fn((action: any) => {
        registeredAction = action;
      }),
    };

    createArgoCDResourceAction({
      actionsRegistry: mockRegistry as any,
      config: mockConfig,
      logger: mockLogger,
    });
  });

  it('should register an action with correct metadata', () => {
    expect(registeredAction.name).toBe('create-resources');
    expect(registeredAction.title).toBe('Create ArgoCD Resources');
    expect(registeredAction.description).toBe('Creates ArgoCD resources');
    expect(registeredAction.attributes).toEqual({
      destructive: false,
      idempotent: false,
      readOnly: false,
    });
  });

  it('should create ArgoCD resources with all parameters', async () => {
    const result = await registeredAction.action({
      input: {
        appName: 'test-app',
        argoInstance: 'test-instance',
        namespace: 'test-namespace',
        repoUrl: 'https://github.com/test/repo',
        path: 'kubernetes/manifests',
        label: 'test-label',
        projectName: 'test-project',
      },
    });

    expect(mockCreateArgoResources).toHaveBeenCalledWith({
      instanceName: 'test-instance',
      appName: 'test-app',
      projectName: 'test-project',
      namespace: 'test-namespace',
      repoUrl: 'https://github.com/test/repo',
      path: 'kubernetes/manifests',
      label: 'test-label',
    });
    expect(result).toEqual({
      output: {
        applicationUrl:
          'https://argocd.example.com/applications/argocd/test-app?view=tree&resource=',
      },
    });
  });

  it('should use appName as label when label is not provided', async () => {
    const result = await registeredAction.action({
      input: {
        appName: 'test-app',
        argoInstance: 'test-instance',
        namespace: 'test-namespace',
        repoUrl: 'https://github.com/test/repo',
        path: 'kubernetes/manifests',
      },
    });

    expect(mockCreateArgoResources).toHaveBeenCalledWith(
      expect.objectContaining({
        label: 'test-app',
        projectName: 'test-app',
      }),
    );
    expect(result).toEqual({
      output: {
        applicationUrl:
          'https://argocd.example.com/applications/argocd/test-app?view=tree&resource=',
      },
    });
  });

  it('should use appName as projectName when projectName is not provided', async () => {
    await registeredAction.action({
      input: {
        appName: 'test-app',
        argoInstance: 'test-instance',
        namespace: 'test-namespace',
        repoUrl: 'https://github.com/test/repo',
        path: 'kubernetes/manifests',
        label: 'custom-label',
      },
    });

    expect(mockCreateArgoResources).toHaveBeenCalledWith(
      expect.objectContaining({
        projectName: 'test-app',
        label: 'custom-label',
      }),
    );
  });

  it('should handle errors from ArgoCDService', async () => {
    mockCreateArgoResources.mockRejectedValue(
      new Error('Failed to create ArgoCD resources'),
    );

    await expect(
      registeredAction.action({
        input: {
          appName: 'test-app',
          argoInstance: 'test-instance',
          namespace: 'test-namespace',
          repoUrl: 'https://github.com/test/repo',
          path: 'kubernetes/manifests',
        },
      }),
    ).rejects.toThrow('Failed to create ArgoCD resources');
  });

  it('should create ArgoCDService with config and logger', async () => {
    await registeredAction.action({
      input: {
        appName: 'test-app',
        argoInstance: 'test-instance',
        namespace: 'test-namespace',
        repoUrl: 'https://github.com/test/repo',
        path: 'kubernetes/manifests',
      },
    });

    expect(ArgoCDService).toHaveBeenCalledWith(mockConfig, mockLogger);
  });

  it('should handle custom projectName and label combinations', async () => {
    mockCreateArgoResources.mockResolvedValue({
      applicationUrl:
        'https://argocd.example.com/applications/argocd/my-app?view=tree&resource=',
    });

    const result = await registeredAction.action({
      input: {
        appName: 'my-app',
        argoInstance: 'production-instance',
        namespace: 'production',
        repoUrl: 'https://github.com/company/repo',
        path: 'k8s/prod',
        label: 'production-label',
        projectName: 'custom-project',
      },
    });

    expect(mockCreateArgoResources).toHaveBeenCalledWith({
      instanceName: 'production-instance',
      appName: 'my-app',
      projectName: 'custom-project',
      namespace: 'production',
      repoUrl: 'https://github.com/company/repo',
      path: 'k8s/prod',
      label: 'production-label',
    });
    expect(result).toEqual({
      output: {
        applicationUrl:
          'https://argocd.example.com/applications/argocd/my-app?view=tree&resource=',
      },
    });
  });
});
