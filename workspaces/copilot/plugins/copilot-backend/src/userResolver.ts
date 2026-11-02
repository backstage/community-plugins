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
import {
  BackstageCredentials,
  createExtensionPoint,
} from '@backstage/backend-plugin-api';
import { CatalogService } from '@backstage/plugin-catalog-node';

/**
 * Additional services made available to a {@link CopilotUserResolver}.
 * Grouped under a single `services` property (rather than being flattened
 * onto {@link CopilotUserResolverContext}) so that further services can be
 * added here in the future without being a breaking change to the context
 * shape.
 *
 * @public
 */
export interface CopilotUserResolverServices {
  /**
   * The catalog service, to be called using the caller's own credentials.
   */
  catalog: CatalogService;
}

/**
 * Context passed to a {@link CopilotUserResolver} when resolving the GitHub
 * login of the currently signed-in user.
 *
 * @public
 */
export interface CopilotUserResolverContext {
  /**
   * The entity ref of the signed-in user, e.g. `user:default/jdoe`.
   */
  userEntityRef: string;

  /**
   * The caller's own credentials. These must be used (rather than
   * service-to-service credentials) for any catalog lookups, so that catalog
   * permissions for the signed-in user are respected.
   */
  credentials: BackstageCredentials;

  /**
   * Additional services available to the resolver, e.g. the catalog.
   */
  services: CopilotUserResolverServices;
}

/**
 * Resolves the GitHub login to use for looking up an individual user's
 * Copilot metrics, given the currently signed-in Backstage user.
 *
 * Implementations must only ever resolve the login of the *caller*
 * themselves. This interface intentionally has no way to resolve or look up
 * another user's login, since the `/v2/me/*` routes must never be able to
 * return another user's metrics.
 *
 * @public
 */
export interface CopilotUserResolver {
  /**
   * Resolves the GitHub login for the signed-in user described by the given
   * context, or `undefined` if no login could be determined (e.g. because
   * the user entity does not exist, or has no matching identifier).
   */
  resolveUserLogin(
    context: CopilotUserResolverContext,
  ): Promise<string | undefined>;
}

/**
 * Default {@link CopilotUserResolver}. Resolves the signed-in user's GitHub
 * login from their `github.com/user-login` catalog annotation.
 *
 * Entity names are not a trusted GitHub identity mapping: separate Backstage
 * namespaces can contain users with the same name. Install a custom resolver
 * through {@link CopilotUserResolverExtensionPoint} for a different trusted
 * identity source.
 *
 * @public
 */
export class DefaultCopilotUserResolver implements CopilotUserResolver {
  async resolveUserLogin({
    userEntityRef,
    credentials,
    services,
  }: CopilotUserResolverContext): Promise<string | undefined> {
    const entity = await services.catalog.getEntityByRef(userEntityRef, {
      credentials,
    });
    return entity?.metadata.annotations?.['github.com/user-login'];
  }
}

/**
 * Extension point that allows other backend modules to customize how a
 * signed-in Backstage user is matched to a GitHub login for the purposes of
 * individual Copilot metrics.
 *
 * @public
 */
export interface CopilotUserResolverExtensionPoint {
  /**
   * Overrides the default catalog-annotation-based user resolver.
   */
  setUserResolver(resolver: CopilotUserResolver): void;
}

/**
 * @public
 */
export const copilotUserResolverExtensionPoint =
  createExtensionPoint<CopilotUserResolverExtensionPoint>({
    id: 'copilot.userResolver',
  });
