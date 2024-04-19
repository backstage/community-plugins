/*
 * Copyright 2021 The Backstage Authors
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

import { CatalogApi } from '@backstage/catalog-client';
import { Entity, CompoundEntityRef } from '@backstage/catalog-model';
import { ConfigReader } from '@backstage/config';
import {
  DefaultJenkinsInfoProvider,
  JenkinsConfig,
  JenkinsInfo,
} from './jenkinsInfoProvider';
import { mockServices } from '@backstage/backend-test-utils';

describe('JenkinsConfig', () => {
  it('Reads simple config and annotation', async () => {
    const config = JenkinsConfig.fromConfig(
      new ConfigReader({
        jenkins: {
          baseUrl: 'https://jenkins.example.com',
          username: 'backstage - bot',
          apiKey: '123456789abcdef0123456789abcedf012',
        },
      }),
    );

    expect(config.instances).toEqual([
      {
        name: 'default',
        baseUrl: 'https://jenkins.example.com',
        username: 'backstage - bot',
        apiKey: '123456789abcdef0123456789abcedf012',
      },
    ]);
  });

  it('Reads named default config and annotation', async () => {
    const config = JenkinsConfig.fromConfig(
      new ConfigReader({
        jenkins: {
          instances: [
            {
              name: 'default',
              baseUrl: 'https://jenkins.example.com',
              username: 'backstage - bot',
              apiKey: '123456789abcdef0123456789abcedf012',
              extraRequestHeaders: {
                myHeader: 'my-value',
              },
            },
          ],
        },
      }),
    );

    expect(config.instances).toEqual([
      {
        name: 'default',
        baseUrl: 'https://jenkins.example.com',
        username: 'backstage - bot',
        apiKey: '123456789abcdef0123456789abcedf012',
        extraRequestHeaders: {
          myHeader: 'my-value',
        },
      },
    ]);
  });

  it('Parses named default config (amongst named other configs)', async () => {
    const config = JenkinsConfig.fromConfig(
      new ConfigReader({
        jenkins: {
          instances: [
            {
              name: 'default',
              baseUrl: 'https://jenkins.example.com',
              username: 'backstage - bot',
              apiKey: '123456789abcdef0123456789abcedf012',
            },
            {
              name: 'other',
              baseUrl: 'https://jenkins-other.example.com',
              username: 'backstage - bot',
              apiKey: '123456789abcdef0123456789abcedf012',
            },
          ],
        },
      }),
    );

    expect(config.instances).toEqual([
      {
        name: 'default',
        baseUrl: 'https://jenkins.example.com',
        username: 'backstage - bot',
        apiKey: '123456789abcdef0123456789abcedf012',
      },
      {
        name: 'other',
        baseUrl: 'https://jenkins-other.example.com',
        username: 'backstage - bot',
        apiKey: '123456789abcdef0123456789abcedf012',
      },
    ]);
  });

  it('Gets default Jenkins instance', async () => {
    const config = new JenkinsConfig([
      {
        name: 'default',
        baseUrl: 'https://jenkins.example.com',
        username: 'backstage - bot',
        apiKey: '123456789abcdef0123456789abcedf012',
      },
      {
        name: 'other',
        baseUrl: 'https://jenkins-other.example.com',
        username: 'backstage - bot',
        apiKey: '123456789abcdef0123456789abcedf012',
      },
    ]);

    expect(config.getInstanceConfig()).toEqual({
      name: 'default',
      baseUrl: 'https://jenkins.example.com',
      username: 'backstage - bot',
      apiKey: '123456789abcdef0123456789abcedf012',
    });
  });

  it('Gets named Jenkins instance', async () => {
    const config = new JenkinsConfig([
      {
        name: 'default',
        baseUrl: 'https://jenkins.example.com',
        username: 'backstage - bot',
        apiKey: '123456789abcdef0123456789abcedf012',
      },
      {
        name: 'other',
        baseUrl: 'https://jenkins-other.example.com',
        username: 'backstage - bot',
        apiKey: '123456789abcdef0123456789abcedf012',
      },
    ]);

    expect(config.getInstanceConfig('other')).toEqual({
      name: 'other',
      baseUrl: 'https://jenkins-other.example.com',
      username: 'backstage - bot',
      apiKey: '123456789abcdef0123456789abcedf012',
    });
  });
});

describe('DefaultJenkinsInfoProvider', () => {
  const mockCatalog: jest.Mocked<CatalogApi> = {
    getEntityByRef: jest.fn(),
  } as any as jest.Mocked<CatalogApi>;

  const entityRef: CompoundEntityRef = {
    kind: 'Component',
    namespace: 'foo',
    name: 'bar',
  };

  function configureProvider(configData: any, entityData: any) {
    const config = new ConfigReader(configData);
    mockCatalog.getEntityByRef.mockReturnValueOnce(
      Promise.resolve(entityData as Entity),
    );

    return DefaultJenkinsInfoProvider.fromConfig({
      config,
      catalog: mockCatalog,
      discovery: mockServices.discovery(),
      auth: mockServices.auth(),
    });
  }

  it('Handles entity not found', async () => {
    const provider = configureProvider({ jenkins: {} }, undefined);
    await expect(provider.getInstance({ entityRef })).rejects.toThrow();

    expect(mockCatalog.getEntityByRef).toHaveBeenCalledWith(
      entityRef,
      undefined,
    );
  });

  it('Reads simple config and annotation', async () => {
    const provider = configureProvider(
      {
        jenkins: {
          baseUrl: 'https://jenkins.example.com',
          username: 'backstage - bot',
          apiKey: '123456789abcdef0123456789abcedf012',
          extraRequestHeaders: {
            ['extra-header']: 'extra-value',
          },
        },
      },
      {
        metadata: {
          annotations: {
            'jenkins.io/job-full-name': 'teamA/artistLookup-build',
          },
        },
      },
    );
    const info: JenkinsInfo = await provider.getInstance({ entityRef });

    expect(mockCatalog.getEntityByRef).toHaveBeenCalledWith(
      entityRef,
      undefined,
    );
    expect(info).toStrictEqual({
      baseUrl: 'https://jenkins.example.com',
      crumbIssuer: undefined,
      headers: {
        Authorization:
          'Basic YmFja3N0YWdlIC0gYm90OjEyMzQ1Njc4OWFiY2RlZjAxMjM0NTY3ODlhYmNlZGYwMTI=',
        'extra-header': 'extra-value',
      },
      jobFullName: 'teamA/artistLookup-build',
    });
  });

  it('Reads named default config and annotation', async () => {
    const provider = configureProvider(
      {
        jenkins: {
          instances: [
            {
              name: 'default',
              baseUrl: 'https://jenkins.example.com',
              username: 'backstage - bot',
              apiKey: '123456789abcdef0123456789abcedf012',
            },
          ],
        },
      },
      {
        metadata: {
          annotations: {
            'jenkins.io/job-full-name': 'teamA/artistLookup-build',
          },
        },
      },
    );
    const info: JenkinsInfo = await provider.getInstance({ entityRef });

    expect(mockCatalog.getEntityByRef).toHaveBeenCalledWith(
      entityRef,
      undefined,
    );
    expect(info).toMatchObject({
      baseUrl: 'https://jenkins.example.com',
      jobFullName: 'teamA/artistLookup-build',
    });
  });

  it('Reads named default config (amongst named other configs) and annotation', async () => {
    const provider = configureProvider(
      {
        jenkins: {
          instances: [
            {
              name: 'default',
              baseUrl: 'https://jenkins.example.com',
              username: 'backstage - bot',
              apiKey: '123456789abcdef0123456789abcedf012',
            },
            {
              name: 'other',
              baseUrl: 'https://jenkins-other.example.com',
              username: 'backstage - bot',
              apiKey: '123456789abcdef0123456789abcedf012',
            },
          ],
        },
      },
      {
        metadata: {
          annotations: {
            'jenkins.io/job-full-name': 'teamA/artistLookup-build',
          },
        },
      },
    );
    const info: JenkinsInfo = await provider.getInstance({ entityRef });

    expect(mockCatalog.getEntityByRef).toHaveBeenCalledWith(
      entityRef,
      undefined,
    );
    expect(info).toMatchObject({
      baseUrl: 'https://jenkins.example.com',
      jobFullName: 'teamA/artistLookup-build',
    });
  });

  it('Reads named other config and named annotation', async () => {
    const provider = configureProvider(
      {
        jenkins: {
          instances: [
            {
              name: 'default',
              baseUrl: 'https://jenkins.example.com',
              username: 'backstage - bot',
              apiKey: '123456789abcdef0123456789abcedf012',
            },
            {
              name: 'other',
              baseUrl: 'https://jenkins-other.example.com',
              username: 'backstage - bot',
              apiKey: '123456789abcdef0123456789abcedf012',
            },
          ],
        },
      },
      {
        metadata: {
          annotations: {
            'jenkins.io/job-full-name': 'other:teamA/artistLookup-build',
          },
        },
      },
    );
    const info: JenkinsInfo = await provider.getInstance({ entityRef });

    expect(mockCatalog.getEntityByRef).toHaveBeenCalledWith(
      entityRef,
      undefined,
    );
    expect(info).toMatchObject({
      baseUrl: 'https://jenkins-other.example.com',
      jobFullName: 'teamA/artistLookup-build',
    });
  });

  it('Reads simple config and default named annotation', async () => {
    const provider = configureProvider(
      {
        jenkins: {
          baseUrl: 'https://jenkins.example.com',
          username: 'backstage - bot',
          apiKey: '123456789abcdef0123456789abcedf012',
        },
      },
      {
        metadata: {
          annotations: {
            'jenkins.io/job-full-name': 'default:teamA/artistLookup-build',
          },
        },
      },
    );
    const info: JenkinsInfo = await provider.getInstance({ entityRef });

    expect(mockCatalog.getEntityByRef).toHaveBeenCalledWith(
      entityRef,
      undefined,
    );
    expect(info).toMatchObject({
      baseUrl: 'https://jenkins.example.com',
      jobFullName: 'teamA/artistLookup-build',
    });
  });

  it('Reads simple config and old annotation', async () => {
    const provider = configureProvider(
      {
        jenkins: {
          baseUrl: 'https://jenkins.example.com',
          username: 'backstage - bot',
          apiKey: '123456789abcdef0123456789abcedf012',
        },
      },
      {
        metadata: {
          annotations: {
            'jenkins.io/github-folder': 'teamA/artistLookup-build',
          },
        },
      },
    );
    const info: JenkinsInfo = await provider.getInstance({ entityRef });

    expect(mockCatalog.getEntityByRef).toHaveBeenCalledWith(
      entityRef,
      undefined,
    );
    expect(info).toMatchObject({
      baseUrl: 'https://jenkins.example.com',
      jobFullName: 'teamA/artistLookup-build',
    });
  });

  it('Reads named other config (with on default config) and named annotation', async () => {
    const provider = configureProvider(
      {
        jenkins: {
          instances: [
            {
              name: 'other',
              baseUrl: 'https://jenkins-other.example.com',
              username: 'backstage - bot',
              apiKey: '123456789abcdef0123456789abcedf012',
            },
          ],
        },
      },
      {
        metadata: {
          annotations: {
            'jenkins.io/job-full-name': 'other:teamA/artistLookup-build',
          },
        },
      },
    );
    const info: JenkinsInfo = await provider.getInstance({ entityRef });

    expect(mockCatalog.getEntityByRef).toHaveBeenCalledWith(
      entityRef,
      undefined,
    );
    expect(info).toMatchObject({
      baseUrl: 'https://jenkins-other.example.com',
      jobFullName: 'teamA/artistLookup-build',
    });
  });
});
