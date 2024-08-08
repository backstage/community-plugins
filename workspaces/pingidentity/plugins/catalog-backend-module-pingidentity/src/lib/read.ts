import { PingIdentityProviderConfig } from './config';
import { requestApi } from './client';
import {
  GroupEntity,
  UserEntity,
  ANNOTATION_LOCATION,
  ANNOTATION_ORIGIN_LOCATION,
} from '@backstage/catalog-model';
import { PING_IDENTITY_ID_ANNOTATION } from './constants';
import { UserTransformer, GroupTransformer } from './types';
import { defaultGroupTransformer, defaultUserTransformer } from './defaultTransformers';

const readChildGroups = (
  group: GroupEntity,
  groups: GroupEntity[]
): void => {
  const childGroups = groups.filter(g => g.spec.parent === group.metadata.name);
  group.spec.children = childGroups.map(childGroup => childGroup.metadata.name);
  childGroups.forEach(childGroup => {
    readChildGroups(childGroup, groups);
  });
}

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

const getEntityLocation = (
  config: PingIdentityProviderConfig,
  entityKind: string,
  entityId: string
): string => {
  return `url:${config.apiPath}/environments/${config.envId}/${entityKind}/${entityId}`;
}

const parsePingIdentityUsers = async (
  config: PingIdentityProviderConfig,
  groups: GroupEntity[],
  groupMembersMap: Map<string, Set<string>>,
  userTransformer?: UserTransformer
): Promise<UserEntity[]> => {
  const transformer = userTransformer ?? defaultUserTransformer;
  const response = await requestApi(config, 'users');
  const data = await response.json();
  const users: UserEntity[] = data._embedded.users;
  const transformedUsers: (UserEntity | undefined)[] = await Promise.all(users.map(async (user: any) => {
    const userLocation = getEntityLocation(config, 'users', user.id);
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
    }, config.envId, groups);
  }));
  return transformedUsers.filter(user => user !== undefined) as UserEntity[];
}

const addUserIdsInGroup = async (
  groupId: string,
  groupMembersMap: Map<string, Set<string>>,
  config: PingIdentityProviderConfig,
): Promise<void> => {
  const response = await requestApi(config, `users?filter=memberOfGroups[id%20eq%20%22${groupId}%22]`);
  const data = await response.json();
  const members = data.count > 0 ? data._embedded.users.map((users: { id: string; }) => users.id) : [];
  groupMembersMap.set(groupId, new Set(members));
  return;
}

const getParentGroup = async (
  groupId: string,
  config: PingIdentityProviderConfig,
): Promise<string> => {
  const response = await requestApi(config, `groups/${groupId}/memberOfGroups`);
  const data = await response.json();
  return data.size > 0
    ? data._embedded.groupMemberships[0].name
    : undefined;
}

const parsePingIdentityGroups = async (
  config: PingIdentityProviderConfig,
  groupMembersMap: Map<string, Set<string>>,
  groupTransformer?: GroupTransformer
): Promise<GroupEntity[]> => {
  const transformer = groupTransformer ?? defaultGroupTransformer;
  const response = await requestApi(config, 'groups');
  const data = await response.json();
  const groups: GroupEntity[] = data._embedded.groups;
  const transformedGroups: (GroupEntity | undefined)[] = await Promise.all(groups.map(async (group: any) => {
    const groupLocation = getEntityLocation(config, 'groups', group.id);
    addUserIdsInGroup(group.id, groupMembersMap, config);
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
        parent: await getParentGroup(group.id, config),
        members: [],
      }
    }, config.envId);
  }));
  return transformedGroups.filter(group => group !== undefined) as GroupEntity[];
};

export const readPingIdentity = async (
  config: PingIdentityProviderConfig,
  options?: {
    userTransformer?: UserTransformer;
    groupTransformer?: GroupTransformer;
  },
): Promise<{
  users: UserEntity[];
  groups: GroupEntity[];
}> => {
  const groupMembersMap = new Map<string, Set<string>>();
  const groups: GroupEntity[] = await parsePingIdentityGroups(config, groupMembersMap, options?.groupTransformer);
  const users: UserEntity[] = await parsePingIdentityUsers(config, groups, groupMembersMap, options?.userTransformer);
  groups.forEach(group => readChildGroups(group, groups));
  return { users, groups };
};