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
import { ArgoCDInstanceApiClient } from '..';
import {
  mockApplication,
  mockQuarkusApplication,
  preProdApplication,
} from '../../../dev/__data__';
import { Instance } from '@backstage-community/plugin-argocd-common';

const mockInstances: Instance[] = [
  { name: 'main', url: 'https://kubernetes.default.svc' },
  { name: 'secondary', url: 'https://argo.secondary.example.com' },
  { name: 'tertiary', url: 'https://argo.tertiary.example.com' },
];

const mockArgoCDApiClient = {
  listApps: jest.fn(),
  getApplication: jest.fn(),
  getRevisionDetails: jest.fn(),
  getRevisionDetailsList: jest.fn(),
  findApplications: jest.fn(),
};

describe('ArgoCDInstanceApiClient', () => {
  let client: ArgoCDInstanceApiClient;

  describe('searchApplications', () => {
    const mockQuarkusDevApplicationWithAppName = {
      ...mockApplication,
      metadata: { ...mockApplication.metadata, name: 'quarkus-app' },
    };

    beforeEach(() => {
      jest.clearAllMocks();
      mockArgoCDApiClient.listApps.mockResolvedValue([
        mockApplication,
        mockQuarkusApplication,
      ]);
      client = new ArgoCDInstanceApiClient({
        argoCDApi: mockArgoCDApiClient,
        instances: mockInstances,
      });
    });

    describe('with appSelector', () => {
      test('should invoke listApps for each specified instance', async () => {
        await client.searchApplications(['main', 'secondary'], {
          appSelector: 'rht.gitops.com/quarkus-app-bootstrap',
        });

        expect(mockArgoCDApiClient.listApps).toHaveBeenCalledTimes(2);
        expect(mockArgoCDApiClient.listApps).toHaveBeenCalledWith(
          expect.objectContaining({
            url: '/argoInstance/main',
            appSelector: 'rht.gitops.com/quarkus-app-bootstrap',
          }),
        );
        expect(mockArgoCDApiClient.listApps).toHaveBeenCalledWith(
          expect.objectContaining({
            url: '/argoInstance/secondary',
            appSelector: 'rht.gitops.com/quarkus-app-bootstrap',
          }),
        );
        expect(mockArgoCDApiClient.getApplication).not.toHaveBeenCalled();
        expect(mockArgoCDApiClient.findApplications).not.toHaveBeenCalled();
      });

      test('should invoke listApps for all instances when instanceNames is empty', async () => {
        await client.searchApplications([], {
          appSelector: 'rht.gitops.com/quarkus-app-bootstrap',
        });

        expect(mockArgoCDApiClient.listApps).toHaveBeenCalledTimes(3);
        expect(mockArgoCDApiClient.listApps).toHaveBeenCalledWith(
          expect.objectContaining({
            url: '/argoInstance/main',
            appSelector: 'rht.gitops.com/quarkus-app-bootstrap',
          }),
        );
        expect(mockArgoCDApiClient.listApps).toHaveBeenCalledWith(
          expect.objectContaining({
            url: '/argoInstance/secondary',
            appSelector: 'rht.gitops.com/quarkus-app-bootstrap',
          }),
        );
        expect(mockArgoCDApiClient.listApps).toHaveBeenCalledWith(
          expect.objectContaining({
            url: '/argoInstance/tertiary',
            appSelector: 'rht.gitops.com/quarkus-app-bootstrap',
          }),
        );
        expect(mockArgoCDApiClient.getApplication).not.toHaveBeenCalled();
        expect(mockArgoCDApiClient.findApplications).not.toHaveBeenCalled();
      });

      test('should invoke listApps with appName and project when passed', async () => {
        await client.searchApplications(['main', 'secondary'], {
          appSelector: 'rht.gitops.com/quarkus-app-bootstrap',
          appNamespace: 'test',
          project: 'custom',
        });

        expect(mockArgoCDApiClient.listApps).toHaveBeenCalledTimes(2);
        expect(mockArgoCDApiClient.listApps).toHaveBeenCalledWith(
          expect.objectContaining({
            url: '/argoInstance/main',
            appSelector: 'rht.gitops.com/quarkus-app-bootstrap',
            appNamespace: 'test',
            projectName: 'custom',
          }),
        );
        expect(mockArgoCDApiClient.listApps).toHaveBeenCalledWith(
          expect.objectContaining({
            url: '/argoInstance/secondary',
            appSelector: 'rht.gitops.com/quarkus-app-bootstrap',
            appNamespace: 'test',
            projectName: 'custom',
          }),
        );
      });

      test('should return all found applications from multiple instances', async () => {
        const mockListApps = jest
          .fn()
          .mockResolvedValueOnce({ items: [mockApplication] })
          .mockResolvedValueOnce({ items: [] })
          .mockResolvedValueOnce({
            items: [mockQuarkusApplication, preProdApplication],
          });
        mockArgoCDApiClient.listApps = mockListApps;

        const result = await client.searchApplications(
          ['main', 'secondary', 'tertiary'],
          { appSelector: 'rht.gitops.com/quarkus-app-bootstrap' },
        );

        expect(result).toHaveLength(3);
        expect(result[0].metadata?.name).toBe('quarkus-app-dev');
        expect(result[1].metadata?.name).toBe('quarkus-app');
        expect(result[2].metadata?.name).toBe('quarkus-app-preprod');
      });

      test('should return empty array when no applications found across instances', async () => {
        const mockListApps = jest.fn().mockResolvedValue({ items: [] });
        mockArgoCDApiClient.listApps = mockListApps;

        const result = await client.searchApplications(
          ['main', 'secondary', 'tertiary'],
          { appSelector: 'rht.gitops.com/nonexistent' },
        );

        expect(result).toHaveLength(0);
      });

      test('should return empty array when no app selector or app name passed', async () => {
        const mockListApps = jest.fn().mockResolvedValue({ items: [] });
        mockArgoCDApiClient.listApps = mockListApps;

        const result = await client.searchApplications(
          ['main', 'secondary', 'tertiary'],
          {},
        );

        expect(result).toHaveLength(0);
      });

      test('should add instance when not included in listApps response', async () => {
        const mockListApps = jest
          .fn()
          .mockResolvedValueOnce({
            items: [
              {
                ...mockApplication,
                metadata: {
                  ...mockApplication.metadata,
                  instance: { name: 'main' },
                },
              },
            ],
          })
          .mockResolvedValueOnce({ items: [] })
          .mockResolvedValueOnce({
            items: [
              {
                ...mockQuarkusApplication,
                metadata: {
                  ...mockQuarkusApplication.metadata,
                  instance: {
                    name: 'tertiary',
                    url: 'https://argo.tertiary-not-changed.example.com',
                  },
                },
              },
              {
                ...preProdApplication,
                metadata: {
                  ...preProdApplication.metadata,
                  instance: {},
                },
              },
            ],
          });

        mockArgoCDApiClient.listApps = mockListApps;

        const result = await client.searchApplications([], {
          appSelector: 'rht.gitops.com/quarkus-app-bootstrap',
        });

        expect(mockArgoCDApiClient.listApps).toHaveBeenCalledTimes(3);
        expect(result[0].metadata?.instance).toEqual({
          name: 'main',
          url: 'https://kubernetes.default.svc',
        });
        expect(result[1].metadata?.instance).toEqual({
          name: 'tertiary',
          url: 'https://argo.tertiary-not-changed.example.com',
        });
        expect(result[2].metadata?.instance).toEqual({
          name: 'tertiary',
          url: 'https://argo.tertiary.example.com',
        });
      });
    });

    describe('with appName and specific instances', () => {
      test('should invoke getApplication for each specified instance', async () => {
        const mockGetApplication = jest
          .fn()
          .mockResolvedValueOnce(mockQuarkusDevApplicationWithAppName)
          .mockResolvedValueOnce(mockQuarkusApplication);
        mockArgoCDApiClient.getApplication = mockGetApplication;

        await client.searchApplications(['main', 'secondary'], {
          appName: 'quarkus-app',
        });

        expect(mockGetApplication).toHaveBeenCalledTimes(2);
        expect(mockGetApplication).toHaveBeenCalledWith(
          expect.objectContaining({
            url: '/argoInstance/main',
            appName: 'quarkus-app',
          }),
        );
        expect(mockGetApplication).toHaveBeenCalledWith(
          expect.objectContaining({
            url: '/argoInstance/secondary',
            appName: 'quarkus-app',
          }),
        );
        expect(mockArgoCDApiClient.listApps).not.toHaveBeenCalled();
        expect(mockArgoCDApiClient.findApplications).not.toHaveBeenCalled();
      });

      test('should invoke getApplication with appNamespace and project if passed', async () => {
        const mockGetApplication = jest
          .fn()
          .mockResolvedValueOnce(mockQuarkusDevApplicationWithAppName)
          .mockResolvedValueOnce(mockQuarkusApplication);
        mockArgoCDApiClient.getApplication = mockGetApplication;

        await client.searchApplications(['main', 'secondary'], {
          appName: 'quarkus-app',
          appNamespace: 'test',
          project: 'custom',
        });

        expect(mockGetApplication).toHaveBeenCalledTimes(2);
        expect(mockGetApplication).toHaveBeenCalledWith(
          expect.objectContaining({
            url: '/argoInstance/main',
            appName: 'quarkus-app',
            appNamespace: 'test',
            project: 'custom',
          }),
        );
        expect(mockGetApplication).toHaveBeenCalledWith(
          expect.objectContaining({
            url: '/argoInstance/main',
            appName: 'quarkus-app',
            appNamespace: 'test',
            project: 'custom',
          }),
        );
      });

      test('should return applications from multiple instances', async () => {
        const mockGetApplication = jest
          .fn()
          .mockResolvedValueOnce(mockQuarkusDevApplicationWithAppName)
          .mockResolvedValueOnce(mockQuarkusApplication);
        mockArgoCDApiClient.getApplication = mockGetApplication;

        const result = await client.searchApplications(['main', 'secondary'], {
          appName: 'quarkus-app',
        });

        expect(result).toHaveLength(2);
        expect(result[0].metadata?.name).toBe('quarkus-app');
        expect(result[1].metadata?.name).toBe('quarkus-app');
      });

      test('should add instance when not included in getApplication response', async () => {
        const mockGetApplication = jest
          .fn()
          .mockResolvedValueOnce({
            ...mockQuarkusDevApplicationWithAppName,
            metadata: {
              ...mockQuarkusDevApplicationWithAppName.metadata,
              instance: {},
            },
          })
          .mockResolvedValueOnce(mockQuarkusApplication);
        mockArgoCDApiClient.getApplication = mockGetApplication;

        const result = await client.searchApplications(['main', 'secondary'], {
          appName: 'quarkus-app',
        });

        expect(result).toHaveLength(2);
        expect(result[0].metadata?.name).toBe('quarkus-app');
        expect(result[0].metadata?.instance).toEqual({
          name: 'main',
          url: 'https://kubernetes.default.svc',
        });
        expect(result[1].metadata?.name).toBe('quarkus-app');
        expect(result[1].metadata?.instance.name).toBeDefined();
        expect(result[1].metadata?.instance.url).toBeDefined();
      });

      test('should not throw error when application with appName does not exist in instance', async () => {
        const errorMessage =
          'Failed to fetch data, status 403: Insufficient permissions for ArgoCD server';
        const mockGetApplication = jest
          .fn()
          .mockResolvedValueOnce(mockQuarkusDevApplicationWithAppName)
          .mockRejectedValueOnce(new Error(errorMessage));
        const mockFindApplications = jest.fn().mockResolvedValue([
          {
            name: 'main',
            url: 'https://kubernetes.default.svc',
            appName: ['quarkus-app'],
          },
        ]);

        mockArgoCDApiClient.getApplication = mockGetApplication;
        mockArgoCDApiClient.findApplications = mockFindApplications;

        const result = await client.searchApplications(['main', 'secondary'], {
          appName: 'quarkus-app', // Exists on main, does not exist on secondary
        });

        expect(mockGetApplication).toHaveBeenCalledTimes(2);
        expect(mockFindApplications).toHaveBeenCalledWith({
          appName: 'quarkus-app',
          appNamespace: undefined,
          project: undefined,
        });
        // Only main instance should be returned, secondary does not throw
        expect(result).toHaveLength(1);
        expect(result[0].metadata?.name).toBe('quarkus-app');
      });

      test('should throw 403 Error if fetching application throws 403 error and app exists in instance', async () => {
        const errorMessage =
          'Failed to fetch data, status 403: Insufficient permissions for ArgoCD server';
        const mockGetApplication = jest
          .fn()
          .mockRejectedValueOnce(new Error(errorMessage));
        const mockFindApplications = jest.fn().mockResolvedValue([
          {
            name: 'main',
            url: 'https://kubernetes.default.svc',
            appName: ['quarkus-app'],
          },
        ]);

        mockArgoCDApiClient.getApplication = mockGetApplication;
        mockArgoCDApiClient.findApplications = mockFindApplications;

        await expect(
          client.searchApplications(['main'], {
            appName: 'quarkus-app',
          }),
        ).rejects.toThrow(errorMessage);
      });

      test('should throw error if fetching application raises non-403 error', async () => {
        const errorMessage =
          'Failed to fetch data, status 500: Internal Server Error';
        const mockGetApplication = jest
          .fn()
          .mockResolvedValueOnce(mockQuarkusDevApplicationWithAppName)
          .mockRejectedValueOnce(new Error(errorMessage));

        mockArgoCDApiClient.getApplication = mockGetApplication;

        await expect(
          client.searchApplications(['main', 'secondary'], {
            appName: 'quarkus-app',
          }),
        ).rejects.toThrow(errorMessage);

        expect(mockGetApplication).toHaveBeenCalledTimes(2);
        expect(mockArgoCDApiClient.findApplications).not.toHaveBeenCalled();
      });

      test('should return empty array when no applications found across instances', async () => {
        const errorMessage =
          'Failed to fetch data, status 403: Insufficient permissions for ArgoCD server';
        const mockGetApplication = jest
          .fn()
          .mockRejectedValueOnce(new Error(errorMessage))
          .mockRejectedValueOnce(new Error(errorMessage));
        const mockFindApplications = jest.fn().mockResolvedValue([]);

        mockArgoCDApiClient.getApplication = mockGetApplication;
        mockArgoCDApiClient.findApplications = mockFindApplications;

        const result = await client.searchApplications(['main', 'secondary'], {
          appName: 'quarkus-app',
        });

        expect(mockGetApplication).toHaveBeenCalledTimes(2);
        expect(mockFindApplications).toHaveBeenCalledWith({
          appName: 'quarkus-app',
          appNamespace: undefined,
          project: undefined,
        });
        expect(result).toHaveLength(0);
      });
    });

    describe('with appName and no instances', () => {
      test('should invoke findApplications', async () => {
        const mockFindApplications = jest.fn().mockResolvedValue([
          {
            name: 'main',
            url: 'https://main-instance-url.com',
            appName: ['quarkus-app'],
            applications: [mockQuarkusDevApplicationWithAppName],
          },
        ]);
        mockArgoCDApiClient.findApplications = mockFindApplications;

        await client.searchApplications([], {
          appName: 'quarkus-app',
        });
        expect(mockFindApplications).toHaveBeenCalledWith({
          appName: 'quarkus-app',
          appNamespace: undefined,
          project: undefined,
          expand: 'applications',
        });
        expect(mockArgoCDApiClient.getApplication).not.toHaveBeenCalled();
        expect(mockArgoCDApiClient.listApps).not.toHaveBeenCalled();
      });

      test('should invoke findApplications with appNamespace and project passed', async () => {
        const mockFindApplications = jest.fn().mockResolvedValue([
          {
            name: 'main',
            url: 'https://main-instance-url.com',
            appName: ['quarkus-app'],
            applications: [mockQuarkusDevApplicationWithAppName],
          },
        ]);
        mockArgoCDApiClient.findApplications = mockFindApplications;

        await client.searchApplications([], {
          appName: 'quarkus-app',
          appNamespace: 'test',
          project: 'custom',
        });
        expect(mockFindApplications).toHaveBeenCalledWith({
          appName: 'quarkus-app',
          appNamespace: 'test',
          project: 'custom',
          expand: 'applications',
        });
      });

      test('should return applications from all instances', async () => {
        const mockFindApplications = jest.fn().mockResolvedValue([
          {
            name: 'main',
            url: 'https:/kubernetes.default.svc',
            appName: ['quarkus-app'],
            applications: [mockQuarkusDevApplicationWithAppName],
          },
          {
            name: 'secondary',
            url: 'https://argo.secondary.example.com',
            appName: ['quarkus-app'],
            applications: [mockQuarkusApplication],
          },
        ]);
        mockArgoCDApiClient.findApplications = mockFindApplications;

        const result = await client.searchApplications([], {
          appName: 'quarkus-app',
        });

        expect(mockFindApplications).toHaveBeenCalledWith({
          appName: 'quarkus-app',
          appNamespace: undefined,
          project: undefined,
          expand: 'applications',
        });
        expect(result).toHaveLength(2);
        expect(result[0]).toEqual(mockQuarkusDevApplicationWithAppName);
        expect(result[1]).toEqual(mockQuarkusApplication);
      });

      test('should return empty array when no applications found across instances', async () => {
        const mockFindApplications = jest.fn().mockResolvedValue([]);
        mockArgoCDApiClient.findApplications = mockFindApplications;

        const result = await client.searchApplications([], {
          appName: 'quarkus-app',
        });

        expect(mockFindApplications).toHaveBeenCalledWith({
          appName: 'quarkus-app',
          appNamespace: undefined,
          project: undefined,
          expand: 'applications',
        });
        expect(result).toHaveLength(0);
      });

      test('should fetch application details when findApplications returns no expanded applications (Roadie)', async () => {
        const mockFindApplications = jest.fn().mockResolvedValue([
          {
            name: 'main',
            url: 'https:/kubernetes.default.svc',
            appName: ['quarkus-app'],
          },
          {
            name: 'secondary',
            url: 'https://argo.secondary.example.com',
            appName: ['quarkus-app'],
          },
        ]);
        const mockGetApplication = jest
          .fn()
          .mockResolvedValueOnce(mockQuarkusDevApplicationWithAppName)
          .mockResolvedValueOnce(mockQuarkusApplication);
        mockArgoCDApiClient.findApplications = mockFindApplications;
        mockArgoCDApiClient.getApplication = mockGetApplication;

        const result = await client.searchApplications([], {
          appName: 'quarkus-app',
        });

        expect(mockGetApplication).toHaveBeenCalledTimes(2);
        expect(mockGetApplication).toHaveBeenCalledWith(
          expect.objectContaining({
            url: '/argoInstance/main',
            appName: 'quarkus-app',
          }),
        );
        expect(mockGetApplication).toHaveBeenCalledWith(
          expect.objectContaining({
            url: '/argoInstance/secondary',
            appName: 'quarkus-app',
          }),
        );
        expect(result[0]).toEqual(mockQuarkusDevApplicationWithAppName);
        expect(result[1]).toEqual(mockQuarkusApplication);
      });
    });
  });
});
