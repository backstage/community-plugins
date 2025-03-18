/*
 * Copyright 2024 The Backstage Authors
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

import type {
  LoggerService,
  SchedulerService,
  SchedulerServiceTaskRunner,
} from '@backstage/backend-plugin-api';
import {
  ANNOTATION_LOCATION,
  ANNOTATION_ORIGIN_LOCATION,
  type Entity,
} from '@backstage/catalog-model';
import type { Config } from '@backstage/config';
import { InputError, isError, NotFoundError } from '@backstage/errors';
import type {
  EntityProvider,
  EntityProviderConnection,
} from '@backstage/plugin-catalog-node';

// @ts-ignore
import { merge } from 'lodash';
import { LimitFunction } from 'p-limit';
import * as uuid from 'uuid';

import {
  GroupTransformer,
  KEYCLOAK_ID_ANNOTATION,
  KeycloakProviderConfig,
  UserTransformer,
} from '../lib';
import { readProviderConfigs } from '../lib/config';
import { readKeycloakRealm } from '../lib/read';
import { authenticate } from '../lib/authenticate';

/**
 * Options for {@link KeycloakOrgEntityProvider}.
 *
 * @public
 */
export interface KeycloakOrgEntityProviderOptions {
  /**
   * A unique, stable identifier for this provider.
   *
   * @example "production"
   */
  id: string;

  /**
   * The refresh schedule to use.
   * @remarks
   *
   * You can pass in the result of
   * {@link @backstage/backend-plugin-api#SchedulerService.createScheduledTaskRunner}
   * to enable automatic scheduling of tasks.
   */
  schedule?: SchedulerServiceTaskRunner;

  /**
   * Scheduler used to schedule refreshes based on
   * the schedule config.
   */
  scheduler?: SchedulerService;

  /**
   * The logger to use.
   */
  logger: LoggerService;

  /**
   * The function that transforms a user entry in LDAP to an entity.
   */
  userTransformer?: UserTransformer;

  /**
   * The function that transforms a group entry in LDAP to an entity.
   */
  groupTransformer?: GroupTransformer;
}

// Makes sure that emitted entities have a proper location
export const withLocations = (
  baseUrl: string,
  realm: string,
  entity: Entity,
): Entity => {
  const kind = entity.kind === 'Group' ? 'groups' : 'users';
  const location = `url:${baseUrl}/admin/realms/${realm}/${kind}/${entity.metadata.annotations?.[KEYCLOAK_ID_ANNOTATION]}`;
  return merge(
    {
      metadata: {
        annotations: {
          [ANNOTATION_LOCATION]: location,
          [ANNOTATION_ORIGIN_LOCATION]: location,
        },
      },
    },
    entity,
  ) as Entity;
};

/**
 * Ingests org data (users and groups) from GitHub.
 *
 * @public
 */
export class KeycloakOrgEntityProvider implements EntityProvider {
  private connection?: EntityProviderConnection;
  private scheduleFn?: () => Promise<void>;

  /**
   * Static builder method to create multiple KeycloakOrgEntityProvider instances from a single config.
   * @param deps - The dependencies required for the provider, including the configuration and logger.
   * @param options - Options for scheduling tasks and transforming users and groups.
   * @returns An array of KeycloakOrgEntityProvider instances.
   */
  static fromConfig(
    deps: {
      config: Config;
      logger: LoggerService;
    },
    options: (
      | { schedule: SchedulerServiceTaskRunner }
      | { scheduler: SchedulerService }
    ) & {
      userTransformer?: UserTransformer;
      groupTransformer?: GroupTransformer;
    },
  ): KeycloakOrgEntityProvider[] {
    const { config, logger } = deps;
    return readProviderConfigs(config).map(providerConfig => {
      let taskRunner: SchedulerServiceTaskRunner | string;
      if ('scheduler' in options && providerConfig.schedule) {
        // Create a scheduled task runner using the provided scheduler and schedule configuration
        taskRunner = options.scheduler.createScheduledTaskRunner(
          providerConfig.schedule,
        );
      } else if ('schedule' in options) {
        // Use the provided schedule directly
        taskRunner = options.schedule;
      } else {
        throw new InputError(
          `No schedule provided via config for KeycloakOrgEntityProvider:${providerConfig.id}.`,
        );
      }

      const provider = new KeycloakOrgEntityProvider({
        id: providerConfig.id,
        provider: providerConfig,
        logger: logger,
        taskRunner: taskRunner,
        userTransformer: options.userTransformer,
        groupTransformer: options.groupTransformer,
      });

      return provider;
    });
  }

