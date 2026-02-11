/*
 * Copyright 2026 The Backstage Authors
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
import { AzureStorageProvider } from './AzureStorageProvider';

describe('AzureStorageProvider', () => {
  describe('fromConfig', () => {
    it('should create provider from legacy config', () => {
      const config = new ConfigReader({
        azureStorage: {
          blobContainers: [
            {
              accountName: 'testaccount',
              authType: 'accessToken',
              auth: { accessToken: 'key' },
            },
          ],
        },
      });

      const provider = AzureStorageProvider.fromConfig(config);

      expect(provider).toBeDefined();
      expect(provider.listAccounts()).toEqual(['testaccount']);
    });

    it('should create provider from OSS config', () => {
      const config = new ConfigReader({
        integrations: {
          azureBlobStorage: [
            {
              accountName: 'ossaccount',
              accountKey: 'oss-key',
            },
          ],
        },
      });

      const provider = AzureStorageProvider.fromConfig(config);

      expect(provider).toBeDefined();
      expect(provider.listAccounts()).toEqual(['ossaccount']);
    });
  });

  describe('listAccounts', () => {
    it('should list all account names', () => {
      const config = new ConfigReader({
        integrations: {
          azureBlobStorage: [
            { accountName: 'account1', accountKey: 'key1' },
            { accountName: 'account2', accountKey: 'key2' },
          ],
        },
      });

      const provider = AzureStorageProvider.fromConfig(config);

      expect(provider.listAccounts()).toEqual(['account1', 'account2']);
    });
  });
});
