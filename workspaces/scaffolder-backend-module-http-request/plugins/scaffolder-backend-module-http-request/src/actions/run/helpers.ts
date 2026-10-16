/*
 * Copyright 2026 The Backstage Authors
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
// Copyright 2021 Larder Software Limited
// Migrated from https://github.com/RoadieHQ/roadie-backstage-plugins in 2026.
import { LoggerService } from '@backstage/backend-plugin-api';
import { DiscoveryApi } from '@backstage/core-plugin-api';
import { fetch } from 'cross-fetch';
import type { Logger } from 'winston';
import { HttpOptions } from './types';

class HttpError extends Error {}
const DEFAULT_TIMEOUT = 60_000;

export const getPluginId = (path: string): string => {
  const pluginId = (path.startsWith('/') ? path.substring(1) : path).split(
    '/',
  )[0];
  return pluginId;
};

export const generateBackstageUrl = async (
  discovery: DiscoveryApi,
  path: string,
): Promise<string> => {
  const [pluginId, ...rest] = (
    path.startsWith('/') ? path.substring(1) : path
  ).split('/');
  return `${await discovery.getBaseUrl(pluginId)}/${rest.join('/')}`;
};

export const http = async (
  { url, timeout = DEFAULT_TIMEOUT, ...options }: HttpOptions,
  logger: Logger | LoggerService,
  continueOnBadResponse: boolean = false,
): Promise<any> => {
  let res: Response;

  try {
    res = await fetch(url, {
      ...options,
      signal: AbortSignal.timeout(timeout),
    });
  } catch (e) {
    // thrown by AbortSignal.timeout
    // https://developer.mozilla.org/en-US/docs/Web/API/AbortSignal/timeout_static
    if (e instanceof Error && e.name === 'TimeoutError') {
      throw new HttpError(
        `Request was aborted as it took longer than ${timeout / 1000} seconds`,
      );
    }

    throw new HttpError(`There was an issue with the request: ${e}`);
  }

  const headers: any = {};
  for (const [name, value] of res.headers) {
    headers[name] = value;
  }

  const isJSON = () =>
    headers['content-type'] &&
    headers['content-type'].includes('application/json');

  let body;
  try {
    body = isJSON() ? await res.json() : { message: await res.text() };
  } catch (e) {
    throw new HttpError(`Could not parse response body: ${e}`);
  }

  if (res.status >= 400) {
    logger.error(
      `There was an issue with your request. Status code: ${
        res.status
      } Response body: ${JSON.stringify(body)}`,
    );
    if (continueOnBadResponse) {
      return { code: res.status, headers: {}, body };
    }
    throw new HttpError('Unable to complete request');
  }
  return { code: res.status, headers, body };
};

export const getObjFieldCaseInsensitively = (obj = {}, fieldName: string) => {
  const [, value = ''] =
    Object.entries<string>(obj).find(
      ([key]) => key.toLowerCase() === fieldName.toLowerCase(),
    ) || [];

  return value;
};
