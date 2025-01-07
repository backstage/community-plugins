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
  getCompoundEntityRef,
  parseEntityRef,
} from '@backstage/catalog-model';
import { LocationSpec } from '@backstage/plugin-catalog-common/index';
import {
  CatalogProcessor,
  CatalogProcessorCache,
  CatalogProcessorEmit,
  processingResult,
} from '@backstage/plugin-catalog-node';

export class InventoryItemProcessor implements CatalogProcessor {
  getProcessorName(): string {
    return 'InventoryItemProcessor';
  }

  async validateEntityKind(entity: Entity): Promise<boolean> {
    // TODO: validate schema
    return (
      entity.apiVersion === 'inventory.backstage.io/v1alpha1' &&
      entity.kind === 'Item'
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
      entity.kind === 'Item'
    ) {
      const place = entity.spec?.place as string;
      if (place) {
        const sourceRef = getCompoundEntityRef(entity);
        const targetRef = parseEntityRef(place, {
          defaultKind: 'Place',
          defaultNamespace: sourceRef.namespace,
        });
        emit(
          processingResult.relation({
            type: 'placed',
            source: sourceRef,
            target: targetRef,
          }),
        );
        emit(
          processingResult.relation({
            type: 'contains',
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
