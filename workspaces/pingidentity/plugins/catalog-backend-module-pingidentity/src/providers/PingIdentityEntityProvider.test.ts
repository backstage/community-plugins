import { ConfigReader } from '@backstage/config';
import {
  GroupEntity,
  UserEntity,
} from '@backstage/catalog-model';
import { EntityProviderConnection } from '@backstage/plugin-catalog-node';
import { PingIdentityEntityProvider } from './PingIdentityEntityProvider';
import { mockServices } from '@backstage/backend-test-utils';
import { readPingIdentity } from '../lib/read';
import { PING_IDENTITY_ID_ANNOTATION } from '../lib/constants';

jest.mock('../lib/read', () => {
  return {
    ...jest.requireActual('../lib/read'),
    readPingIdentity: jest.fn(),
  };
});

const readPingIdentityMocked = readPingIdentity as jest.Mock<
  Promise<{ users: UserEntity[]; groups: GroupEntity[] }>
>;

describe('PingIdentityEntityProvider', () => {
  beforeEach(() => {
    readPingIdentityMocked.mockResolvedValue({
      users: [
        {
          apiVersion: 'backstage.io/v1beta1',
          kind: 'User',
          metadata: {
            name: 'u1',
            annotations: {
              [PING_IDENTITY_ID_ANNOTATION]: 'uid1',
            },
          },
          spec: {
            memberOf: [],
          },
        },
      ],
      groups: [
        {
          apiVersion: 'backstage.io/v1beta1',
          kind: 'Group',
          metadata: {
            name: 'g1',
            annotations: {
              [PING_IDENTITY_ID_ANNOTATION]: 'gid1',
            },
          },
          spec: {
            type: 'group',
            children: [],
          },
        },
      ],
    });
  });

  afterEach(() => jest.resetAllMocks());

  const logger = mockServices.logger.mock();
  const entityProviderConnection: EntityProviderConnection = {
    applyMutation: jest.fn(),
    refresh: jest.fn(),
  };

  const expectedMutation = {
    entities: [
      {
        entity: {
          apiVersion: 'backstage.io/v1beta1',
          kind: 'User',
          metadata: {
            annotations: {
              [PING_IDENTITY_ID_ANNOTATION]: 'uid1',
            },
            name: 'u1',
          },
          spec: {
            memberOf: [],
          },
        },
        locationKey: 'pingidentity-org-provider:default',
      },
      {
        entity: {
          apiVersion: 'backstage.io/v1beta1',
          kind: 'Group',
          metadata: {
            annotations: {
              [PING_IDENTITY_ID_ANNOTATION]: 'gid1',
            },
            name: 'g1',
          },
          spec: {
            children: [],
            type: 'group',
          },
        },
        locationKey: 'pingidentity-org-provider:default',
      },
    ],
    type: 'full',
  };

  it('should apply mutation - manual', async () => {
    const config = new ConfigReader({
      catalog: {
        providers: {
          pingIdentityOrg: {
            default: {
              apiPath: 'apiPath',
              authPath: 'authPath',
              envId: 'envId',
              clientId: 'clientId',
              clientSecret: 'clientSecret',
            },
          },
        },
      },
    });

    const provider = PingIdentityEntityProvider.fromConfig(config, {
      id: 'development',
      logger,
      schedule: 'manual',
    })[0];

    await provider.connect(entityProviderConnection);
    await provider.read();

    expect(entityProviderConnection.applyMutation).toHaveBeenCalledWith(
      expectedMutation,
    );
  });

  it('should apply mutation - schedule', async () => {
    const config = new ConfigReader({
      catalog: {
        providers: {
          pingIdentityOrg: {
            default: {
              apiPath: 'apiPath',
              authPath: 'authPath',
              envId: 'envId',
              clientId: 'clientId',
              clientSecret: 'clientSecret',
            },
          },
        },
      },
    });

    const mockTaskRunner = {
      run: jest.fn().mockImplementation(async (task) => {
        await task.fn();
      }),
    };

    const provider = PingIdentityEntityProvider.fromConfig(config, {
      id: 'development',
      logger,
      schedule: mockTaskRunner,
    })[0];
    expect(provider.getProviderName()).toEqual(
      'PingIdentityEntityProvider:default',
    );

    await provider.connect(entityProviderConnection);
    expect(mockTaskRunner.run).toHaveBeenCalled();

    expect(entityProviderConnection.applyMutation).toHaveBeenCalledWith(
      expectedMutation,
    );
  });

  it('should apply mutation - scheduler', async () => {
    const config = new ConfigReader({
      catalog: {
        providers: {
          pingIdentityOrg: {
            default: {
              apiPath: 'apiPath',
              authPath: 'authPath',
              envId: 'envId',
              clientId: 'clientId',
              clientSecret: 'clientSecret',
              schedule: {
                frequency: {
                  minutes: 30,
                },
                initialDelay: undefined,
                scope: undefined,
                timeout: {
                  minutes: 3,
                },
              },
            },
          },
        },
      },
    });

    const mockTaskRunner = {
      run: jest.fn().mockImplementation(async (task) => {
        await task.fn();
      }),
    };

    const scheduler = {
      createScheduledTaskRunner: jest.fn().mockReturnValue(mockTaskRunner),
      triggerTask: jest.fn(),
      scheduleTask: jest.fn(),
      getScheduledTasks: jest.fn(),
    };

    const provider = PingIdentityEntityProvider.fromConfig(config, {
      id: 'development',
      logger,
      scheduler,
    })[0];
    expect(provider.getProviderName()).toEqual(
      'PingIdentityEntityProvider:default',
    );

    await provider.connect(entityProviderConnection);
    expect(scheduler.createScheduledTaskRunner).toHaveBeenCalled();
    expect(mockTaskRunner.run).toHaveBeenCalled();

    expect(entityProviderConnection.applyMutation).toHaveBeenCalledWith(
      expectedMutation,
    );
  });

  it('fail without schedule and scheduler', () => {
    const config = new ConfigReader({
      catalog: {
        providers: {
          pingIdentityOrg: {
            default: {
              apiPath: 'apiPath',
              authPath: 'authPath',
              envId: 'envId',
              clientId: 'clientId',
              clientSecret: 'clientSecret',
            },
          },
        },
      },
    });

    expect(() =>
      PingIdentityEntityProvider.fromConfig(config, {
        id: 'development',
        logger,
      }),
    ).toThrow('No schedule provided neither via code nor config for PingIdentityEntityProvider:default.');
  });

  it('fail with scheduler but no schedule config', () => {
    const config = new ConfigReader({
      catalog: {
        providers: {
          pingIdentityOrg: {
            default: {
              apiPath: 'apiPath',
              authPath: 'authPath',
              envId: 'envId',
              clientId: 'clientId',
              clientSecret: 'clientSecret',
            },
          },
        },
      },
    });

    const scheduler = {
      createScheduledTaskRunner: jest.fn(),
      triggerTask: jest.fn(),
      scheduleTask: jest.fn(),
      getScheduledTasks: jest.fn(),
    };

    expect(() =>
      PingIdentityEntityProvider.fromConfig(config, {
        id: 'development',
        logger,
        scheduler,
      }),
    ).toThrow(
      'No schedule provided neither via code nor config for PingIdentityEntityProvider:default',
    );
  });
});
