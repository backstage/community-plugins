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
} from './constants';
import { noopGroupTransformer, noopUserTransformer } from './transformers';
import {
  GroupRepresentationWithParent,
  GroupRepresentationWithParentAndEntity,
  GroupTransformer,
  UserRepresentationWithEntity,
  UserTransformer,
} from './types';
import { Credentials } from '@keycloak/keycloak-admin-client/lib/utils/auth';
import { InputError } from '@backstage/errors';

export const parseGroup = async (
  keycloakGroup: GroupRepresentationWithParent,
  realm: string,
  groupTransformer?: GroupTransformer,
): Promise<GroupEntity | undefined> => {
  const transformer = groupTransformer ?? noopGroupTransformer;
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

  userTransformer?: UserTransformer,
): Promise<UserEntity | undefined> => {
  const transformer = userTransformer ?? noopUserTransformer;
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
      memberOf: keycloakGroups
        .filter(g => g.members?.includes(user.username!))
        .map(g => g.entity.metadata.name),
    },
  };

  return await transformer(entity, user, realm, keycloakGroups);
};

export async function getEntities<T extends Users | Groups>(
  getEntitiesFn: () => Promise<T>,
  config: KeycloakProviderConfig,
  logger: LoggerService,
  limit: LimitFunction,
  entityQuerySize: number = KEYCLOAK_ENTITY_QUERY_SIZE,
): Promise<Awaited<ReturnType<T['find']>>> {
  const entitiesAPI = await getEntitiesFn();
  const rawEntityCount = await entitiesAPI.count({ realm: config.realm });
  const entityCount =
    typeof rawEntityCount === 'number' ? rawEntityCount : rawEntityCount.count;

  const pageCount = Math.ceil(entityCount / entityQuerySize);

  // The next line acts like range in python
  const entityPromises = Array.from({ length: pageCount }, (_, i) =>
    limit(() =>
      getEntitiesFn().then(entities => {
        return entities
          .find({
            realm: config.realm,
            max: entityQuerySize,
            first: i * entityQuerySize,
          })
          .then(ents => {
            console.log(`index ${i} from ${pageCount}`);
            return ents;
          })
          .catch(err =>
            logger.warn('Failed to retieve Keycloak entities.', err),
          ) as ReturnType<T['find']>;
      }),
    ),
  );

  const entityResults = (await Promise.all(entityPromises)).flat() as Awaited<
    ReturnType<T['find']>
  >;

  return entityResults;
}

