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
import {
  DefaultAzureCredential,
  ClientSecretCredential,
} from '@azure/identity';
import { ResourceGraphClient } from '@azure/arm-resourcegraph';
import { Config } from '@backstage/config';
import { LoggerService } from '@backstage/backend-plugin-api';

/**
 * Azure resources credentials configuration.
 * @public
 */
export type AzureResourceConfig = {
  tenantId: string;
  clientId: string;
  clientSecret: string;
};

function getAzureCredentialConfig(
  logger: LoggerService,
  config?: Config,
): AzureResourceConfig | undefined {
  const azureConfig =
    config && config.getOptional<AzureResourceConfig>('credentials');
  if (!azureConfig) {
    logger.warn(
      'No azure resources credentials config provided, using default credential. you can provide credentials in app-config.yaml under `azure-resources.credentials` path',
    );
    return undefined;
  }

  if (
    !azureConfig.clientId ||
    !azureConfig.clientSecret ||
    !azureConfig.tenantId
  ) {
    logger.warn(
      'The azure resources credentials provided are empty or invalid, using default credential. check credentials in app-config.yaml under `azure-resources.credentials` path',
    );
    return undefined;
  }

  return azureConfig;
}

/**
 * A '\@azure/arm-resourcegraph' wrapper that takes azure credentials from backstage config
 * @public
 */
export class AzureResourceGraphClient extends ResourceGraphClient {
  public static fromConfig(
    logger: LoggerService,
    config?: Config,
  ): AzureResourceGraphClient {
    const azureConfig = getAzureCredentialConfig(logger, config);
    if (!azureConfig) {
      return new AzureResourceGraphClient(new DefaultAzureCredential());
    }

    const credential = new ClientSecretCredential(
      azureConfig.tenantId,
      azureConfig.clientId,
      azureConfig.clientSecret,
    );

    return new AzureResourceGraphClient(credential);
  }
}
