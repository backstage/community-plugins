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
import { decodeJwt } from 'jose';
import { z } from 'zod/v3';
import {
  AuthResolverContext,
  commonSignInResolvers,
  createSignInResolverFactory,
  OAuthAuthenticatorResult,
  SignInInfo,
} from '@backstage/plugin-auth-node';
import { UserinfoResponse } from 'openid-client';

/** Annotation defined by `@backstage-community/plugin-catalog-backend-module-keycloak`. */
const KEYCLOAK_ID_ANNOTATION = 'keycloak.org/id';

/** Annotation defined by `@backstage/plugin-catalog-backend-module-ldap`. */
const LDAP_UUID_ANNOTATION = 'backstage.io/ldap-uuid';

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

  /**
   * Looks up the catalog User whose `keycloak.org/id` annotation matches the OIDC
   * `sub` claim from Keycloak userinfo.
   *
   * The ID token `sub` must match userinfo `sub` before the user is accepted.
   * Pair this resolver with the Keycloak catalog module so User entities carry
   * the same `keycloak.org/id` value as Keycloak's subject identifier.
   */
  export const oidcSubClaimMatchingKeycloakUserId = createSignInResolverFactory(
    {
      optionsSchema: z
        .object({
          dangerouslyAllowSignInWithoutUserInCatalog: z.boolean().optional(),
        })
        .optional(),
      create(options = {}) {
        return async (
          info: SignInInfo<OAuthAuthenticatorResult<UserinfoResponse>>,
          ctx: AuthResolverContext,
        ) => {
          const sub = info.result.fullProfile.sub?.trim();
          if (!sub) {
            throw new Error(
              'Login failed, Keycloak userinfo does not contain a non-empty sub claim',
            );
          }

          const idToken = info.result.session.idToken;
          if (!idToken) {
            throw new Error(
              'Login failed, Keycloak did not return an ID token, which is required to verify the sub claim',
            );
          }

          const subFromIdToken = decodeJwt(idToken).sub;
          if (subFromIdToken !== sub) {
            throw new Error(
              'Login failed, Keycloak ID token sub claim does not match the userinfo sub claim',
            );
          }

          return ctx.signInWithCatalogUser(
            {
              annotations: { [KEYCLOAK_ID_ANNOTATION]: sub },
            },
            {
              dangerousEntityRefFallback:
                options?.dangerouslyAllowSignInWithoutUserInCatalog
                  ? { entityRef: { name: sub } }
                  : undefined,
            },
          );
        };
      },
    },
  );

  /**
   * A resolver that looks up the user using an LDAP UUID from Keycloak.
   *
   * Retrieves the LDAP UUID claim from the OIDC UserInfo response and matches it
   * against the `backstage.io/ldap-uuid` annotation on catalog User entities.
   *
   *
   * **Requires Keycloak LDAP UUID Configuration:**
   * Keycloak must be configured to expose the LDAP UUID attribute in both
   * the ID token and UserInfo endpoint.
   *
   * **Configuration Options:**
   * - `ldapUuidKey` (optional): The claim name containing the LDAP UUID (default: 'ldap_uuid')
   */
  export const ldapUuidMatchingAnnotation = createSignInResolverFactory({
    optionsSchema: z
      .object({
        dangerouslyAllowSignInWithoutUserInCatalog: z.boolean().optional(),
        ldapUuidKey: z.string().optional(),
      })
      .optional(),
    create(options = {}) {
      return async (
        info: SignInInfo<OAuthAuthenticatorResult<UserinfoResponse>>,
        ctx,
      ) => {
        const uuidKey = options?.ldapUuidKey ?? 'ldap_uuid';
        const userinfo = info.result.fullProfile as Record<string, unknown>;
        const uuid = userinfo[uuidKey];
        if (!uuid) {
          throw new Error(
            `Keycloak UserInfo response is missing the '${uuidKey}' claim. ` +
              `Keycloak must be configured to expose the LDAP UUID attribute in the OIDC Policy. ` +
              `Please contact your system administrator for assistance.`,
          );
        }
        const uuidFromUserinfo = z.string().uuid().safeParse(uuid);
        if (!uuidFromUserinfo.success) {
          throw new Error(
            `UUID in Keycloak UserInfo response for claim '${uuidKey}' must be a valid UUID string. Please contact your system administrator for assistance.`,
          );
        }

        const idToken = info.result.session.idToken;
        if (!idToken) {
          throw new Error(
            `ID token is missing from Keycloak response. Please contact your system administrator for assistance.`,
          );
        }

        const uuidFromIdToken = z
          .string()
          .uuid()
          .safeParse(decodeJwt(idToken)?.[uuidKey]);
        if (!uuidFromIdToken.success) {
          throw new Error(
            `UUID in Keycloak ID token for claim '${uuidKey}' must be a valid UUID string. Please contact your system administrator for assistance.`,
          );
        }
        if (uuidFromUserinfo.data !== uuidFromIdToken.data) {
          throw new Error(
            `There was a problem verifying your identity with Keycloak due to mismatching UUID. Please contact your system administrator for assistance.`,
          );
        }

        return ctx.signInWithCatalogUser(
          {
            annotations: { [LDAP_UUID_ANNOTATION]: uuidFromUserinfo.data },
          },
          {
            dangerousEntityRefFallback:
              options?.dangerouslyAllowSignInWithoutUserInCatalog
                ? { entityRef: { name: uuidFromUserinfo.data } }
                : undefined,
          },
        );
      };
    },
  });
}
