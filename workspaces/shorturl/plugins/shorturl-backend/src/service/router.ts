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
import { Request, Response } from 'express';

/**
 * RouterOptions
 * @public
 */
export interface RouterOptions {
  /**
   * Logger service
   * @public
   */
  logger: LoggerService;
  /**
   * Config service
   * @public
   */
  config: RootConfigService;

  /**
   * Database service
   * @public
   */
  database: DatabaseService;
}

const DEFAULT_ALPHABET =
  '0123456789ABCDEFGHIJKLMNOPQRSTUVWXYZ_abcdefghijklmnopqrstuvwxyz-' as const;
const DEFAULT_URL_LENGTH = 8;

/**
 * createRouter
 * @public
 */
export async function createRouter(
  options: RouterOptions,
): Promise<express.Router> {
  const { logger, config, database } = options;

  const router = Router();
  router.use(express.json());

  const db: ShortURLStore = await DatabaseHandler.create({ database });

  router.put('/create', async (req: Request, res: Response) => {
    const reqBody = req.body;
    if (
      !reqBody ||
      Object.keys(reqBody)?.length === 0 ||
      !reqBody.fullUrl ||
      reqBody.usageCount === undefined
    ) {
      res.status(400).json({ status: 'invalid request' });
      return;
    }
    try {
      const existing = await db.getIdByUrl({ fullUrl: reqBody.fullUrl });
      if (existing && existing.shortId) {
        res.json({ status: 'ok', shortUrl: existing.shortId });
      }
      return;
    } catch (e) {
      logger.debug(`URL not found in the database. Proceeding to create it.`);
    }

    const urlLenght =
      Number(config.getOptionalNumber('shorturl.length')) || DEFAULT_URL_LENGTH;
    const urlAlphabet =
      config.getOptionalString('shorturl.alphabet') || DEFAULT_ALPHABET;
    const nanoid = customAlphabet(urlAlphabet, urlLenght);
    const id = nanoid();
    await db.saveUrlMapping({
      shortId: id,
      fullUrl: reqBody.fullUrl,
      usageCount: reqBody.usageCount,
    });

    res.status(201).json({ status: 'ok', shortUrl: id });
  });

  router.get('/go/:id', async (req: Request, res: Response) => {
    const shortId = req.params?.id;
    if (!shortId) {
      res.status(400).json({ status: 'invalid request' });
      return;
    }

    try {
      const urlResponse = await db.getUrlById({ shortId });
      if (urlResponse && urlResponse?.fullUrl) {
        res
          .status(200)
          .json({ status: 'ok', redirectUrl: urlResponse.fullUrl });
      } else {
        res
          .status(500)
          .json({ status: 'error', message: 'Not able to redirect' });
      }
      return;
    } catch (error) {
      if (error instanceof NotFoundError) {
        res.status(404).json({ status: 'ok', message: 'Not found' });
      } else {
        res
          .status(500)
          .json({ status: 'error', message: `Not found ${error}` });
      }
    }
  });

  router.get('/getAll', async (_req: Request, res: Response) => {
    const allRows = await db.getAllRecords();
    if (allRows) {
      res.json({ status: 'ok', data: allRows });
    } else {
      res.json({ status: 'error', message: 'Not able to fetch' });
    }
  });

  router.get('/health', (_req: Request, res: Response) => {
    logger.info('PONG!');
    res.json({ status: 'ok' });
  });

  const middleware = MiddlewareFactory.create({ logger, config });

  router.use(middleware.error());
  return router;
}
