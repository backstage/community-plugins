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
import { mockServices } from '@backstage/backend-test-utils';

import { setupServer } from 'msw/node';

import { handlers } from '../../__fixtures__/handlers';
import { OcmConfig } from '../types';
import {
  getManagedCluster,
  getManagedClusterInfo,
  listManagedClusterInfos,
  listManagedClusters,
} from './kubernetes';

const server = setupServer(...handlers);

beforeAll(() => server.listen());
afterEach(() => server.restoreHandlers());
afterAll(() => server.close());

const kubeConfig = {
  clusters: [{ name: 'cluster', server: 'https://example.com' }],
  users: [{ name: 'user', password: 'password' }],
  contexts: [{ name: 'currentContext', cluster: 'cluster', user: 'user' }],
  currentContext: 'currentContext',
};

const getApi = async () => {
  const { KubeConfig, CustomObjectsApi } = await import(
    '@kubernetes/client-node'
  );
  const kc = new KubeConfig();
  kc.loadFromOptions(kubeConfig);
  return kc.makeApiClient(CustomObjectsApi);
};

const FIXTURES_DIR = `${__dirname}/../../__fixtures__`;
const logger = mockServices.logger.mock();

const mockKubeConfig = {
  loadFromOptions: jest.fn(),
  loadFromDefault: jest.fn(),
  makeApiClient: jest.fn(),
};

describe('kubernetes.ts', () => {
  beforeEach(() => {
    jest.resetModules();
  });

  describe('getManagedClusters', () => {
    it('should return some clusters', async () => {
      const api = await getApi();
      const result: any = await listManagedClusters(api);
      expect(result.items[0].metadata.name).toBe('local-cluster');
      expect(result.items[1].metadata.name).toBe('cluster1');
    });
  });

  describe('getManagedCluster', () => {
    it('should return the correct cluster', async () => {
      const result: any = await getManagedCluster(await getApi(), 'cluster1');

      expect(result.metadata.name).toBe('cluster1');
    });

    it('should return an error object when cluster is not found', async () => {
      const result = await getManagedCluster(
        await getApi(),
        'non_existent_cluster',
      ).catch(r => r);

      expect(result.statusCode).toBe(404);
      expect(result.name).toBe('NotFound');
    });
  });

  describe('getManagedClusterInfo', () => {
    it('should return cluster', async () => {
      const result: any = await getManagedClusterInfo(
        await getApi(),
        'local-cluster',
      );
      expect(result.metadata.name).toBe('local-cluster');
    });
  });

  describe('getManagedClusterInfos', () => {
    it('should return some cluster infos', async () => {
      const result: any = await listManagedClusterInfos(await getApi());
      expect(result.items[0].metadata.name).toBe('local-cluster');
      expect(result.items[1].metadata.name).toBe('cluster1');
    });
  });

  describe('hubApiClient', () => {
    beforeAll(() => {
      // @ts-ignore
      jest.unstable_mockModule('@kubernetes/client-node', () => {
        return {
          KubeConfig: jest.fn().mockImplementation(() => mockKubeConfig),
        };
      });
    });

    it('should use the default config if there is no service account token configured', async () => {
      process.env.KUBECONFIG = `${FIXTURES_DIR}/kubeconfig.yaml`;
      const clusterConfig = {
        id: 'foo',
        hubResourceName: 'cluster1',
      } as OcmConfig;

      // use require here to ensure the mock is used. It doesn't work with direct import
      const { hubApiClient } = require('./kubernetes');

      await hubApiClient(clusterConfig, logger);

      expect(mockKubeConfig.loadFromDefault).toHaveBeenCalled();
      expect(mockKubeConfig.makeApiClient).toHaveBeenCalled();
    });

    it('should use the provided config in the returned api client', async () => {
      const clusterConfig = {
        id: 'foo',
        hubResourceName: 'cluster1',
        serviceAccountToken: 'TOKEN',
        url: 'http://cluster.com',
      } as OcmConfig;

      // use require here to ensure the mock is used. It doesn't work with direct import
      const { hubApiClient } = require('./kubernetes');

      await hubApiClient(clusterConfig, logger);

      expect(mockKubeConfig.makeApiClient).toHaveBeenCalled();
      expect(mockKubeConfig.loadFromOptions).toHaveBeenCalledWith({
        clusters: [
          {
            server: 'http://cluster.com',
            name: 'cluster1',
            skipTLSVerify: undefined,
            caData: undefined,
          },
        ],
        users: [{ name: 'backstage', token: 'TOKEN' }],
        contexts: [
          { cluster: 'cluster1', name: 'cluster1', user: 'backstage' },
        ],
        currentContext: 'cluster1',
      });
    });
  });
});
