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
  CatalogProcessor,
  CatalogProcessorEmit,
} from '@backstage/plugin-catalog-node';
import { LocationSpec } from '@backstage/plugin-catalog-common';
import { Entity } from '@backstage/catalog-model';
import { UnclaimedEntity } from '../types/types';
import { UnclaimedEntityV1alpha1Validator } from '../validators/UnclaimedEntityValidator';

/**
 * Processor for Unclaimed entities that validates and processes them
 */
export class UnclaimedEntityProcessor implements CatalogProcessor {
  private readonly validator = new UnclaimedEntityV1alpha1Validator();

  getProcessorName(): string {
    return 'UnclaimedEntityProcessor';
  }

  async validateEntityKind(entity: Entity): Promise<boolean> {
    return entity.kind === 'Unclaimed';
  }

  async postProcessEntity(
    entity: Entity,
    _location: LocationSpec,
    _emit: CatalogProcessorEmit,
  ): Promise<Entity> {
    if (entity.kind !== 'Unclaimed') {
      return entity;
    }

    // Validate the entity structure
    const isValid = await this.validator.check(entity as UnclaimedEntity);
    if (!isValid) {
      // If validation fails, still return the entity but it may not be processed correctly
      // The catalog system will handle this appropriately
      return entity;
    }

    // Add default values and normalization if needed
    const unclaimedEntity = entity as UnclaimedEntity;

    // Add default tags if not present
    if (!unclaimedEntity.metadata.tags) {
      unclaimedEntity.metadata.tags = [];
    }

    if (!unclaimedEntity.metadata.tags.includes('unclaimed')) {
      unclaimedEntity.metadata.tags.push('unclaimed');
    }

    return unclaimedEntity;
  }
}
