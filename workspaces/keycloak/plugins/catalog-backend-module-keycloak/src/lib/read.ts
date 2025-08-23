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

import type { LoggerService } from '@backstage/backend-plugin-api';
import type { GroupEntity, UserEntity } from '@backstage/catalog-model';

import type KeycloakAdminClient from '@keycloak/keycloak-admin-client';
import type GroupRepresentation from '@keycloak/keycloak-admin-client/lib/defs/groupRepresentation';
import type UserRepresentation from '@keycloak/keycloak-admin-client/lib/defs/userRepresentation';
import type { Groups } from '@keycloak/keycloak-admin-client/lib/resources/groups';
import type { Users } from '@keycloak/keycloak-admin-client/lib/resources/users';
import { LimitFunction } from 'p-limit';

import { KeycloakProviderConfig } from './config';
import {
  KEYCLOAK_ENTITY_QUERY_SIZE,
  KEYCLOAK_ID_ANNOTATION,
  KEYCLOAK_REALM_ANNOTATION,
  KEYCLOAK_BRIEF_REPRESENTATION_DEFAULT,
} from './constants';
import {
  sanitizeUserNameTransformer,
  sanitizeGroupNameTransformer,
} from './transformers';
import {
  GroupRepresentationWithParent,
  GroupRepresentationWithParentAndEntity,
  GroupTransformer,
  UserRepresentationWithEntity,
  UserTransformer,
} from './types';
import { ensureTokenValid } from './authenticate';
import { Attributes, Counter } from '@opentelemetry/api';

export const parseGroup = async (
  keycloakGroup: GroupRepresentationWithParent,
  realm: string,
  groupTransformer?: GroupTransformer,
): Promise<GroupEntity | undefined> => {
  const transformer = groupTransformer ?? sanitizeGroupNameTransformer;
  const entity: GroupEntity = {
    apiVersion: 'backstage.io/v1beta1',
    kind: 'Group',
    metadata: {
      name: keycloakGroup.name!,
      annotations: {
        [KEYCLOAK_ID_ANNOTATION]: keycloakGroup.id!,
        [KEYCLOAK_REALM_ANNOTATION]: realm,
      },
    },
    spec: {
      type: 'group',
      profile: {
        displayName: keycloakGroup.name!,
      },
      // children, parent and members are updated again after all group and user transformers applied.
      children: keycloakGroup.subGroups?.map(g => g.name!) ?? [],
      parent: keycloakGroup.parent,
      members: keycloakGroup.members,
    },
  };

  return await transformer(entity, keycloakGroup, realm);
};

export const parseUser = async (
  user: UserRepresentation,
  realm: string,
  keycloakGroups: GroupRepresentationWithParentAndEntity[],
  groupIndex: Map<string, string[]>,
  userTransformer?: UserTransformer,
): Promise<UserEntity | undefined> => {
  const transformer = userTransformer ?? sanitizeUserNameTransformer;
  const entity: UserEntity = {
    apiVersion: 'backstage.io/v1beta1',
    kind: 'User',
    metadata: {
      name: user.username!,
      annotations: {
        [KEYCLOAK_ID_ANNOTATION]: user.id!,
        [KEYCLOAK_REALM_ANNOTATION]: realm,
      },
    },
    spec: {
      profile: {
        email: user.email,
        ...(user.firstName || user.lastName
          ? {
              displayName: [user.firstName, user.lastName]
                .filter(Boolean)
                .join(' '),
            }
          : {}),
      },
      memberOf: groupIndex.get(user.username!) ?? [],
    },
  };

  return await transformer(entity, user, realm, keycloakGroups);
};

