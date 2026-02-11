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
import { AzureSorageConfig } from './AzureStorageConfig';
import { BlobServiceClient } from '@azure/storage-blob';
import {
  DefaultAzureCredentialsManager,
  ScmIntegrations,
} from '@backstage/integration';

import { formatBytes } from '../utils/formatBytes';
import { NotFoundError } from '@backstage/errors';
import { ExtendedAzureBlobStorageConfig } from './types';

export class AzureStorageProvider {
  private azureStorageConfig: AzureSorageConfig;
  private credentialsManager: DefaultAzureCredentialsManager;

  constructor(config: AzureSorageConfig, rootConfig: Config) {
    this.azureStorageConfig = config;
    const integrations = ScmIntegrations.fromConfig(rootConfig);
    this.credentialsManager =
      DefaultAzureCredentialsManager.fromIntegrations(integrations);
  }

  static fromConfig(config: Config): AzureStorageProvider {
    return new AzureStorageProvider(
      AzureSorageConfig.fromConfig(config),
      config,
    );
  }

  listAccounts() {
    return this.azureStorageConfig.integrations.map(i => i.accountName);
  }

  protected async getblobServiceClient(storageAccount: string) {
    const integration = this.findIntegration(storageAccount);
    const credential = await this.credentialsManager.getCredentials(
      storageAccount,
    );

    const url = `https://${storageAccount}.${integration.host}`;
    return new BlobServiceClient(url, credential);
  }

  private findIntegration(accountName: string): ExtendedAzureBlobStorageConfig {
    const integration = this.azureStorageConfig.integrations.find(
      i => i.accountName === accountName,
    );
    if (!integration) {
      throw new NotFoundError(
        `No integration found for account: ${accountName}`,
      );
    }
    return integration;
  }

  private getAllowedContainers(account: string): string[] {
    const integration = this.findIntegration(account);
    return integration.allowedContainers ?? [];
  }

  async listContainers(storageAccount: string) {
    const blobServiceClient = await this.getblobServiceClient(storageAccount);
    const allowed = this.getAllowedContainers(storageAccount);
    const contianerList = [];
    for await (const container of blobServiceClient.listContainers()) {
      if (allowed.length === 0 || allowed.includes(container.name)) {
        contianerList.push(container.name);
      }
    }
    return contianerList;
  }

  async listContainerBlobs(
    storageAccount: string,
    containerName: string,
    prefix: any,
  ) {
    const blobServiceClient = await this.getblobServiceClient(storageAccount);
    const containerClient = blobServiceClient.getContainerClient(containerName);
    const items = containerClient.listBlobsByHierarchy('/', {
      prefix: prefix === undefined ? '' : prefix,
    });
    const blobList = [];
    for await (const item of items) {
      if (item.kind === 'prefix') {
        blobList.push({
          filename: item.name.slice(0, -1).includes('/')
            ? item.name.slice(0, -1).split('/').pop()?.concat('/')
            : item.name,
          lastModified: '',
          createdOn: '',
          contentType: 'Folder',
          contentLength: '',
        });
      } else {
        const blobClient = containerClient.getBlobClient(item.name);
        const blobProps = await blobClient.getProperties();
        blobList.push({
          filename: item.name.includes('/')
            ? item.name.split('/').pop()
            : item.name,
          lastModified: blobProps.lastModified,
          createdOn: blobProps.createdOn,
          contentType: blobProps.contentType,
          contentLength: formatBytes(blobProps.contentLength),
        });
      }
    }
    return blobList;
  }

  async downloadBlob(
    storageAccount: string,
    containerName: string,
    blobName: string,
    prefix: any,
  ) {
    const blobServiceClient = await this.getblobServiceClient(storageAccount);
    const containerClient = blobServiceClient.getContainerClient(containerName);
    const blobClient = containerClient.getBlobClient(
      prefix ? prefix + blobName : blobName,
    );
    const downloadBlockBlobResponse = await blobClient.download();
    return downloadBlockBlobResponse.readableStreamBody;
  }
}
