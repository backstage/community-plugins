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
  DEFAULT_NAMESPACE,
  Entity,
  parseEntityRef,
  RELATION_MEMBER_OF,
  stringifyEntityRef,
} from '@backstage/catalog-model';
import {
  CatalogService,
  CatalogServiceRequestOptions,
} from '@backstage/plugin-catalog-node';
import { BackstageCredentials } from '@backstage/backend-plugin-api';
import { NotFoundError } from '@backstage/errors';

export class CatalogHelper {
  readonly #credentials: BackstageCredentials;
  readonly #catalog: CatalogService;

  constructor({
    credentials,
    catalog,
  }: {
    credentials: BackstageCredentials;
    catalog: CatalogService;
  }) {
    this.#credentials = credentials;
    this.#catalog = catalog;
  }

  #getOptions = (
    options?: Partial<CatalogServiceRequestOptions>,
  ): CatalogServiceRequestOptions => {
    return {
      ...options,
      credentials: this.#credentials,
    };
  };

  #pickDefaultEntity = (items: Entity[]): Entity => {
    if (items.length > 1) {
      const defaultItem = items.find(
        e => e.metadata.namespace === DEFAULT_NAMESPACE,
      );
      if (defaultItem) {
        return defaultItem;
      }
    }

    return items[0];
  };

  #getUserEntityByEmail = async (email: string): Promise<Entity> => {
    const { items } = await this.#catalog.getEntities(
      {
        filter: { 'spec.profile.email': email },
      },
      this.#getOptions(),
    );

    if (items.length === 0) {
      throw new NotFoundError(`No user found for email ${email}`);
    }

    return this.#pickDefaultEntity(items);
  };

  #getUserEntityByNameOrRef = async (name: string): Promise<Entity> => {
    // Try to parse as entity ref first
    try {
      const parsedEntityRef = parseEntityRef(name);
      if (parsedEntityRef.kind.toLocaleLowerCase('en-US') === 'user') {
        const entity = await this.#catalog.getEntityByRef(
          name,
          this.#getOptions(),
        );
        if (entity) {
          return entity;
        }
      }
    } catch {
      // Swallow error (parseEntityRef) and try by name
    }

    const { items } = await this.#catalog.getEntities(
      {
        filter: {
          'metadata.name': name,
          kind: 'User',
        },
      },
      this.#getOptions(),
    );

    if (items.length === 0) {
      throw new NotFoundError(`No user found with username ${name}`);
    }

    return this.#pickDefaultEntity(items);
  };

  /**
   * Gets the Entity for a user, given the username, user entity ref or email
   */
  getUserByNameOrEmail = async (nameOrEmail: string): Promise<Entity> => {
    return nameOrEmail.includes('@')
      ? await this.#getUserEntityByEmail(nameOrEmail)
      : await this.#getUserEntityByNameOrRef(nameOrEmail);
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
