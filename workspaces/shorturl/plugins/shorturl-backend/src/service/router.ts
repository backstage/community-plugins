// code based on https://github.com/shailahir/backstage-plugin-shorturl-backend/
import { MiddlewareFactory } from '@backstage/backend-defaults/rootHttpRouter';
import {
  DatabaseService,
  LoggerService,
  RootConfigService,
} from '@backstage/backend-plugin-api';
import express from 'express';
import Router from 'express-promise-router';
import { NotFoundError } from '@backstage/errors';
import { customAlphabet } from 'nanoid';
import { DatabaseHandler } from '../database/DatabaseHandler';
import { ShortURLStore } from '../database/ShortURLStore';

export interface RouterOptions {
  logger: LoggerService;
  config: RootConfigService;
  database: DatabaseService;
}

const defaultAlphabet =
  '0123456789ABCDEFGHIJKLMNOPQRSTUVWXYZ_abcdefghijklmnopqrstuvwxyz-';

export async function createRouter(
  options: RouterOptions,
): Promise<express.Router> {
  const { logger, config, database } = options;

  const router = Router();
  router.use(express.json());

  const db: ShortURLStore = await DatabaseHandler.create({ database });

  router.put('/create', async (_, response) => {
    const reqBody = _.body;
    if (
      !reqBody ||
      Object.keys(reqBody)?.length === 0 ||
      !reqBody.fullUrl ||
      reqBody.usageCount === undefined
    ) {
      response.status(400).json({ status: 'invalid request' });
      return;
    }
    try {
      const existing = await db.getIdByUrl({ fullUrl: reqBody.fullUrl });
      if (existing && existing.shortId) {
        response.json({ status: 'ok', shortUrl: existing.shortId });
      }
      return;
    } catch (e) {
      logger.debug(`URL not found in the database. Proceeding to create it.`);
    }

    const urlLenght = Number(config.getOptionalString('shorturl.length')) || 8;
    const urlAlphabet =
      config.getOptionalString('shorturl.alphabet') || defaultAlphabet;
    const nanoid = customAlphabet(urlAlphabet, urlLenght);
    const id = nanoid();
    await db.saveUrlMapping({
      shortId: id,
      fullUrl: reqBody.fullUrl,
      usageCount: reqBody.usageCount,
    });

    response.status(201).json({ status: 'ok', shortUrl: id });
  });

  router.get('/go/:id', async (_, response) => {
    const shortId = _.params?.id;
    if (!shortId) {
      response.status(400).json({ status: 'invalid request' });
      return;
    }

    try {
      const urlResponse = await db.getUrlById({ shortId });
      if (urlResponse && urlResponse?.fullUrl) {
        response.status(200).json({ status: 'ok', redirectUrl: urlResponse });
      } else {
        response
          .status(500)
          .json({ status: 'error', message: 'Not able to redirect' });
      }
      return;
    } catch (error) {
      if (error instanceof NotFoundError) {
        response.status(404).json({ status: 'ok', message: 'Not found' });
      } else {
        response
          .status(500)
          .json({ status: 'error', message: `Not found ${error}` });
      }
    }
  });

  router.get('/getAll', async (_, response) => {
    const allRows = await db.getAllRecords();
    if (allRows) {
      response.json({ status: 'ok', data: allRows });
    } else {
      response.json({ status: 'error', message: 'Not able to fetch' });
    }
  });

  router.get('/health', (_, response) => {
    logger.info('PONG!');
    response.json({ status: 'ok' });
  });

  const middleware = MiddlewareFactory.create({ logger, config });

  router.use(middleware.error());
  return router;
}
