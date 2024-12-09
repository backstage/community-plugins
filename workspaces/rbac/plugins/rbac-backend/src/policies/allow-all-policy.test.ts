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
import {
  AuthorizeResult,
  createPermission,
} from '@backstage/plugin-permission-common';
import {
  PermissionPolicy,
  PolicyQuery,
  PolicyQueryUser,
} from '@backstage/plugin-permission-node';

import { AllowAllPolicy } from './allow-all-policy';

describe('Allow All Policy', () => {
  describe('Allow all policy should allow all', () => {
    let policy: PermissionPolicy;
    beforeEach(() => {
      policy = new AllowAllPolicy();
    });

    it('should be able to create an allow all permission policy', () => {
      expect(policy).not.toBeNull();
    });

    it('should allow all when handle is called', async () => {
      const result = await policy.handle(
        newPolicyQueryWithBasicPermission('catalog.entity.create'),
        newPolicyQueryUser('user:default/guest'),
      );

      expect(result).toStrictEqual({ result: AuthorizeResult.ALLOW });
    });
  });
});

function newPolicyQueryWithBasicPermission(name: string): PolicyQuery {
  const mockPermission = createPermission({
    name: name,
    attributes: {},
  });
  return { permission: mockPermission };
}

function newPolicyQueryUser(
  user?: string,
  ownershipEntityRefs?: string[],
): PolicyQueryUser | undefined {
  if (user) {
    return {
      identity: {
        ownershipEntityRefs: ownershipEntityRefs ?? [],
        type: 'user',
        userEntityRef: user,
      },
      credentials: {
        $$type: '@backstage/BackstageCredentials',
        principal: true,
        expiresAt: new Date('2021-01-01T00:00:00Z'),
      },
      info: {
        userEntityRef: user,
        ownershipEntityRefs: ownershipEntityRefs ?? [],
      },
      token: 'token',
    };
  }
  return undefined;
}
