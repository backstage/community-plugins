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
import type { CatalogProcessorCache } from '@backstage/plugin-catalog-node';
import type { EventsService } from '@backstage/plugin-events-node';
import { CatalogClient } from '@backstage/catalog-client';
import {
  NotificationService,
  NotificationRecipients,
} from '@backstage/plugin-notifications-node';
import { AuthService } from '@backstage/backend-plugin-api';
import { NotificationPayload } from '@backstage/plugin-notifications-common';
import type { Entity } from '@backstage/catalog-model';
import {
  DEFAULT_NOTIFICATION_DESCRIPTION,
  DEFAULT_NOTIFICATION_DESCRIPTION_WITH_PR,
  DEFAULT_NOTIFICATION_ENABLED,
  DEFAULT_NOTIFICATION_TITLE,
  DEFAULT_NOTIFICATION_TITLE_WITH_PR,
  DEFAULT_PR_ENABLED,
  ENTITY_DISPLAY_NAME_TEMPLATE_VAR,
  PR_CREATION_FAILED_PREFIX,
  PR_LINK_TEMPLATE_VAR,
  TEMPLATE_UPDATE_PRS_DOCS_URL,
  TEMPLATE_VERSION_UPDATED_TOPIC,
} from './constants';
import { ScaffolderRelationProcessorConfig } from './types';
import type { Config } from '@backstage/config';
import { LoggerService, UrlReaderService } from '@backstage/backend-plugin-api';
import { handleTemplateUpdatePullRequest } from './pullRequests';
import type { VcsProviderRegistry } from './pullRequests/vcs/VcsProviderRegistry';
import type { PullRequestResult } from './pullRequests/vcs/VcsProvider';

/**
 * Cache structure for storing template version information
 *
 * @internal
 */
export interface TemplateVersionCache {
  version: string;
}

/**
 * Handles template version checking and caching
 *
 * @param entityRef - The string reference of the template entity
 * @param currentVersion - The current version of the template
 * @param cache - The catalog processor cache
 * @param eventsService - The events service for emitting events
 *
 * @internal
 */
export async function handleTemplateVersion(
  entityRef: string,
  currentVersion: string,
  cache: CatalogProcessorCache,
  eventsService?: EventsService,
): Promise<void> {
  const cacheKey = `template-version-${entityRef}`;
  const cachedData = (await cache.get(cacheKey)) as
    | TemplateVersionCache
    | undefined;

  if (cachedData && cachedData.version < currentVersion) {
    if (eventsService) {
      await eventsService.publish({
        topic: TEMPLATE_VERSION_UPDATED_TOPIC,
        eventPayload: {
          entityRef,
          previousVersion: cachedData.version,
          currentVersion,
        },
      });
    }
  }

  await cache.set(cacheKey, {
    version: currentVersion,
  });
}

/**
 * Generates a catalog URL for an entity
 *
 * @param entity - The entity to generate URL for
 * @returns The catalog URL path for the entity
 *
 * @internal
 */
function createEntityCatalogUrl(entity: Entity): string {
  const namespace = entity.metadata.namespace || 'default';
  const encodedNamespace = encodeURIComponent(namespace.toLowerCase());
  const encodedKind = encodeURIComponent(entity.kind.toLowerCase());
  const encodedName = encodeURIComponent(entity.metadata.name.toLowerCase());

  return `/catalog/${encodedNamespace}/${encodedKind}/${encodedName}`;
}

/**
 * Builds a notification payload based on entity, config, and PR result
 *
 * @param entityName - Display name of the entity
 * @param catalogUrl - URL to the entity in the catalog
 * @param config - Configuration for notification title and description
 * @param prResult - Optional PR creation result for this entity
 * @returns NotificationPayload with title, description, and link
 *
 * @internal
 */
function buildNotificationPayload(
  entityName: string,
  catalogUrl: string,
  config: ScaffolderRelationProcessorConfig,
  prResult?: PullRequestResult,
): NotificationPayload {
  const entityNameRegex = new RegExp(
    ENTITY_DISPLAY_NAME_TEMPLATE_VAR.replace(/\$/g, '\\$'),
    'g',
  );
  const prLinkRegex = new RegExp(
    PR_LINK_TEMPLATE_VAR.replace(/\$/g, '\\$'),
    'g',
  );

  // Check if PR creation failed - use default message with error prefix
  if (prResult && !prResult.success) {
    const titleReplaced = DEFAULT_NOTIFICATION_TITLE.replace(
      entityNameRegex,
      entityName,
    );
    const title =
      titleReplaced.charAt(0).toUpperCase() + titleReplaced.slice(1);

    const baseDescription = DEFAULT_NOTIFICATION_DESCRIPTION.replace(
      entityNameRegex,
      entityName,
    );
    const description = `${PR_CREATION_FAILED_PREFIX}: ${prResult.error}. ${baseDescription} For more information, see the documentation: ${TEMPLATE_UPDATE_PRS_DOCS_URL}`;

    return { title, description, link: catalogUrl };
  }

  // Normal flow: use configured message
  const messageConfig = config.notifications?.templateUpdate?.message;

  const titleReplaced =
    messageConfig?.title.replace(entityNameRegex, entityName) || '';
  const title = titleReplaced.charAt(0).toUpperCase() + titleReplaced.slice(1);

  let description =
    messageConfig?.description.replace(entityNameRegex, entityName) || '';

  // Replace PR link placeholder with PR URL if available, otherwise remove it
  if (prResult?.success) {
    description = description.replace(prLinkRegex, prResult.url);
    return { title, description, link: prResult.url };
  }

  description = description.replace(prLinkRegex, '').trim();
  return { title, description, link: catalogUrl };
}

