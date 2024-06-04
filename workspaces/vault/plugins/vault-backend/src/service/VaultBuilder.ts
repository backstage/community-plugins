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

import { Config } from '@backstage/config';
import {InputError, NotAllowedError, NotFoundError} from '@backstage/errors';
import { LoggerService } from '@backstage/backend-plugin-api';
import express from 'express';
import Router from 'express-promise-router';
import { createPermissionIntegrationRouter } from '@backstage/plugin-permission-node';
import { VaultApi, VaultClient } from './vaultApi';
import { RouterOptions } from './router'
import {
  PluginTaskScheduler,
  TaskRunner,
  TaskScheduleDefinition,
  TaskScheduleDefinitionConfig,
  readTaskScheduleDefinitionFromConfig,
} from '@backstage/backend-tasks';
import {createLegacyAuthAdapters, errorHandler} from '@backstage/backend-common';
import {
  vaultEntityPermissions,
  vaultEntityReadPermission
} from "@backstage-community/plugin-vault-node/src/permissions";
import { AuthorizeResult } from '@backstage/plugin-permission-common';

/**
 * Environment values needed by the VaultBuilder
 * @public
 */
export interface VaultEnvironment {
  logger: LoggerService;
  config: Config;
  scheduler: PluginTaskScheduler;
}

/**
 * The object returned by the VaultBuilder.build() function
 * @public
 */
export type VaultBuilderReturn = {
  router: express.Router;
};

/**
 * Implementation for Vault. It creates the routing and initializes the backend
 * to allow the use of the Vault's frontend plugin.
 * @public
 */
export class VaultBuilder {
  private vaultApi?: VaultApi;

  /**
   * Creates a new instance of the VaultBuilder.
   *
   * @param env - The backstage environment
   * @returns A new instance of the VaultBuilder
   */
  static createBuilder(env: VaultEnvironment) {
    return new VaultBuilder(env);
  }

  constructor(private readonly env: VaultEnvironment) {}

  /**
   * Builds the routes for Vault.
   *
   * @returns The router configured for Vault
   */
  public build(): VaultBuilderReturn {
    const { logger, config } = this.env;

    logger.info('Initializing Vault backend');

    if (!config.has('vault')) {
      logger.warn(
        'Failed to initialize Vault backend: vault config is missing',
      );
      return {
        router: Router(),
      };
    }

    // TODO: Properly build a set of options to pass into buildRouter
    this.vaultApi = this.vaultApi ?? new VaultClient(this.env);

    const router = this.buildRouter(this.vaultApi);

    return {
      router: router,
    };
  }

  /**
   * Overwrites the current vault client.
   *
   * @param vaultApi - The new Vault client
   * @returns
   */
  public setVaultClient(vaultApi: VaultApi) {
    this.vaultApi = vaultApi;
    return this;
  }

  /**
   * Enables the token renewal for Vault. The schedule if configured in the app-config.yaml file.
   * If not set, the renewal is executed hourly
   *
   * @returns
   */
  public async enableTokenRenew(schedule?: TaskRunner) {
    const taskRunner = schedule
      ? schedule
      : this.env.scheduler.createScheduledTaskRunner(this.getConfigSchedule());

    await taskRunner.run({
      id: 'refresh-vault-token',
      fn: async () => {
        this.env.logger.info('Renewing Vault token');
        const vaultApi = this.vaultApi ?? new VaultClient(this.env);
        await vaultApi.renewToken?.();
      },
    });
    return this;
  }

  private getConfigSchedule(): TaskScheduleDefinition {
    const schedule = this.env.config.getOptional<
      TaskScheduleDefinitionConfig | boolean
    >('vault.schedule');

    const scheduleCfg =
      schedule !== undefined && schedule !== false
        ? {
            frequency: { hours: 1 },
            timeout: { hours: 1 },
          }
        : readTaskScheduleDefinitionFromConfig(
            this.env.config.getConfig('vault.schedule'),
          );

    return scheduleCfg;
  }

  /**
   * Builds the backend routes for Vault.
   *
   * @param vaultApi - The Vault client used to list the secrets.
   * @param options
   * @returns The generated backend router
   */
  private buildRouter(options: RouterOptions): express.Router {
    const { vaultApi, permissions, catalogApi } = options;
    const { auth, httpAuth } = createLegacyAuthAdapters(options);


    // Connect permissions to the router
    const permissionIntegrationRouter = createPermissionIntegrationRouter({
      permissions: vaultEntityPermissions,
    });

    const router = Router();
    router.use(express.json());
    router.use(permissionIntegrationRouter);

    router.get('/health', (_, res) => {
      res.json({ status: 'ok' });
    });

    router.get('/v1/secrets/:path', async (req, res) => {
      const { path } = req.params;
      const { engine } = req.query;
      const credentials = await httpAuth.credentials(req);

      const entityRef = req.body.entityRef;
      if (typeof entityRef !== 'string') {
        throw new InputError('Invalid entityRef, not a string');
      }
      const { token } = await auth.getPluginRequestToken({
        onBehalfOf: credentials,
        targetPluginId: 'catalog',
      });
      const entity = await catalogApi.getEntityByRef(entityRef, { token });
      if (!entity) {
        throw new NotFoundError()
      }

      const decision = permissions
          ? (
              await permissions.authorize(
                  [
                    {
                      permission: vaultEntityReadPermission,
                      resourceRef: entityRef,
                    },
                  ],
                  { credentials },
              )
          )[0]
          : undefined;
      if (decision && decision.result === AuthorizeResult.DENY) {
        throw new NotAllowedError('Unauthorized');
      }

      if (typeof path !== 'string') {
        throw new InputError(`Invalid path: ${path}`);
      }
      if (engine && typeof engine !== 'string') {
        throw new InputError(`Invalid engine: ${engine}`);
      }

      const secrets = await vaultApi.listSecrets(path, {
        secretEngine: engine,
      });
      res.json({ items: secrets });
    });

    router.use(errorHandler());
    return router;
  }
}
