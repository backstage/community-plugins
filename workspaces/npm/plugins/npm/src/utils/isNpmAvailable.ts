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
import { type Entity } from '@backstage/catalog-model';

import { NPM_PACKAGE_ANNOTATION } from '../annotations';

/**
 * Function that returns true if the given entity contains at least one
 * npm related annotations.
 *
 * @public
 */
export const isNpmAvailable = (entity: Entity): boolean => {
  return Boolean(entity.metadata.annotations?.[NPM_PACKAGE_ANNOTATION]);
};
