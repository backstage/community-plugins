import yn from 'yn';
import { getRootLogger } from '@backstage/backend-common';
import { startStandaloneServer } from './service/standaloneServer';

const port = process.env.PLUGIN_PORT ? Number(process.env.PLUGIN_PORT) : 7007;
const enableCors = yn(process.env.PLUGIN_CORS, { default: true });
const logger = getRootLogger();

startStandaloneServer({ port, enableCors, logger }).catch(err => {
  logger.error(err);
  process.exit(1);
});

process.on('SIGINT', () => {
  logger.info('CTRL+C pressed; exiting.');
  process.exit(0);
});
