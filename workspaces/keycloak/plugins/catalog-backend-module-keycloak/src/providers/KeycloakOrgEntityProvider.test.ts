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
import type {
  LoggerService,
  SchedulerServiceTaskInvocationDefinition,
  SchedulerServiceTaskRunner,
  SchedulerServiceTaskScheduleDefinition,
} from '@backstage/backend-plugin-api';
import { mockServices, ServiceMock } from '@backstage/backend-test-utils';
import { ErrorLike } from '@backstage/errors';
import type { EntityProviderConnection } from '@backstage/plugin-catalog-node';
import type { JsonObject } from '@backstage/types';

import {
  assertLogMustNotInclude,
  authMock,
  CONFIG,
  KeycloakAdminClientMockServerv18,
  KeycloakAdminClientMockServerv24,
  PASSWORD_CONFIG,
} from '../../__fixtures__/helpers';
import { KeycloakOrgEntityProvider } from './KeycloakOrgEntityProvider';

const connection = {
  applyMutation: jest.fn(),
  refresh: jest.fn(),
} as unknown as EntityProviderConnection;

class SchedulerServiceTaskRunnerMock implements SchedulerServiceTaskRunner {
  private tasks: SchedulerServiceTaskInvocationDefinition[] = [];
  async run(task: SchedulerServiceTaskInvocationDefinition) {
    this.tasks.push(task);
  }
  async runAll() {
    const abortSignal = jest.fn() as unknown as AbortSignal;
    for await (const task of this.tasks) {
      await task.fn(abortSignal);
    }
  }
}

const scheduler = mockServices.scheduler.mock({
  createScheduledTaskRunner() {
    return new SchedulerServiceTaskRunnerMock();
  },
});

