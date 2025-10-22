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
import { kubernetesApiRef } from '@backstage/plugin-kubernetes';
import {
  ReconcileRequestAnnotation,
  getRequest,
  pathForResource,
  requestSyncResource,
  syncRequest,
  syncResource,
} from './useSyncResource';
import { alertApiRef } from '@backstage/core-plugin-api';
import { HelmRelease } from '../objects';

describe('pathForResource', () => {
  it('returns the correct path', () => {
    const name = 'test-name';
    const namespace = 'test-namespace';
    const gvk = {
      group: 'test-group',
      apiVersion: 'test-api-version',
      plural: 'test-plural',
    };

    expect(pathForResource(name, namespace, gvk)).toEqual(
      '/apis/test-group/test-api-version/namespaces/test-namespace/test-plural/test-name',
    );
  });
});

describe('syncRequest', () => {
  it('returns the correct request', () => {
    const name = 'test-name';
    const namespace = 'test-namespace';
    const clusterName = 'test-cluster-name';
    const gvk = {
      group: 'test-group',
      apiVersion: 'test-api-version',
      plural: 'test-plural',
    };
    const now = 'test-now';

    const expected = {
      clusterName: 'test-cluster-name',
      init: {
        body: `{"metadata":{"annotations":{"reconcile.fluxcd.io/requestedAt":"test-now"}}}`,
        headers: {
          'Content-Type': 'application/merge-patch+json',
        },
        method: 'PATCH',
      },
      path: '/apis/test-group/test-api-version/namespaces/test-namespace/test-plural/test-name',
    };

    expect(syncRequest(name, namespace, clusterName, gvk, now)).toEqual(
      expected,
    );
  });
});

describe('getRequest', () => {
  it('returns the correct request', () => {
    const name = 'test-name';
    const namespace = 'test-namespace';
    const clusterName = 'test-cluster-name';
    const gvk = {
      group: 'test-group',
      apiVersion: 'test-api-version',
      plural: 'test-plural',
    };

    const expected = {
      clusterName: 'test-cluster-name',
      path: '/apis/test-group/test-api-version/namespaces/test-namespace/test-plural/test-name',
    };

    expect(getRequest(name, namespace, clusterName, gvk)).toEqual(expected);
  });
});

function makeMockKubernetesApi() {
  return {
    getObjectsByEntity: jest.fn(),
    getCluster: jest.fn(),
    getClusters: jest.fn(),
    getWorkloadsByEntity: jest.fn(),
    getCustomObjectsByEntity: jest.fn(),
    proxy: jest.fn(),
  } as jest.Mocked<typeof kubernetesApiRef.T>;
}

function makeMockAlertApi() {
  return {
    post: jest.fn(),
    alert$: jest.fn(),
  } as jest.Mocked<typeof alertApiRef.T>;
}

describe('requestSyncResource', () => {
  it('resolves to undefined if everything goes okay', async () => {
    const kubernetesApi = makeMockKubernetesApi();
    // mock values in a sequence, first time the api is called return a 200
    // second time return a response body with the new lastHandledReconcileAt

    // Make the request
    kubernetesApi.proxy.mockResolvedValueOnce({
      ok: true,
    } as Response);

    kubernetesApi.proxy.mockResolvedValueOnce({
      ok: true,
      json: () =>
        Promise.resolve({
          status: {
            lastHandledReconcileAt: 'test-old',
          },
        }),
    } as Response);

    kubernetesApi.proxy.mockResolvedValueOnce({
      ok: true,
      json: () =>
        Promise.resolve({
          status: {
            lastHandledReconcileAt: 'test-now',
          },
        }),
    } as Response);

    const gvk = {
      group: 'test-group',
      apiVersion: 'test-api-version',
      plural: 'test-plural',
    };

    await expect(
      requestSyncResource(
        kubernetesApi,
        'test-name',
        'test-namespace',
        'test-cluster-name',
        gvk,
        'test-now',
        0, // 0ms for the test
      ),
    ).resolves.toBeUndefined();
  });

  it('throws an error if k8s api responds with not ok response', async () => {
    const kubernetesApi = makeMockKubernetesApi();
    kubernetesApi.proxy.mockResolvedValue({
      ok: false,
      status: 500,
      statusText: 'Internal Server Error',
      json: () => Promise.resolve({}),
    } as Response);

    const gvk = {
      group: 'test-group',
      apiVersion: 'test-api-version',
      plural: 'test-plural',
    };

    await expect(
      requestSyncResource(
        kubernetesApi,
        'test-name',
        'test-namespace',
        'test-cluster-name',
        gvk,
        'test-now',
      ),
    ).rejects.toThrow('Failed to sync resource: 500 Internal Server Error');
  });
});

