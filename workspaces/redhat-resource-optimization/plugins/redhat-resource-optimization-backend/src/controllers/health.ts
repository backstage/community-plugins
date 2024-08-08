import type { RequestHandler } from 'express';
import type { RouterOptions } from '../service/router';

export const getHealth: (options: RouterOptions) => RequestHandler =
  options => (_, response) => {
    const { logger } = options;

    logger.info('PONG!');
    response.json({ status: 'ok' });
  };
