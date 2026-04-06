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

import { evaluateFilterPredicate, FilterPredicate } from '@backstage/filter-predicates';
import { Entity } from '@backstage/catalog-model';
import { PatchDefinition } from '../components/DefaultPatchesLayout/types';

/**
 * Returns an entity predicate that is true when at least one patch's filter
 * matches the given entity. Patches with no filter are always considered a
 * match.
 *
 * Pass the result as the `filter` param of `EntityContextMenuItemBlueprint`
 * to hide the menu item entirely when no patch applies to the current entity.
 */
export function mergePatchesFilters(
  patches: PatchDefinition[],
): (entity: Entity) => boolean {
  // Compose all patch filters into a single $any predicate.
  // Patches with no filter use {} which is a match-all (vacuously true).
  // An empty patches array produces { $any: [] } which is always false — correct.
  const predicate: FilterPredicate = {
    $any: patches.map(patch => patch.filter ?? {}),
  };
  return (entity: Entity) => evaluateFilterPredicate(predicate, entity);
}

/**
 * Returns the subset of patches whose filter matches the given entity.
 * Patches with no filter are always included.
 *
 * Use this inside `useProps` to narrow the patch list passed to the dialog.
 */
export function filterPatchesForEntity(
  patches: PatchDefinition[],
  entity: Entity,
): PatchDefinition[] {
  return patches.filter(
    patch => !patch.filter || evaluateFilterPredicate(patch.filter, entity),
  );
}
