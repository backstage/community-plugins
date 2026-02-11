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
import { AzureSorageConfig } from './AzureStorageConfig';

describe('AzureSorageConfig', () => {
  describe('fromLegacyConfig', () => {
    it('should transform legacy accessToken auth to OSS accountKey', () => {
      const config = new ConfigReader({
        azureStorage: {
          blobContainers: [
            {
              accountName: 'testaccount',
              authType: 'accessToken',
              auth: {
                accessToken: 'test-key-123',
              },
            },
          ],
        },
      });

      const result = AzureSorageConfig.fromLegacyConfig(config);

      expect(result.integrations).toHaveLength(1);
      expect(result.integrations[0].accountName).toBe('testaccount');
      expect(result.integrations[0].accountKey).toBe('test-key-123');
      expect(result.integrations[0].host).toBe('blob.core.windows.net');
    });

    it('should transform legacy clientToken auth to OSS aadCredential', () => {
      const config = new ConfigReader({
        azureStorage: {
          blobContainers: [
            {
              accountName: 'testaccount',
              authType: 'clientToken',
              auth: {
                tenantId: 'tenant-123',
                clientId: 'client-456',
                clientSecret: 'secret-789',
              },
            },
          ],
        },
      });

      const result = AzureSorageConfig.fromLegacyConfig(config);

      expect(result.integrations).toHaveLength(1);
      expect(result.integrations[0].accountName).toBe('testaccount');
      expect(result.integrations[0].aadCredential).toEqual({
        tenantId: 'tenant-123',
        clientId: 'client-456',
        clientSecret: 'secret-789',
      });
      expect(result.integrations[0].host).toBe('blob.core.windows.net');
    });

    it('should preserve allowedContainers from legacy config', () => {
      const config = new ConfigReader({
        azureStorage: {
          blobContainers: [
            {
              accountName: 'testaccount',
              authType: 'accessToken',
              auth: {
                accessToken: 'test-key',
              },
              allowedContainers: ['container1', 'container2'],
            },
          ],
        },
      });

      const result = AzureSorageConfig.fromLegacyConfig(config);

      expect(result.integrations[0].allowedContainers).toEqual([
        'container1',
        'container2',
      ]);
    });

    it('should handle multiple accounts', () => {
      const config = new ConfigReader({
        azureStorage: {
          blobContainers: [
            {
              accountName: 'account1',
              authType: 'accessToken',
              auth: { accessToken: 'key1' },
            },
            {
              accountName: 'account2',
              authType: 'clientToken',
              auth: {
                tenantId: 'tenant',
                clientId: 'client',
                clientSecret: 'secret',
              },
            },
          ],
        },
      });

      const result = AzureSorageConfig.fromLegacyConfig(config);

      expect(result.integrations).toHaveLength(2);
      expect(result.integrations[0].accountName).toBe('account1');
      expect(result.integrations[1].accountName).toBe('account2');
    });

    it('should throw error for unknown authType', () => {
      const config = new ConfigReader({
        azureStorage: {
          blobContainers: [
            {
              accountName: 'testaccount',
              authType: 'unknownType',
              auth: {},
            },
          ],
        },
      });

      expect(() => AzureSorageConfig.fromLegacyConfig(config)).toThrow(
        'Unknown authType: unknownType',
      );
    });
  });

  describe('fromConfig with OSS format', () => {
    it('should parse OSS config with accountKey', () => {
      const config = new ConfigReader({
        integrations: {
          azureBlobStorage: [
            {
              accountName: 'testaccount',
              accountKey: 'test-key-123',
            },
          ],
        },
      });

      const result = AzureSorageConfig.fromConfig(config);

      expect(result.integrations).toHaveLength(1);
      expect(result.integrations[0].accountName).toBe('testaccount');
      expect(result.integrations[0].accountKey).toBe('test-key-123');
      expect(result.integrations[0].host).toBe('blob.core.windows.net');
    });

    it('should parse OSS config with sasToken', () => {
      const config = new ConfigReader({
        integrations: {
          azureBlobStorage: [
            {
              accountName: 'testaccount',
              sasToken: 'sas-token-123',
            },
          ],
        },
      });

      const result = AzureSorageConfig.fromConfig(config);

      expect(result.integrations[0].sasToken).toBe('sas-token-123');
    });

    it('should parse OSS config with connectionString', () => {
      const config = new ConfigReader({
        integrations: {
          azureBlobStorage: [
            {
              accountName: 'testaccount',
              connectionString:
                'DefaultEndpointsProtocol=https;AccountName=testaccount;AccountKey=key',
            },
          ],
        },
      });

      const result = AzureSorageConfig.fromConfig(config);

      expect(result.integrations[0].connectionString).toContain(
        'AccountName=testaccount',
      );
    });

    it('should parse OSS config with aadCredential', () => {
      const config = new ConfigReader({
        integrations: {
          azureBlobStorage: [
            {
              accountName: 'testaccount',
              aadCredential: {
                tenantId: 'tenant-123',
                clientId: 'client-456',
                clientSecret: 'secret-789',
              },
            },
          ],
        },
      });

      const result = AzureSorageConfig.fromConfig(config);

      expect(result.integrations[0].aadCredential).toEqual({
        tenantId: 'tenant-123',
        clientId: 'client-456',
        clientSecret: 'secret-789',
      });
    });

    it('should parse OSS config with allowedContainers extension', () => {
      const config = new ConfigReader({
        integrations: {
          azureBlobStorage: [
            {
              accountName: 'testaccount',
              accountKey: 'key',
              allowedContainers: ['container1', 'container2'],
            },
          ],
        },
      });

      const result = AzureSorageConfig.fromConfig(config);

      expect(result.integrations[0].allowedContainers).toEqual([
        'container1',
        'container2',
      ]);
    });

    it('should parse OSS config with custom host', () => {
      const config = new ConfigReader({
        integrations: {
          azureBlobStorage: [
            {
              accountName: 'testaccount',
              accountKey: 'key',
              endpoint: 'https://custom.blob.core.windows.net/',
            },
          ],
        },
      });

      const result = AzureSorageConfig.fromConfig(config);

      expect(result.integrations[0].host).toBe('custom.blob.core.windows.net');
    });
  });

  describe('fromConfig with precedence', () => {
    it('should use legacy config when both legacy and OSS exist', () => {
      const config = new ConfigReader({
        azureStorage: {
          blobContainers: [
            {
              accountName: 'legacyaccount',
              authType: 'accessToken',
              auth: { accessToken: 'legacy-key' },
            },
          ],
        },
        integrations: {
          azureBlobStorage: [
            {
              accountName: 'ossaccount',
              accountKey: 'oss-key',
            },
          ],
        },
      });

      const result = AzureSorageConfig.fromConfig(config);

      expect(result.integrations).toHaveLength(1);
      expect(result.integrations[0].accountName).toBe('legacyaccount');
      expect(result.integrations[0].accountKey).toBe('legacy-key');
    });

    it('should use OSS config when legacy does not exist', () => {
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

      const result = AzureSorageConfig.fromConfig(config);

      expect(result.integrations).toHaveLength(1);
      expect(result.integrations[0].accountName).toBe('ossaccount');
      expect(result.integrations[0].accountKey).toBe('oss-key');
    });
  });
});
