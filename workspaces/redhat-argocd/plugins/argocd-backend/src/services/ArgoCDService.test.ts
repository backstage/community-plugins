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
import { RevisionInfo } from '@backstage-community/plugin-redhat-argocd-common';
import { mockApplications, mockConfig } from '../__data__/mockdata';

const mockLogger = {
  error: jest.fn(),
  info: jest.fn(),
  warn: jest.fn(),
  debug: jest.fn(),
} as any;

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
        items: mockApplications[1],
      };
      fetchMock.mockResolvedValue({
        ok: true,
        json: async () => expectedAppNamespaceResponse,
      });

      const result = await service.listArgoApps('test-instance', {
        appNamespace: 'staging',
      });
      expect(result).toEqual(expectedAppNamespaceResponse);
      expect(fetchMock).toHaveBeenCalledWith(
        'https://argocd.example.com/api/v1/applications?appNamespace=staging',
        {
          headers: {
            Authorization: 'Bearer test-token',
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
        items: mockApplications[0],
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
      const expectedEmptyNamespaceResponse = {
        metadata: {
          resourceVersion: '12345',
        },
        items: [],
      };
      fetchMock.mockResolvedValue({
        ok: true,
        json: async () => expectedEmptyNamespaceResponse,
      });

      const result = await service.listArgoApps('test-instance', {
        appNamespace: 'fake',
      });
      expect(result).toEqual(expectedEmptyNamespaceResponse);
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
});
