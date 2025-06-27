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
  getRequest,
  pathForResource,
  requestToggleSuspendResource,
  toggleSuspendRequest,
  toggleSuspendResource,
} from './useToggleSuspendResource';
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

describe('toggleSuspendRequest', () => {
  it('returns the correct request', () => {
    const name = 'test-name';
    const namespace = 'test-namespace';
    const clusterName = 'test-cluster-name';
    const gvk = {
      group: 'test-group',
      apiVersion: 'test-api-version',
      plural: 'test-plural',
    };
    const suspend = false;
    const expected = {
      clusterName: 'test-cluster-name',
      init: {
        body: `{"spec":{"suspend":false}}`,
        headers: {
          'Content-Type': 'application/merge-patch+json',
        },
        method: 'PATCH',
      },
      path: '/apis/test-group/test-api-version/namespaces/test-namespace/test-plural/test-name',
    };

    expect(
      toggleSuspendRequest(name, namespace, clusterName, gvk, suspend),
    ).toEqual(expected);
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

describe('requestToggleSuspendResource', () => {
  it('resolves to undefined if everything goes okay', async () => {
    const kubernetesApi = makeMockKubernetesApi();
    // mock values in a sequence, first time the api is called return a 200

    // Make the request
    kubernetesApi.proxy.mockResolvedValueOnce({
      ok: true,
    } as Response);

    const gvk = {
      group: 'test-group',
      apiVersion: 'test-api-version',
      plural: 'test-plural',
    };

    await expect(
      requestToggleSuspendResource(
        kubernetesApi,
        'test-name',
        'test-namespace',
        'test-cluster-name',
        gvk,
        false,
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
      requestToggleSuspendResource(
        kubernetesApi,
        'test-name',
        'test-namespace',
        'test-cluster-name',
        gvk,
        false,
      ),
    ).rejects.toThrow('Failed to Resume resource: 500 Internal Server Error');
  });
});

describe('toggleSuspendResource', () => {
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

  it('should Suspend resource', async () => {
    const kubernetesApi = makeMockKubernetesApi();
    const alertApi = makeMockAlertApi();
    kubernetesApi.proxy.mockResolvedValue({
      ok: true,
      status: 200,
    } as Response);

    await toggleSuspendResource(helmRelease, kubernetesApi, alertApi, false);

    // ASSERT we tried to PATCH the resource
    expect(kubernetesApi.proxy).toHaveBeenCalledWith({
      clusterName: 'test-clusterName',
      init: {
        body: `{"spec":{"suspend":false}}`,
        headers: {
          'Content-Type': 'application/merge-patch+json',
        },
        method: 'PATCH',
      },
      path: '/apis/helm.toolkit.fluxcd.io/v2beta1/namespaces/test-namespace/helmreleases/test-name',
    });

    expect(alertApi.post).toHaveBeenCalledWith({
      display: 'transient',
      message: 'Resume request successful',
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

    await toggleSuspendResource(helmRelease, kubernetesApi, alertApi, false);

    expect(alertApi.post).toHaveBeenCalledWith({
      display: 'transient',
      message: 'Resume error: Failed to Resume resource: 403 Forbidden',
      severity: 'error',
    });
  });
});
