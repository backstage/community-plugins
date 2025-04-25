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
import { mockServices } from '@backstage/backend-test-utils';
import { buildAnnouncementsContext } from './announcementsContextBuilder';
import { initializePersistenceContext } from './persistence/persistenceContext';
import {
  HttpAuthService,
  PermissionsService,
} from '@backstage/backend-plugin-api';
import { EventsService } from '@backstage/plugin-events-node';
import { SignalsService } from '@backstage/plugin-signals-node';

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

    const events: EventsService = {
      publish: jest.fn(),
      subscribe: jest.fn(),
    };

    const signals: SignalsService = {
      publish: jest.fn(),
    };

    const context = await buildAnnouncementsContext({
      logger,
      config,
      database,
      permissions,
      httpAuth,
      events,
      signals,
    });

    expect(context).toStrictEqual({
      logger,
      config,
      persistenceContext: await initializePersistenceContext(database),
      permissions,
      httpAuth,
      events,
      signals,
    });
  });
});
