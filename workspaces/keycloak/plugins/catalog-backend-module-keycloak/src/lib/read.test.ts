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
import { mockServices } from '@backstage/backend-test-utils';

import type KeycloakAdminClient from '@keycloak/keycloak-admin-client';
import { LimitFunction } from 'p-limit';

import {
  kGroups23orHigher,
  kGroupsLowerThan23,
  topLevelGroups23orHigher,
  topLevelGroupsLowerThan23,
  users as usersFixture,
} from '../../__fixtures__/data';
import {
  KeycloakAdminClientMockServerv18,
  KeycloakAdminClientMockServerv24,
} from '../../__fixtures__/helpers';
import { KeycloakProviderConfig } from './config';
import {
  getEntities,
  parseGroup,
  parseUser,
  processGroupsRecursively,
  readKeycloakRealm,
  traverseGroups,
} from './read';
import type { GroupTransformer, UserTransformer } from './types';

const config: KeycloakProviderConfig = {
  realm: 'myrealm',
  id: 'mock_id',
  baseUrl: 'http://mock-url',
  clientId: 'mock-client-id',
  clientSecret: 'mock-client-secret',
};

const logger = mockServices.logger.mock();
const mockPLimit = jest
  .fn()
  .mockImplementation(
    async <Arguments extends unknown[], ReturnType>(
      fn: (...args: Arguments) => ReturnType | PromiseLike<ReturnType>,
      ...args: Arguments
    ): Promise<ReturnType> => {
      const result = fn(...args);
      return result instanceof Promise ? result : Promise.resolve(result); // Ensure result is always a Promise
    },
  );

describe('readKeycloakRealm', () => {
  it('should return the correct number of users and groups (Version 23 or Higher)', async () => {
    const client =
      new KeycloakAdminClientMockServerv24() as unknown as KeycloakAdminClient;
    const { users, groups } = await readKeycloakRealm(
      client,
      config,
      logger,
      mockPLimit as unknown as LimitFunction,
    );
    expect(users).toHaveLength(3);
    expect(groups).toHaveLength(3);
  });

  it('should return the correct number of users and groups (Version Less than 23)', async () => {
    const client =
      new KeycloakAdminClientMockServerv18() as unknown as KeycloakAdminClient;
    const { users, groups } = await readKeycloakRealm(
      client,
      config,
      logger,
      mockPLimit as unknown as LimitFunction,
    );
    expect(users).toHaveLength(3);
    expect(groups).toHaveLength(3);
  });

  it(`should not contain undefined members when a group member is not found in the fetched user list`, async () => {
    const client =
      new KeycloakAdminClientMockServerv24() as unknown as KeycloakAdminClient;
    client.users.find = jest
      .fn()
      .mockResolvedValue([usersFixture[1], usersFixture[2]]);
    client.users.count = jest.fn().mockResolvedValue(2);

    const { groups } = await readKeycloakRealm(
      client,
      config,
      logger,
      mockPLimit as unknown as LimitFunction,
    );

    for (const group of groups) {
      console.log(group.spec.members);
      expect(group.spec.members).not.toContain(undefined);
    }
  });

  it('should propagate transformer changes to entities (version 23 or Higher)', async () => {
    const groupTransformer: GroupTransformer = async (entity, _g, _r) => {
      entity.metadata.name = `${entity.metadata.name}_foo`;
      return entity;
    };
    const userTransformer: UserTransformer = async (e, _u, _r, _g) => {
      e.metadata.name = `${e.metadata.name}_bar`;
      return e;
    };

    const client =
      new KeycloakAdminClientMockServerv24() as unknown as KeycloakAdminClient;
    const { users, groups } = await readKeycloakRealm(
      client,
      config,
      logger,
      mockPLimit as unknown as LimitFunction,
      {
        userTransformer,
        groupTransformer,
      },
    );
    expect(groups[0].metadata.name).toBe('biggroup_foo');
    expect(groups[0].spec.children).toEqual(['subgroup_foo']);
    expect(groups[0].spec.members).toEqual(['jamesdoe_bar']);
    expect(groups[1].spec.parent).toBe('biggroup_foo');
    expect(users[0].metadata.name).toBe('jamesdoe_bar');
    expect(users[0].spec.memberOf).toEqual(['biggroup_foo']);
  });

  it('should propagate transformer changes to entities (version less than 23)', async () => {
    const groupTransformer: GroupTransformer = async (entity, _g, _r) => {
      entity.metadata.name = `${entity.metadata.name}_foo`;
      return entity;
    };
    const userTransformer: UserTransformer = async (e, _u, _r, _g) => {
      e.metadata.name = `${e.metadata.name}_bar`;
      return e;
    };

    const client =
      new KeycloakAdminClientMockServerv18() as unknown as KeycloakAdminClient;
    const { users, groups } = await readKeycloakRealm(
      client,
      config,
      logger,
      mockPLimit as unknown as LimitFunction,
      {
        userTransformer,
        groupTransformer,
      },
    );
    expect(groups[0].metadata.name).toBe('biggroup_foo');
    expect(groups[0].spec.children).toEqual(['subgroup_foo']);
    expect(groups[0].spec.members).toEqual(['jamesdoe_bar']);
    expect(groups[1].spec.parent).toBe('biggroup_foo');
    expect(users[0].metadata.name).toBe('jamesdoe_bar');
    expect(users[0].spec.memberOf).toEqual(['biggroup_foo']);
  });
});

