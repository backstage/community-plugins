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
  RELATION_HAS_PART,
  RELATION_PART_OF,
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

export class InventoryItemProcessor implements CatalogProcessor {
  private readonly kinds: string[];

  getProcessorName(): string {
    return 'InventoryItemProcessor';
  }

  constructor({ config }: Options) {
    this.kinds = config?.getOptionalStringArray('kinds.items') ?? [
      'Item',
      'Container',
    ];
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
      const location = entity.spec?.location as string;
      if (location) {
        const sourceRef = getCompoundEntityRef(entity);
        const targetRef = parseEntityRef(location, {
          defaultNamespace: sourceRef.namespace,
        });
        emit(
          processingResult.relation({
            type: RELATION_PART_OF,
            source: sourceRef,
            target: targetRef,
          }),
        );
        emit(
          processingResult.relation({
            type: RELATION_HAS_PART,
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
