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
import { TEMPLATE_VERSION_UPDATED_TOPIC } from './constants';

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
 *
 * @internal
 */
async function sendNotificationsToOwners(
  notifications: NotificationService,
  entities: Entity[],
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

      const notificationPayload: NotificationPayload = {
        title: `${
          entity.metadata.name.charAt(0).toUpperCase() +
          entity.metadata.name.slice(1)
        } is out of sync with template`,
        description: `The template used to create ${entity.metadata.name} has been updated to a new version. Review and update your entity to stay in sync with the template.`,
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
 * @param payload - Template update payload containing entity ref and version info
 *
 * @internal
 */
export async function handleTemplateUpdateNotifications(
  catalogClient: CatalogClient,
  notifications: NotificationService,
  auth: AuthService,
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
      fields: ['kind', 'metadata.namespace', 'metadata.name', 'relations'],
    },
    { token },
  );

  await sendNotificationsToOwners(notifications, scaffoldedEntities.items);
}
