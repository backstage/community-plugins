import { PingIdentityProviderConfig } from './config';
import { PingIdentityClient } from './client';
import {
  GroupEntity,
  UserEntity,
  ANNOTATION_LOCATION,
  ANNOTATION_ORIGIN_LOCATION,
} from '@backstage/catalog-model';
import { PING_IDENTITY_ID_ANNOTATION } from './constants';
import { UserTransformer, GroupTransformer, PingIdentityUser, PingIdentityGroup } from './types';
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
 * @param userQuerySize - the number of users to query at a time
 * @param userTransformer - Optional user transformer method
 * 
 * @returns a parsed list of all users fetched from Ping Identity of type `UserEntity`
 */
const parsePingIdentityUsers = async (
  client: PingIdentityClient,
  groups: GroupEntity[],
  groupMembersMap: Map<string, Set<string>>,
  userQuerySize?: number,
  userTransformer?: UserTransformer
): Promise<UserEntity[]> => {
  const transformer = userTransformer ?? defaultUserTransformer;
  const pingIdentityUsers: PingIdentityUser[] = await client.getUsers(userQuerySize);
  const transformedUsers: (UserEntity | undefined)[] = await Promise.all(pingIdentityUsers.map(async (user: any) => {
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
    }, user, client.getConfig().envId, groups);
  }));
  return transformedUsers.filter(user => user !== undefined) as UserEntity[];
}

/**
 * Returns a parsed list of all groups in the Ping Identity environment
 *
 * @param client - The `PingIdentityClient`
 * @param groupMembersMap - Maps group ID to all user IDs that belong in that 
 * @param parentGroupMap - Maps group ID to its parent group ID
 * @param groupQuerySize - the number of groups to query at a time
 * @param groupTransformer - Optional group transformer method
 * 
 * @returns a parsed list of all groups fetched from Ping Identity of type `GroupEntity`
 */
const parsePingIdentityGroups = async (
  client: PingIdentityClient,
  groupMembersMap: Map<string, Set<string>>,
  parentGroupMap: Map<string, string>,
  groupQuerySize?: number,
  groupTransformer?: GroupTransformer
): Promise<GroupEntity[]> => {
  const transformer = groupTransformer ?? defaultGroupTransformer;
  const pingIdentityGroups: PingIdentityGroup[] = await client.getGroups(groupQuerySize);
  const transformedGroups: (GroupEntity | undefined)[] = await Promise.all(pingIdentityGroups.map(async (group: any) => {
    const groupLocation = getEntityLocation(client.getConfig(), 'groups', group.id);
    // add users in group to group membership map
    groupMembersMap.set(group.id, new Set(await client.getUsersInGroup(group.id)));
    // add parent group relationship to map
    const parentGroupId = await client.getParentGroupId(group.id);
    if (parentGroupId) parentGroupMap.set(group.id, parentGroupId);

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
        parent: undefined, // will be updated later
      }
    }, group, client.getConfig().envId);
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
    userQuerySize?: number;
    groupQuerySize?: number;
    userTransformer?: UserTransformer;
    groupTransformer?: GroupTransformer;
  },
): Promise<{
  users: UserEntity[];
  groups: GroupEntity[];
}> => {
  const groupMembersMap = new Map<string, Set<string>>();
  const parentGroupMap = new Map<string, string>();
  const groups: GroupEntity[] = await parsePingIdentityGroups(client, groupMembersMap, parentGroupMap, options?.userQuerySize, options?.groupTransformer);
  // update parent/child group relationship
  const groupsMap = new Map<string, GroupEntity>();
  groups.forEach(group => {
    const groupId = group.metadata.annotations![PING_IDENTITY_ID_ANNOTATION];
    groupsMap.set(groupId, group);
  });

  groups.forEach((group) => {
    const parentGroupId = parentGroupMap.get(group.metadata.annotations![PING_IDENTITY_ID_ANNOTATION]);
    if (parentGroupId) {
      const parentGroup = groupsMap.get(parentGroupId);
      group.spec.parent = parentGroup?.metadata.name;
    }
  });

  const users: UserEntity[] = await parsePingIdentityUsers(client, groups, groupMembersMap, options?.groupQuerySize, options?.userTransformer);
  return { users, groups };
};