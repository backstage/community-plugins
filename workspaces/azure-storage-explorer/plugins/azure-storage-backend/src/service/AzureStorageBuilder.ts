import { Logger } from 'winston';
import { AzureStorageProvider } from './AzureStorageProvider';
import { Config } from '@backstage/config';
import Router from 'express-promise-router';
import express from 'express';
import { NotFoundError } from '@backstage/errors';
import { errorHandler } from '@backstage/backend-common';

export interface AzureStorageEnv {
  logger: Logger;
  config: Config;
}

export interface AzureStorageBuilderReturn {
  router: express.Router;
}

export class AzureStorageBuilder {
  private azureStorageProvider?: AzureStorageProvider;
  constructor(protected readonly env: AzureStorageEnv) {}

  static createBuilder(env: AzureStorageEnv) {
    return new AzureStorageBuilder(env);
  }

  public async build(): Promise<AzureStorageBuilderReturn> {
    const { logger, config } = this.env;

    logger.info('Initializing Azure Storage backend');

    if (!config.has('azureStorage')) {
      logger.warn('Failed to initialize Azure Storage Backend');
      throw new NotFoundError('azureStorage config mission!!');
    }

    this.azureStorageProvider =
      this.azureStorageProvider ?? AzureStorageProvider.fromConfig(config);

    const router = this.buildRouter(this.azureStorageProvider, logger);
    return {
      router: router,
    };
  }

  protected buildRouter(
    azureStorageProvider: AzureStorageProvider,
    logger: Logger,
  ): express.Router {
    const router = Router();
    router.use(express.json());

    router.get('/health', (_, response) => {
      logger.info('PONG!');
      response.json({ status: 'ok' });
    });

    router.get('/list/accounts', async (_, response) => {
      response.json(await azureStorageProvider.listAccounts());
    });

    router.get('/:storageAccount/containers', async (request, response) => {
      const { storageAccount } = request.params;
      const containers = await azureStorageProvider.listContainers(
        storageAccount,
      );
      response.json(containers);
    });

    router.get(
      '/:storageAccount/containers/:containerName',
      async (request, response) => {
        const { storageAccount, containerName } = request.params;
        const prefix = request.query.prefix;
        const blobs = await azureStorageProvider.listContainerBlobs(
          storageAccount,
          containerName,
          prefix,
        );
        response.json(blobs);
      },
    );

    router.get(
      '/:storageAccount/containers/:containerName/:blobName/download',
      async (request, response) => {
        const { storageAccount, containerName, blobName } = request.params;
        const prefix = request.query.prefix;
        const readableStream = await azureStorageProvider.downloadBlob(
          storageAccount,
          containerName,
          blobName,
          prefix,
        );
        readableStream?.on('data', data => {
          response.write(data);
        });
        readableStream?.on('end', () => {
          response.send();
        });
        readableStream?.on('error', err => {
          response.status(400).send(err.message);
        });
      },
    );

    router.use(errorHandler());

    return router;
  }
}
