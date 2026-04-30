/*
 * Copyright 2026 The Backstage Authors
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
import { z } from 'zod/v3';
import {
  commonSignInResolvers,
  createSignInResolverFactory,
  OAuthAuthenticatorResult,
  SignInInfo,
} from '@backstage/plugin-auth-node';
import { UserinfoResponse } from 'openid-client';

/**
 * Sign-in resolvers for the Keycloak auth provider.
 *
 * @public
 */
export namespace keycloakSignInResolvers {
  /**
   * Matches the Keycloak profile email to the Catalog User entity email.
   */
  export const emailMatchingUserEntityProfileEmail =
    commonSignInResolvers.emailMatchingUserEntityProfileEmail;

  /**
   * Matches the local part of the Keycloak email to the Catalog User entity name.
   */
  export const emailLocalPartMatchingUserEntityName =
    commonSignInResolvers.emailLocalPartMatchingUserEntityName;

  /**
   * Matches the Keycloak-specific `preferred_username` claim to the Catalog User entity name.
   */
  export const preferredUsernameMatchingUserEntityName =
    createSignInResolverFactory({
      optionsSchema: z
        .object({
          dangerouslyAllowSignInWithoutUserInCatalog: z.boolean().optional(),
        })
        .optional(),
      create(options = {}) {
        return async (
          info: SignInInfo<OAuthAuthenticatorResult<UserinfoResponse>>,
          ctx,
        ) => {
          const rawUsername =
            info.result.fullProfile.preferred_username?.trim();
          if (!rawUsername) {
            throw new Error(
              'Login failed, Keycloak profile does not contain a non-empty preferred_username',
            );
          }

          // Sanitize to match the entity name transformation used by catalog-backend-module-keycloak.
          // We mirror its logic exactly to ensure the strings match.
          const sanitizedUsername = rawUsername.replace(
            /[^a-zA-Z0-9\-_.]/g,
            '-',
          );

          return ctx.signInWithCatalogUser(
            { entityRef: { name: sanitizedUsername } },
            {
              dangerousEntityRefFallback:
                options?.dangerouslyAllowSignInWithoutUserInCatalog
                  ? { entityRef: { name: sanitizedUsername } }
                  : undefined,
            },
          );
        };
      },
    });
}
