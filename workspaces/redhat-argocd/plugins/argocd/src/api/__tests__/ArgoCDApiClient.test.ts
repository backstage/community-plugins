/*
 * Copyright 2024 The Backstage Authors
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
import { IdentityApi } from '@backstage/core-plugin-api';

import { ArgoCDApiClient } from '..';
import { mockApplication, multiSourceArgoApp } from '../../../dev/__data__';

const getIdentityApiStub: IdentityApi = {
  getProfileInfo: jest.fn(),
  getBackstageIdentity: jest.fn(),
  async getCredentials() {
    return { token: 'fake-jwt-token' };
  },
  signOut: jest.fn(),
};

describe('API calls', () => {
  let fetchSpy: jest.SpyInstance;

  beforeEach(() => {
    fetchSpy = jest.spyOn(global, 'fetch');
  });

  afterEach(() => {
    fetchSpy.mockRestore();
  });

  describe('listApps', () => {
    beforeEach(() => {
      fetchSpy.mockImplementation(() =>
        Promise.resolve<Response>({
          ok: true,
          json: () => Promise.resolve({ items: [] }),
        } as Response),
      );
    });

    test('fetches app based on provided projectName', async () => {
      const client = new ArgoCDApiClient({
        backendBaseUrl: 'https://test.com',
        useNamespacedApps: false,
        identityApi: getIdentityApiStub,
      });

      await client.listApps({
        url: '',
        appSelector: 'janus.io%253Dquarkus-app',
        projectName: 'test',
        appNamespace: 'my-test-ns',
      });

      expect(global.fetch).toHaveBeenCalledWith(
        'https://test.com/api/argocd/applications/selector/janus.io%253Dquarkus-app?selector=janus.io%25253Dquarkus-app&project=test',
        expect.objectContaining({
          headers: {
            'Content-Type': 'application/json',
            Authorization: `Bearer fake-jwt-token`,
          },
        }),
      );
    });
    test('fetches app based on provided appSelector', async () => {
      const client = new ArgoCDApiClient({
        backendBaseUrl: 'https://test.com',
        useNamespacedApps: false,
        identityApi: getIdentityApiStub,
      });

      await client.listApps({
        url: '',
        appSelector: 'my-test-app-selector',
      });

      expect(global.fetch).toHaveBeenCalledWith(
        'https://test.com/api/argocd/applications/selector/my-test-app-selector?selector=my-test-app-selector',
        expect.objectContaining({
          headers: {
            'Content-Type': 'application/json',
            Authorization: `Bearer fake-jwt-token`,
          },
        }),
      );
    });

    test('Should throw error incase of any internal API failure', async () => {
      fetchSpy.mockImplementation(() =>
        Promise.resolve<Response>({
          ok: false,
          status: 'Internal server error',
          statusText: 'Something went wrong',
          json: () => Promise.reject({ status: 'Internal server error' }),
        } as unknown as Response),
      );

      const client = new ArgoCDApiClient({
        backendBaseUrl: 'https://test.com',
        useNamespacedApps: false,
        identityApi: getIdentityApiStub,
      });
      let error;
      try {
        await client.listApps({
          url: '',
          appSelector: 'my-test-app-selector',
        });
      } catch (e: any) {
        error = e;
      } finally {
        expect(error.message).toBe(
          'failed to fetch data, status Internal server error: Something went wrong',
        );
      }
    });

    test('should not pass the token for the guest user', async () => {
      const client = new ArgoCDApiClient({
        backendBaseUrl: 'https://test.com',
        useNamespacedApps: false,
        identityApi: {
          ...getIdentityApiStub,
          getCredentials: async () => {
            return {};
          },
        },
      });

      await client.listApps({
        url: '',
        projectName: 'test',
        appSelector: 'janus.io%253Dquarkus-app',
        appNamespace: 'my-test-ns',
      });

      expect(global.fetch).toHaveBeenCalledWith(
        'https://test.com/api/argocd/applications/selector/janus.io%253Dquarkus-app?selector=janus.io%25253Dquarkus-app&project=test',
        expect.objectContaining({
          headers: undefined,
        }),
      );
    });
  });

  describe('findApplications', () => {
    beforeEach(() => {
      fetchSpy.mockImplementation(() =>
        Promise.resolve<Response>({
          ok: true,
          json: () => Promise.resolve([]),
        } as Response),
      );
    });

    test('should fetch applications by appName', async () => {
      const client = new ArgoCDApiClient({
        backendBaseUrl: 'https://test.com',
        useNamespacedApps: false,
        identityApi: getIdentityApiStub,
      });

      await client.findApplications({
        appName: 'my-test-app',
      });

      expect(global.fetch).toHaveBeenCalledWith(
        'https://test.com/api/argocd/find/name/my-test-app',
        expect.objectContaining({
          headers: {
            'Content-Type': 'application/json',
            Authorization: 'Bearer fake-jwt-token',
          },
        }),
      );
    });

    test('should fetch applications with expand when passed', async () => {
      const client = new ArgoCDApiClient({
        backendBaseUrl: 'https://test.com',
        useNamespacedApps: false,
        identityApi: getIdentityApiStub,
      });

      await client.findApplications({
        appName: 'my-test-app',
        expand: 'applications',
      });

      expect(global.fetch).toHaveBeenCalledWith(
        'https://test.com/api/argocd/find/name/my-test-app?expand=applications',
        expect.objectContaining({
          headers: {
            'Content-Type': 'application/json',
            Authorization: 'Bearer fake-jwt-token',
          },
        }),
      );
    });

    test('should fetch applications with expand, appNamespace and project when passed', async () => {
      const client = new ArgoCDApiClient({
        backendBaseUrl: 'https://test.com',
        useNamespacedApps: true,
        identityApi: getIdentityApiStub,
      });

      await client.findApplications({
        appName: 'my-test-app',
        appNamespace: 'my-namespace',
        project: 'my-project',
        expand: 'applications',
      });

      expect(global.fetch).toHaveBeenCalledWith(
        'https://test.com/api/argocd/find/name/my-test-app?appNamespace=my-namespace&project=my-project&expand=applications',
        expect.objectContaining({
          headers: {
            'Content-Type': 'application/json',
            Authorization: 'Bearer fake-jwt-token',
          },
        }),
      );
    });

    test('should fetch applications without appNamespace when useNamespacedApps is false', async () => {
      const client = new ArgoCDApiClient({
        backendBaseUrl: 'https://test.com',
        useNamespacedApps: false,
        identityApi: getIdentityApiStub,
      });

      await client.findApplications({
        appName: 'my-test-app',
        appNamespace: 'my-namespace',
        project: 'my-project',
      });

      expect(global.fetch).toHaveBeenCalledWith(
        'https://test.com/api/argocd/find/name/my-test-app?project=my-project',
        expect.objectContaining({
          headers: {
            'Content-Type': 'application/json',
            Authorization: 'Bearer fake-jwt-token',
          },
        }),
      );
    });

    test('should throw error in case of any internal API failure', async () => {
      fetchSpy.mockImplementation(() =>
        Promise.resolve<Response>({
          ok: false,
          status: 'Internal server error',
          statusText: 'Something went wrong',
          json: () => Promise.reject({ status: 'Internal server error' }),
        } as unknown as Response),
      );

      const client = new ArgoCDApiClient({
        backendBaseUrl: 'https://test.com',
        useNamespacedApps: false,
        identityApi: getIdentityApiStub,
      });

      await expect(
        client.findApplications({
          appName: 'my-test-app',
        }),
      ).rejects.toThrow(
        'failed to fetch data, status Internal server error: Something went wrong',
      );
    });
  });

  describe('getApplication', () => {
    beforeEach(() => {
      fetchSpy.mockImplementation(() =>
        Promise.resolve<Response>({
          ok: true,
          json: () => Promise.resolve({}),
        } as Response),
      );
    });

    test('should return empty object as response', async () => {
      const client = new ArgoCDApiClient({
        backendBaseUrl: 'https://test.com',
        useNamespacedApps: false,
        identityApi: getIdentityApiStub,
      });

      const data = await client.getApplication({
        url: '',
        appName: 'quarkus-app',
        appNamespace: '',
      });
      expect(Object.keys(data)).toHaveLength(0);
    });

    test('should return application object', async () => {
      fetchSpy.mockImplementation(() =>
        Promise.resolve<Response>({
          ok: true,
          json: () => Promise.resolve(mockApplication),
        } as Response),
      );

      const client = new ArgoCDApiClient({
        backendBaseUrl: 'https://test.com',
        useNamespacedApps: false,
        identityApi: getIdentityApiStub,
      });

      const data = await client.getApplication({
        url: '',
        appName: 'quarkus-app',
        appNamespace: '',
      });
      expect(data).toEqual(
        expect.objectContaining({
          metadata: expect.objectContaining({
            name: 'quarkus-app-dev',
          }),
        }),
      );
    });
  });

  describe('getRevisionDetails', () => {
    beforeEach(() => {
      fetchSpy.mockImplementation(() =>
        Promise.resolve<Response>({
          ok: true,
          json: () => Promise.resolve({ items: [] }),
        } as Response),
      );
    });

    test('should return the revision details', async () => {
      const client = new ArgoCDApiClient({
        backendBaseUrl: 'https://test.com',
        useNamespacedApps: false,
        identityApi: getIdentityApiStub,
      });

      await client.getRevisionDetails({
        instanceName: 'main',
        app: 'my-test-app',
        revisionID: '12345',
      });

      expect(global.fetch).toHaveBeenCalledWith(
        'https://test.com/api/argocd/argoInstance/main/applications/name/my-test-app/revisions/12345/metadata',
        expect.objectContaining({
          headers: {
            'Content-Type': 'application/json',
            Authorization: `Bearer fake-jwt-token`,
          },
        }),
      );
    });
  });

  describe('getRevisionDetailsList', () => {
    beforeEach(() => {
      fetchSpy.mockImplementation(() =>
        Promise.resolve<Response>({
          ok: true,
          json: () => Promise.resolve({ items: [] }),
        } as Response),
      );
    });

    test('should return empty list if the revisionIds are not passed', async () => {
      const client = new ArgoCDApiClient({
        backendBaseUrl: 'https://test.com',
        useNamespacedApps: false,
        identityApi: getIdentityApiStub,
      });

      const data = await client.getRevisionDetailsList({
        apps: [mockApplication],
        revisionIDs: [],
        appNamespace: '',
      });
      expect(data).toHaveLength(0);
    });

    test('should return the list of revision details', async () => {
      const client = new ArgoCDApiClient({
        backendBaseUrl: 'https://test.com',
        useNamespacedApps: false,
        identityApi: getIdentityApiStub,
      });

      await client.getRevisionDetailsList({
        apps: [mockApplication],
        revisionIDs: ['90f9758b7033a4bbb7c33a35ee474d61091644bc'],
        appNamespace: '',
      });

      expect(global.fetch).toHaveBeenCalledWith(
        'https://test.com/api/argocd/argoInstance/main/applications/name/quarkus-app-dev/revisions/90f9758b7033a4bbb7c33a35ee474d61091644bc/metadata',
        expect.objectContaining({
          headers: {
            'Content-Type': 'application/json',
            Authorization: `Bearer fake-jwt-token`,
          },
        }),
      );
    });

    test('should return the list of revision details for multi-source apps', async () => {
      const client = new ArgoCDApiClient({
        backendBaseUrl: 'https://test.com',
        useNamespacedApps: false,
        identityApi: getIdentityApiStub,
      });

      await client.getRevisionDetailsList({
        apps: [multiSourceArgoApp],
        revisionIDs: [
          '331386ce09e4536a730a16f10d1bce8dfca0c8b1',
          'de1631a6d84f35d826235a933657baca77c2ca9c',
        ],
        appNamespace: '',
      });

      expect(global.fetch).toHaveBeenCalledWith(
        'https://test.com/api/argocd/argoInstance/main/applications/name/demo/revisions/331386ce09e4536a730a16f10d1bce8dfca0c8b1/metadata?sourceIndex=0',
        expect.objectContaining({
          headers: {
            'Content-Type': 'application/json',
            Authorization: `Bearer fake-jwt-token`,
          },
        }),
      );

      expect(global.fetch).toHaveBeenCalledWith(
        'https://test.com/api/argocd/argoInstance/main/applications/name/demo/revisions/de1631a6d84f35d826235a933657baca77c2ca9c/metadata?sourceIndex=1',
        expect.objectContaining({
          headers: {
            'Content-Type': 'application/json',
            Authorization: `Bearer fake-jwt-token`,
          },
        }),
      );
    });
  });
});
