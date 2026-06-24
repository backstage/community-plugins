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

import { sanitizeUserNameTransformer } from '@backstage-community/plugin-catalog-backend-module-keycloak';
import type { UserEntity } from '@backstage/catalog-model';
import { AuthResolverContext, SignInInfo } from '@backstage/plugin-auth-node';
import type { OAuthAuthenticatorResult } from '@backstage/plugin-auth-node';
import type { UserinfoResponse } from 'openid-client';

import { keycloakSignInResolvers } from './resolvers';

/** Representative input spanning auth resolver and catalog default transformer. */
const CONTRACT_USERNAME = 'Jane Doe/Admin@Example';
const CONTRACT_SANITIZED_NAME = 'Jane-Doe-Admin-Example';

const createMockContext = (): jest.Mocked<AuthResolverContext> => ({
  issueToken: jest.fn(),
  findCatalogUser: jest.fn(),
  signInWithCatalogUser: jest.fn().mockResolvedValue({ token: 'test-token' }),
  resolveOwnershipEntityRefs: jest.fn(),
});

describe('auth↔catalog username sanitization contract', () => {
  it('yields the same sanitized entity name from catalog default transformer and auth preferredUsernameMatchingUserEntityName', async () => {
    const entity: UserEntity = {
      apiVersion: 'backstage.io/v1beta1',
      kind: 'User',
      metadata: {
        name: CONTRACT_USERNAME,
      },
      spec: {
        memberOf: [],
      },
    };

    const catalogEntity = await sanitizeUserNameTransformer(
      entity,
      {
        id: 'contract-user-id',
        username: CONTRACT_USERNAME,
      },
      'test-realm',
      [],
    );

    const ctx = createMockContext();
    const resolver =
      keycloakSignInResolvers.preferredUsernameMatchingUserEntityName();
    const info = {
      profile: {},
      result: {
        fullProfile: { preferred_username: CONTRACT_USERNAME },
        session: {
          accessToken: 'test-access-token',
          tokenType: 'bearer',
          scope: 'openid profile email',
        },
      },
    } as SignInInfo<OAuthAuthenticatorResult<UserinfoResponse>>;

    await resolver(info, ctx);

    expect(catalogEntity).toBeDefined();
    expect(catalogEntity!.metadata.name).toBe(CONTRACT_SANITIZED_NAME);
    expect(ctx.signInWithCatalogUser).toHaveBeenCalledWith(
      { entityRef: { name: CONTRACT_SANITIZED_NAME } },
      { dangerousEntityRefFallback: undefined },
    );
  });
});
