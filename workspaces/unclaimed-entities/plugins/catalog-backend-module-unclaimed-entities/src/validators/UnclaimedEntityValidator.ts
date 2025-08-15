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

import { KindValidator } from '@backstage/catalog-model';
import { UnclaimedEntity } from '../types/types';

/**
 * Validator for Unclaimed entities
 */
export class UnclaimedEntityV1alpha1Validator implements KindValidator {
  async check(entity: UnclaimedEntity): Promise<boolean> {
    // Basic validation for Unclaimed entities
    if (entity.kind !== 'Unclaimed') {
      return false;
    }

    if (entity.apiVersion !== 'backstage.io/v1alpha1') {
      return false;
    }

    if (!entity.metadata?.name) {
      return false;
    }

    if (!entity.spec?.type) {
      return false;
    }

    if (!entity.spec?.lifecycle) {
      return false;
    }

    return true;
  }
}