export async function getEntities<T extends Users | Groups>(
  getEntitiesFn: () => Promise<T>,
  config: KeycloakProviderConfig,
  logger: LoggerService,
  dataBatchFailureCounter: Counter<Attributes>,
  taskInstanceId: string,
  limit: LimitFunction,
  entityQuerySize: number = KEYCLOAK_ENTITY_QUERY_SIZE,
): Promise<Awaited<ReturnType<T['find']>>> {
  const entitiesAPI = await getEntitiesFn();
  const rawEntityCount = await entitiesAPI.count({ realm: config.realm });
  const entityCount =
    typeof rawEntityCount === 'number' ? rawEntityCount : rawEntityCount.count;

  const pageCount = Math.ceil(entityCount / entityQuerySize);
  const brief =
    config.briefRepresentation ?? KEYCLOAK_BRIEF_REPRESENTATION_DEFAULT;

  // The next line acts like range in python
  const entityPromises = Array.from({ length: pageCount }, (_, i) =>
    limit(() =>
      getEntitiesFn().then(entities => {
        return entities
          .find({
            realm: config.realm,
            max: entityQuerySize,
            first: i * entityQuerySize,
            briefRepresentation: brief,
          })
          .then(ents => {
            logger.debug(
              `Importing keycloak entities batch with index ${i} from pages: ${pageCount}`,
            );
            return ents;
          })
          .catch(err => {
            dataBatchFailureCounter.add(1, { taskInstanceId: taskInstanceId });
            logger.warn(
              `Failed to retieve Keycloak entities for taskInstanceId: ${taskInstanceId}. Error: ${err}`,
            );
            return [];
          }) as ReturnType<T['find']>;
      }),
    ),
  );

  const entityResults = (await Promise.all(entityPromises)).flat() as Awaited<
    ReturnType<T['find']>
  >;

  return entityResults;
}

async function getAllGroupMembers<T extends Groups>(
  groupsAPI: () => Promise<T>,
  groupId: string,
  config: KeycloakProviderConfig,
  options?: { userQuerySize?: number },
): Promise<string[]> {
  const querySize = options?.userQuerySize || 100;

  let allMembers: string[] = [];
  let page = 0;
  let totalMembers = 0;

  do {
    const groups = await groupsAPI();
    const members = await groups.listMembers({
      id: groupId,
      max: querySize,
      realm: config.realm,
      first: page * querySize,
    });

    if (members.length > 0) {
      allMembers = allMembers.concat(members.map(m => m.username!));
      totalMembers = members.length; // Get the number of members retrieved
    } else {
      totalMembers = 0; // No members retrieved
    }

    page++;
  } while (totalMembers > 0);

  return allMembers;
}

export async function processGroupsRecursively(
  kcAdminClient: KeycloakAdminClient,
  config: KeycloakProviderConfig,
  logger: LoggerService,
  topLevelGroups: GroupRepresentationWithParent[],
) {
  const allGroups: GroupRepresentationWithParent[] = [];
  const brief =
    config.briefRepresentation ?? KEYCLOAK_BRIEF_REPRESENTATION_DEFAULT;

  for (const group of topLevelGroups) {
    allGroups.push(group);

    if (group.subGroupCount! > 0) {
      await ensureTokenValid(kcAdminClient, config, logger);
      const subgroups = await kcAdminClient.groups.listSubGroups({
        parentId: group.id!,
        first: 0,
        max: group.subGroupCount,
        briefRepresentation: brief,
        realm: config.realm,
      });
      const subGroupResults = await processGroupsRecursively(
        kcAdminClient,
        config,
        logger,
        subgroups,
      );
      allGroups.push(...subGroupResults);
    }
  }

  return allGroups;
}

export function* traverseGroups(
  group: GroupRepresentation,
): IterableIterator<GroupRepresentationWithParent> {
  yield group;
  for (const g of group.subGroups ?? []) {
    (g as GroupRepresentationWithParent).parent = group.name!;
    yield* traverseGroups(g);
  }
}

