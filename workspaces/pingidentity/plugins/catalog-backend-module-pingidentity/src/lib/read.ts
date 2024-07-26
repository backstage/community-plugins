import { PingIdentityProviderConfig } from './config';
import { requestApi } from './client';
import {
  GroupEntity,
  UserEntity,
  ANNOTATION_LOCATION,
  ANNOTATION_ORIGIN_LOCATION,
} from '@backstage/catalog-model';
import { PING_IDENTITY_ID_ANNOTATION } from './constants';

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
  groups: GroupEntity[]
): string[] => {
  const groupMemberships: string[] = [];
  groups.forEach(group => {
    if (group.spec.members?.includes(userId)) {
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
  groups: GroupEntity[]
): Promise<UserEntity[]> => {
  const response = await requestApi(config, 'users');
  const data = await response.json();
  const users: UserEntity[] = data._embedded.users;
  return Promise.all(users.map(async (user: any) => {
    const userLocation = getEntityLocation(config, 'users', user.id);
    return {
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
        memberOf: findGroupMemberships(user.id, groups)
      }
    };
  }));
}

const getUsersInGroup = async (
  groupId: string,
  config: PingIdentityProviderConfig,
): Promise<string[]> => {
  // only show the first 100 responses and only include direct groups
  const response = await requestApi(config, `users?filter=memberOfGroups[id%20eq%20%22${groupId}%22]`);
  const data = await response.json();
  return data.count > 0 ? data._embedded.users.map((users: { username: string; }) => users.username) : [];
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
): Promise<GroupEntity[]> => {
  const response = await requestApi(config, 'groups');
  const data = await response.json();
  const groups: GroupEntity[] = data._embedded.groups;
  return Promise.all(groups.map(async (group: any) => {
    const groupLocation = getEntityLocation(config, 'groups', group.id);
    return {
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
        members: await getUsersInGroup(group.id, config),
      }
    };
  }));
}

export const readPingIdentity = async (
  config: PingIdentityProviderConfig,
): Promise<{
  users: UserEntity[];
  groups: GroupEntity[];
}> => {
  const groups: GroupEntity[] = await parsePingIdentityGroups(config);
  const users: UserEntity[] = await parsePingIdentityUsers(config, groups);
  groups.forEach(group => readChildGroups(group, groups));
  return { users, groups };
};