import { Config } from '@backstage/config';
import { BlobContainer } from './types';

export class AzureSorageConfig {
  constructor(public readonly blobContainers: BlobContainer[]) {}

  static fromConfig(config: Config): AzureSorageConfig {
    const azConfig = config.getConfig('azureStorage');
    const blobContainers: BlobContainer[] = azConfig
      .getConfigArray('blobContainers')
      .map(cfg => {
        return {
          accountName: cfg.getString('accountName'),
          authType: cfg.getString('authType'),
          auth: cfg.getConfig('auth'),
        };
      });
    return new AzureSorageConfig(blobContainers);
  }
}
