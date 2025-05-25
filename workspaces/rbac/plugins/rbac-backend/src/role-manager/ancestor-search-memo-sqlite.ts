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
import type { AuthService } from '@backstage/backend-plugin-api';
import type { CatalogApi } from '@backstage/catalog-client';
import type { Entity } from '@backstage/catalog-model';

import { AncestorSearchMemo } from './ancestor-search-memo';

export class AncestorSearchMemoSQLite extends AncestorSearchMemo<Entity> {
  constructor(
    private readonly userEntityRef: string,
    private readonly catalogApi: CatalogApi,
    private readonly auth: AuthService,
    private readonly maxDepth?: number,
  ) {
    super();
  }

  async getAllASMGroups(): Promise<Entity[]> {
    const { token } = await this.auth.getPluginRequestToken({
      onBehalfOf: await this.auth.getOwnServiceCredentials(),
      targetPluginId: 'catalog',
    });

    const { items } = await this.catalogApi.getEntities(
      {
        filter: { kind: 'Group' },
        fields: ['metadata.name', 'metadata.namespace', 'spec.parent'],
      },
      { token },
    );
    return items;
  }

  async getUserASMGroups(): Promise<Entity[]> {
    const { token } = await this.auth.getPluginRequestToken({
      onBehalfOf: await this.auth.getOwnServiceCredentials(),
      targetPluginId: 'catalog',
    });
    const { items } = await this.catalogApi.getEntities(
      {
        filter: { kind: 'Group', 'relations.hasMember': this.userEntityRef },
        fields: ['metadata.name', 'metadata.namespace', 'spec.parent'],
      },
      { token },
    );
    return items;
  }

  traverse(group: Entity, allGroups: Entity[], current_depth: number) {
    const groupName = `group:${group.metadata.namespace?.toLocaleLowerCase(
      'en-US',
    )}/${group.metadata.name.toLocaleLowerCase('en-US')}`;
    if (!super.hasEntityRef(groupName)) {
      super.setNode(groupName);
    }

    if (this.maxDepth !== undefined && current_depth >= this.maxDepth) {
      return;
    }
    const depth = current_depth + 1;

    const parent = group.spec?.parent as string;
    const parentGroup = allGroups.find(g => g.metadata.name === parent);

    if (parentGroup) {
      const parentName = `group:${group.metadata.namespace?.toLocaleLowerCase(
        'en-US',
      )}/${parentGroup.metadata.name.toLocaleLowerCase('en-US')}`;
      super.setEdge(parentName, groupName);

      if (super.isAcyclic()) {
        this.traverse(parentGroup, allGroups, depth);
      }
    }
  }

  async buildUserGraph() {
    const userGroups = await this.getUserASMGroups();
    const allGroups = await this.getAllASMGroups();
    userGroups.forEach(group =>
      this.traverse(group as Entity, allGroups as Entity[], 0),
    );
  }
}