async function getAllGroupMembers<T extends Groups>(
  kcAdminClient: KeycloakAdminClient,
  groups: T,
  groupId: string,
  config: KeycloakProviderConfig,
  options?: { userQuerySize?: number },
): Promise<string[]> {
  const querySize = options?.userQuerySize || 100;

  let allMembers: string[] = [];
  let page = 0;
  let totalMembers = 0;

  do {
    await ensureTokenValid(kcAdminClient, config);
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
  topLevelGroups: GroupRepresentationWithParent[],
  entities: Groups,
) {
  const allGroups: GroupRepresentationWithParent[] = [];
  for (const group of topLevelGroups) {
    allGroups.push(group);

    if (group.subGroupCount! > 0) {
      await ensureTokenValid(kcAdminClient, config);
      const subgroups = await entities.listSubGroups({
        parentId: group.id!,
        first: 0,
        max: group.subGroupCount,
        briefRepresentation: true,
      });
      const subGroupResults = await processGroupsRecursively(
        kcAdminClient,
        config,
        subgroups,
        entities,
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

// update token with refresh token.
async function ensureTokenValid(
  kcAdminClient: KeycloakAdminClient,
  provider: KeycloakProviderConfig,
) {
  if (!kcAdminClient.accessToken) {
    await authenticate(kcAdminClient, provider);
  } else {
    const tokenData = JSON.parse(
      Buffer.from(kcAdminClient.accessToken.split('.')[1], 'base64').toString(),
    );

    const tokenExpiry = tokenData.exp * 1000; // Convert to milliseconds
    const now = Date.now();

    // update token with refresh token.
    if (now > tokenExpiry - 30000) {
      await authenticate(kcAdminClient, provider);
    }
  }
}

async function authenticate(
  kcAdminClient: KeycloakAdminClient,
  provider: KeycloakProviderConfig,
) {
  try {
    let credentials: Credentials;
    if (provider.username && provider.password) {
      credentials = {
        grantType: 'password',
        clientId: provider.clientId ?? 'admin-cli',
        username: provider.username,
        password: provider.password,
      };
    } else if (provider.clientId && provider.clientSecret) {
      credentials = {
        grantType: 'client_credentials',
        clientId: provider.clientId,
        clientSecret: provider.clientSecret,
      };
    } else {
      throw new InputError(
        `username and password or clientId and clientSecret must be provided.`,
      );
    }
    await kcAdminClient.auth(credentials);
    console.log('Authenticated successfully');
  } catch (error) {
    console.error('Failed to authenticate', error);
    throw error;
  }
}

export const readKeycloakRealm = async (
  client: KeycloakAdminClient,
  config: KeycloakProviderConfig,
  logger: LoggerService,
  limit: LimitFunction,
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
      await ensureTokenValid(client, config);
      return client.users;
    },
    config,
    logger,
    limit,
    options?.userQuerySize,
  );

  const topLevelKGroups = (await getEntities(
    async () => {
      await ensureTokenValid(client, config);
      return client.groups;
    },
    config,
    logger,
    limit,
    options?.groupQuerySize,
  )) as GroupRepresentationWithParent[];

  let serverVersion: number;

  try {
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

  if (isVersion23orHigher) {
    rawKGroups = await processGroupsRecursively(
      client,
      config,
      topLevelKGroups,
      client.groups as Groups,
    );
  } else {
    rawKGroups = topLevelKGroups.reduce(
      (acc, g) => acc.concat(...traverseGroups(g)),
      [] as GroupRepresentationWithParent[],
    );
  }

  const kGroups = await Promise.all(
    rawKGroups.map(g =>
      limit(async () => {
        g.members = await getAllGroupMembers(
          client,
          client.groups as Groups,
          g.id!,
          config,
          options,
        );

        if (isVersion23orHigher) {
          if (g.subGroupCount! > 0) {
            await ensureTokenValid(client, config);
            g.subGroups = await client.groups.listSubGroups({
              parentId: g.id!,
              first: 0,
              max: g.subGroupCount,
              briefRepresentation: false,
              realm: config.realm,
            });
          }
          if (g.parentId) {
            await ensureTokenValid(client, config);
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

  const parsedGroups = await kGroups.reduce(
    async (promise, g) => {
      const partial = await promise;
      const entity = await parseGroup(
        g,
        config.realm,
        options?.groupTransformer,
      );
      if (entity) {
        const group = {
          ...g,
          entity,
        } as GroupRepresentationWithParentAndEntity;
        partial.push(group);
      }
      return partial;
    },
    Promise.resolve([] as GroupRepresentationWithParentAndEntity[]),
  );

  const parsedUsers = await kUsers.reduce(
    async (promise, u) => {
      const partial = await promise;
      const entity = await parseUser(
        u,
        config.realm,
        parsedGroups,
        options?.userTransformer,
      );
      if (entity) {
        const user = { ...u, entity } as UserRepresentationWithEntity;
        partial.push(user);
      }
      return partial;
    },
    Promise.resolve([] as UserRepresentationWithEntity[]),
  );

  const groups = parsedGroups.map(g => {
    const entity = g.entity;
    entity.spec.members =
      g.entity.spec.members?.flatMap(m => {
        const name = parsedUsers.find(p => p.username === m)?.entity.metadata
          .name;
        return name ? [name] : [];
      }) ?? [];
    entity.spec.children =
      g.entity.spec.children?.flatMap(c => {
        const child = parsedGroups.find(p => p.name === c)?.entity.metadata
          .name;
        return child ? [child] : [];
      }) ?? [];
    entity.spec.parent = parsedGroups.find(
      p => p.name === entity.spec.parent,
    )?.entity.metadata.name;
    return entity;
  });

  logger.info(
    `Fetched and parsed ${parsedUsers.length} users and ${groups.length} groups from Keycloak`,
  );

  return { users: parsedUsers.map(u => u.entity), groups };
};
