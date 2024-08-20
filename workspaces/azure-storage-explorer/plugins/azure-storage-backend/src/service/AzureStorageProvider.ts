import { Config } from '@backstage/config';
import { AzureSorageConfig } from './AzureStorageConfig';
import {
  BlobServiceClient,
  StorageSharedKeyCredential,
} from '@azure/storage-blob';
import { ClientSecretCredential } from '@azure/identity';

import { formatBytes } from '../utils/formatBytes';
import { NotFoundError } from '@backstage/errors';

export class AzureStorageProvider {
  private azureStorageConfig: AzureSorageConfig;
  constructor(config: AzureSorageConfig) {
    this.azureStorageConfig = config;
  }

  static fromConfig(config: Config): AzureStorageProvider {
    return new AzureStorageProvider(AzureSorageConfig.fromConfig(config));
  }

  listAccounts() {
    const accountList = [];
    for (const account of this.azureStorageConfig.blobContainers) {
      accountList.push(account.accountName);
    }
    return accountList;
  }

  protected getblobServiceClient(storageAccount: string) {
    let credentialProvider;
    for (const account of this.azureStorageConfig.blobContainers) {
      if (account.accountName === storageAccount) {
        if (account.authType === 'accessToken') {
          credentialProvider = new StorageSharedKeyCredential(
            storageAccount,
            account.auth.getString('accessToken'),
          );
        } else if (account.authType === 'clientToken') {
          credentialProvider = new ClientSecretCredential(
            account.auth.getString('tenantId'),
            account.auth.getString('clientId'),
            account.auth.getString('clientSecret'),
          );
        } else {
          throw new NotFoundError('No valid auth provider');
        }
      }
    }
    return new BlobServiceClient(
      `https://${storageAccount}.blob.core.windows.net`,
      credentialProvider,
    );
  }

  async listContainers(storageAccount: string) {
    const blobServiceClient = this.getblobServiceClient(storageAccount);
    const contianerList = [];
    for await (const container of blobServiceClient.listContainers()) {
      contianerList.push(container.name);
    }
    return contianerList;
  }

  async listContainerBlobs(
    storageAccount: string,
    containerName: string,
    prefix: any,
  ) {
    const blobServiceClient = this.getblobServiceClient(storageAccount);
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
    const blobServiceClient = this.getblobServiceClient(storageAccount);
    const containerClient = blobServiceClient.getContainerClient(containerName);
    const blobClient = containerClient.getBlobClient(
      prefix ? prefix + blobName : blobName,
    );
    const downloadBlockBlobResponse = await blobClient.download();
    return downloadBlockBlobResponse.readableStreamBody;
  }
}
