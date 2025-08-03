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

import { ConfigReader } from '@backstage/config';
import { UnclaimedEntityProvider } from './UnclaimedEntityProvider';
import { mockServices } from '@backstage/backend-test-utils';

describe('UnclaimedEntityProvider', () => {
  describe('fromConfig', () => {
    it('should create provider from config', () => {
      const config = new ConfigReader({
        integrations: {
          github: [
            {
              host: 'github.com',
              token: 'test-token',
            },
          ],
        },
        catalog: {
          providers: {
            unclaimed: {
              providers: [
                {
                  type: 'github',
                  organization: 'test-org',
                },
              ],
              schedule: {
                frequency: { hours: 6 },
                timeout: { minutes: 10 },
              },
            },
          },
        },
      });

      const provider = UnclaimedEntityProvider.fromConfig(config, {
        logger: mockServices.logger.mock(),
        scheduler: mockServices.scheduler.mock(),
      });

      expect(provider).toBeInstanceOf(UnclaimedEntityProvider);
      expect(provider.getProviderName()).toBe('UnclaimedEntityProvider');
    });

    it('should throw error if providers configuration is missing', () => {
      const config = new ConfigReader({
        catalog: {
          providers: {
            unclaimed: {
              schedule: {
                frequency: { hours: 6 },
              },
            },
          },
        },
      });

      expect(() =>
        UnclaimedEntityProvider.fromConfig(config, {
          logger: mockServices.logger.mock(),
          scheduler: mockServices.scheduler.mock(),
        }),
      ).toThrow();
    });
  });

  describe('getProviderName', () => {
    it('should return provider name', () => {
      const provider = new UnclaimedEntityProvider(
        {
          providers: [
            {
              type: 'github',
              organization: 'test-org',
            },
          ],
        },
        {
          logger: mockServices.logger.mock(),
          scheduler: mockServices.scheduler.mock(),
        },
        {} as any, // integrations mock
      );

      expect(provider.getProviderName()).toBe('UnclaimedEntityProvider');
    });
  });
});
