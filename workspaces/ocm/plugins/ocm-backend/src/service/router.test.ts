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
import { mockServices, startTestBackend } from '@backstage/backend-test-utils';
import { AuthorizeResult } from '@backstage/plugin-permission-common';

import { setupServer } from 'msw/node';
import request from 'supertest';

import { handlers } from '../../__fixtures__/handlers';
import { ocmPlugin } from './router';

const server = setupServer(...handlers);

beforeAll(() =>
  server.listen({
    /*
     *  This is required so that msw doesn't throw
     *  warnings when the backend is requesting an endpoint
     */
    onUnhandledRequest: 'bypass',
  }),
);
afterEach(() => server.restoreHandlers());
afterAll(() => server.close());

const config = mockServices.rootConfig.factory({
  data: {
    catalog: {
      providers: {
        ocm: {
          foo: {
            name: 'thisishub',
            url: 'https://example.com',
            serviceAccountToken: 'TOKEN',
          },
        },
      },
    },
  },
});

describe('GET /status', () => {
  it('should deny access when getting all clusters', async () => {
    const backend = await startTestBackend({
      features: [
        ocmPlugin,
        config,
        mockServices.permissions.mock({
          authorize: async () => [{ result: AuthorizeResult.DENY }],
        }).factory,
      ],
    });

    const result = await request(backend.server).get('/api/ocm/status');

    expect(result.statusCode).toBe(403);
    expect(result.body.error).toEqual({
      name: 'NotAllowedError',
      message: 'Unauthorized',
    });
  });
  it('should get all clusters', async () => {
    const backend = await startTestBackend({
      features: [ocmPlugin, config],
    });

    const result = await request(backend.server).get('/api/ocm/status');

    expect(result.status).toBe(200);
    expect(result.body).toEqual([
      {
        name: 'thisishub',
        status: {
          available: true,
          reason: 'Managed cluster is available',
        },
        nodes: [
          {
            status: 'True',
            type: 'Ready',
          },
          {
            status: 'True',
            type: 'Ready',
          },
          {
            status: 'True',
            type: 'Ready',
          },
        ],
        openshiftVersion: '4.10.26',
        platform: 'BareMetal',
        update: {
          available: true,
          url: 'https://access.redhat.com/errata/RHSA-2023:0561',
          version: '4.10.51',
        },
      },
      {
        name: 'cluster1',
        status: {
          available: true,
          reason: 'Managed cluster is available',
        },
        nodes: [
          {
            status: 'True',
            type: 'Ready',
          },
          {
            status: 'True',
            type: 'Ready',
          },
          {
            status: 'True',
            type: 'Ready',
          },
          {
            status: 'True',
            type: 'Ready',
          },
          {
            status: 'True',
            type: 'Ready',
          },
          {
            status: 'True',
            type: 'Ready',
          },
          {
            status: 'True',
            type: 'Ready',
          },
        ],
        openshiftVersion: '4.9.21',
        platform: 'BareMetal',
        update: {
          available: true,
          url: 'https://access.redhat.com/errata/RHSA-2023:0561',
          version: '4.10.51',
        },
      },
      {
        name: 'offline-cluster',
        status: {
          available: false,
          reason: 'Managed cluster is unavailable',
        },
        nodes: [
          {
            status: 'Unknown',
            type: 'Ready',
          },
          {
            status: 'True',
            type: 'Ready',
          },
          {
            status: 'Unknown',
            type: 'Ready',
          },
          {
            status: 'True',
            type: 'Ready',
          },
          {
            status: 'True',
            type: 'Ready',
          },
          {
            status: 'True',
            type: 'Ready',
          },
          {
            status: 'True',
            type: 'Ready',
          },
        ],
        openshiftVersion: '4.9.21',
        platform: 'BareMetal',
        update: {
          available: true,
          url: 'https://access.redhat.com/errata/RHSA-2023:0561',
          version: '4.10.51',
        },
      },
    ]);
  });
});

