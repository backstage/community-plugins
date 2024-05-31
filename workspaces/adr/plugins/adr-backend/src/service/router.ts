/*
 * Copyright 2022 The Backstage Authors
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *     http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */

import { CacheClient, UrlReader } from '@backstage/backend-common';
import { NotModifiedError, stringifyError } from '@backstage/errors';
import express from 'express';
import Router from 'express-promise-router';
import { madrParser } from '../search/madrParser';
import { LoggerService } from '@backstage/backend-plugin-api';
import { Config } from '@backstage/config';

/** @public */
export type AdrRouterOptions = {
  reader: UrlReader;
  cacheClient: CacheClient;
  logger: LoggerService;
  config: Config;
};

/** @public */
export async function createRouter(
  options: AdrRouterOptions,
): Promise<express.Router> {
  const { reader, cacheClient, logger, config } = options;

  const timeout = config.getOptionalNumber('adrs.cache.readTimeout');
  const readTimeout = timeout === undefined ? 1000 : timeout;

  const router = Router();
  router.use(express.json());

  router.get('/list', async (req, res) => {
    const urlToProcess = req.query.url as string;
    if (!urlToProcess) {
      res.statusCode = 400;
      res.json({ message: 'No URL provided' });
      return;
    }

    // Promise.race ensures we don't hang the client for long if the cache is unreachable
    const cachedTree = (await Promise.race([
      cacheClient.get(urlToProcess),
      new Promise(cancelAfter => setTimeout(cancelAfter, readTimeout)),
    ])) as
      | {
          data: {
            type: string;
            name: string;
            path: string;
          }[];
          etag: string;
        }
      | undefined;

    const cachedData = cachedTree?.data;

    try {
      const treeGetResponse = await reader.readTree(urlToProcess, {
        etag: cachedTree?.etag,
      });
      const files = await treeGetResponse.files();
      const data = await Promise.all(
        files
          .map(async file => {
            const fileContent = await file.content();
            const adrInfo = madrParser(fileContent.toString());
            return {
              type: 'file',
              name: file.path.substring(file.path.lastIndexOf('/') + 1),
              path: file.path,
              ...adrInfo,
            };
          })
          .reverse(),
      );

      await cacheClient.set(urlToProcess, {
        data,
        etag: treeGetResponse.etag,
      });

      res.json({ data });
    } catch (error: any) {
      if (cachedData && error.name === NotModifiedError.name) {
        res.json({ data: cachedData });
        return;
      }

      const message = stringifyError(error);
      logger.error(`Unable to fetch ADRs from ${urlToProcess}: ${message}`);
      res.statusCode = 500;
      res.json({ message });
    }
  });

  router.get('/file', async (req, res) => {
    const urlToProcess = req.query.url as string;
    if (!urlToProcess) {
      res.statusCode = 400;
      res.json({ message: 'No URL provided' });
      return;
    }

    // Promise.race ensures we don't hang the client for long if the cache is unreachable
    const cachedFileContent = (await Promise.race([
      cacheClient.get(urlToProcess),
      new Promise(cancelAfter => setTimeout(cancelAfter, readTimeout)),
    ])) as
      | {
          data: string;
          etag: string;
        }
      | undefined;

    try {
      const fileGetResponse = await reader.readUrl(urlToProcess, {
        etag: cachedFileContent?.etag,
      });
      const fileBuffer = await fileGetResponse.buffer();
      const data = fileBuffer.toString();

      await cacheClient.set(urlToProcess, {
        data,
        etag: fileGetResponse.etag,
      });

      res.json({ data });
    } catch (error) {
      if (cachedFileContent && error.name === NotModifiedError.name) {
        res.json({ data: cachedFileContent.data });
        return;
      }

      const message = stringifyError(error);
      logger.error(`Unable to fetch ADRs from ${urlToProcess}: ${message}`);
      res.statusCode = 500;
      res.json({ message });
    }
  });

  return router;
}
