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
import { Config } from '@backstage/config';
import { readAzureBlobStorageIntegrationConfig } from '@backstage/integration';
import { ExtendedAzureBlobStorageConfig } from './types';

export class AzureSorageConfig {
  constructor(public readonly integrations: ExtendedAzureBlobStorageConfig[]) {}

  static fromLegacyConfig(config: Config): AzureSorageConfig {
    const azConfig = config.getConfig('azureStorage');
    const legacyConfigs = azConfig.getConfigArray('blobContainers');

    const integrations: ExtendedAzureBlobStorageConfig[] = legacyConfigs.map(
      cfg => {
        const accountName = cfg.getString('accountName');
        const authType = cfg.getString('authType');
        const auth = cfg.getConfig('auth');
        const allowedContainers =
          cfg.getOptionalStringArray('allowedContainers');

        if (authType === 'accessToken') {
          return {
            accountName,
            accountKey: auth.getString('accessToken'),
            host: 'blob.core.windows.net',
            allowedContainers,
          };
        } else if (authType === 'clientToken') {
          return {
            accountName,
            aadCredential: {
              clientId: auth.getString('clientId'),
              tenantId: auth.getString('tenantId'),
              clientSecret: auth.getString('clientSecret'),
            },
            host: 'blob.core.windows.net',
            allowedContainers,
          };
        }
        throw new Error(`Unknown authType: ${authType}`);
      },
    );

    return new AzureSorageConfig(integrations);
  }

  static fromConfig(config: Config): AzureSorageConfig {
    // Try legacy format first (takes precedence)
    if (config.has('azureStorage.blobContainers')) {
      return AzureSorageConfig.fromLegacyConfig(config);
    }

    // Fall back to OSS format
    const configArray =
      config.getOptionalConfigArray('integrations.azureBlobStorage') ?? [];
    const integrations: ExtendedAzureBlobStorageConfig[] = configArray.map(
      cfg => {
        const ossConfig = readAzureBlobStorageIntegrationConfig(cfg);
        const allowedContainers =
          cfg.getOptionalStringArray('allowedContainers');
        return { ...ossConfig, allowedContainers };
      },
    );

    return new AzureSorageConfig(integrations);
  }
}
