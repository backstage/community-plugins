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

/**
 * Handler and scaffolder-node schema contract tests.
 * Module wiring (extension-point registration) is covered in `../module.test.ts`
 * and is not replaced by these handler-level cases.
 */
import { createRequire } from 'node:module';

import type { CatalogClient } from '@backstage/catalog-client';
import { createMockActionContext } from '@backstage/plugin-scaffolder-node-test-utils';

import type { V1Namespace } from '@kubernetes/client-node';

import {
  convertLabelsToObject,
  createKubernetesNamespaceAction,
} from './createKubernetesNamespace';

const LOCAL_ADDR = 'https://kube-api:5000';
const FIXTURES_DIR = `${__dirname}/../../__fixtures__/cluster-entities`;
const BEARER_TOKEN = 'token-should-not-leak';

/**
 * `@kubernetes/client-node` 2.x calls `fetch` from its own nested `undici`.
 * The workspace also hoists an older `undici`, and each copy has its own
 * global dispatcher. Load the client copy so the mock sees the request.
 */
const requireFromClient = createRequire(
  createRequire(__filename).resolve('@kubernetes/client-node/package.json'),
);
const undici = requireFromClient('undici') as {
  MockAgent: new () => {
    disableNetConnect: () => void;
    close: () => Promise<void>;
    get: (origin: string) => {
      intercept: (options: { path: string; method: string }) => {
        reply: (
          handler: (request: { body?: unknown }) => {
            statusCode: number;
            data: string;
            responseOptions: { headers: Record<string, string> };
          },
        ) => void;
      };
    };
  };
  getGlobalDispatcher: () => unknown;
  setGlobalDispatcher: (dispatcher: unknown) => void;
};

const originalDispatcher = undici.getGlobalDispatcher();
let mockAgent: InstanceType<typeof undici.MockAgent>;
let namespacePool: ReturnType<InstanceType<typeof undici.MockAgent>['get']>;

function postedNamespace(body: unknown): V1Namespace {
  if (typeof body === 'string') {
    return JSON.parse(body) as V1Namespace;
  }
  if (body instanceof Uint8Array) {
    return JSON.parse(Buffer.from(body).toString('utf8')) as V1Namespace;
  }
  throw new Error('Kubernetes client posted an unexpected namespace body');
}

function mockNamespacePost(options?: {
  statusCode?: number;
  data?: string;
  headers?: Record<string, string>;
  onNamespace?: (namespace: V1Namespace) => void;
}) {
  namespacePool
    .intercept({ path: '/api/v1/namespaces', method: 'POST' })
    .reply(request => {
      if (options?.onNamespace) {
        options.onNamespace(postedNamespace(request.body));
      }
      return {
        statusCode: options?.statusCode ?? 200,
        data: options?.data ?? '{}',
        responseOptions: {
          headers: options?.headers ?? { 'content-type': 'application/json' },
        },
      };
    });
}

beforeEach(() => {
  mockAgent = new undici.MockAgent();
  mockAgent.disableNetConnect();
  undici.setGlobalDispatcher(mockAgent);
  namespacePool = mockAgent.get(LOCAL_ADDR);
});

afterEach(async () => {
  await mockAgent.close();
  undici.setGlobalDispatcher(originalDispatcher);
});

