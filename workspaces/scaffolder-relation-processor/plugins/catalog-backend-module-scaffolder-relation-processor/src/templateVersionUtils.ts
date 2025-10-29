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
  DEFAULT_NOTIFICATION_ENABLED,
  DEFAULT_NOTIFICATION_TITLE,
  ENTITY_DISPLAY_NAME_TEMPLATE_VAR,
  TEMPLATE_VERSION_UPDATED_TOPIC,
} from './constants';
import { ScaffolderRelationProcessorConfig } from './types';
import type { Config } from '@backstage/config';

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
 * Sends notifications to owners for each entity that should be updated
 *
 * @param notifications - Notification service to send notifications
 * @param entities - Array of entities that need update notifications sent to their owners
 * @param config - Configuration for notification title and description
 *
 * @internal
 */
async function sendNotificationsToOwners(
  notifications: NotificationService,
  entities: Entity[],
  config: ScaffolderRelationProcessorConfig,
): Promise<void> {
  for (const entity of entities) {
    const ownedByRelations =
      entity.relations?.filter(rel => rel.type === 'ownedBy') || [];

    for (const relation of ownedByRelations) {
      const recipients: NotificationRecipients = {
        type: 'entity',
        entityRef: relation.targetRef,
      };

      const catalogUrl = createEntityCatalogUrl(entity);

      const entityName = entity.metadata.title ?? entity.metadata.name;
      const entityNameRegex = new RegExp(
        ENTITY_DISPLAY_NAME_TEMPLATE_VAR.replace(/\$/g, '\\$'),
        'g',
      );

      const titleReplaced =
        config.notifications?.templateUpdate?.message.title.replace(
          entityNameRegex,
          entityName,
        ) || '';

      // Capitalize the first word of the title
      const title =
        titleReplaced.charAt(0).toUpperCase() + titleReplaced.slice(1);

      const description =
        config.notifications?.templateUpdate?.message.description.replace(
          entityNameRegex,
          entityName,
        ) || '';

      const notificationPayload: NotificationPayload = {
        title,
        description,
        link: catalogUrl,
      };

      await notifications.send({
        recipients,
        payload: notificationPayload,
      });
    }
  }
}

/**
 * Handles template update notifications by finding scaffolded entities and notifying their owners
 *
 * @param catalogClient - Catalog client to query for entities
 * @param notifications - Notification service to send notifications
 * @param auth - Auth service to get authentication token
 * @param processorConfig - Parsed scaffolder relation processor config
 * @param payload - Template update payload containing entity ref and version info
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
        'relations',
      ],
    },
    { token },
  );

  await sendNotificationsToOwners(
    notifications,
    scaffoldedEntities.items,
    processorConfig,
  );
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
            ) ?? DEFAULT_NOTIFICATION_TITLE,
          description:
            config.getOptionalString(
              'scaffolder.notifications.templateUpdate.message.description',
            ) ?? DEFAULT_NOTIFICATION_DESCRIPTION,
        },
      },
    },
  };
}
