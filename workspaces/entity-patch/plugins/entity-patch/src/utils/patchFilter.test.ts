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

import { Entity } from '@backstage/catalog-model';
import { PatchDefinition } from '@backstage-community/plugin-entity-patch-common';
import { mergePatchesFilters, filterPatchesForEntity } from './patchFilter';

const groupEntity: Entity = {
  apiVersion: 'backstage.io/v1alpha1',
  kind: 'Group',
  metadata: { name: 'platform', namespace: 'default' },
  spec: { type: 'team', children: [], members: [] },
};

const componentEntity: Entity = {
  apiVersion: 'backstage.io/v1alpha1',
  kind: 'Component',
  metadata: { name: 'my-service', namespace: 'default' },
  spec: { type: 'service', lifecycle: 'production', owner: 'team-a' },
};

const groupPatch: PatchDefinition = {
  name: 'group-details',
  filter: { kind: 'group' },
};

const componentPatch: PatchDefinition = {
  name: 'component-details',
  filter: { kind: 'component' },
};

const unfiltered: PatchDefinition = {
  name: 'universal',
};

// ---------------------------------------------------------------------------
// mergePatchesFilters
// ---------------------------------------------------------------------------

describe('mergePatchesFilters', () => {
  it('returns false for any entity when patches list is empty', () => {
    const filter = mergePatchesFilters([]);
    expect(filter(groupEntity)).toBe(false);
    expect(filter(componentEntity)).toBe(false);
  });

  it('returns true for any entity when patch has no filter', () => {
    const filter = mergePatchesFilters([unfiltered]);
    expect(filter(groupEntity)).toBe(true);
    expect(filter(componentEntity)).toBe(true);
  });

  it('returns true only for matching kind when patch has a kind filter', () => {
    const filter = mergePatchesFilters([groupPatch]);
    expect(filter(groupEntity)).toBe(true);
    expect(filter(componentEntity)).toBe(false);
  });

  it('returns true when at least one patch matches (OR logic across patches)', () => {
    const filter = mergePatchesFilters([groupPatch, componentPatch]);
    expect(filter(groupEntity)).toBe(true);
    expect(filter(componentEntity)).toBe(true);
  });

  it('returns true when any patch has no filter, regardless of entity kind', () => {
    const filter = mergePatchesFilters([groupPatch, unfiltered]);
    expect(filter(componentEntity)).toBe(true);
  });

  it('shows menu for a broad-kind group and a specific-type group when either matches', () => {
    // Patch 1: applies to any Group
    const allGroupsPatch: PatchDefinition = {
      name: 'all-groups',
      filter: { kind: 'group' },
    };
    // Patch 2: applies only to Groups of type "team"
    const teamGroupPatch: PatchDefinition = {
      name: 'team-groups',
      filter: { kind: 'group', 'spec.type': 'team' },
    };
    const squadGroup: Entity = {
      ...groupEntity,
      spec: { type: 'squad', children: [], members: [] },
    };
    const filter = mergePatchesFilters([allGroupsPatch, teamGroupPatch]);
    // team group matches both patches
    expect(filter(groupEntity)).toBe(true);
    // squad group matches only the broad patch — menu should still show
    expect(filter(squadGroup)).toBe(true);
    // component matches neither
    expect(filter(componentEntity)).toBe(false);
  });

  it('hides menu for a third group type when two patches each target a different group type', () => {
    const teamPatch: PatchDefinition = {
      name: 'team-patch',
      filter: { kind: 'group', 'spec.type': 'team' },
    };
    const squadPatch: PatchDefinition = {
      name: 'squad-patch',
      filter: { kind: 'group', 'spec.type': 'squad' },
    };
    const teamGroup: Entity = {
      ...groupEntity,
      spec: { type: 'team', children: [], members: [] },
    };
    const squadGroup: Entity = {
      ...groupEntity,
      spec: { type: 'squad', children: [], members: [] },
    };
    const departmentGroup: Entity = {
      ...groupEntity,
      spec: { type: 'department', children: [], members: [] },
    };
    const filter = mergePatchesFilters([teamPatch, squadPatch]);
    expect(filter(teamGroup)).toBe(true);
    expect(filter(squadGroup)).toBe(true);
    // department type matches neither patch — menu must be hidden
    expect(filter(departmentGroup)).toBe(false);
  });
});

// ---------------------------------------------------------------------------
// filterPatchesForEntity
// ---------------------------------------------------------------------------

describe('filterPatchesForEntity', () => {
  it('returns empty array when no patches are provided', () => {
    expect(filterPatchesForEntity([], groupEntity)).toEqual([]);
  });

  it('returns all patches that have no filter', () => {
    const result = filterPatchesForEntity([unfiltered], componentEntity);
    expect(result).toEqual([unfiltered]);
  });

  it('returns only patches matching the entity kind', () => {
    const result = filterPatchesForEntity(
      [groupPatch, componentPatch],
      groupEntity,
    );
    expect(result).toEqual([groupPatch]);
  });

  it('returns patches with no filter alongside matching filtered patches', () => {
    const result = filterPatchesForEntity(
      [groupPatch, unfiltered],
      componentEntity,
    );
    expect(result).toEqual([unfiltered]);
  });

  it('returns multiple matching patches when entity matches all their filters', () => {
    const anotherGroupPatch: PatchDefinition = {
      name: 'group-extra',
      filter: { kind: 'group' },
    };
    const result = filterPatchesForEntity(
      [groupPatch, anotherGroupPatch, componentPatch],
      groupEntity,
    );
    expect(result).toEqual([groupPatch, anotherGroupPatch]);
  });

  it('preserves patch order', () => {
    const patches = [unfiltered, groupPatch, componentPatch];
    const result = filterPatchesForEntity(patches, groupEntity);
    expect(result.map(p => p.name)).toEqual(['universal', 'group-details']);
  });
});