describe('GET /status/:hubName/:clusterName', () => {
  it('should deny access when getting all clusters', async () => {
    const backend = await startTestBackend({
      features: [
        ocmPlugin,
        config,
        mockServices.permissions.mock({
          authorize: async () => [{ result: AuthorizeResult.DENY }],
        }).factory,
      ],
    });

    const result = await request(backend.server).get(
      '/api/ocm/status/foo/cluster1',
    );

    expect(result.statusCode).toBe(403);
    expect(result.body.error).toEqual({
      name: 'NotAllowedError',
      message: 'Unauthorized',
    });
  });
  it('should correctly parse a cluster', async () => {
    const backend = await startTestBackend({
      features: [ocmPlugin, config],
    });

    const result = await request(backend.server).get(
      '/api/ocm/status/foo/cluster1',
    );

    expect(result.status).toBe(200);
    expect(result.body).toEqual({
      allocatableResources: {
        cpuCores: 1136.5,
        memorySize: '7469511796Ki',
        numberOfPods: 7750,
      },
      availableResources: {
        cpuCores: 1152,
        memorySize: '7505192052Ki',
        numberOfPods: 7750,
      },
      consoleUrl: 'https://console-openshift-console.apps.cluster1.bar.baz',
      kubernetesVersion: 'v1.22.3+fdba464',
      name: 'cluster1',
      oauthUrl:
        'https://oauth-openshift.apps.cluster1.bar.baz/oauth/token/implicit',
      openshiftId: '5d448ae7-05f1-42cc-aacc-3122a8ad0184',
      openshiftVersion: '4.9.21',
      platform: 'BareMetal',
      region: '',
      status: {
        available: true,
        reason: 'Managed cluster is available',
      },
      update: {
        available: true,
        url: 'https://access.redhat.com/errata/RHSA-2023:0561',
        version: '4.10.51',
      },
    });
  });
  it('should normalize the cluster name if the queried cluster is the hub', async () => {
    const backend = await startTestBackend({
      features: [ocmPlugin, config],
    });

    const result = await request(backend.server).get(
      '/api/ocm/status/foo/thisishub',
    );

    expect(result.status).toBe(200);
    expect(result.body).toEqual({
      allocatableResources: {
        cpuCores: 94.5,
        memorySize: '524485752Ki',
        numberOfPods: 750,
      },
      availableResources: {
        cpuCores: 96,
        memorySize: '527938680Ki',
        numberOfPods: 750,
      },
      consoleUrl: 'https://console-openshift-console.apps.foo.bar.baz',
      kubernetesVersion: 'v1.23.5+012e945',
      name: 'thisishub',
      oauthUrl: 'https://oauth-openshift.apps.foo.bar.baz/oauth/token/implicit',
      openshiftId: '91976abd-8b8e-47b9-82d3-e84793396ed7',
      openshiftVersion: '4.10.26',
      platform: 'BareMetal',
      region: '',
      status: {
        available: true,
        reason: 'Managed cluster is available',
      },
      update: {
        available: true,
        url: 'https://access.redhat.com/errata/RHSA-2023:0561',
        version: '4.10.51',
      },
    });
  });
  it('should correctly parse an error while querying for non existent cluster', async () => {
    const backend = await startTestBackend({
      features: [ocmPlugin, config],
    });

    const result = await request(backend.server).get(
      '/api/ocm/status/foo/non_existent_cluster',
    );

    expect(result.status).toBe(404);
    expect(result.body).toEqual({
      error: {
        name: 'NotFound',
        message:
          'managedclusters.cluster.open-cluster-management.io "non_existent_cluster" not found',
        statusCode: 404,
        kind: 'Status',
        apiVersion: 'v1',
        metadata: {},
        status: 'Failure',
        reason: 'NotFound',
        details: {
          name: 'non_existent_cluster',
          group: 'cluster.open-cluster-management.io',
          kind: 'managedclusters',
        },
        code: 404,
      },
      request: { method: 'GET', url: '/status/foo/non_existent_cluster' },
      response: { statusCode: 404 },
    });
  });
});