/**
 * Sends notifications to owners for each entity that should be updated
 *
 * @param notifications - Notification service to send notifications
 * @param entities - Array of entities that need update notifications sent to their owners
 * @param config - Configuration for notification title and description
 * @param prResults - Optional map of entity names to their PR creation results.
 *                    If defined (PRs enabled), only entities in this map get notifications.
 *                    If undefined (PRs disabled), all entities get notifications.
 *
 * @internal
 */
async function sendNotificationsToOwners(
  notifications: NotificationService,
  entities: Entity[],
  config: ScaffolderRelationProcessorConfig,
  prResults?: Map<string, PullRequestResult>,
): Promise<void> {
  for (const entity of entities) {
    const prResult = prResults?.get(entity.metadata.name);

    // If PRs are enabled (prResults is defined) but entity is not in the map,
    // it means there were no changes for this entity - skip notification
    if (prResults !== undefined && prResult === undefined) {
      continue;
    }

    const ownedByRelations =
      entity.relations?.filter(rel => rel.type === 'ownedBy') || [];

    for (const relation of ownedByRelations) {
      const recipients: NotificationRecipients = {
        type: 'entity',
        entityRef: relation.targetRef,
      };

      const catalogUrl = createEntityCatalogUrl(entity);
      const entityName = entity.metadata.title ?? entity.metadata.name;

      const payload = buildNotificationPayload(
        entityName,
        catalogUrl,
        config,
        prResult,
      );

      await notifications.send({
        recipients,
        payload,
      });
    }
  }
}

/**
 * Handles template update events by optionally creating PRs and sending notifications
 *
 * @param catalogClient - Catalog client to query for entities
 * @param notifications - Notification service to send notifications
 * @param auth - Auth service to get authentication token
 * @param processorConfig - Parsed scaffolder relation processor config
 * @param payload - Template update payload containing entity ref and version info
 * @param logger - Logger service for logging diffs
 * @param urlReader - UrlReaderService for fetching repository files
 * @param vcsRegistry - VCS provider registry
 * @param config - Backstage config for SCM integrations
 *
 * @internal
 */
export async function handleTemplateUpdateNotifications(
  catalogClient: CatalogClient,
  notifications: NotificationService,
  auth: AuthService,
  processorConfig: ScaffolderRelationProcessorConfig,
  payload: {
    entityRef: string;
    previousVersion: string;
    currentVersion: string;
  },
  logger: LoggerService,
  urlReader: UrlReaderService,
  vcsRegistry: VcsProviderRegistry,
  config: Config,
): Promise<void> {
  const { token } = await auth.getPluginRequestToken({
    onBehalfOf: await auth.getOwnServiceCredentials(),
    targetPluginId: 'catalog',
  });

  const scaffoldedEntities = await catalogClient.getEntities(
    {
      filter: { 'spec.scaffoldedFrom': payload.entityRef },
      fields: [
        'kind',
        'metadata.namespace',
        'metadata.name',
        'metadata.title',
        'metadata.annotations',
        'relations',
        'spec',
      ],
    },
    { token },
  );

  let prResults: Map<string, PullRequestResult> | undefined;

  // Only create PRs if enabled
  if (processorConfig.pullRequests?.templateUpdate?.enabled) {
    prResults = await handleTemplateUpdatePullRequest(
      catalogClient,
      token,
      payload.entityRef,
      logger,
      urlReader,
      vcsRegistry,
      config,
      scaffoldedEntities.items,
      payload.previousVersion,
      payload.currentVersion,
    );
  }

  // Only send notifications if enabled
  if (processorConfig.notifications?.templateUpdate?.enabled) {
    await sendNotificationsToOwners(
      notifications,
      scaffoldedEntities.items,
      processorConfig,
      prResults,
    );
  }
}

/**
 * Reads and parses the scaffolder relation processor configuration
 *
 * @param config - Backstage config
 * @returns Parsed config with defaults
 *
 * @internal
 */
export function readScaffolderRelationProcessorConfig(
  config: Config,
): ScaffolderRelationProcessorConfig {
  const prEnabled =
    config.getOptionalBoolean(
      'scaffolder.pullRequests.templateUpdate.enabled',
    ) ?? DEFAULT_PR_ENABLED;

  // Use PR-specific defaults when PRs are enabled
  const defaultTitle = prEnabled
    ? DEFAULT_NOTIFICATION_TITLE_WITH_PR
    : DEFAULT_NOTIFICATION_TITLE;
  const defaultDescription = prEnabled
    ? DEFAULT_NOTIFICATION_DESCRIPTION_WITH_PR
    : DEFAULT_NOTIFICATION_DESCRIPTION;

  return {
    notifications: {
      templateUpdate: {
        enabled:
          config.getOptionalBoolean(
            'scaffolder.notifications.templateUpdate.enabled',
          ) ?? DEFAULT_NOTIFICATION_ENABLED,
        message: {
          title:
            config.getOptionalString(
              'scaffolder.notifications.templateUpdate.message.title',
            ) ?? defaultTitle,
          description:
            config.getOptionalString(
              'scaffolder.notifications.templateUpdate.message.description',
            ) ?? defaultDescription,
        },
      },
    },
    pullRequests: {
      templateUpdate: {
        enabled: prEnabled,
      },
    },
  };
}
