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
import { ConfigReader } from '@backstage/config';

import {
  deferToKubernetesPlugin,
  getHubClusterFromConfig,
  getHubClusterFromKubernetesConfig,
  getHubClusterFromOcmConfig,
} from './config';

describe('deferToKubernetesPlugin', () => {
  it('should use kubernetes plugin definition if both are present', () => {
    const config = new ConfigReader({
      kubernetesPluginRef: 'foo',
      url: 'bar',
    });

    const result = deferToKubernetesPlugin(config);

    expect(result).toEqual(true);
  });

  it.each([
    [
      {
        kubernetesPluginRef: 'foo',
      },
      true,
    ],
    [
      {
        kubernetesPluginRef: 'foo',
        url: 'bar',
        name: 'baz',
      },
      true,
    ],
    [
      {
        url: 'bar',
        name: 'baz',
      },
      false,
    ],
  ])('should return %s for %o', (input, expected) => {
    const config = new ConfigReader(input);
    const result = deferToKubernetesPlugin(config);

    expect(result).toEqual(expected);
  });
});

describe('getHubClusterFromKubernetesConfig', () => {
  it('should get the correct hub cluster from multiple configured clusters', () => {
    const globalConfig = new ConfigReader({
      kubernetes: {
        clusterLocatorMethods: [
          {
            type: 'config',
            clusters: [
              {
                name: 'cluster1',
              },
              {
                name: 'cluster2',
                url: 'http://example.com',
                authProvider: 'serviceAccount',
              },
              {
                name: 'cluster3',
              },
            ],
          },
        ],
      },
    });
    const ocmConfig = new ConfigReader({
      kubernetesPluginRef: 'cluster2',
    });

    const result = getHubClusterFromKubernetesConfig(
      'foo',
      ocmConfig,
      globalConfig,
    );

    expect(result.getString('name')).toEqual('cluster2');
    expect(result.getString('url')).toEqual('http://example.com');
  });

  it('should throw if authProvider is not serviceAccount', () => {
    const globalConfig = new ConfigReader({
      kubernetes: {
        clusterLocatorMethods: [
          {
            type: 'config',
            clusters: [
              {
                name: 'cluster2',
                url: 'http://example.com',
                authProvider: 'oidc',
              },
            ],
          },
        ],
      },
    });
    const ocmConfig = new ConfigReader({
      kubernetesPluginRef: 'cluster2',
    });

    const result = () =>
      getHubClusterFromKubernetesConfig('foo', ocmConfig, globalConfig);
    expect(result).toThrow(
      "Hub cluster catalog.providers.ocm.foo.kubernetesPluginRef=cluster2 has to authenticate via 'serviceAccount'",
    );
  });

  it('should throw an error when the hub cluster is not found in kubernetes config', () => {
    const globalConfig = new ConfigReader({
      kubernetes: {
        clusterLocatorMethods: [
          {
            type: 'config',
            clusters: [
              {
                name: 'cluster4',
              },
            ],
          },
        ],
      },
    });
    const ocmConfig = new ConfigReader({
      kubernetesPluginRef: 'cluster2',
    });

    const result = () =>
      getHubClusterFromKubernetesConfig('foo', ocmConfig, globalConfig);

    expect(result).toThrow(
      'Hub cluster catalog.providers.ocm.foo.kubernetesPluginRef=cluster2 not defined in kubernetes in kubernetes.clusterLocatorMethods.clusters',
    );
  });

  it('should throw an error when there are no cluster configured', () => {
    const globalConfig = new ConfigReader({
      kubernetes: {
        clusterLocatorMethods: [
          {
            type: 'config',
          },
        ],
      },
    });
    const ocmConfig = new ConfigReader({
      kubernetesPluginRef: 'cluster2',
    });

    const result = () => {
      getHubClusterFromKubernetesConfig('foo', ocmConfig, globalConfig);
    };

    expect(result).toThrow(
      'Hub cluster catalog.providers.ocm.foo.kubernetesPluginRef=cluster2 not defined in kubernetes in kubernetes.clusterLocatorMethods.clusters',
    );
  });

  it('should throw an error when there is no kubernetes config', () => {
    const globalConfig = new ConfigReader({});
    const ocmConfig = new ConfigReader({
      kubernetesPluginRef: 'cluster2',
    });
    const result = () =>
      getHubClusterFromKubernetesConfig('foo', ocmConfig, globalConfig);

    expect(result).toThrow(
      "Missing required config value at 'kubernetes.clusterLocatorMethods'",
    );
  });

  it('should throw an error when there is no ocm cluster name configured', () => {
    const globalConfig = new ConfigReader({
      kubernetes: {
        clusterLocatorMethods: [
          {
            type: 'config',
          },
        ],
      },
    });
    const ocmConfig = new ConfigReader({
      kubernetesPluginRef: {
        key: 'value',
      },
    });

    const result = () =>
      getHubClusterFromKubernetesConfig('foo', ocmConfig, globalConfig);

    expect(result).toThrow(
      "Invalid type in config for key 'kubernetesPluginRef' in 'mock-config', got object, wanted string",
    );
  });
});

