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
import type { ServiceMock } from '@backstage/backend-test-utils';

import {
  groupMembers1,
  groupMembers2,
  topLevelGroups23orHigher,
  topLevelGroupsLowerThan23,
  users,
} from './data';

export const CONFIG = {
  catalog: {
    providers: {
      keycloakOrg: {
        default: {
          baseUrl: 'http://localhost:8080',
        },
      },
    },
  },
} as const;

export const PASSWORD_CONFIG = {
  catalog: {
    providers: {
      keycloakOrg: {
        default: {
          baseUrl: 'http://localhost:8080',
          username: 'myusername',
          password: 'mypassword', // NOSONAR
        },
      },
    },
  },
} as const;

export const assertLogMustNotInclude = (
  logger: ServiceMock<LoggerService>,
  secrets: string[],
) => {
  const logMethods: (keyof LoggerService)[] = [
    'debug',
    'error',
    'info',
    'warn',
  ];
  logMethods.forEach(methodName => {
    const method = logger[methodName];
    if (jest.isMockFunction(method)) {
      const json = JSON.stringify(method.mock.calls);
      secrets.forEach(secret => {
        if (json.includes(secret)) {
          throw new Error(`Log must not include secret "${secret}"`);
        }
      });
    }
  });
};

export const authMock = jest.fn();

export class KeycloakAdminClientMockServerv18 {
  public constructor() {
    return;
  }

  serverInfo = {
    find: jest.fn().mockResolvedValue({
      systemInfo: {
        version: '18.0.6.redhat-00001',
      },
    }),
  };

  users = {
    find: jest.fn().mockResolvedValue(users),
    count: jest.fn().mockResolvedValue(users.length),
  };

  groups = {
    find: jest.fn().mockResolvedValue(topLevelGroupsLowerThan23),
    count: jest.fn().mockResolvedValue(3),
    listMembers: jest
      .fn()
      .mockResolvedValueOnce(groupMembers1.map(username => ({ username })))
      // stop second pagination fetch for groupMembers1
      .mockResolvedValueOnce([])
      // return empty list members
      .mockResolvedValueOnce([])
      // return empty list members
      .mockResolvedValueOnce([])
      .mockResolvedValueOnce(groupMembers2.map(username => ({ username }))),
  };

  auth = authMock;
}

export class KeycloakAdminClientMockServerv24 {
  public constructor() {
    return;
  }

  serverInfo = {
    find: jest.fn().mockResolvedValue({
      systemInfo: {
        version: '24.0.6.redhat-00001',
      },
    }),
  };

  users = {
    find: jest.fn().mockResolvedValue(users),
    count: jest.fn().mockResolvedValue(users.length),
  };

  groups = {
    find: jest.fn().mockResolvedValue(topLevelGroups23orHigher),
    findOne: jest.fn().mockResolvedValue({
      id: '9cf51b5d-e066-4ed8-940c-dc6da77f81a5',
      name: 'biggroup',
      path: '/biggroup',
      subGroupCount: 1,
      subGroups: [],
      access: {
        view: true,
        viewMembers: true,
        manageMembers: false,
        manage: false,
        manageMembership: false,
      },
    }),
    count: jest.fn().mockResolvedValue(3),
    listSubGroups: jest.fn().mockResolvedValue([
      {
        id: 'eefa5b46-0509-41d8-b8b3-7ddae9c83632',
        name: 'subgroup',
        path: '/biggroup/subgroup',
        parentId: '9cf51b5d-e066-4ed8-940c-dc6da77f81a5',
        subGroupCount: 0,
        subGroups: [],
        access: {
          view: true,
          viewMembers: true,
          manageMembers: false,
          manage: false,
          manageMembership: false,
        },
      },
    ]),
    listMembers: jest
      .fn()
      .mockImplementation(
        async (payload?: {
          id: string;
          _max?: number;
          _realm?: string;
          first?: number;
        }) => {
          const { id, first } = payload || {};
          if (id === '9cf51b5d-e066-4ed8-940c-dc6da77f81a5' && first === 0) {
            // biggroup - first members page
            return groupMembers1.map(username => ({ username }));
          }
          if (id === 'bb10231b-2939-4b1a-b8bb-9249ed7b76f7' && first === 0) {
            // testgroup - first members page
            return groupMembers2.map(username => ({ username }));
          }
          return [];
        },
      ),
  };

  auth = authMock;
}
