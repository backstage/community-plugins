import { Config } from '@backstage/config';
import { Logger } from 'winston';
import { AzureStorageBuilder } from './AzureStorageBuilder';

/** @public */
export interface RouterOptions {
  logger: Logger;
  config: Config;
}

/** @public */
export async function createRouter(options: RouterOptions) {
  const { logger, config } = options;
  const { router } = await AzureStorageBuilder.createBuilder({
    logger,
    config,
  }).build();

  return router;
}
