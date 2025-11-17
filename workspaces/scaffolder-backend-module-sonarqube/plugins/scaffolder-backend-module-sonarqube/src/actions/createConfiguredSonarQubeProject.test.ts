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

import fs from 'fs';
import path from 'path';

import { Config, ConfigReader } from '@backstage/config';
import { createMockActionContext } from '@backstage/plugin-scaffolder-node-test-utils';
import yaml from 'yaml';

import { SonarQubeClient } from '../sonarqube';
import { createConfiguredSonarQubeProjectAction } from './createConfiguredSonarQubeProject';
import { createSonarQubeProjectAction } from './createSonarQubeProject';
import { examples as legacyExamples } from './createSonarQubeProject.examples';

const configPath = path.resolve(process.cwd(), 'app-config.local.yaml');
let fileBaseUrl: string | undefined;
let fileToken: string | undefined;

if (fs.existsSync(configPath)) {
  const parsed = yaml.parse(fs.readFileSync(configPath, 'utf8'));
  const fileSonarQube = parsed?.sonarqube;

  const resolveValue = (value: unknown): string | undefined => {
    if (typeof value !== 'string') {
      return undefined;
    }
    const envRef = value.match(/^\$\{(.+)\}$/);
    if (envRef) {
      return process.env[envRef[1]];
    }
    return value;
  };

  fileBaseUrl = resolveValue(fileSonarQube?.baseUrl);
  fileToken = resolveValue(fileSonarQube?.token);
}

const liveBaseUrl = process.env.SONARQUBE_BASE_URL ?? fileBaseUrl;
const liveToken = process.env.SONARQUBE_TOKEN ?? fileToken;
const shouldRunLiveTests = Boolean(liveBaseUrl && liveToken);

const createProjectMock = jest.fn();

jest.mock('../sonarqube', () => ({
  SonarQubeClient: jest.fn().mockImplementation(() => ({
    createProject: createProjectMock,
  })),
}));

describe('createConfiguredSonarQubeProjectAction (unit)', () => {
  const config = new ConfigReader({
    sonarqube: {
      baseUrl: 'https://sonarqube.local',
      token: 'very-secret',
    },
  });
  const action = createConfiguredSonarQubeProjectAction(config);
  const context = createMockActionContext();

  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('creates a SonarQube project with the shared config', async () => {
    await action.handler({
      ...context,
      input: {
        projectKey: 'service-key',
        projectName: 'Service',
        organization: 'org',
        visibility: 'private',
      },
    });

    expect(SonarQubeClient).toHaveBeenCalledWith({
      baseUrl: 'https://sonarqube.local',
      token: 'very-secret',
    });
    expect(createProjectMock).toHaveBeenCalledWith({
      project: 'service-key',
      name: 'Service',
      organization: 'org',
      visibility: 'private',
    });
    expect(context.output).toHaveBeenCalledWith(
      'projectUrl',
      'https://sonarqube.local/dashboard?id=service-key',
    );
  });

  it('propagates errors coming from the SonarQube API', async () => {
    createProjectMock.mockRejectedValueOnce(new Error('boom'));

    await expect(
      action.handler({
        ...context,
        input: {
          projectKey: 'service-key',
          projectName: 'Service',
        },
      }),
    ).rejects.toThrow('boom');
  });
});

const describeIfLive = shouldRunLiveTests ? describe : describe.skip;

describeIfLive('createConfiguredSonarQubeProjectAction (live)', () => {
  let liveAction: typeof createConfiguredSonarQubeProjectAction;

  beforeAll(async () => {
    jest.resetModules();
    jest.unmock('../sonarqube');
    ({ createConfiguredSonarQubeProjectAction: liveAction } =
      jest.requireActual('./createConfiguredSonarQubeProject'));
  });

  it('creates a project against a running SonarQube instance', async () => {
    const context = createMockActionContext();
    const config = new ConfigReader({
      sonarqube: {
        baseUrl: liveBaseUrl!,
        token: liveToken!,
      },
    });
    const action = liveAction(config);
    const projectKey = `bkstg-sonar-${Date.now()}`;

    await action.handler({
      ...context,
      input: {
        projectKey,
        projectName: 'Backstage Sonar Test',
      },
    });

    expect(context.output).toHaveBeenCalledWith(
      'projectUrl',
      `${liveBaseUrl}/dashboard?id=${projectKey}`,
    );
  });
});

