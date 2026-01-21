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
import { ArgoCDService } from './ArgoCDService';
import { RevisionInfo } from '@backstage-community/plugin-argocd-common';
import { mockApplications, mockConfig } from './__data__/mockdata';
import { mockServices } from '@backstage/backend-test-utils';

const mockLogger = mockServices.logger.mock();

describe('ArgoCDService', () => {
  let service: ArgoCDService;
  let fetchMock: jest.SpyInstance;

  beforeEach(() => {
    service = new ArgoCDService(mockConfig, mockLogger);
    fetchMock = jest.spyOn(global, 'fetch');
    jest.clearAllMocks();
  });

  describe('getArgoInstances', () => {
    it('should return configured instances', () => {
      const instances = service.getArgoInstances();
      expect(instances).toHaveLength(2);
      expect(instances[0]).toEqual({
        name: 'test-instance',
        url: 'https://argocd.example.com',
        token: 'test-token',
      });
    });
  });

  describe('listArgoApps', () => {
    const expectedApplicationsResponse = {
      metadata: {
        resourceVersion: '12345',
      },
      items: mockApplications.filter(
        a => a.metadata.instance.name === 'test-instance',
      ),
    };

    it('should fetch applications successfully', async () => {
      fetchMock.mockResolvedValue({
        ok: true,
        json: async () => expectedApplicationsResponse,
      });

      const result = await service.listArgoApps('test-instance');
      expect(result).toEqual(expectedApplicationsResponse);
      expect(fetchMock).toHaveBeenCalledWith(
        'https://argocd.example.com/api/v1/applications',
        {
          headers: {
            Authorization: 'Bearer test-token',
            'Content-Type': 'application/json',
          },
          method: 'GET',
        },
      );
    });

    it('should fetch applications using selector param successfully', async () => {
      const expectedApplicationSelectorResponse = {
        metadata: {
          resourceVersion: '12345',
        },
        items: mockApplications.filter(
          a => a.metadata?.labels?.test === 'true',
        ),
      };
      fetchMock.mockResolvedValue({
        ok: true,
        json: async () => expectedApplicationSelectorResponse,
      });

      const result = await service.listArgoApps('test-instance', {
        selector: 'test=true',
      });
      expect(result).toEqual(expectedApplicationSelectorResponse);
      expect(fetchMock).toHaveBeenCalledWith(
        'https://argocd.example.com/api/v1/applications?selector=test%3Dtrue',
        {
          headers: {
            Authorization: 'Bearer test-token',
            'Content-Type': 'application/json',
          },
          method: 'GET',
        },
      );
    });

    it('should fetch applications using appNamespace param successfully', async () => {
      const expectedAppNamespaceResponse = {
        metadata: {
          resourceVersion: '12345',
        },
        items: [mockApplications[1]],
      };
      fetchMock.mockResolvedValue({
        ok: true,
        json: async () => expectedAppNamespaceResponse,
      });

      const result = await service.listArgoApps('staging-instance', {
        appNamespace: 'staging',
      });
      expect(result).toEqual(expectedAppNamespaceResponse);
      expect(fetchMock).toHaveBeenCalledWith(
        'https://argocd.staging.example.com/api/v1/applications?appNamespace=staging',
        {
          headers: {
            Authorization: 'Bearer test-staging-token',
            'Content-Type': 'application/json',
          },
          method: 'GET',
        },
      );
    });

    it('should fetch applications using project param successfully', async () => {
      const expectedProjectResponse = {
        metadata: {
          resourceVersion: '12345',
        },
        items: [mockApplications[0]],
      };
      fetchMock.mockResolvedValue({
        ok: true,
        json: async () => expectedProjectResponse,
      });

      const result = await service.listArgoApps('test-instance', {
        project: 'staging',
      });
      expect(result).toEqual(expectedProjectResponse);
      expect(fetchMock).toHaveBeenCalledWith(
        'https://argocd.example.com/api/v1/applications?project=staging',
        {
          headers: {
            Authorization: 'Bearer test-token',
            'Content-Type': 'application/json',
          },
          method: 'GET',
        },
      );
    });

    it('should handle errors gracefully', async () => {
      fetchMock.mockResolvedValue({
        ok: false,
        statusText: 'Internal Server Error',
      });

      await expect(
        service.listArgoApps('non-existent-instance'),
      ).rejects.toThrow(
        "Failed to retrieve ArgoCD Applications from Instance 'non-existent-instance' : ArgoCD Instance non-existent-instance not found",
      );

      expect(mockLogger.error).toHaveBeenCalledWith(
        'ArgoCD Instance non-existent-instance not found',
      );
    });

    it('should successfully handle zero items returned with the appNamespace param', async () => {
      const emptyNamespaceResponse = {
        metadata: {
          resourceVersion: '12345',
        },
        items: null,
      };
      fetchMock.mockResolvedValue({
        ok: true,
        json: async () => emptyNamespaceResponse,
      });

      const result = await service.listArgoApps('test-instance', {
        appNamespace: 'fake',
      });
      expect(result).toEqual({ ...emptyNamespaceResponse, items: [] });
      expect(fetchMock).toHaveBeenCalledWith(
        'https://argocd.example.com/api/v1/applications?appNamespace=fake',
        {
          headers: {
            Authorization: 'Bearer test-token',
            'Content-Type': 'application/json',
          },
          method: 'GET',
        },
      );

      expect(mockLogger.warn).toHaveBeenCalledWith(
        "No Applications returned from Instance 'test-instance' with appNamespace 'fake'",
      );
    });
  });

  describe('getRevisionDetails', () => {
    it('should fetch revision details successfully', async () => {
      const expectedRevisionResponse: RevisionInfo = {
        author: 'test-user <test-user@mail.com>',
        date: new Date('2025-01-01'),
        message: 'committed changed',
      };

      fetchMock.mockResolvedValue({
        ok: true,
        json: async () => expectedRevisionResponse,
      });

      const result = await service.getRevisionDetails(
        'staging-instance',
        'staging-app',
        'abc123def456',
      );
      expect(result).toEqual(expectedRevisionResponse);
      expect(fetchMock).toHaveBeenCalledWith(
        'https://argocd.staging.example.com/api/v1/applications/staging-app/revisions/abc123def456/metadata',
        {
          method: 'GET',
          headers: {
            'Content-Type': 'application/json',
            Authorization: 'Bearer test-staging-token',
          },
        },
      );
    });

    it('should fetch revision details with appNamespace param successfully', async () => {
      const expectedRevision: RevisionInfo = {
        author: 'test-user <test-user@mail.com>',
        date: new Date('2025-01-01'),
        message: 'committed changed',
      };

      fetchMock.mockResolvedValue({
        ok: true,
        json: async () => expectedRevision,
      });

      const result = await service.getRevisionDetails(
        'staging-instance',
        'staging-app',
        'abc123def456',
        {
          appNamespace: 'staging',
        },
      );
      expect(result).toEqual(expectedRevision);
      expect(fetchMock).toHaveBeenCalledWith(
        'https://argocd.staging.example.com/api/v1/applications/staging-app/revisions/abc123def456/metadata?appNamespace=staging',
        {
          method: 'GET',
          headers: {
            'Content-Type': 'application/json',
            Authorization: 'Bearer test-staging-token',
          },
        },
      );
    });

    it('should fetch revision details with sourceIndex param successfully', async () => {
      const expectedRevision: RevisionInfo = {
        author: 'test-user <test-user@mail.com>',
        date: new Date('2025-01-02'),
        message: 'Test commit',
      };

      fetchMock.mockResolvedValue({
        ok: true,
        json: async () => expectedRevision,
      });

      const result = await service.getRevisionDetails(
        'staging-instance',
        'staging-app',
        'abc123def456',
        {
          sourceIndex: '1',
        },
      );
      expect(result).toEqual(expectedRevision);
      expect(fetchMock).toHaveBeenCalledWith(
        'https://argocd.staging.example.com/api/v1/applications/staging-app/revisions/abc123def456/metadata?sourceIndex=1',
        {
          method: 'GET',
          headers: {
            'Content-Type': 'application/json',
            Authorization: 'Bearer test-staging-token',
          },
        },
      );
    });

    it('should handle errors gracefully', async () => {
      fetchMock.mockResolvedValue({
        ok: false,
        statusText: 'Internal Server Error',
      });

      await expect(
        service.getRevisionDetails(
          'non-existent-instance',
          'fake-appName',
          'fakeRevision',
        ),
      ).rejects.toThrow(
        "Failed to fetch Revision data from Instance 'non-existent-instance' with revisionID 'fakeRevision' with appName 'fake-appName' with appNamespace 'N/A' with sourceIndex 'N/A' : ArgoCD Instance non-existent-instance not found",
      );

      expect(mockLogger.error).toHaveBeenCalledWith(
        'ArgoCD Instance non-existent-instance not found',
      );
    });
  });

  describe('getApplication', () => {
    it('should fetch application details successfully', async () => {
      const expectedApplication = mockApplications[1];
      fetchMock.mockResolvedValue({
        ok: true,
        json: async () => expectedApplication,
      });
      const result = await service.getApplication('staging-instance', {
        appName: 'staging-app',
        appNamespace: 'staging',
      });
      expect(result).toEqual(expectedApplication);
      expect(fetchMock).toHaveBeenCalledWith(
        'https://argocd.staging.example.com/api/v1/applications/staging-app?appNamespace=staging',
        {
          method: 'GET',
          headers: {
            'Content-Type': 'application/json',
            Authorization: 'Bearer test-staging-token',
          },
        },
      );
    });

    it('should fetch application details with appNamespace successfully', async () => {
      const expectedApplication = mockApplications.find(
        a => a.metadata.namespace === 'staging',
      );
      fetchMock.mockResolvedValue({
        ok: true,
        json: async () => expectedApplication,
      });
      const result = await service.getApplication('staging-instance', {
        appNamespace: 'staging',
      });
      expect(result).toEqual(expectedApplication);
      expect(fetchMock).toHaveBeenCalledWith(
        'https://argocd.staging.example.com/api/v1/applications?appNamespace=staging',
        {
          method: 'GET',
          headers: {
            'Content-Type': 'application/json',
            Authorization: 'Bearer test-staging-token',
          },
        },
      );
    });

    it('should handle errors gracefully', async () => {
      fetchMock.mockResolvedValue({
        ok: false,
        statusText: 'Internal Server Error',
      });

      await expect(
        service.getApplication('staging-instance', {
          appName: 'wrong-app',
          appNamespace: 'staging',
        }),
      ).rejects.toThrow(
        "Failed to fetch Application from Instance 'staging-instance' with appName 'wrong-app' with appNamespace 'staging' : Request to https://argocd.staging.example.com/api/v1/applications/wrong-app?appNamespace=staging failed with 500 Internal Server Error",
      );
    });
  });

  describe('findApplications', () => {
    it('should return instances with applications filtered by appName from single instance', async () => {
      const expectedApplications = mockApplications.filter(
        application => application.metadata.name === 'test-app',
      );
      fetchMock
        // test-instance
        .mockResolvedValueOnce({
          ok: true,
          json: async () => ({
            items: expectedApplications,
          }),
        })
        // staging-instance
        .mockResolvedValueOnce({
          ok: true,
          json: async () => ({
            items: [],
          }),
        });

      const result = await service.findApplications({ appName: 'test-app' });
      expect(result).toEqual([
        {
          name: 'test-instance',
          url: 'https://argocd.example.com',
          appName: ['test-app'],
        },
      ]);
      expect(result[0].applications).toBeUndefined();
      expect(fetchMock).toHaveBeenCalledTimes(2);
    });

    it('should return instances with expanded applications filtered by appName from single instance when expand=applications', async () => {
      const expectedApplications = mockApplications.filter(
        application => application.metadata.name === 'test-app',
      );
      fetchMock
        // test-instance
        .mockResolvedValueOnce({
          ok: true,
          json: async () => ({
            items: expectedApplications,
          }),
        })
        // staging-instance
        .mockResolvedValueOnce({
          ok: true,
          json: async () => ({
            items: [],
          }),
        });

      const result = await service.findApplications({
        appName: 'test-app',
        expand: 'applications',
      });
      expect(result).toEqual([
        {
          name: 'test-instance',
          url: 'https://argocd.example.com',
          appName: ['test-app'],
          applications: expectedApplications,
        },
      ]);
      expect(fetchMock).toHaveBeenCalledTimes(2);
    });

    it('should return instances with applications filtered by appName from multiple instances', async () => {
      const expectedApplications = [
        mockApplications[0],
        {
          ...mockApplications[2],
          metadata: { ...mockApplications[2].metadata, name: 'test-app' },
        },
        {
          ...mockApplications[1],
          metadata: { ...mockApplications[1].metadata, name: 'test-app' },
        },
      ];
      fetchMock
        // test-instance
        .mockResolvedValueOnce({
          ok: true,
          json: async () => ({
            items: [expectedApplications[0], expectedApplications[1]],
          }),
        })
        // staging-instance
        .mockResolvedValueOnce({
          ok: true,
          json: async () => ({
            items: [expectedApplications[2]],
          }),
        });

      const result = await service.findApplications({
        appName: 'test-app',
      });
      expect(result).toEqual([
        {
          name: 'test-instance',
          url: 'https://argocd.example.com',
          appName: ['test-app'],
        },
        {
          name: 'staging-instance',
          url: 'https://argocd.staging.example.com',
          appName: ['test-app'],
        },
      ]);
      expect(fetchMock).toHaveBeenCalledTimes(2);
      expect(fetchMock).toHaveBeenCalledWith(
        'https://argocd.example.com/api/v1/applications?name=test-app',
        {
          headers: {
            Authorization: 'Bearer test-token',
            'Content-Type': 'application/json',
          },
          method: 'GET',
        },
      );
      expect(fetchMock).toHaveBeenCalledWith(
        'https://argocd.staging.example.com/api/v1/applications?name=test-app',
        {
          headers: {
            Authorization: 'Bearer test-staging-token',
            'Content-Type': 'application/json',
          },
          method: 'GET',
        },
      );
    });

    it('should return instances with expanded applications filtered by appName from multiple instances when expand=applications', async () => {
      const expectedApplications = [
        mockApplications[0],
        {
          ...mockApplications[2],
          metadata: { ...mockApplications[2].metadata, name: 'test-app' },
        },
        {
          ...mockApplications[1],
          metadata: { ...mockApplications[1].metadata, name: 'test-app' },
        },
      ];
      fetchMock
        // test-instance
        .mockResolvedValueOnce({
          ok: true,
          json: async () => ({
            items: [expectedApplications[0], expectedApplications[1]],
          }),
        })
        // staging-instance
        .mockResolvedValueOnce({
          ok: true,
          json: async () => ({
            items: [expectedApplications[2]],
          }),
        });

      const result = await service.findApplications({
        appName: 'test-app',
        expand: 'applications',
      });
      expect(result).toEqual([
        {
          name: 'test-instance',
          url: 'https://argocd.example.com',
          appName: ['test-app'],
          applications: [expectedApplications[0], expectedApplications[1]],
        },
        {
          name: 'staging-instance',
          url: 'https://argocd.staging.example.com',
          appName: ['test-app'],
          applications: [expectedApplications[2]],
        },
      ]);
      expect(fetchMock).toHaveBeenCalledTimes(2);
      expect(fetchMock).toHaveBeenCalledWith(
        'https://argocd.example.com/api/v1/applications?name=test-app',
        {
          headers: {
            Authorization: 'Bearer test-token',
            'Content-Type': 'application/json',
          },
          method: 'GET',
        },
      );
      expect(fetchMock).toHaveBeenCalledWith(
        'https://argocd.staging.example.com/api/v1/applications?name=test-app',
        {
          headers: {
            Authorization: 'Bearer test-staging-token',
            'Content-Type': 'application/json',
          },
          method: 'GET',
        },
      );
    });

    it('should handle no applications returned from an instance', async () => {
      fetchMock.mockResolvedValue({
        ok: true,
        json: async () => ({
          items: [],
        }),
      });

      const result = await service.findApplications({ appName: 'test-app' });
      expect(result).toEqual([]);
    });

    it('should return expanded instances with applications filtered by appName and project from single instance', async () => {
      const expectedApplications = mockApplications.filter(
        application =>
          application.metadata.name === 'test-app' &&
          application.metadata.namespace === 'test',
      );
      fetchMock
        // test-instance
        .mockResolvedValueOnce({
          ok: true,
          json: async () => ({
            items: expectedApplications,
          }),
        })
        // staging-instance
        .mockResolvedValueOnce({
          ok: true,
          json: async () => ({
            items: [],
          }),
        });

      const result = await service.findApplications({
        appName: 'test-app',
        appNamespace: 'test',
        project: 'custom',
        expand: 'applications',
      });
      expect(result).toEqual([
        {
          name: 'test-instance',
          url: 'https://argocd.example.com',
          appName: ['test-app'],
          applications: expectedApplications,
        },
      ]);
      expect(fetchMock).toHaveBeenCalledTimes(2);
      expect(fetchMock).toHaveBeenCalledWith(
        'https://argocd.example.com/api/v1/applications?name=test-app&project=custom&appNamespace=test',
        {
          headers: {
            Authorization: 'Bearer test-token',
            'Content-Type': 'application/json',
          },
          method: 'GET',
        },
      );
    });

    it('should handle errors when fetching applications from an instance', async () => {
      fetchMock.mockResolvedValue({
        ok: false,
        statusText: 'Internal Server Error',
      });

      await expect(
        service.findApplications({ appName: 'nonexistent-app' }),
      ).rejects.toThrow(
        "Failed to retrieve ArgoCD Applications from Instance 'test-instance' with name 'nonexistent-app' : Request to https://argocd.example.com/api/v1/applications?name=nonexistent-app failed with 500 Internal Server Error",
      );
    });
  });

  describe('createArgoResources', () => {
    const createResourcesInput = {
      appName: 'test-app',
      instanceName: 'test-instance',
      namespace: 'test-namespace',
      repoUrl: 'https://github.com/test/repo',
      path: 'kubernetes/manifests',
      label: 'test-label',
      projectName: 'test-project',
    };

    const expectedProjectPayload = {
      project: {
        metadata: {
          name: 'test-project',
          resourceVersion: undefined,
          finalizers: ['resources-finalizer.argocd.argoproj.io'],
        },
        spec: {
          destinations: [
            {
              namespace: 'test-namespace',
              server: 'https://kubernetes.default.svc',
            },
          ],
          sourceRepos: ['https://github.com/test/repo'],
        },
      },
    };

    const expectedApplicationPayload = {
      metadata: {
        name: 'test-app',
        labels: { backstage: 'test-label' },
        finalizers: ['resources-finalizers.argocd.argoproj.io'],
        resourceVersion: undefined,
      },
      spec: {
        destination: {
          namespace: 'test-namespace',
          server: 'https://kubernetes.default.svc',
        },
        project: 'test-project',
        revisionHistoryLimit: 10,
        source: {
          path: 'kubernetes/manifests',
          repoURL: 'https://github.com/test/repo',
        },
        syncPolicy: {
          automated: {
            enabled: true,
            prune: true,
            selfHeal: true,
            allowEmpty: true,
          },
          retry: {
            backoff: {
              duration: '5s',
              factor: 2,
              maxDuration: '5m',
            },
            limit: 10,
          },
          syncOptions: ['CreateNamespace=false', 'FailOnSharedResource=true'],
        },
      },
    };

    it('should create ArgoCD project and application successfully', async () => {
      fetchMock
        .mockResolvedValueOnce({
          ok: true,
          json: async () => expectedProjectPayload,
        })
        .mockResolvedValueOnce({
          ok: true,
          json: async () => expectedApplicationPayload,
        });

      const result = await service.createArgoResources(createResourcesInput);

      expect(result).toEqual({
        applicationUrl:
          'https://argocd.example.com/applications/argocd/test-app?view=tree&resource=',
      });
      expect(fetchMock).toHaveBeenCalledTimes(2);

      // Verify project creation
      expect(fetchMock).toHaveBeenNthCalledWith(
        1,
        'https://argocd.example.com/api/v1/projects',
        {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            Authorization: 'Bearer test-token',
          },
          body: JSON.stringify(expectedProjectPayload),
        },
      );

      // Verify application creation
      expect(fetchMock).toHaveBeenNthCalledWith(
        2,
        'https://argocd.example.com/api/v1/applications',
        {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            Authorization: 'Bearer test-token',
          },
          body: JSON.stringify(expectedApplicationPayload),
        },
      );
    });

    it('should use appName as projectName when projectName is not provided', async () => {
      const inputWithoutProjectName = {
        ...createResourcesInput,
        projectName: '',
      };

      const expectedPayloadWithAppName = {
        ...expectedProjectPayload,
        project: {
          ...expectedProjectPayload.project,
          metadata: {
            ...expectedProjectPayload.project.metadata,
            name: 'test-app',
          },
        },
      };

      fetchMock
        .mockResolvedValueOnce({
          ok: true,
          json: async () => expectedPayloadWithAppName,
        })
        .mockResolvedValueOnce({
          ok: true,
          json: async () => expectedApplicationPayload,
        });

      const result = await service.createArgoResources(inputWithoutProjectName);

      expect(result).toEqual({
        applicationUrl:
          'https://argocd.example.com/applications/argocd/test-app?view=tree&resource=',
      });
      expect(fetchMock).toHaveBeenCalledTimes(2);
    });

    it('should handle instance not found error', async () => {
      await expect(
        service.createArgoResources({
          ...createResourcesInput,
          instanceName: 'non-existent-instance',
        }),
      ).rejects.toThrow(
        "Failed to create ArgoCD Resource from Instance 'non-existent-instance' with appName 'test-app' with namespace 'test-namespace' with repoUrl 'https://github.com/test/repo' with path 'kubernetes/manifests' with label 'test-label' with projectName 'test-project' : ArgoCD Instance non-existent-instance not found",
      );

      expect(mockLogger.error).toHaveBeenCalledWith(
        'ArgoCD Instance non-existent-instance not found',
      );
    });

    it('should handle project creation error', async () => {
      fetchMock.mockResolvedValueOnce({
        ok: false,
        statusText: 'Conflict',
        status: 409,
      });

      await expect(
        service.createArgoResources(createResourcesInput),
      ).rejects.toThrow(
        "Failed to create ArgoCD Resource from Instance 'test-instance'",
      );
    });

    it('should handle application creation error', async () => {
      fetchMock
        .mockResolvedValueOnce({
          ok: true,
          json: async () => expectedProjectPayload,
        })
        .mockResolvedValueOnce({
          ok: false,
          statusText: 'Bad Request',
          status: 400,
        });

      await expect(
        service.createArgoResources(createResourcesInput),
      ).rejects.toThrow(
        "Failed to create ArgoCD Resource from Instance 'test-instance'",
      );

      expect(fetchMock).toHaveBeenCalledTimes(2);
    });
  });
});