  constructor(
    private options: {
      id: string;
      provider: KeycloakProviderConfig;
      logger: LoggerService;
      taskRunner: SchedulerServiceTaskRunner;
      userTransformer?: UserTransformer;
      groupTransformer?: GroupTransformer;
    },
  ) {
    this.schedule(options.taskRunner);
  }

  /**
   * Returns the name of this entity provider.
   */
  getProviderName(): string {
    return `KeycloakOrgEntityProvider:${this.options.id}`;
  }

  /**
   * Connect to Backstage catalog entity provider
   * @param connection - The connection to the catalog API ingestor, which allows the provision of new entities.
   */
  async connect(connection: EntityProviderConnection) {
    this.connection = connection;
    await this.scheduleFn?.();
  }

  /**
   * Runs one complete ingestion loop. Call this method regularly at some
   * appropriate cadence.
   */
  async read(options?: { logger?: LoggerService }) {
    if (!this.connection) {
      throw new NotFoundError('Not initialized');
    }

    const logger = options?.logger ?? this.options.logger;
    const provider = this.options.provider;

    const { markReadComplete } = trackProgress(logger);
    const KeyCloakAdminClientModule = await import(
      '@keycloak/keycloak-admin-client'
    );
    const KeyCloakAdminClient = KeyCloakAdminClientModule.default;

    const kcAdminClient = new KeyCloakAdminClient({
      baseUrl: provider.baseUrl,
      realmName: provider.loginRealm,
    });
    await authenticate(kcAdminClient, provider, logger);

    const pLimitCJSModule = await import('p-limit');
    const limitFunc = pLimitCJSModule.default;
    const concurrency = provider.maxConcurrency ?? 20;
    const limit: LimitFunction = limitFunc(concurrency);

    const { users, groups } = await readKeycloakRealm(
      kcAdminClient,
      provider,
      logger,
      limit,
      {
        userQuerySize: provider.userQuerySize,
        groupQuerySize: provider.groupQuerySize,
        userTransformer: this.options.userTransformer,
        groupTransformer: this.options.groupTransformer,
      },
    );

    const { markCommitComplete } = markReadComplete({ users, groups });

    await this.connection.applyMutation({
      type: 'full',
      entities: [...users, ...groups].map(entity => ({
        locationKey: `keycloak-org-provider:${this.options.id}`,
        entity: withLocations(provider.baseUrl, provider.realm, entity),
      })),
    });

    markCommitComplete();
  }

  /**
   * Periodically schedules a task to read Keycloak user and group information, parse it, and provision it to the Backstage catalog.
   * @param taskRunner - The task runner to use for scheduling tasks.
   */
  schedule(taskRunner: SchedulerServiceTaskRunner) {
    this.scheduleFn = async () => {
      const id = `${this.getProviderName()}:refresh`;
      await taskRunner.run({
        id,
        fn: async () => {
          const logger = this.options.logger.child({
            class: KeycloakOrgEntityProvider.prototype.constructor.name,
            taskId: id,
            taskInstanceId: uuid.v4(),
          });

          try {
            await this.read({ logger });
          } catch (error) {
            if (isError(error)) {
              // Ensure that we don't log any sensitive internal data:
              logger.error('Error while syncing Keycloak users and groups', {
                // Default Error properties:
                name: error.name,
                cause: error.cause,
                message: error.message,
                stack: error.stack,
                // Additional status code if available:
                status: (error.response as { status?: string })?.status,
              });
            }
          }
        },
      });
    };
  }
}

// Helps wrap the timing and logging behaviors
function trackProgress(logger: LoggerService) {
  let timestamp = Date.now();
  let summary: string;

  logger.info('Reading Keycloak users and groups');

  function markReadComplete(read: { users: unknown[]; groups: unknown[] }) {
    summary = `${read.users.length} Keycloak users and ${read.groups.length} Keycloak groups`;
    const readDuration = ((Date.now() - timestamp) / 1000).toFixed(1);
    timestamp = Date.now();
    logger.info(`Read ${summary} in ${readDuration} seconds. Committing...`);
    return { markCommitComplete };
  }

  function markCommitComplete() {
    const commitDuration = ((Date.now() - timestamp) / 1000).toFixed(1);
    logger.info(`Committed ${summary} in ${commitDuration} seconds.`);
  }

  return { markReadComplete };
}
