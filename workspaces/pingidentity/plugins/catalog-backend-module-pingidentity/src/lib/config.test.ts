import { ConfigReader } from '@backstage/config';
import { readProviderConfigs } from './config';

describe('readProviderConfigs', () => {
  it('reads all the values', () => {
    const config = {
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
              userQuerySize: 100,
              groupQuerySize: 200,
            },
          },
        },
      },
    };
    const actual = readProviderConfigs(new ConfigReader(config));
    const expected = [
      {
        id: 'default',
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
        userQuerySize: 100,
        groupQuerySize: 200,
      },
    ];
    expect(actual).toEqual(expected);
  });

  it('should fail if clientId is set without clientSecret', () => {
    const config = {
      catalog: {
        providers: {
          pingIdentityOrg: {
            default: {
              apiPath: 'apiPath',
              authPath: 'authPath',
              envId: 'envId',
              clientId: 'clientId',
            },
          },
        },
      },
    };
    expect(() => readProviderConfigs(new ConfigReader(config))).toThrow();
  });

  it('should fail if clientSecret is set without clientId', () => {
    const config = {
      catalog: {
        providers: {
          pingIdentityOrg: {
            default: {
              apiPath: 'apiPath',
              authPath: 'authPath',
              envId: 'envId',
              clientSecret: 'clientSecret',
            },
          },
        },
      },
    };
    expect(() => readProviderConfigs(new ConfigReader(config))).toThrow();
  });
});
