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

/**
 * A relation from a scaffolder template entity to the entity it generated.
 * Reverse direction of {@link RELATION_SCAFFOLDED_FROM}
 *
 * @public
 */
export const RELATION_SCAFFOLDER_OF = 'scaffolderOf';

/**
 * A relation of an entity generated from a scaffolder template entity
 * Reverse direction of {@link RELATION_SCAFFOLDER_OF}
 *
 * @public
 */
export const RELATION_SCAFFOLDED_FROM = 'scaffoldedFrom';
