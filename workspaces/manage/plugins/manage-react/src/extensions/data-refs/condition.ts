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
  ApiHolder,
  createExtensionDataRef,
} from '@backstage/frontend-plugin-api';
import { Entity } from '@backstage/catalog-model';

import { Owners } from '../../api';

/** @public */
export interface ManageConditionOptions {
  apis: ApiHolder;
  owners: Owners;
  entities: Entity[];
}

/** @public */
export type ManageCondition = (
  options: ManageConditionOptions,
) => boolean | Promise<boolean>;

/** @public */
export const manageConditionRef =
  createExtensionDataRef<ManageCondition>().with({
    id: 'manage.condition.ref',
  });