describe('createSonarQubeProjectAction (legacy)', () => {
  const originalFetch = global.fetch;
  const action = createSonarQubeProjectAction();

  beforeEach(() => {
    jest.clearAllMocks();
    (global as unknown as { fetch: jest.Mock }).fetch = jest
      .fn()
      .mockResolvedValue({
        ok: true,
        status: 200,
        statusText: 'OK',
        json: async () => ({ key: 'service' }),
      }) as unknown as typeof fetch;
  });

  afterEach(() => {
    (global as unknown as { fetch: jest.Mock }).fetch.mockReset();
    global.fetch = originalFetch;
  });

  const buildInput = (overrides: Partial<Record<string, unknown>> = {}) => ({
    baseUrl: 'https://sonar.acme',
    token: 'token',
    username: '',
    password: '',
    name: 'Service',
    key: 'service',
    branch: 'main',
    visibility: 'private',
    ...overrides,
  });

  it('calls the SonarQube API and outputs the dashboard URL', async () => {
    const context = createMockActionContext();

    await action.handler({
      ...context,
      input: buildInput(),
    });

    const calledUrl = (global.fetch as jest.Mock).mock.calls[0][0];
    expect(calledUrl).toContain('/api/projects/create?');
    expect(calledUrl).toContain('mainBranch=main');
    expect(calledUrl).toContain('visibility=private');
    expect((global.fetch as jest.Mock).mock.calls[0][1]).toMatchObject({
      method: 'POST',
      headers: expect.objectContaining({
        Authorization: expect.stringContaining('Basic'),
      }),
    });
    expect(context.output).toHaveBeenCalledWith(
      'projectUrl',
      'https://sonar.acme/dashboard?id=service',
    );
  });

  it('requires authentication details', async () => {
    await expect(
      action.handler({
        ...createMockActionContext(),
        input: buildInput({
          token: '',
          username: '',
          password: '',
        }),
      }),
    ).rejects.toThrow(
      '"token" or "username" and "password" are required input parameters',
    );
  });

  it('validates required inputs', async () => {
    await expect(
      action.handler({
        ...createMockActionContext(),
        input: buildInput({ baseUrl: '' }),
      }),
    ).rejects.toThrow('"baseUrl" is a required input parameter');

    await expect(
      action.handler({
        ...createMockActionContext(),
        input: buildInput({ name: '' }),
      }),
    ).rejects.toThrow('"name" is a required input parameter');

    await expect(
      action.handler({
        ...createMockActionContext(),
        input: buildInput({ key: '' }),
      }),
    ).rejects.toThrow('"key" is a required input parameter');
  });

  it('translates 401 responses into a friendly message', async () => {
    (global.fetch as jest.Mock).mockResolvedValue({
      ok: false,
      status: 401,
      statusText: '',
      json: async () => ({ errors: [] }),
    });

    await expect(
      action.handler({
        ...createMockActionContext(),
        input: buildInput(),
      }),
    ).rejects.toThrow(
      'Failed to create SonarQube project, status 401 - Unauthorized, please use a valid token or username and password',
    );
  });

  it('surfaces errors from the SonarQube response body', async () => {
    (global.fetch as jest.Mock).mockResolvedValue({
      ok: false,
      status: 400,
      statusText: '',
      json: async () => ({ errors: [{ msg: 'bad request' }] }),
    });

    await expect(
      action.handler({
        ...createMockActionContext(),
        input: buildInput(),
      }),
    ).rejects.toThrow(
      'Failed to create SonarQube project, status 400 - bad request',
    );
  });
});

describe('createSonarQubeProject examples', () => {
  it('provides legacy action snippets', () => {
    expect(Array.isArray(legacyExamples)).toBe(true);
    expect(legacyExamples.length).toBeGreaterThan(0);
  });
});

