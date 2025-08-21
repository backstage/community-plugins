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
        topic: 'relationProcessor.template:version_updated',
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
 * Extracts unique owners from a list of entities by looking at their "ownedBy" relations
 *
 * @param entities - Array of entities to extract owners from
 * @returns Set of unique owner references
 *
 * @internal
 */
function extractUniqueOwnersFromEntities(entities: Entity[]): Set<string> {
  const uniqueOwners = new Set<string>();
  for (const entity of entities) {
    const ownedByRelations =
      entity.relations?.filter(rel => rel.type === 'ownedBy') || [];

    for (const relation of ownedByRelations) {
      uniqueOwners.add(relation.targetRef);
    }
  }
  return uniqueOwners;
}

/**
 * Sends notifications to a set of owners about a template update
 *
 * @param notifications - Notification service to send notifications
 * @param uniqueOwners - Set of unique owner references to notify
 * @param payload - Template update payload containing entity ref and version info
 *
 * @internal
 */
async function sendNotificationsToOwners(
  notifications: NotificationService,
  uniqueOwners: Set<string>,
  payload: {
    entityRef: string;
    previousVersion: string;
    currentVersion: string;
  },
): Promise<void> {
  for (const ownerRef of uniqueOwners) {
    const recipients: NotificationRecipients = {
      type: 'entity',
      entityRef: ownerRef,
    };

    const notificationPayload: NotificationPayload = {
      title: `${payload.entityRef} is out of sync with template`,
      description: `The template used to create ${payload.entityRef} has been updated to a new version. Review and update your entity to stay in sync with the template.`,
      link: `/catalog/${payload.entityRef.replace(':', '/')}`,
    };

    await notifications.send({
      recipients,
      payload: notificationPayload,
    });
  }

  console.log(
    `Successfully sent notifications for template update: ${payload.entityRef}`,
  );
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
  try {
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

    if (scaffoldedEntities.items.length === 0) {
      console.log(`No entities scaffolded from template ${payload.entityRef}`);
      return;
    }

    console.log(
      `Found ${scaffoldedEntities.items.length} entities scaffolded from template ${payload.entityRef}`,
    );

    const uniqueOwners = extractUniqueOwnersFromEntities(
      scaffoldedEntities.items,
    );

    console.log(
      `Sending notifications to ${uniqueOwners.size} owners for template update`,
    );

    await sendNotificationsToOwners(notifications, uniqueOwners, payload);
  } catch (error) {
    console.log(
      `Failed to send notifications for template update ${payload.entityRef}: ${error}`,
    );
  }
}
