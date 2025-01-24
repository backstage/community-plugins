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

import { NotModifiedError, stringifyError } from '@backstage/errors';
import express from 'express';
import Router from 'express-promise-router';
import { madrParser } from '@backstage-community/plugin-adr-common';
import {
  CacheService,
  LoggerService,
  UrlReaderService,
} from '@backstage/backend-plugin-api';

/** @public */
export type AdrRouterOptions = {
  reader: UrlReaderService;
  cacheClient: CacheService;
  logger: LoggerService;
};

const isFulfilled = <T>(
  p: PromiseSettledResult<T>,
): p is PromiseFulfilledResult<T> => p.status === 'fulfilled';

/** @public */
export async function createRouter(
  options: AdrRouterOptions,
): Promise<express.Router> {
  const { reader, cacheClient, logger } = options;

  const router = Router();
  router.use(express.json());

  router.get('/list', async (req, res) => {
    const urlToProcess = req.query.url as string;
    if (!urlToProcess) {
      res.statusCode = 400;
      res.json({ message: 'No URL provided' });
      return;
    }

    const cachedTree = (await cacheClient.get(urlToProcess)) as {
      data: {
        type: string;
        name: string;
        path: string;
      }[];
      etag: string;
    };
    const cachedData = cachedTree?.data;

    try {
      const treeGetResponse = await reader.readTree(urlToProcess, {
        etag: cachedTree?.etag,
      });
      const files = await treeGetResponse.files();
      const results = await Promise.allSettled(
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
      const data = results.filter(isFulfilled).map(result => result.value);

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

    const cachedFileContent = (await cacheClient.get(urlToProcess)) as {
      data: string;
      etag: string;
    };

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

  router.get('/image', async (req, res) => {
    const urlToProcess = req.query.url as string;
    if (!urlToProcess) {
      res.statusCode = 400;
      res.json({ message: 'No URL provided' });
      return;
    }

    const imageTypeMap: Record<string, string> = {
      png: 'image/png',
      jpg: 'image/jpeg',
      jpeg: 'image/jpeg',
      gif: 'image/gif',
      svg: 'image/svg+xml',
      webp: 'image/webp',
    };

    const imageType = urlToProcess.match(/\.([a-z0-9]+)(\?.*)?$/i);
    if (!(imageType && imageType[1])) {
      res.statusCode = 400;
      res.json({ message: 'No URL to image' });
      return;
    }
    if (!imageTypeMap[imageType[1].toLowerCase()]) {
      res.statusCode = 400;
      res.json({ message: `Image type ${imageType[1]} is not supported` });
      return;
    }
    const contentType = imageTypeMap[imageType[1].toLowerCase()];

    const cachedFileContent = (await cacheClient.get(urlToProcess)) as {
      data: string;
      etag: string;
    };
    try {
      const fileGetResponse = await reader.readUrl(urlToProcess, {
        etag: cachedFileContent?.etag,
      });
      const fileBuffer = await fileGetResponse.buffer();
      const data = fileBuffer.toString('base64');

      await cacheClient.set(urlToProcess, {
        data,
        etag: fileGetResponse.etag,
      });
      res.setHeader('Content-Type', contentType);
      res.end(data, 'base64');
    } catch (error) {
      if (cachedFileContent && error.name === NotModifiedError.name) {
        res.setHeader('Content-Type', contentType);
        res.end(cachedFileContent.data, 'base64');
        return;
      }

      const message = stringifyError(error);
      logger.error(
        `Unable to fetch ADRs images from ${urlToProcess}: ${message}`,
      );
      res.statusCode = 500;
      res.json({ message });
    }
  });

  return router;
}
