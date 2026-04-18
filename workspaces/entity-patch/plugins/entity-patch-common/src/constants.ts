/*
 * Copyright 2026 The Backstage Authors
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
 * `app-config.yaml` key paths used by the entity-patch plugin family.
 * @public
 */
export const CONFIG_KEYS = {
  /** Root array of patch definitions: `entityPatch.patches` */
  PATCHES: 'entityPatch.patches',
  /** Root array of relation pair definitions: `entityPatch.relations` */
  RELATIONS: 'entityPatch.relations',
} as const;

/**
 * Prefix used in mapping keys to denote a catalog relation target, e.g.
 * `relations.hasProductOwner`.
 * @public
 */
export const RELATION_KEY_PREFIX = 'relations.' as const;

/**
 * Backstage default entity namespace, used when `entity.metadata.namespace`
 * is absent.
 * @public
 */
export const DEFAULT_NAMESPACE = 'default' as const;