describe('SonarQubeClient (unit)', () => {
  let fetchMock: jest.Mock;
  let ActualSonarQubeClient: typeof import('../sonarqube').SonarQubeClient;
  let createClientFactory: typeof import('../sonarqube').createSonarQubeClient;

  beforeEach(() => {
    jest.resetModules();
    fetchMock = jest.fn();
    jest.doMock('cross-fetch', () => fetchMock);
    jest.unmock('../sonarqube');
    ({
      SonarQubeClient: ActualSonarQubeClient,
      createSonarQubeClient: createClientFactory,
    } = require('../sonarqube'));
  });

  afterEach(() => {
    jest.resetModules();
    jest.dontMock('cross-fetch');
  });

  it('creates a project using basic auth and urlencoded body', async () => {
    fetchMock.mockResolvedValue({
      ok: true,
      json: async () => ({ key: 'service' }),
      text: async () => '',
    });

    const client = new ActualSonarQubeClient({
      baseUrl: 'https://sonar.example',
      token: 'token-123',
    });

    await client.createProject({
      project: 'service',
      name: 'Service',
      visibility: 'private',
      organization: 'org',
    });

    expect(fetchMock).toHaveBeenCalledWith(
      'https://sonar.example/api/projects/create',
      expect.objectContaining({
        method: 'POST',
        headers: expect.objectContaining({
          Authorization: `Basic ${Buffer.from('token-123:').toString(
            'base64',
          )}`,
          'Content-Type': 'application/x-www-form-urlencoded',
        }),
        body: expect.stringContaining('project=service'),
      }),
    );
  });

  it('throws with response body details on project failure', async () => {
    fetchMock.mockResolvedValue({
      ok: false,
      statusText: 'Bad Request',
      text: async () => '{"errors":[{"msg":"bad"}]}',
    });

    const client = new ActualSonarQubeClient({
      baseUrl: 'https://sonar.example',
      token: 'token-123',
    });

    await expect(
      client.createProject({
        project: 'service',
        name: 'Service',
      }),
    ).rejects.toThrow(
      'Failed to create SonarQube project: Bad Request - {"errors":[{"msg":"bad"}]}',
    );
  });

  it('generates a token via the SonarQube API', async () => {
    fetchMock.mockResolvedValue({
      ok: true,
      json: async () => ({ token: 'abc' }),
      text: async () => '',
    });

    const client = new ActualSonarQubeClient({
      baseUrl: 'https://sonar.example',
      token: 'token-123',
    });

    await client.generateToken({
      name: 'build',
      type: 'PROJECT_ANALYSIS_TOKEN',
      projectKey: 'service',
      organization: 'org',
    });

    expect(fetchMock).toHaveBeenCalledWith(
      'https://sonar.example/api/user_tokens/generate',
      expect.objectContaining({
        headers: expect.objectContaining({
          Authorization: `Basic ${Buffer.from('token-123:').toString(
            'base64',
          )}`,
        }),
        body: expect.stringContaining('projectKey=service'),
      }),
    );
  });

  it('includes response body when token generation fails', async () => {
    fetchMock.mockResolvedValue({
      ok: false,
      statusText: 'Forbidden',
      text: async () => '{"errors":[{"msg":"nope"}]}',
    });

    const client = new ActualSonarQubeClient({
      baseUrl: 'https://sonar.example',
      token: 'token-123',
    });

    await expect(
      client.generateToken({
        name: 'build',
        type: 'PROJECT_ANALYSIS_TOKEN',
        projectKey: 'service',
      }),
    ).rejects.toThrow(
      'Failed to generate token: Forbidden - {"errors":[{"msg":"nope"}]}',
    );
  });

  it('creates clients through the helper factory', () => {
    const client = createClientFactory({
      baseUrl: 'https://sonar.example',
      token: 'factory-token',
    });

    expect(client).toBeInstanceOf(ActualSonarQubeClient);
  });

  it('omits extra separator when project failure body is empty', async () => {
    fetchMock.mockResolvedValue({
      ok: false,
      statusText: 'Bad Request',
      text: async () => '',
    });

    const client = new ActualSonarQubeClient({
      baseUrl: 'https://sonar.example',
      token: 'token-123',
    });

    await expect(
      client.createProject({
        project: 'service',
        name: 'Service',
      }),
    ).rejects.toThrow('Failed to create SonarQube project: Bad Request');
  });

  it('omits extra separator when token failure body is empty', async () => {
    fetchMock.mockResolvedValue({
      ok: false,
      statusText: 'Forbidden',
      text: async () => '',
    });

    const client = new ActualSonarQubeClient({
      baseUrl: 'https://sonar.example',
      token: 'token-123',
    });

    await expect(
      client.generateToken({
        name: 'build',
        type: 'PROJECT_ANALYSIS_TOKEN',
        projectKey: 'service',
      }),
    ).rejects.toThrow('Failed to generate token: Forbidden');
  });
});

describe('scaffolderModuleSonarqubeActions registration', () => {
  afterEach(() => {
    jest.resetModules();
    jest.clearAllMocks();
  });

  it('registers both actions with the scaffolder extension point', async () => {
    const registerInit = jest.fn();
    const addActions = jest.fn();
    const configuredAction = { id: 'configured' };
    const legacyAction = { id: 'legacy' };
    const mockCreateConfigured = jest.fn(() => configuredAction);
    const mockCreateLegacy = jest.fn(() => legacyAction);

    jest.isolateModules(() => {
      jest.doMock('@backstage/plugin-scaffolder-node', () => ({
        scaffolderActionsExtensionPoint: Symbol('scaffolder'),
      }));
      jest.doMock('../actions', () => ({
        createConfiguredSonarQubeProjectAction: mockCreateConfigured,
        createSonarQubeProjectAction: mockCreateLegacy,
      }));
      jest.doMock('@backstage/backend-plugin-api', () => ({
        coreServices: { config: Symbol('config') },
        createBackendModule: jest.fn(config => ({
          register: config.register,
        })),
      }));
      const { scaffolderModuleSonarqubeActions } = require('../module');
      scaffolderModuleSonarqubeActions.register({ registerInit });
    });

    expect(registerInit).toHaveBeenCalledTimes(1);
    const initConfig = registerInit.mock.calls[0][0];
    await initConfig.init({
      scaffolder: { addActions },
      config: {} as Config,
    });

    expect(addActions).toHaveBeenCalledWith(configuredAction, legacyAction);
  });
});