describe('parseGroup', () => {
  it('should parse a group (version greater than or equal to 23)', async () => {
    const entity = await parseGroup(kGroups23orHigher[0], 'test');
    expect(entity).toEqual({
      apiVersion: 'backstage.io/v1beta1',
      kind: 'Group',
      metadata: {
        annotations: {
          'keycloak.org/id': '9cf51b5d-e066-4ed8-940c-dc6da77f81a5',
          'keycloak.org/realm': 'test',
        },
        name: 'biggroup',
      },
      spec: {
        children: ['subgroup'],
        members: ['jamesdoe'],
        parent: undefined,
        profile: {
          displayName: 'biggroup',
        },
        type: 'group',
      },
    });
  });

  it('should parse a group (version less than 23)', async () => {
    const entity = await parseGroup(kGroupsLowerThan23[0], 'test');
    expect(entity).toEqual({
      apiVersion: 'backstage.io/v1beta1',
      kind: 'Group',
      metadata: {
        annotations: {
          'keycloak.org/id': '9cf51b5d-e066-4ed8-940c-dc6da77f81a5',
          'keycloak.org/realm': 'test',
        },
        name: 'biggroup',
      },
      spec: {
        children: ['subgroup'],
        members: ['jamesdoe'],
        parent: undefined,
        profile: {
          displayName: 'biggroup',
        },
        type: 'group',
      },
    });
  });

  it('should parse a group with a transformer (version greater than or equal to 23)', async () => {
    const transformer: GroupTransformer = async (e, _g, r) => {
      e.metadata.name = `${e.metadata.name}_${r}`;
      return e;
    };
    const entity = await parseGroup(kGroups23orHigher[0], 'test', transformer);

    expect(entity).toBeDefined();
    expect(entity?.metadata.name).toEqual('biggroup_test');
  });

  it('should parse a group with a transformer (version less than 23)', async () => {
    const transformer: GroupTransformer = async (e, _g, r) => {
      e.metadata.name = `${e.metadata.name}_${r}`;
      return e;
    };
    const entity = await parseGroup(kGroupsLowerThan23[0], 'test', transformer);

    expect(entity).toBeDefined();
    expect(entity?.metadata.name).toEqual('biggroup_test');
  });
});

describe('parseUser', () => {
  it('should parse an user', async () => {
    const entity = await parseUser(usersFixture[0], 'test', []);

    expect(entity).toEqual({
      apiVersion: 'backstage.io/v1beta1',
      kind: 'User',
      metadata: {
        annotations: {
          'keycloak.org/id': '59efec15-a00b-4700-8833-5f4cdecc1132',
          'keycloak.org/realm': 'test',
        },
        name: 'jamesdoe',
      },
      spec: {
        memberOf: [],
        profile: {
          email: 'jamesdoe@gmail.com',
        },
      },
    });
  });

  it('should parse an user with displayName', async () => {
    const entity = await parseUser(usersFixture[2], 'test', []);

    expect(entity?.spec.profile?.displayName).toEqual('John Doe');
  });

  it('should parse an user without displayName', async () => {
    const entity = await parseUser(usersFixture[0], 'test', []);

    expect(entity?.spec.profile?.displayName).toBeUndefined();
  });

  it('should parse an user with transformer', async () => {
    const transformer: UserTransformer = async (e, _u, r, _g) => {
      e.metadata.name = `${e.metadata.name}_${r}`;
      return e;
    };
    const entity = await parseUser(usersFixture[0], 'test', [], transformer);

    expect(entity).toBeDefined();
    expect(entity?.metadata.name).toEqual('jamesdoe_test');
  });
});

describe('getEntitiesUser', () => {
  it('should fetch all users (version 23 or Higher)', async () => {
    const client =
      new KeycloakAdminClientMockServerv24() as unknown as KeycloakAdminClient;

    const users = await getEntities(
      async () => client.users,
      {
        id: '',
        baseUrl: '',
        realm: '',
      },
      logger,
      mockPLimit as unknown as LimitFunction,
    );

    expect(users).toHaveLength(3);
  });

  it('should fetch all users (version less than 23)', async () => {
    const client =
      new KeycloakAdminClientMockServerv18() as unknown as KeycloakAdminClient;

    const users = await getEntities(
      async () => client.users,
      {
        id: '',
        baseUrl: '',
        realm: '',
      },
      logger,
      mockPLimit as unknown as LimitFunction,
    );

    expect(users).toHaveLength(3);
  });

  it('should fetch all users with pagination (version greater than or equal to 23)', async () => {
    const client =
      new KeycloakAdminClientMockServerv24() as unknown as KeycloakAdminClient;

    await getEntities(
      async () => client.users,
      {
        id: '',
        baseUrl: '',
        realm: '',
      },
      logger,
      mockPLimit as unknown as LimitFunction,
      1,
    );

    expect(client.users.find).toHaveBeenCalledTimes(3);
  });

  it('should fetch all users with pagination (version less than 23)', async () => {
    const client =
      new KeycloakAdminClientMockServerv18() as unknown as KeycloakAdminClient;

    await getEntities(
      async () => client.users,
      {
        id: '',
        baseUrl: '',
        realm: '',
      },
      logger,
      mockPLimit as unknown as LimitFunction,
      1,
    );

    expect(client.users.find).toHaveBeenCalledTimes(3);
  });
});

describe('fetch subgroups', () => {
  it('processGroupsRecursively (Version greater than or equal to 23)', async () => {
    const client =
      new KeycloakAdminClientMockServerv24() as unknown as KeycloakAdminClient;
    const groups = await processGroupsRecursively(
      client,
      config,
      topLevelGroups23orHigher,
      client.groups,
    );

    expect(groups).toHaveLength(3);
  });

  it('traverseGroups (Version less than 23)', async () => {
    const groups = [...traverseGroups(topLevelGroupsLowerThan23[0])];

    expect(groups).toHaveLength(2);
  });
});
