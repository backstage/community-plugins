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
  Entity,
  stringifyEntityRef,
  DEFAULT_NAMESPACE,
} from '@backstage/catalog-model';

import { AuthResolverContext } from '@backstage/plugin-auth-node';

export const issueToken = async (
  ctx: AuthResolverContext,
  id: string,
  hostname: string,
) => {
  // Manual membership lookup instead of using ctx.signInWithCatalogUser, since we
  // don't want to require a catalog entity to login.
  let entity: Entity | undefined;
  let membership: string[] = [];
  try {
    const result = await ctx.findCatalogUser({
      annotations: {
        [`${hostname}/user-login`]: id,
      },
    });
    entity = result.entity;
    membership = (await ctx.resolveOwnershipEntityRefs(result.entity))
      .ownershipEntityRefs;
  } catch (e) {
    // ignored; no catalog user, proceed with empty membership
  }

  const userEntityRef = stringifyEntityRef(
    entity ?? {
      kind: 'User',
      namespace: DEFAULT_NAMESPACE,
      name: id,
    },
  );

  return ctx.issueToken({
    claims: {
      sub: userEntityRef,
      ent: membership,
    },
  });
};
