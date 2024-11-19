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
export const topLevelGroups23orHigher = [
  {
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
  },
  {
    id: '557501bd-8188-41c0-a2d5-43ff3d5b0258',
    name: 'emptygroup',
    path: '/emptygroup',
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
];

export const topLevelGroupsLowerThan23 = [
  {
    id: '9cf51b5d-e066-4ed8-940c-dc6da77f81a5',
    name: 'biggroup',
    path: '/biggroup',
    subGroups: [
      {
        id: 'eefa5b46-0509-41d8-b8b3-7ddae9c83632',
        name: 'subgroup',
        path: '/biggroup/subgroup',
        subGroups: [],
      },
    ],
  },
  {
    id: '557501bd-8188-41c0-a2d5-43ff3d5b0258',
    name: 'emptygroup',
    path: '/emptygroup',
    subGroups: [],
  },
];

export const users = [
  {
    id: '59efec15-a00b-4700-8833-5f4cdecc1132',
    createdTimestamp: 1686170983010,
    username: 'jamesdoe',
    enabled: true,
    totp: false,
    emailVerified: false,
    firstName: '',
    lastName: '',
    email: 'jamesdoe@gmail.com',
    disableableCredentialTypes: [],
    requiredActions: [],
    notBefore: 0,
    access: {
      manageGroupMembership: false,
      view: true,
      mapRoles: false,
      impersonate: false,
      manage: false,
    },
  },
  {
    id: 'c982b51a-abf6-4f68-bfdf-a1c6257214fc',
    createdTimestamp: 1686170953553,
    username: 'joedoe',
    enabled: true,
    totp: false,
    emailVerified: false,
    firstName: '',
    lastName: '',
    disableableCredentialTypes: [],
    requiredActions: [],
    notBefore: 0,
    access: {
      manageGroupMembership: false,
      view: true,
      mapRoles: false,
      impersonate: false,
      manage: false,
    },
  },
  {
    id: '2bf97dbd-fd6a-47ae-986b-2632fa95e03f',
    createdTimestamp: 1686170890908,
    username: 'johndoe',
    enabled: true,
    totp: false,
    emailVerified: false,
    firstName: 'John',
    lastName: 'Doe',
    disableableCredentialTypes: [],
    requiredActions: [],
    notBefore: 0,
    access: {
      manageGroupMembership: false,
      view: true,
      mapRoles: false,
      impersonate: false,
      manage: false,
    },
  },
];

export const groupMembers1 = ['jamesdoe'];
export const groupMembers2 = ['jamesdoe', 'joedoe', 'johndoe'];

export const kGroups23orHigher = [
  {
    id: '9cf51b5d-e066-4ed8-940c-dc6da77f81a5',
    name: 'biggroup',
    path: '/biggroup',
    subGroupCount: 1,
    subGroups: [
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
        members: [],
        parent: 'biggroup',
      },
    ],
    access: {
      view: true,
      viewMembers: true,
      manageMembers: false,
      manage: false,
      manageMembership: false,
    },
    members: ['jamesdoe'],
  },
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
    members: [],
    parent: 'biggroup',
  },
  {
    id: '557501bd-8188-41c0-a2d5-43ff3d5b0258',
    name: 'emptygroup',
    path: '/emptygroup',
    subGroupCount: 0,
    subGroups: [],
    access: {
      view: true,
      viewMembers: true,
      manageMembers: false,
      manage: false,
      manageMembership: false,
    },
    members: [],
  },
];

export const kGroupsLowerThan23 = [
  {
    id: '9cf51b5d-e066-4ed8-940c-dc6da77f81a5',
    name: 'biggroup',
    path: '/biggroup',
    subGroups: [
      {
        id: 'eefa5b46-0509-41d8-b8b3-7ddae9c83632',
        name: 'subgroup',
        path: '/biggroup/subgroup',
        subGroups: [],
        parent: 'big-group',
        members: [],
      },
    ],
    members: ['jamesdoe'],
  },
  {
    id: 'eefa5b46-0509-41d8-b8b3-7ddae9c83632',
    name: 'subgroup',
    path: '/biggroup/subgroup',
    subGroups: [],
    parent: 'biggroup',
    members: [],
  },
  {
    id: '557501bd-8188-41c0-a2d5-43ff3d5b0258',
    name: 'emptygroup',
    path: '/emptygroup',
    subGroups: [],
    members: [],
  },
];
