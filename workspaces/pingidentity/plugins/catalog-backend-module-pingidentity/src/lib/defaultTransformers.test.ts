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
import { GroupEntity, UserEntity } from '@backstage/catalog-model';
import {
  defaultGroupTransformer,
  defaultUserTransformer,
} from './defaultTransformers';
import { PingIdentityGroup, PingIdentityUser } from './types';

describe('defaultTransformers', () => {
  it('tests defaultGroupTransformer', async () => {
    const group: GroupEntity = {
      apiVersion: 'backstage.io/v1alpha1',
      kind: 'Group',
      metadata: {
        annotations: { 'pingidentity.org/id': 'foo' },
        name: 'group one',
      },
      spec: {
        children: [],
        profile: { displayName: 'BAR' },
        type: 'team',
      },
    };
    const pingIdentityGroup: PingIdentityGroup = {
      _links: {
        self: {
          href: '',
        },
      },
      id: 'group1',
      environment: {
        id: '',
      },
      name: 'group one',
      description: '',
      directMemberCounts: {
        users: 0,
      },
      createdAt: '',
      updatedAt: '',
    };
    const result = await defaultGroupTransformer(
      group,
      pingIdentityGroup,
      'envId',
    );
    // should normalize illegal characters in group name
    expect(result).toEqual({
      apiVersion: 'backstage.io/v1alpha1',
      kind: 'Group',
      metadata: {
        annotations: { 'pingidentity.org/id': 'foo' },
        name: 'group_one',
      },
      spec: {
        children: [],
        profile: { displayName: 'BAR' },
        type: 'team',
      },
    });
  });

  it('tests defaultUserTransformer', async () => {
    const user: UserEntity = {
      apiVersion: 'backstage.io/v1alpha1',
      kind: 'User',
      metadata: {
        annotations: {
          'pingidentity.org/id': 'foo',
        },
        name: 'test~user@example.com',
      },
      spec: {
        memberOf: [],
        profile: {
          displayName: 'BAR',
        },
      },
    };
    const pingIdentityUser: PingIdentityUser = {
      _links: {
        self: {
          href: 'https://api.pingone.com',
        },
        password: {
          href: 'https://api.pingone.com',
        },
        'password.set': {
          href: 'https://api.pingone.com',
        },
        'password.reset': {
          href: 'https://api.pingone.com',
        },
        'password.check': {
          href: 'https://api.pingone.com',
        },
        'password.recover': {
          href: 'https://api.pingone.com',
        },
        account: {
          sendVerificationCode: {
            href: 'https://api.pingone.com',
          },
        },
        linkedAccounts: {
          href: 'https://api.pingone.com',
        },
      },
      id: 'bar-123',
      environment: {
        id: 'example-env',
      },
      account: {
        canAuthenticate: true,
        status: '',
      },
      createdAt: '',
      email: 'bar@example.com',
      enabled: true,
      identityProvider: {
        type: '',
      },
      lifecycle: {
        status: '',
      },
      mfaEnabled: false,
      name: {
        given: 'Bar',
        family: 'Example',
      },
      population: {
        id: '',
      },
      updatedAt: '',
      username: 'bar',
      verifyStatus: '',
    };

    const result = await defaultUserTransformer(
      user,
      pingIdentityUser,
      'envId',
      [],
    );
    // should normalize illegal characters in metadata.annotations.name
    expect(result).toEqual({
      apiVersion: 'backstage.io/v1alpha1',
      kind: 'User',
      metadata: {
        annotations: {
          'pingidentity.org/id': 'foo',
        },
        name: 'test_user_example.com',
      },
      spec: {
        memberOf: [],
        profile: {
          displayName: 'BAR',
        },
      },
    });
  });
});
