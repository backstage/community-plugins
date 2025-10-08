/*
 * Copyright 2025 The Backstage Authors
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
  RELATION_MEMBER_OF,
  stringifyEntityRef,
} from '@backstage/catalog-model';
import {
  CatalogService,
  CatalogServiceRequestOptions,
} from '@backstage/plugin-catalog-node';
import { AuthService } from '@backstage/backend-plugin-api';
import { NotFoundError } from '@backstage/errors';

export class CatalogHelper {
  readonly #auth: AuthService;
  readonly #catalog: CatalogService;

  constructor({
    auth,
    catalog,
  }: {
    auth: AuthService;
    catalog: CatalogService;
  }) {
    this.#auth = auth;
    this.#catalog = catalog;
  }

  #getOptions = async (
    options?: Partial<CatalogServiceRequestOptions>,
  ): Promise<CatalogServiceRequestOptions> => {
    return {
      ...options,
      credentials: await this.#auth.getOwnServiceCredentials(),
    };
  };

  #getUserEntityRefByEmail = async (email: string): Promise<Entity> => {
    const { items } = await this.#catalog.getEntities(
      {
        filter: { 'spec.profile.email': email },
      },
      await this.#getOptions(),
    );

    if (items.length === 0) {
      throw new NotFoundError(`No user found for email ${email}`);
    }
    return items[0];
  };

  #ensureUserEntityRef = async (username: string): Promise<Entity> => {
    const { items } = await this.#catalog.getEntities(
      {
        filter: {
          'metadata.name': username,
          'metadata.namespace': 'default',
          Kind: 'User',
        },
      },
      await this.#getOptions(),
    );

    if (items.length === 0) {
      throw new NotFoundError(`No user found with username ${username}`);
    }
    return items[0];
  };

  /**
   * Gets the Entity for a user, given the username or email
   */
  getUserByNameOrEmail = async (nameOrEmail: string): Promise<Entity> => {
    return nameOrEmail.includes('@')
      ? await this.#getUserEntityRefByEmail(nameOrEmail)
      : await this.#ensureUserEntityRef(nameOrEmail);
  };

  /**
   * Gets the immediate group ownership of a user, and returns the user as well
   */
  getOwnershipEntityRefs = async (userEntity: Entity) => {
    const groupEntityRefs = (userEntity?.relations ?? [])
      .filter(rel => rel.type === RELATION_MEMBER_OF)
      .map(rel => rel.targetRef);

    return [stringifyEntityRef(userEntity), ...groupEntityRefs];
  };
}
