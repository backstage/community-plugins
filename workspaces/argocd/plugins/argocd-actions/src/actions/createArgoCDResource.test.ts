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
import { createArgoCDResource } from './createArgoCDResource';
import { createMockActionContext } from '@backstage/plugin-scaffolder-node-test-utils';
import { ConfigReader } from '@backstage/config';
import { mockServices } from '@backstage/backend-test-utils';
import { ArgoCDService } from '@backstage-community/plugin-argocd-node';

jest.mock('@backstage-community/plugin-argocd-node');

const mockLogger = mockServices.logger.mock();

describe('createArgoCDResource', () => {
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

  beforeEach(() => {
    jest.clearAllMocks();
    mockCreateArgoResources = jest.fn().mockResolvedValue({
      applicationUrl:
        'https://argocd.example.com/applications/argocd/test-app?view=tree&resource=',
    });
    (ArgoCDService as jest.Mock).mockImplementation(() => ({
      createArgoResources: mockCreateArgoResources,
    }));
  });

  it('should create ArgoCD resources with all parameters', async () => {
    const action = createArgoCDResource(mockConfig, mockLogger);

    const mockContext = createMockActionContext({
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

    await action.handler(mockContext);

    expect(mockCreateArgoResources).toHaveBeenCalledWith({
      instanceName: 'test-instance',
      appName: 'test-app',
      projectName: 'test-project',
      namespace: 'test-namespace',
      repoUrl: 'https://github.com/test/repo',
      path: 'kubernetes/manifests',
      label: 'test-label',
    });
    expect(mockContext.output).toHaveBeenCalledWith(
      'applicationUrl',
      'https://argocd.example.com/applications/argocd/test-app?view=tree&resource=',
    );
  });

  it('should use appName as label when label is not provided', async () => {
    const action = createArgoCDResource(mockConfig, mockLogger);

    const mockContext = createMockActionContext({
      input: {
        appName: 'test-app',
        argoInstance: 'test-instance',
        namespace: 'test-namespace',
        repoUrl: 'https://github.com/test/repo',
        path: 'kubernetes/manifests',
      },
    });

    await action.handler(mockContext);

    expect(mockCreateArgoResources).toHaveBeenCalledWith({
      instanceName: 'test-instance',
      appName: 'test-app',
      projectName: 'test-app',
      namespace: 'test-namespace',
      repoUrl: 'https://github.com/test/repo',
      path: 'kubernetes/manifests',
      label: 'test-app',
    });
    expect(mockContext.output).toHaveBeenCalledWith(
      'applicationUrl',
      'https://argocd.example.com/applications/argocd/test-app?view=tree&resource=',
    );
  });

  it('should use appName as projectName when projectName is not provided', async () => {
    const action = createArgoCDResource(mockConfig, mockLogger);

    const mockContext = createMockActionContext({
      input: {
        appName: 'test-app',
        argoInstance: 'test-instance',
        namespace: 'test-namespace',
        repoUrl: 'https://github.com/test/repo',
        path: 'kubernetes/manifests',
        label: 'custom-label',
      },
    });

    await action.handler(mockContext);

    expect(mockCreateArgoResources).toHaveBeenCalledWith({
      instanceName: 'test-instance',
      appName: 'test-app',
      projectName: 'test-app',
      namespace: 'test-namespace',
      repoUrl: 'https://github.com/test/repo',
      path: 'kubernetes/manifests',
      label: 'custom-label',
    });
    expect(mockContext.output).toHaveBeenCalledWith(
      'applicationUrl',
      'https://argocd.example.com/applications/argocd/test-app?view=tree&resource=',
    );
  });

  it('should handle errors from ArgoCDService', async () => {
    const mockError = new Error('Failed to create ArgoCD resources');
    mockCreateArgoResources.mockRejectedValue(mockError);

    const action = createArgoCDResource(mockConfig, mockLogger);

    const mockContext = createMockActionContext({
      input: {
        appName: 'test-app',
        argoInstance: 'test-instance',
        namespace: 'test-namespace',
        repoUrl: 'https://github.com/test/repo',
        path: 'kubernetes/manifests',
      },
    });

    await expect(action.handler(mockContext)).rejects.toThrow(
      'Failed to create ArgoCD resources',
    );
  });

  it('should have correct action metadata', () => {
    const action = createArgoCDResource(mockConfig, mockLogger);

    expect(action.id).toBe('argocd:create-resources');
    expect(action.description).toBe('Creates ArgoCD resources');
  });

  it('should create new ArgoCDService instance with config and logger', async () => {
    const action = createArgoCDResource(mockConfig, mockLogger);

    const mockContext = createMockActionContext({
      input: {
        appName: 'test-app',
        argoInstance: 'test-instance',
        namespace: 'test-namespace',
        repoUrl: 'https://github.com/test/repo',
        path: 'kubernetes/manifests',
      },
    });

    await action.handler(mockContext);

    expect(ArgoCDService).toHaveBeenCalledWith(mockConfig, mockLogger);
  });

  it('should handle custom projectName and label combinations', async () => {
    mockCreateArgoResources.mockResolvedValue({
      applicationUrl:
        'https://argocd.example.com/applications/argocd/my-app?view=tree&resource=',
    });

    const action = createArgoCDResource(mockConfig, mockLogger);

    const mockContext = createMockActionContext({
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

    await action.handler(mockContext);

    expect(mockCreateArgoResources).toHaveBeenCalledWith({
      instanceName: 'production-instance',
      appName: 'my-app',
      projectName: 'custom-project',
      namespace: 'production',
      repoUrl: 'https://github.com/company/repo',
      path: 'k8s/prod',
      label: 'production-label',
    });
    expect(mockContext.output).toHaveBeenCalledWith(
      'applicationUrl',
      'https://argocd.example.com/applications/argocd/my-app?view=tree&resource=',
    );
  });
});
