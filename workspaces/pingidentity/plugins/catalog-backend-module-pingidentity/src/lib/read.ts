import { PingIdentityProviderConfig } from './config';
import { PingIdentityClient } from './client';
import {
  GroupEntity,
  UserEntity,
  ANNOTATION_LOCATION,
  ANNOTATION_ORIGIN_LOCATION,
} from '@backstage/catalog-model';
import { PING_IDENTITY_ID_ANNOTATION } from './constants';
import { UserTransformer, GroupTransformer } from './types';
import { defaultGroupTransformer, defaultUserTransformer } from './defaultTransformers';

/**
 * Find groups that a given user is a member of
 * 
 * @param userId - The user to find group memberships for
 * @param groups - A list of all groups
 * @param groupMembersMap - Maps group ID to all user IDs that belong in that group
 * 
 * @returns a list of group names that a given user belongs in
 */
const findGroupMemberships = (
  userId: string,
  groups: GroupEntity[],
  groupMembersMap: Map<string, Set<string>>
): string[] => {
  const groupMemberships: string[] = [];
  groups.forEach(group => {
    const groupId = group.metadata.annotations ? group.metadata.annotations[PING_IDENTITY_ID_ANNOTATION] : undefined;
    if (groupId && groupMembersMap.has(groupId) && groupMembersMap.get(groupId)?.has(userId)) {
      groupMemberships.push(group.metadata.name);
    }
  });
  return groupMemberships;
}

/**
 * Gets the Ping Identity link ref of the entity
 *
 * @param config
 * @param entityKind - The given entity kind, either `users` or `groups`
 * @param entityId - The given entity ID
 * 
 * @returns the Ping Identity link ref of the entity
 */
const getEntityLocation = (
  config: PingIdentityProviderConfig,
  entityKind: string,
  entityId: string
): string => {
  return `url:${config.apiPath}/environments/${config.envId}/${entityKind}/${entityId}`;
}

/**
 * Returns a parsed list of all users in the Ping Identity environment
 *
 * @param client - The `PingIdentityClient`
 * @param groups - A list of all groups
 * @param groupMembersMap - Maps group ID to all user IDs that belong in that group
 * @param userTransformer - Optional user transformer method
 * 
 * @returns a parsed list of all users fetched from Ping Identity of type `UserEntity`
 */
const parsePingIdentityUsers = async (
  client: PingIdentityClient,
  groups: GroupEntity[],
  groupMembersMap: Map<string, Set<string>>,
  userTransformer?: UserTransformer
): Promise<UserEntity[]> => {
  const transformer = userTransformer ?? defaultUserTransformer;
  const users = await client.getUsers();
  const transformedUsers: (UserEntity | undefined)[] = await Promise.all(users.map(async (user: any) => {
    const userLocation = getEntityLocation(client.getConfig(), 'users', user.id);
    return await transformer({
      apiVersion: 'backstage.io/v1beta1',
      kind: 'User',
      metadata: {
        name: user.username!,
        annotations: {
          [PING_IDENTITY_ID_ANNOTATION]: user.id!,
          [ANNOTATION_LOCATION]: userLocation,
          [ANNOTATION_ORIGIN_LOCATION]: userLocation,
        },
      },
      spec: {
        profile: {
          email: user.email,
          ...(user.name.given || user.name.family
            ? {
              displayName: [user.name.given, user.name.family]
                .filter(Boolean)
                .join(' '),
            }
            : {}),
        },
        memberOf: findGroupMemberships(user.id, groups, groupMembersMap)
      }
    }, client.getConfig().envId, groups);
  }));
  return transformedUsers.filter(user => user !== undefined) as UserEntity[];
}

/**
 * Returns a parsed list of all groups in the Ping Identity environment
 *
 * @param client - The `PingIdentityClient`
 * @param groupMembersMap - Maps group ID to all user IDs that belong in that group
 * @param groupTransformer - Optional group transformer method
 * 
 * @returns a parsed list of all groups fetched from Ping Identity of type `GroupEntity`
 */
const parsePingIdentityGroups = async (
  client: PingIdentityClient,
  groupMembersMap: Map<string, Set<string>>,
  groupTransformer?: GroupTransformer
): Promise<GroupEntity[]> => {
  const transformer = groupTransformer ?? defaultGroupTransformer;
  const groups = await client.getGroups();
  const transformedGroups: (GroupEntity | undefined)[] = await Promise.all(groups.map(async (group: any) => {
    const groupLocation = getEntityLocation(client.getConfig(), 'groups', group.id);
    // add users in group to group membership map
    groupMembersMap.set(group.id, new Set(await client.getUsersInGroup(group.id)));
    return await transformer({
      apiVersion: 'backstage.io/v1beta1',
      kind: 'Group',
      metadata: {
        name: group.name!,
        annotations: {
          [PING_IDENTITY_ID_ANNOTATION]: group.id!,
          [ANNOTATION_LOCATION]: groupLocation,
          [ANNOTATION_ORIGIN_LOCATION]: groupLocation,
        },
        description: group.description
      },
      spec: {
        type: 'group',
        profile: {
          displayName: group.name!,
        },
        children: [],
        parent: await client.getParentGroup(group.id),
        members: [],
      }
    }, client.getConfig().envId);
  }));
  return transformedGroups.filter(group => group !== undefined) as GroupEntity[];
};

/**
 * Returns two parsed lists of all users and groups in the Ping Identity environment
 *
 * @public
 *
 * @param config
 * @param client - The `PingIdentityClient`
 * @param options - The `PingIdentityEntityProvider` options
 * 
 * @returns two parsed lists of all users and groups fetched from Ping Identity
 */
export const readPingIdentity = async (
  client: PingIdentityClient,
  options?: {
    userTransformer?: UserTransformer;
    groupTransformer?: GroupTransformer;
  },
): Promise<{
  users: UserEntity[];
  groups: GroupEntity[];
}> => {
  const groupMembersMap = new Map<string, Set<string>>();
  const groups: GroupEntity[] = await parsePingIdentityGroups(client, groupMembersMap, options?.groupTransformer);
  const users: UserEntity[] = await parsePingIdentityUsers(client, groups, groupMembersMap, options?.userTransformer);
  return { users, groups };
};