describe('syncResource', () => {
  const helmRelease = {
    type: 'HelmRelease',
    name: 'test-name',
    namespace: 'test-namespace',
    sourceRef: {
      kind: 'HelmRepository',
      name: 'test-source-name',
    },
    clusterName: 'test-clusterName',
  } as HelmRelease;

  it('should sync the source and resource', async () => {
    const kubernetesApi = makeMockKubernetesApi();
    const alertApi = makeMockAlertApi();

    const nows: string[] = [];
    kubernetesApi.proxy.mockImplementation(async ({ init }) => {
      // PATCH
      if (init?.method === 'PATCH') {
        const data = JSON.parse(init.body as string);
        nows.push(data.metadata.annotations[ReconcileRequestAnnotation]);
        return {
          ok: true,
        } as Response;
      }

      // otherwise return the poll response
      return {
        ok: true,
        json: () =>
          Promise.resolve({
            status: {
              lastHandledReconcileAt: nows[nows.length - 1],
            },
          }),
      } as Response;
    });

    await syncResource(helmRelease, kubernetesApi, alertApi);

    // Assert we tried to PATCH the source
    expect(kubernetesApi.proxy).toHaveBeenCalledWith({
      clusterName: 'test-clusterName',
      init: {
        body: `{"metadata":{"annotations":{"reconcile.fluxcd.io/requestedAt":"${nows[0]}"}}}`,
        headers: {
          'Content-Type': 'application/merge-patch+json',
        },
        method: 'PATCH',
      },
      path: '/apis/source.toolkit.fluxcd.io/v1beta2/namespaces/test-namespace/helmrepositories/test-source-name',
    });

    // ASSERT we tried to PATCH the resource
    expect(kubernetesApi.proxy).toHaveBeenCalledWith({
      clusterName: 'test-clusterName',
      init: {
        body: `{"metadata":{"annotations":{"reconcile.fluxcd.io/requestedAt":"${nows[1]}"}}}`,
        headers: {
          'Content-Type': 'application/merge-patch+json',
        },
        method: 'PATCH',
      },
      path: '/apis/helm.toolkit.fluxcd.io/v2beta1/namespaces/test-namespace/helmreleases/test-name',
    });

    expect(alertApi.post).toHaveBeenCalledWith({
      display: 'transient',
      message: 'Sync request successful',
      severity: 'success',
    });
  });

  it('should post an error if something goes wrong', async () => {
    const kubernetesApi = makeMockKubernetesApi();
    const alertApi = makeMockAlertApi();

    kubernetesApi.proxy.mockResolvedValue({
      ok: false,
      status: 403,
      statusText: 'Forbidden',
    } as Response);

    await syncResource(helmRelease, kubernetesApi, alertApi);

    expect(alertApi.post).toHaveBeenCalledWith({
      display: 'transient',
      message: 'Sync error: Failed to sync resource: 403 Forbidden',
      severity: 'error',
    });
  });

  it('should post an error if something goes wrong locally', async () => {
    const kubernetesApi = makeMockKubernetesApi();
    const alertApi = makeMockAlertApi();

    kubernetesApi.proxy.mockResolvedValue({
      ok: true,
      json: () => Promise.reject(new Error('bad json')),
    } as Response);

    await syncResource(helmRelease, kubernetesApi, alertApi);

    expect(alertApi.post).toHaveBeenCalledWith({
      display: 'transient',
      message: 'Sync error: bad json',
      severity: 'error',
    });
  });
});
