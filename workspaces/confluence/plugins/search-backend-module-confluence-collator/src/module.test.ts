import { mockServices, startTestBackend } from '@backstage/backend-test-utils';
import { searchIndexRegistryExtensionPoint } from '@backstage/plugin-search-backend-node/alpha';
import { searchModuleConfluenceCollator } from './module';

describe('searchModuleConfluenceCollator', () => {
  const schedule = {
    frequency: { minutes: 10 },
    timeout: { minutes: 15 },
    initialDelay: { seconds: 3 },
  };

  it('should register the confluence collator to the search index registry extension point with factory and schedule', async () => {
    const extensionPointMock = {
      addCollator: jest.fn(),
    };

    await startTestBackend({
      extensionPoints: [
        [searchIndexRegistryExtensionPoint, extensionPointMock],
      ],
      features: [
        searchModuleConfluenceCollator(),
        mockServices.rootConfig.factory({
          data: {
            search: {
              collators: {
                confluence: {
                  schedule,
                },
              },
            },
            confluence: {
              baseUrl: 'https://confluence.mock',
              auth: {
                type: 'bearer',
                token: 'M0ck1ng.confluence',
              },
            },
          },
        }),
      ],
    });

    expect(extensionPointMock.addCollator).toHaveBeenCalledTimes(1);
    expect(extensionPointMock.addCollator).toHaveBeenCalledWith({
      factory: expect.objectContaining({ type: 'confluence' }),
      schedule: expect.objectContaining({ run: expect.any(Function) }),
    });
  });
});