describe.each([
  ['v24', KeycloakAdminClientMockServerv24],
  ['v18', KeycloakAdminClientMockServerv18],
])('KeycloakOrgEntityProvider with %s', (_version, mockImplementation) => {
  let logger: ServiceMock<LoggerService>;
  let keycloakLogger: ServiceMock<LoggerService>;
  let schedule: SchedulerServiceTaskRunnerMock;

  const mockPLimit = jest.fn().mockImplementation((_concurrency: number) => {
    // Create function repeatedly calling the original function without limit implementation
    const limit = jest
      .fn()
      .mockImplementation(
        async <Arguments extends unknown[], ReturnType>(
          fn: (...args: Arguments) => ReturnType | PromiseLike<ReturnType>,
          ...args: Arguments
        ): Promise<ReturnType> => {
          const result = fn(...args);
          return result instanceof Promise ? result : Promise.resolve(result); // Ensure result is always a Promise
        },
      );
    return limit;
  });

  beforeEach(() => {
    jest.clearAllMocks();
    authMock.mockReset();
    jest.resetModules(); // Clears require cache to allow re-mocking

    // @ts-ignore
    jest.unstable_mockModule('@keycloak/keycloak-admin-client', async () => ({
      default: mockImplementation,
    }));

    // @ts-ignore
    jest.unstable_mockModule('p-limit', () => {
      return {
        default: mockPLimit,
      };
    });
    keycloakLogger = mockServices.logger.mock();
    logger = mockServices.logger.mock({
      child: () => keycloakLogger,
    });
    schedule = scheduler.createScheduledTaskRunner(
      '' as unknown as SchedulerServiceTaskScheduleDefinition,
    ) as SchedulerServiceTaskRunnerMock;
  });

  afterEach(() => {
    for (const log of [logger, keycloakLogger]) {
      assertLogMustNotInclude(log, ['myclientsecret', 'mypassword']); // NOSONAR
    }
  });

  const createProvider = (configData: JsonObject) =>
    KeycloakOrgEntityProvider.fromConfig(
      {
        config: mockServices.rootConfig({ data: configData }),
        logger,
      },
      {
        schedule,
      },
    );

  const runProvider = async (configData: JsonObject) => {
    const keycloak = createProvider(configData);
    for await (const k of keycloak) {
      await k.connect(connection);
      await schedule.runAll();
    }
  };

  it('should connect', async () => {
    const keycloak = createProvider(CONFIG);
    const result = await Promise.all(
      keycloak.map(async k => await k.connect(connection)),
    );
    expect(result).toEqual([undefined]);
  });

  it('should not read without a connection', async () => {
    const keycloak = createProvider(CONFIG);

    for await (const k of keycloak) {
      await expect(() => k.read()).rejects.toThrow('Not initialized');
    }
    expect(authMock).toHaveBeenCalledTimes(0);
  });

  it('should fail with grantType client_credential, but without client secret', async () => {
    const invalidConfig = {
      catalog: {
        providers: {
          keycloakOrg: {
            default: {
              baseUrl: 'http://localhost:8080',
              clientId: 'myclientid',
            },
          },
        },
      },
    };

    expect(() => createProvider(invalidConfig)).toThrow(
      'clientSecret must be provided when clientId is defined.',
    );
    expect(authMock).toHaveBeenCalledTimes(0);
  });

  it('should read with grantType client_credential', async () => {
    const validConfig = {
      catalog: {
        providers: {
          keycloakOrg: {
            default: {
              baseUrl: 'http://localhost:8080',
              clientId: 'myclientid',
              clientSecret: 'myclientsecret',
            },
          },
        },
      },
    };

    await runProvider(validConfig);

    expect(authMock).toHaveBeenCalled();
    expect(authMock).toHaveBeenCalledWith({
      grantType: 'client_credentials',
      clientId: 'myclientid',
      clientSecret: 'myclientsecret',
    });
    expect(connection.applyMutation).toHaveBeenCalledTimes(1);
    expect(
      (connection.applyMutation as jest.Mock).mock.calls,
    ).toMatchSnapshot();
  });

  it('should fail read with grantType username, but without password', async () => {
    const invalidConfig = {
      catalog: {
        providers: {
          keycloakOrg: {
            default: {
              baseUrl: 'http://localhost:8080',
              username: 'myusername',
            },
          },
        },
      },
    };

    expect(() => createProvider(invalidConfig)).toThrow(
      'password must be provided when username is defined.',
    );
    expect(authMock).toHaveBeenCalledTimes(0);
  });

  it('should read with grantType password', async () => {
    await runProvider(PASSWORD_CONFIG);

    expect(authMock).toHaveBeenCalled();
    expect(authMock).toHaveBeenCalledWith({
      grantType: 'password',
      clientId: 'admin-cli',
      username: 'myusername',
      password: 'mypassword', // NOSONAR
    });
    expect(connection.applyMutation).toHaveBeenCalled();
    expect(
      (connection.applyMutation as jest.Mock).mock.calls,
    ).toMatchSnapshot();
  });

  it('should log a proper error when network connection was refused', async () => {
    // Create an error that contains sensitive information.
    // The afterEach call ensure that this information aren't logged.
    const error = new Error('connect ECONNREFUSED ::1:8080') as ErrorLike;
    error.code = 'ECONNREFUSED';
    error.config = {
      data: 'username=myusername&password=mypassword', // NOSONAR
    };
    error.status = null;
    authMock.mockRejectedValue(error);

    await runProvider(PASSWORD_CONFIG);

    expect(authMock).toHaveBeenCalledTimes(1);
    expect(authMock).toHaveBeenCalledWith({
      grantType: 'password',
      clientId: 'admin-cli',
      username: 'myusername',
      password: 'mypassword', // NOSONAR
    });
    expect(connection.applyMutation).toHaveBeenCalledTimes(0);

    expect(logger.child).toHaveBeenCalledTimes(1);
    expect(keycloakLogger.info).toHaveBeenCalledWith(
      'Reading Keycloak users and groups',
    );
    expect(keycloakLogger.error).toHaveBeenCalledWith(
      'Error while syncing Keycloak users and groups',
      {
        name: 'Error',
        message: 'connect ECONNREFUSED ::1:8080',
        stack: expect.any(String),
      },
    );
  });

  it('should log a proper error when network connection was forbidden', async () => {
    // Create an error that contains sensitive information.
    // The afterEach call ensure that this information aren't logged.
    const error = new Error('Request failed with status code 401') as ErrorLike;
    error.config = {
      data: 'username=myusername&password=mypassword', // NOSONAR
    };
    error.status = 401;
    authMock.mockRejectedValue(error);

    await runProvider(PASSWORD_CONFIG);

    expect(authMock).toHaveBeenCalledTimes(1);
    expect(authMock).toHaveBeenCalledWith({
      grantType: 'password',
      clientId: 'admin-cli',
      username: 'myusername',
      password: 'mypassword', // NOSONAR
    });
    expect(connection.applyMutation).toHaveBeenCalledTimes(0);

    expect(logger.child).toHaveBeenCalledTimes(1);
    expect(keycloakLogger.info).toHaveBeenCalledWith(
      'Reading Keycloak users and groups',
    );
    expect(keycloakLogger.error).toHaveBeenCalledWith(
      'Error while syncing Keycloak users and groups',
      {
        name: 'Error',
        message: 'Request failed with status code 401',
        stack: expect.any(String),
      },
    );
  });
});
