/*
 * Copyright 2025 The Backstage Authors
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

import { LoggerService } from '@backstage/backend-plugin-api';
import { Config } from '@backstage/config';
import { InputError, NotAllowedError } from '@backstage/errors';
import { MiddlewareFactory } from '@backstage/backend-defaults/rootHttpRouter';
import express from 'express';
import Router from 'express-promise-router';
import { getAkeylessConfig } from '../config';
import { assertPathAllowed, joinSecretPath, normalizePath } from '../pathUtils';
import { AkeylessApi, AkeylessClient } from './akeylessApi';

/**
 * Environment values needed by the AkeylessBuilder.
 * @public
 */
export interface AkeylessEnvironment {
  logger: LoggerService;
  config: Config;
}

/**
 * The object returned by AkeylessBuilder.build().
 * @public
 */
export type AkeylessBuilderReturn = {
  router: express.Router;
};

type StaticSecretRequest = {
  name?: string;
  value?: string;
  contextPath?: string;
};

/**
 * @public
 */
export class AkeylessBuilder {
  private akeylessApi?: AkeylessApi;
  private allowCrud = true;

  static createBuilder(env: AkeylessEnvironment) {
    return new AkeylessBuilder(env);
  }

  constructor(private readonly env: AkeylessEnvironment) {}

  public setAkeylessClient(client: AkeylessApi) {
    this.akeylessApi = client;
    return this;
  }

  public build(): AkeylessBuilderReturn {
    const { logger, config } = this.env;

    logger.info('Initializing Akeyless backend');

    if (!config.has('akeyless')) {
      logger.warn(
        'Failed to initialize Akeyless backend: akeyless config is missing',
      );
      return { router: Router() };
    }

    const akeylessConfig = getAkeylessConfig(config);
    this.allowCrud = akeylessConfig.allowCrud;
    this.akeylessApi = this.akeylessApi ?? new AkeylessClient(akeylessConfig);

    return {
      router: this.buildRouter(this.akeylessApi),
    };
  }

  private ensureCrudEnabled(): void {
    if (!this.allowCrud) {
      throw new NotAllowedError('Akeyless CRUD operations are disabled');
    }
  }

  private parseContextPath(contextPath: unknown): string {
    if (typeof contextPath !== 'string' || !contextPath.trim()) {
      throw new InputError('contextPath is required');
    }
    return normalizePath(contextPath);
  }

  private parseSecretRequest(body: StaticSecretRequest): {
    name: string;
    value?: string;
    contextPath: string;
  } {
    const contextPath = this.parseContextPath(body.contextPath);
    if (typeof body.name !== 'string' || !body.name.trim()) {
      throw new InputError('name is required');
    }

    const name = joinSecretPath(contextPath, body.name);
    assertPathAllowed(name, contextPath);

    return {
      name,
      value: body.value,
      contextPath,
    };
  }

  private buildRouter(akeylessApi: AkeylessApi): express.Router {
    const router = Router();
    router.use(express.json());

    router.get('/health', (_, response) => {
      response.json({ status: 'ok', allowCrud: this.allowCrud });
    });

    router.get('/v1/secrets/:path', async (request, response) => {
      const { path } = request.params;
      const types = request.query.types;

      if (typeof path !== 'string') {
        throw new InputError(`Invalid path: ${path}`);
      }

      let itemTypes: string[] | undefined;
      if (Array.isArray(types)) {
        itemTypes = types.map(String);
      } else if (typeof types === 'string') {
        itemTypes = [types];
      }

      const items = await akeylessApi.listSecrets(path, itemTypes);
      response.json({
        items,
        consoleUrl: akeylessApi.getConsoleUrl(),
        allowCrud: this.allowCrud,
      });
    });

    router.get('/v1/static-secrets/value', async (request, response) => {
      this.ensureCrudEnabled();

      const { name, contextPath } = request.query;
      const parsedContextPath = this.parseContextPath(contextPath);
      if (typeof name !== 'string' || !name.trim()) {
        throw new InputError('name is required');
      }

      const fullName = normalizePath(name);
      assertPathAllowed(fullName, parsedContextPath);

      const value = await akeylessApi.getStaticSecretValue(fullName);
      response.json({ name: fullName, value });
    });

    router.post('/v1/static-secrets', async (request, response) => {
      this.ensureCrudEnabled();

      const { name, value } = this.parseSecretRequest(
        request.body as StaticSecretRequest,
      );
      if (typeof value !== 'string') {
        throw new InputError('value is required');
      }

      await akeylessApi.createStaticSecret(name, value);
      response.status(201).json({ name });
    });

    router.put('/v1/static-secrets', async (request, response) => {
      this.ensureCrudEnabled();

      const { name, value } = this.parseSecretRequest(
        request.body as StaticSecretRequest,
      );
      if (typeof value !== 'string') {
        throw new InputError('value is required');
      }

      await akeylessApi.updateStaticSecretValue(name, value);
      response.json({ name });
    });

    router.delete('/v1/static-secrets', async (request, response) => {
      this.ensureCrudEnabled();

      const { name } = this.parseSecretRequest(
        request.body as StaticSecretRequest,
      );
      await akeylessApi.deleteItem(name);
      response.status(204).send();
    });

    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    router.use(MiddlewareFactory.create(this.env).error() as any);
    return router;
  }
}
