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
    it('should create providers from config', () => {
      const config = new ConfigReader({
        integrations: {
          github: [
            {
              host: 'github.com',
              token: 'test-token',
            },
          ],
          azure: [
            {
              host: 'dev.azure.com',
              credentials: [
                {
                  personalAccessToken: 'test-pat',
                },
              ],
            },
          ],
        },
        catalog: {
          providers: {
            github: {
              'test-github': {
                organization: 'test-org',
              },
            },
            azureDevOps: {
              'test-azure': {
                organization: 'test-azure-org',
                project: 'test-project',
              },
            },
          },
        },
        UnclaimedEntities: {
          github: ['test-github'],
          azureDevops: ['test-azure'],
          schedule: {
            frequency: { hours: 6 },
            timeout: { minutes: 10 },
          },
        },
      });

      const providers = UnclaimedEntityProvider.fromConfig(config, {
        logger: mockServices.logger.mock(),
        scheduler: mockServices.scheduler.mock(),
      });

      expect(providers).toHaveLength(2);
      expect(providers[0]).toBeInstanceOf(UnclaimedEntityProvider);
      expect(providers[1]).toBeInstanceOf(UnclaimedEntityProvider);
      expect(providers[0].getProviderName()).toBe(
        'UnclaimedEntityProvider:github:test-github',
      );
      expect(providers[1].getProviderName()).toBe(
        'UnclaimedEntityProvider:azureDevOps:test-azure',
      );
    });

    it('should return empty array if no providers are configured', () => {
      const config = new ConfigReader({
        UnclaimedEntities: {
          schedule: {
            frequency: { hours: 6 },
          },
        },
      });

      const providers = UnclaimedEntityProvider.fromConfig(config, {
        logger: mockServices.logger.mock(),
        scheduler: mockServices.scheduler.mock(),
      });

      expect(providers).toHaveLength(0);
    });

    it('should handle missing catalog provider configurations gracefully', () => {
      const config = new ConfigReader({
        UnclaimedEntities: {
          github: ['non-existent-provider'],
          azureDevops: ['another-non-existent'],
        },
      });

      const providers = UnclaimedEntityProvider.fromConfig(config, {
        logger: mockServices.logger.mock(),
        scheduler: mockServices.scheduler.mock(),
      });

      expect(providers).toHaveLength(0);
    });
  });

  describe('getProviderName', () => {
    it('should return provider name with type and id', () => {
      const provider = new UnclaimedEntityProvider(
        {
          providerType: 'github',
          providerId: 'test-provider',
          organization: 'test-org',
        },
        {
          logger: mockServices.logger.mock(),
          scheduler: mockServices.scheduler.mock(),
        },
        {} as any, // integrations mock
      );

      expect(provider.getProviderName()).toBe(
        'UnclaimedEntityProvider:github:test-provider',
      );
    });
  });
});
