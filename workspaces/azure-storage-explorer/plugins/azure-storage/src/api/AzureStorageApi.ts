import { createApiRef } from '@backstage/core-plugin-api';

/** @public */
export const azureStorageApiRef = createApiRef<AzureStorageApi>({
  id: 'plugin.azure-storage.service',
});

export interface AzureStorageApi {
  listStorageAccounts(): Promise<any>;
  listContainers(storageAccount: string): Promise<any>;
  listContainerBlobs(
    storageAccount: string,
    containerName: string,
    prefix?: string,
  ): Promise<any>;
  downloadBlob(
    storageAccount: string,
    containerName: string,
    blobName: string,
    prefix?: string,
  ): Promise<any>;
}
