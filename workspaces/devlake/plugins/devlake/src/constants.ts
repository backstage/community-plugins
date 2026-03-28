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

import { Entity } from '@backstage/catalog-model';

/**
 * Annotation key used to associate a Backstage entity with a DevLake project.
 * The value must match the `devlakeProjectName` field in your app-config teams list.
 *
 * @example
 * ```yaml
 * metadata:
 *   annotations:
 *     devlake.io/project-name: my-devlake-project
 * ```
 *
 * @public
 */
export const DEVLAKE_PROJECT_NAME_ANNOTATION = 'devlake.io/project-name';

/**
 * Returns true if the entity has the `devlake.io/project-name` annotation.
 * Use this predicate to conditionally render DevLake entity cards.
 *
 * @public
 */
export const isDevlakeAvailable = (entity: Entity): boolean =>
  Boolean(entity.metadata.annotations?.[DEVLAKE_PROJECT_NAME_ANNOTATION]);
