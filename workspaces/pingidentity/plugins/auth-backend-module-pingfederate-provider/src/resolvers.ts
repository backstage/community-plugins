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

import type { PingFederateAuthResult } from './authenticator';
import {
  commonSignInResolvers,
  createSignInResolverFactory,
  type SignInInfo,
  type OAuthAuthenticatorResult,
} from '@backstage/plugin-auth-node';

import { decodeJwt } from 'jose';
import { z } from 'zod/v3';

const PING_IDENTITY_INFO = {
  userIdKey: 'pingidentity.org/id',
  providerName: 'PingFederate',
};

const LDAP_UUID_ANNOTATION = 'backstage.io/ldap-uuid';

/**
 * Available sign-in resolvers for the PingFederate auth provider.
 *
 * @public
 */
export namespace pingfederateSignInResolvers {
  /**
   * A resolver that looks up the user using the local part of
   * their email address as the entity name.
   */
  export const emailLocalPartMatchingUserEntityName =
    commonSignInResolvers.emailLocalPartMatchingUserEntityName;

  /**
   * A resolver that looks up the user using their email address
   * as email of the entity.
   */
  export const emailMatchingUserEntityProfileEmail =
    commonSignInResolvers.emailMatchingUserEntityProfileEmail;

  /**
   * A sign-in resolver that looks up the user using their Ping Identity user ID.
   *
   * Matches the `sub` claim from the ID token against the `pingidentity.org/id`
   * annotation on catalog User entities.
   */
  export const subClaimMatchingPingIdentityUserId = createSignInResolverFactory(
    {
      optionsSchema: z
        .object({
          dangerouslyAllowSignInWithoutUserInCatalog: z.boolean().optional(),
        })
        .optional(),
      create(options = {}) {
        return async (
          info: SignInInfo<OAuthAuthenticatorResult<PingFederateAuthResult>>,
          ctx,
        ) => {
          const sub = info.result.fullProfile.userinfo.sub;
          if (!sub) {
            throw new Error(
              `The user profile from ${PING_IDENTITY_INFO.providerName} is missing a 'sub' claim, likely due to a misconfiguration in the provider. Please contact your system administrator for assistance.`,
            );
          }

          const idToken = info.result.fullProfile.tokenset.id_token;
          if (!idToken) {
            throw new Error(
              `The user ID token from ${PING_IDENTITY_INFO.providerName} is missing. Please contact your system administrator for assistance.`,
            );
          }

          const subFromIdToken = decodeJwt(idToken)?.sub;
          if (sub !== subFromIdToken) {
            throw new Error(
              `There was a problem verifying your identity with ${PING_IDENTITY_INFO.providerName} due to a mismatching 'sub' claim. Please contact your system administrator for assistance.`,
            );
          }

          return await ctx.signInWithCatalogUser(
            {
              annotations: { [PING_IDENTITY_INFO.userIdKey]: sub },
            },
            {
              dangerousEntityRefFallback:
                options?.dangerouslyAllowSignInWithoutUserInCatalog
                  ? { entityRef: sub }
                  : undefined,
            },
          );
        };
      },
    },
  );

  /**
   * A resolver that looks up the user using an LDAP UUID from PingFederate.
   *
   * Retrieves the LDAP UUID claim from the OIDC UserInfo response and matches it
   * against the `backstage.io/ldap-uuid` annotation on catalog User entities.
   *
   * The UUID claim is validated to ensure it appears in both the UserInfo response
   * and the ID token as a UUID string, preventing token substitution attacks.
   *
   * **Requires PingFederate LDAP UUID Configuration:**
   * PingFederate must be configured to expose the LDAP UUID attribute in both
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
        info: SignInInfo<OAuthAuthenticatorResult<PingFederateAuthResult>>,
        ctx,
      ) => {
        const uuidKey = options?.ldapUuidKey ?? 'ldap_uuid';
        const uuid = info.result.fullProfile.userinfo[uuidKey];
        if (!uuid) {
          throw new Error(
            `PingFederate UserInfo response is missing the '${uuidKey}' claim. ` +
              `PingFederate must be configured to expose the LDAP UUID attribute in the OIDC Policy. ` +
              `Please contact your system administrator for assistance.`,
          );
        }
        const uuidFromUserinfo = z.string().uuid().safeParse(uuid);
        if (!uuidFromUserinfo.success) {
          throw new Error(
            `UUID in PingFederate UserInfo response for claim '${uuidKey}' must be a valid UUID string. Please contact your system administrator for assistance.`,
          );
        }

        const idToken = info.result.fullProfile.tokenset.id_token;
        if (!idToken) {
          throw new Error(
            `ID token is missing from PingFederate response. Please contact your system administrator for assistance.`,
          );
        }

        const uuidFromIdToken = z
          .string()
          .uuid()
          .safeParse(decodeJwt(idToken)?.[uuidKey]);
        if (!uuidFromIdToken.success) {
          throw new Error(
            `UUID in PingFederate ID token for claim '${uuidKey}' must be a valid UUID string. Please contact your system administrator for assistance.`,
          );
        }
        if (uuidFromUserinfo.data !== uuidFromIdToken.data) {
          throw new Error(
            `There was a problem verifying your identity with PingFederate due to mismatching UUID. Please contact your system administrator for assistance.`,
          );
        }

        return ctx.signInWithCatalogUser(
          {
            annotations: { [LDAP_UUID_ANNOTATION]: uuidFromUserinfo.data },
          },
          {
            dangerousEntityRefFallback:
              options?.dangerouslyAllowSignInWithoutUserInCatalog
                ? { entityRef: uuidFromUserinfo.data }
                : undefined,
          },
        );
      };
    },
  });
}