describe('getHubClusterFromOcmConfig', () => {
  it('should correctly return an ocm hub config', () => {
    const config = new ConfigReader({
      name: 'cluster2',
      url: 'http://example.com',
    });

    const result = getHubClusterFromOcmConfig('foo', config);

    expect(result.getString('name')).toEqual('cluster2');
    expect(result.getString('url')).toEqual('http://example.com');
  });

  it("should throw an error when url isn't specified in the hub config", () => {
    const config = new ConfigReader({
      name: 'cluster2',
    });

    const result = () => getHubClusterFromOcmConfig('foo', config);

    expect(result).toThrow(
      `Value must be specified in config at 'catalog.providers.ocm.foo.url'`,
    );
  });

  it("should throw an error when name isn't specified in the hub config", () => {
    const config = new ConfigReader({
      url: 'http://example.com',
    });

    const result = () => getHubClusterFromOcmConfig('foo', config);

    expect(result).toThrow(
      `Value must be specified in config at 'catalog.providers.ocm.foo.name'`,
    );
  });
});

describe('getHubClusterFromConfig', () => {
  it('should correctly parse the ocm hub from the ocm config', () => {
    const ocmConfig = {
      name: 'foo',
      url: 'http://example.com',
      owner: 'bar',
    };

    const config = new ConfigReader(ocmConfig);
    const globalConfig = new ConfigReader({
      catalog: {
        providers: {
          ocm: {
            env: ocmConfig,
          },
        },
      },
    });

    const result = getHubClusterFromConfig('env', config, globalConfig);

    expect(result.hubResourceName).toEqual('foo');
    expect(result.url).toEqual('http://example.com');
    expect(result.owner).toEqual('bar');
  });

  it('should correctly parse the ocm hub from the config while using kubernetes ref', () => {
    const ocmConfig = {
      kubernetesPluginRef: 'cluster1',
      owner: 'foo',
    };
    const globalConfig = new ConfigReader({
      kubernetes: {
        clusterLocatorMethods: [
          {
            type: 'config',
            clusters: [
              {
                name: 'cluster1',
                url: 'http://example.com',
                authProvider: 'serviceAccount',
              },
            ],
          },
        ],
      },
      catalog: {
        providers: {
          ocm: {
            env: ocmConfig,
          },
        },
      },
    });
    const config = new ConfigReader(ocmConfig);

    const result = getHubClusterFromConfig('env', config, globalConfig);

    expect(result.hubResourceName).toEqual('cluster1');
    expect(result.url).toEqual('http://example.com');
    expect(result.owner).toEqual('foo');
  });

  it('should throw an error if the url is not valid while using ocm config', () => {
    const ocmConfig = {
      name: 'foo',
      url: 'bar',
    };

    const config = new ConfigReader(ocmConfig);
    const globalConfig = new ConfigReader({
      catalog: {
        providers: {
          ocm: {
            env: ocmConfig,
          },
        },
      },
    });

    const result = () => getHubClusterFromConfig('env', config, globalConfig);

    expect(result).toThrow('"bar" is not a valid url');
  });

  it('should throw an error if the url is not valid while using kubernetes ref', () => {
    const ocmConfig = {
      kubernetesPluginRef: 'cluster1',
    };
    const globalConfig = new ConfigReader({
      kubernetes: {
        clusterLocatorMethods: [
          {
            type: 'config',
            clusters: [
              {
                name: 'cluster1',
                url: 'bar',
                authProvider: 'serviceAccount',
              },
            ],
          },
        ],
      },
      catalog: {
        providers: {
          ocm: {
            env: ocmConfig,
          },
        },
      },
    });
    const config = new ConfigReader(ocmConfig);

    const result = () => getHubClusterFromConfig('env', config, globalConfig);

    expect(result).toThrow('"bar" is not a valid url');
  });

  it('should fallback to the default owner if no owner is configured', () => {
    const ocmConfig = {
      name: 'foo',
      url: 'http://example.com',
    };

    const config = new ConfigReader(ocmConfig);
    const globalConfig = new ConfigReader({
      catalog: {
        providers: {
          ocm: {
            env: ocmConfig,
          },
        },
      },
    });

    const result = getHubClusterFromConfig('env', config, globalConfig);

    expect(result.owner).toEqual('unknown');
  });
});
