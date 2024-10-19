import { mockServices } from '@backstage/backend-test-utils';
import { buildAnnouncementsContext } from './announcementsContextBuilder';
import { initializePersistenceContext } from './persistence/persistenceContext';
import {
  HttpAuthService,
  PermissionsService,
} from '@backstage/backend-plugin-api';

jest.mock('./persistence/persistenceContext', () => ({
  initializePersistenceContext: jest.fn(),
}));

describe('buildAnnouncementsContext', () => {
  it('returns context with logger, persistenceContext, permissions and httpAuth properties', async () => {
    const logger = mockServices.logger.mock();
    const config = mockServices.rootConfig.mock();
    const database = {
      getClient: jest.fn(),
      url: 'url',
    };
    const permissions: PermissionsService = {
      authorize: jest.fn(),
      authorizeConditional: jest.fn(),
    };
    const httpAuth: HttpAuthService = {
      credentials: jest.fn(),
      issueUserCookie: jest.fn(),
    };

    const context = await buildAnnouncementsContext({
      logger,
      config,
      database,
      permissions,
      httpAuth,
    });

    expect(context).toStrictEqual({
      logger,
      config,
      persistenceContext: await initializePersistenceContext(database),
      permissions,
      httpAuth,
    });
  });
});
