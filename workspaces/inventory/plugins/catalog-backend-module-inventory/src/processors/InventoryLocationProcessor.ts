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
import { Config } from '@backstage/config';
import {
  Entity,
  getCompoundEntityRef,
  parseEntityRef,
  RELATION_CHILD_OF,
  RELATION_PARENT_OF,
} from '@backstage/catalog-model';
import { LocationSpec } from '@backstage/plugin-catalog-common/index';
import {
  CatalogProcessor,
  CatalogProcessorCache,
  CatalogProcessorEmit,
  processingResult,
} from '@backstage/plugin-catalog-node';

interface Options {
  config?: Config;
}

export class InventoryLocationProcessor implements CatalogProcessor {
  private readonly kinds: string[];

  constructor({ config }: Options) {
    this.kinds = config?.getOptionalStringArray('kinds.locations') ?? [
      'Shelf',
      'Room',
      'Floor',
      'Building',
      'Campus',
    ];
    if (this.kinds.some(kind => kind.toLowerCase() === 'location')) {
      throw new Error(
        'The inventory plugin forbids using the kind "Location" due the high-risk of misconfiguration. A Backstage Location might allow users to import other resources into the catalog. We recommend to use the predefined or a more specific kind instead.',
      );
    }
  }

  getProcessorName(): string {
    return 'InventoryLocationProcessor';
  }

  async validateEntityKind(entity: Entity): Promise<boolean> {
    // TODO: validate schema
    return (
      entity.apiVersion === 'inventory.backstage.io/v1alpha1' &&
      this.kinds.includes(entity.kind)
    );
  }

  async postProcessEntity(
    entity: Entity,
    _location: LocationSpec,
    emit: CatalogProcessorEmit,
    _cache: CatalogProcessorCache,
  ): Promise<Entity> {
    if (
      entity.apiVersion === 'inventory.backstage.io/v1alpha1' &&
      this.kinds.includes(entity.kind)
    ) {
      const parent = entity.spec?.parent as string;
      if (parent) {
        const sourceRef = getCompoundEntityRef(entity);
        const targetRef = parseEntityRef(parent, {
          defaultNamespace: sourceRef.namespace,
        });
        emit(
          processingResult.relation({
            type: RELATION_CHILD_OF,
            source: sourceRef,
            target: targetRef,
          }),
        );
        emit(
          processingResult.relation({
            type: RELATION_PARENT_OF,
            source: targetRef,
            target: sourceRef,
          }),
        );
      }
      return entity;
    }
    return entity;
  }
}