/** Minimal JSON Schema required-field check (no extra validator dependency). */
function missingRequiredFields(
  schema: { required?: boolean | string[] } | undefined,
  input: Record<string, unknown>,
): string[] {
  const required = Array.isArray(schema?.required) ? schema.required : [];
  return required.filter(key => input[key] === undefined);
}

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

  describe('scaffolder-node input schema', () => {
    it('requires namespace and token in the Zod → JSON Schema contract', () => {
      const inputSchema = action.schema?.input;
      expect(inputSchema).toEqual(
        expect.objectContaining({
          type: 'object',
          required: expect.arrayContaining(['namespace', 'token']),
        }),
      );
    });

    it('rejects missing required token without invoking the handler', () => {
      const missing = missingRequiredFields(action.schema?.input, {
        namespace: 'foo',
        url: LOCAL_ADDR,
      });
      expect(missing).toEqual(['token']);
      expect(catalogClientFn).not.toHaveBeenCalled();
    });

    it('rejects missing required namespace without invoking the handler', () => {
      const missing = missingRequiredFields(action.schema?.input, {
        token: 'test-token',
        url: LOCAL_ADDR,
      });
      expect(missing).toEqual(['namespace']);
      expect(catalogClientFn).not.toHaveBeenCalled();
    });
  });

  it('should get the api url from the correct entity', async () => {
    mockNamespacePost();
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

  it('posts namespace name and labels on the happy path', async () => {
    let postedBody: V1Namespace | undefined;
    mockNamespacePost({
      onNamespace: namespace => {
        postedBody = namespace;
      },
    });

    await action.handler({
      ...mockContext,
      input: {
        namespace: 'happy-ns',
        url: LOCAL_ADDR,
        token: 'test-token',
        skipTLSVerify: false,
        labels: 'app.io/type=ns;app.io/managed-by=org',
      },
    });

    expect(postedBody?.metadata?.name).toBe('happy-ns');
    expect(postedBody?.metadata?.labels).toEqual({
      'app.io/type': 'ns',
      'app.io/managed-by': 'org',
    });
    expect(catalogClientFn).not.toHaveBeenCalled();
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
    mockNamespacePost();
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

  it('should surface a generic client HTTP error (no string body Status JSON)', async () => {
    mockNamespacePost({ statusCode: 401 });

    const error = await action
      .handler({
        ...mockContext,
        input: {
          namespace: 'error',
          url: LOCAL_ADDR,
          token: BEARER_TOKEN,
          skipTLSVerify: false,
        },
      })
      .catch((caught: unknown) => caught);

    expect(error).toBeInstanceOf(Error);
    expect((error as Error).message).toContain(
      'Failed to create kubernetes namespace, HTTP-Code: 401\nMessage: Unauthorized\nBody: undefined\nHeaders:',
    );
    expect((error as Error).message).not.toContain(BEARER_TOKEN);
  });

  it('should parse string body Status JSON into an API code error message', async () => {
    const statusBody = {
      kind: 'Status',
      apiVersion: 'v1',
      metadata: {},
      status: 'Failure',
      message: 'namespaces is forbidden',
      reason: 'Forbidden',
      code: 403,
    };
    mockNamespacePost({
      statusCode: 403,
      data: JSON.stringify(statusBody),
      headers: { 'content-type': 'text/plain' },
    });

    const error = await action
      .handler({
        ...mockContext,
        input: {
          namespace: 'forbidden-ns',
          url: LOCAL_ADDR,
          token: BEARER_TOKEN,
          skipTLSVerify: false,
        },
      })
      .catch((caught: unknown) => caught);

    expect(error).toBeInstanceOf(Error);
    expect((error as Error).message).toBe(
      'Failed to create kubernetes namespace, API code: 403 -- namespaces is forbidden',
    );
    expect((error as Error).message).not.toContain(BEARER_TOKEN);
  });

  it('should fall back to the generic failure message for unparseable string body', async () => {
    mockNamespacePost({
      statusCode: 500,
      data: 'not-json',
      headers: { 'content-type': 'text/plain' },
    });

    const error = await action
      .handler({
        ...mockContext,
        input: {
          namespace: 'bad-body-ns',
          url: LOCAL_ADDR,
          token: BEARER_TOKEN,
          skipTLSVerify: false,
        },
      })
      .catch((caught: unknown) => caught);

    expect(error).toBeInstanceOf(Error);
    expect((error as Error).message).toMatch(
      /^Failed to create kubernetes namespace,/,
    );
    expect((error as Error).message).not.toContain(BEARER_TOKEN);
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

  it('should throw Cluster reference or url are required when url is an empty string', async () => {
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