export const readKeycloakRealm = async (
  client: KeycloakAdminClient,
  config: KeycloakProviderConfig,
  logger: LoggerService,
  limit: LimitFunction,
  taskInstanceId: string,
  dataBatchFailureCounter: Counter<Attributes>,
  options?: {
    userQuerySize?: number;
    groupQuerySize?: number;
    userTransformer?: UserTransformer;
    groupTransformer?: GroupTransformer;
  },
): Promise<{
  users: UserEntity[];
  groups: GroupEntity[];
}> => {
  const kUsers = await getEntities(
    async () => {
      await ensureTokenValid(client, config, logger);
      return client.users;
    },
    config,
    logger,
    dataBatchFailureCounter,
    taskInstanceId,
    limit,
    options?.userQuerySize,
  );
  logger.debug(`Fetched ${kUsers.length} users from Keycloak`);

  const topLevelKGroups = (await getEntities(
    async () => {
      await ensureTokenValid(client, config, logger);
      return client.groups;
    },
    config,
    logger,
    dataBatchFailureCounter,
    taskInstanceId,
    limit,
    options?.groupQuerySize,
  )) as GroupRepresentationWithParent[];
  logger.debug(`Fetched ${topLevelKGroups.length} groups from Keycloak`);

  let serverVersion: number;

  try {
    await ensureTokenValid(client, config, logger);
    const serverInfo = await client.serverInfo.find();
    serverVersion = parseInt(
      serverInfo.systemInfo?.version?.slice(0, 2) || '',
      10,
    );
  } catch (error) {
    throw new Error(`Failed to retrieve Keycloak server information: ${error}`);
  }

  const isVersion23orHigher = serverVersion >= 23;

  let rawKGroups: GroupRepresentationWithParent[] = [];

  logger.debug(`Processing groups recursively`);
  if (isVersion23orHigher) {
    rawKGroups = await processGroupsRecursively(
      client,
      config,
      logger,
      topLevelKGroups,
    );
  } else {
    rawKGroups = topLevelKGroups.reduce(
      (acc, g) => acc.concat(...traverseGroups(g)),
      [] as GroupRepresentationWithParent[],
    );
  }

  logger.debug(`Fetching group members for keycloak groups and list subgroups`);
  const brief =
    config.briefRepresentation ?? KEYCLOAK_BRIEF_REPRESENTATION_DEFAULT;

  const kGroups = await Promise.all(
    rawKGroups.map(g =>
      limit(async () => {
        g.members = await getAllGroupMembers(
          async () => {
            await ensureTokenValid(client, config, logger);
            return client.groups as Groups;
          },
          g.id!,
          config,
          options,
        );

        if (isVersion23orHigher) {
          if (g.subGroupCount! > 0) {
            await ensureTokenValid(client, config, logger);
            g.subGroups = await client.groups.listSubGroups({
              parentId: g.id!,
              first: 0,
              max: g.subGroupCount,
              briefRepresentation: brief,
              realm: config.realm,
            });
          }
          if (g.parentId) {
            await ensureTokenValid(client, config, logger);
            const groupParent = await client.groups.findOne({
              id: g.parentId,
              realm: config.realm,
            });
            g.parent = groupParent?.name;
          }
        }

        return g;
      }),
    ),
  );

  logger.debug(`Parsing groups`);
  const parsedGroups = await Promise.all(
    kGroups.map(async g => {
      // it is possible if fetch request failed
      if (!g) {
        return null;
      }
      const entity = await parseGroup(
        g,
        config.realm,
        options?.groupTransformer,
      );
      if (entity) {
        return { ...g, entity } as GroupRepresentationWithParentAndEntity;
      }
      return null;
    }),
  );
  const filteredParsedGroups = parsedGroups.filter(
    (group): group is GroupRepresentationWithParentAndEntity => group !== null,
  );

  const groupIndex = new Map<string, string[]>();
  filteredParsedGroups.forEach(group => {
    if (group.members) {
      group.members.forEach(member => {
        if (!groupIndex.has(member)) {
          groupIndex.set(member, []);
        }
        groupIndex.get(member)?.push(group.entity.metadata.name);
      });
    }
  });

  logger.debug('Parsing users');
  const parsedUsers = await Promise.all(
    kUsers.map(async u => {
      // it is possible if fetch request failed
      if (!u) {
        return null;
      }
      const entity = await parseUser(
        u,
        config.realm,
        filteredParsedGroups,
        groupIndex,
        options?.userTransformer,
      );
      if (entity) {
        return { ...u, entity } as UserRepresentationWithEntity;
      }
      return null;
    }),
  );
  const filteredParsedUsers = parsedUsers.filter(
    (user): user is UserRepresentationWithEntity => user !== null,
  );

  logger.debug(`Set up group members and children information`);

  const userMap = new Map(
    filteredParsedUsers.map(user => [user.username, user.entity.metadata.name]),
  );

  const groupMap = new Map(
    filteredParsedGroups.map(group => [group.name, group.entity.metadata.name]),
  );

  const groups = filteredParsedGroups.map(g => {
    const entity = g.entity;
    entity.spec.members =
      g.entity.spec.members?.flatMap(m => userMap.get(m) ?? []) ?? [];
    entity.spec.children =
      g.entity.spec.children?.flatMap(c => groupMap.get(c) ?? []) ?? [];
    entity.spec.parent = groupMap.get(entity.spec.parent);
    return entity;
  });

  logger.info(
    `Prepared to ingest  ${parsedUsers.length} users and ${groups.length} groups into the catalog from Keycloak`,
  );

  return { users: filteredParsedUsers.map(u => u.entity), groups };
};
