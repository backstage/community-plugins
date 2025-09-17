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
import type { CatalogClient } from '@backstage/catalog-client';
import { createMockActionContext } from '@backstage/plugin-scaffolder-node-test-utils';

import type { V1Namespace } from '@kubernetes/client-node';
import { rest } from 'msw';
import { setupServer } from 'msw/node';

import {
  convertLabelsToObject,
  createKubernetesNamespaceAction,
} from './createKubernetesNamespace';

const LOCAL_ADDR = 'https://kube-api:5000';
const FIXTURES_DIR = `${__dirname}/../../__fixtures__/cluster-entities`;

const handlers = [
  rest.post(`${LOCAL_ADDR}/api/v1/namespaces`, async (req, res, ctx) => {
    const ns = (await req.json()) as V1Namespace;
    if (ns.metadata?.name === 'error') {
      const error = {
        body: {
          kind: 'Status',
          apiVersion: 'v1',
          metadata: {},
          status: 'Failure',
          message: 'Unauthorized',
          reason: 'Unauthorized',
          code: 401,
        },
        statusCode: 401,
        message: 'Unauthorized',
      };
      return res(ctx.status(401), ctx.json(error));
    }
    return res(ctx.status(200), ctx.json({}));
  }),
];

const server = setupServer(...handlers);

beforeAll(() => server.listen());
afterEach(() => server.restoreHandlers());
afterAll(() => server.close());

describe('kubernetes:create-namespace', () => {
  afterEach(() => {
    jest.clearAllMocks();
  });

  const catalogClientFn = jest.fn(async (entityRef: string) => {
    switch (entityRef) {
      case 'resource:foo':
        return require(`${FIXTURES_DIR}/foo`);
      case 'resource:bar':
        return require(`${FIXTURES_DIR}/bar`);
      case 'resource:qux':
        return require(`${FIXTURES_DIR}/qux`);
      default:
        return undefined;
    }
  });

  const action = createKubernetesNamespaceAction({
    getEntityByRef: catalogClientFn,
  } as unknown as CatalogClient);

  const mockContext = createMockActionContext();

  it('should get the api url from the correct entity', async () => {
    await action.handler({
      ...mockContext,
      input: {
        namespace: 'foo',
        clusterRef: 'resource:foo',
        token: 'TOKEN',
        skipTLSVerify: false,
      },
    });

    expect(catalogClientFn).toHaveBeenCalledTimes(1);
    expect(catalogClientFn).toHaveBeenCalledWith('resource:foo');
  });

  it.each([
    {
      entityName: 'foo',
      calledWith: 'resource:foo',
      warnMsg: 'Cluster reference in the wrong format, attempting to fix it',
      name: 'should warn and try to fix the entity name',
    },
    {
      entityName: 'resource:bar',
      calledWith: 'resource:bar',
      warnMsg: 'Resource is not of kubernetes-cluster type',
      name: 'should warn if the resource is not kubernetes-cluster',
    },
  ])('$name', async ({ entityName, calledWith, warnMsg }) => {
    const mockedWarn = jest.spyOn(mockContext.logger, 'warn');
    await action.handler({
      ...mockContext,
      input: {
        namespace: entityName,
        clusterRef: entityName,
        token: 'TOKEN',
        skipTLSVerify: false,
      },
    });

    expect(mockedWarn).toHaveBeenCalledWith(warnMsg);
    expect(catalogClientFn).toHaveBeenCalledTimes(1);
    expect(catalogClientFn).toHaveBeenCalledWith(calledWith);
  });

  it.each([
    {
      entityName: 'resource:missing-entity',
      error: 'Resource not found',
      name: 'should throw if the entity is not found',
    },
    {
      entityName: 'resource:qux',
      error: 'Cluster resource is missing kubernetes.io/api-server annotation',
      name: 'should throw if the api url annotation is not present',
    },
  ])('$name', async ({ entityName, error }) => {
    await expect(async () => {
      await action.handler({
        ...mockContext,
        input: {
          namespace: entityName,
          clusterRef: entityName,
          token: 'TOKEN',
          skipTLSVerify: false,
        },
      });
    }).rejects.toThrow(error);

    expect(catalogClientFn).toHaveBeenCalledTimes(1);
    expect(catalogClientFn).toHaveBeenCalledWith(entityName);
  });

  it('should throw if neither url nor clusterRef is provided', async () => {
    await expect(async () => {
      await action.handler({
        ...mockContext,
        input: {
          namespace: 'foo',
          token: 'TOKEN',
          skipTLSVerify: false,
        },
      });
    }).rejects.toThrow('Cluster reference or url are required');
  });

  it('should throw if url and clusterRef are provided', async () => {
    await expect(async () => {
      await action.handler({
        ...mockContext,
        input: {
          namespace: 'foo',
          url: 'https://example.com',
          clusterRef: 'foo',
          token: 'TOKEN',
          skipTLSVerify: false,
        },
      });
    }).rejects.toThrow(
      "Cluster reference and url can't be specified at the same time",
    );
  });

  it('should correctly parse a http error', async () => {
    await expect(async () => {
      await action.handler({
        ...mockContext,
        input: {
          namespace: 'error',
          url: 'https://kube-api:5000',
          token: 'TOKEN',
          skipTLSVerify: false,
        },
      });
    }).rejects.toThrow(
      `Failed to create kubernetes namespace, HTTP-Code: 401\nMessage: Unauthorized\nBody: undefined\nHeaders: {\"content-type\":\"application/json\",\"x-powered-by\":\"msw\"}`,
    );
  });

  it('should throw an error while using an invalid api url', async () => {
    await expect(async () => {
      await action.handler({
        ...mockContext,
        input: {
          namespace: 'foo',
          token: 'TOKEN',
          url: 'bar',
          skipTLSVerify: false,
        },
      });
    }).rejects.toThrow('"bar" is an invalid url');
  });

  it('should throw if empty string is provided as api url', async () => {
    await expect(async () => {
      await action.handler({
        ...mockContext,
        input: {
          namespace: 'foo',
          token: 'TOKEN',
          url: '',
          skipTLSVerify: false,
        },
      });
    }).rejects.toThrow('Cluster reference or url are required');
  });

  it('should throw if undefined is provided as api url', async () => {
    await expect(async () => {
      await action.handler({
        ...mockContext,
        input: {
          namespace: 'foo',
          token: 'TOKEN',
          url: undefined,
          skipTLSVerify: false,
        },
      });
    }).rejects.toThrow('Cluster reference or url are required');
  });
});

describe('convertLabelsToObject', () => {
  test('converts labels string to object', () => {
    const labelsString = 'key1=value1;key2=value2;key3=value3';
    const expectedObject = {
      key1: 'value1',
      key2: 'value2',
      key3: 'value3',
    };
    expect(convertLabelsToObject(labelsString)).toEqual(expectedObject);
  });

  test('handles empty string', () => {
    expect(convertLabelsToObject('')).toEqual({});
  });

  test('handles invalid input', () => {
    // No '=' in the string
    expect(convertLabelsToObject('key1value1;')).toEqual({});
  });

  test('handles invalid labels', () => {
    // Label without '='
    expect(convertLabelsToObject('key1value1;key2=value2;=value3')).toEqual({
      key2: 'value2',
    });
  });
});
