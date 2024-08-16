import { getRootLogger } from '@backstage/backend-common';

const logger = getRootLogger();

process.on('SIGINT', () => {
  logger.info('CTRL+C pressed; exiting.');
  process.exit(0);
});
