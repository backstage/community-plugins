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
import nunjucks from 'nunjucks';
import { Entity } from '@backstage/catalog-model';
import { mockServices } from '@backstage/backend-test-utils';
import {
  EntityPatcher,
  EntityPatcherOptions,
  PatchDataMap,
} from './EntityPatcher';

const nunjucksEnv = new nunjucks.Environment(null as any, {
  autoescape: false,
});

function makePatcher(
  overrides: Partial<EntityPatcherOptions> = {},
): EntityPatcher {
  return EntityPatcher.fromConfigs({
    patchConfigs: [],
    relationPairs: new Map(),
    nunjucksEnv,
    logger: mockServices.logger.mock(),
    ...overrides,
  });
}

const component: Entity = {
  apiVersion: 'backstage.io/v1alpha1',
  kind: 'Component',
  metadata: {
    name: 'my-service',
    namespace: 'default',
    description: 'original',
  },
  spec: { type: 'service', lifecycle: 'experimental' },
};

const group: Entity = {
  apiVersion: 'backstage.io/v1alpha1',
  kind: 'Group',
  metadata: { name: 'platform', namespace: 'default' },
  spec: { type: 'team', children: [] },
};

describe('EntityPatcher', () => {
  describe('hasScalarEntries / hasRelationEntries / hasMatchingEntries', () => {
    it('returns false when no configs are provided', () => {
      const patcher = makePatcher();
      expect(patcher.hasScalarEntries(component)).toBe(false);
      expect(patcher.hasRelationEntries(component)).toBe(false);
      expect(patcher.hasMatchingEntries(component)).toBe(false);
    });

    it('returns true for scalar entries when filter matches the entity', () => {
      const patcher = makePatcher({
        patchConfigs: [
          {
            name: 'comp-patch',
            filter: { kind: 'component' },
            mapping: { 'metadata.description': 'description' },
            sectionProperties: {},
          },
        ],
      });
      expect(patcher.hasScalarEntries(component)).toBe(true);
      expect(patcher.hasScalarEntries(group)).toBe(false);
    });

    it('returns true for relation entries when filter matches the entity', () => {
      const patcher = makePatcher({
        patchConfigs: [
          {
            name: 'comp-patch',
            filter: { kind: 'component' },
            mapping: { 'relations.ownedBy': 'owner' },
            sectionProperties: {},
          },
        ],
        relationPairs: new Map([
          ['ownedBy', { forward: 'ownedBy', reverse: 'ownerOf' }],
        ]),
      });
      expect(patcher.hasRelationEntries(component)).toBe(true);
      expect(patcher.hasRelationEntries(group)).toBe(false);
    });

    it('returns true when no filter is set (matches all entities)', () => {
      const patcher = makePatcher({
        patchConfigs: [
          {
            name: 'global-patch',
            mapping: { 'metadata.description': 'description' },
            sectionProperties: {},
          },
        ],
      });
      expect(patcher.hasScalarEntries(component)).toBe(true);
      expect(patcher.hasScalarEntries(group)).toBe(true);
    });
  });

  describe('applyScalars', () => {
    it('applies a field mapping onto the entity', () => {
      const patcher = makePatcher({
        patchConfigs: [
          {
            name: 'comp-patch',
            filter: { kind: 'component' },
            mapping: {
              'metadata.description': 'description',
              'spec.lifecycle': 'lifecycle',
            },
            sectionProperties: {},
          },
        ],
      });
      const patchData: PatchDataMap = {
        'comp-patch': { description: 'patched desc', lifecycle: 'production' },
      };
      const result = patcher.applyScalars(component, patchData);

      expect(result.metadata.description).toBe('patched desc');
      expect((result.spec as any).lifecycle).toBe('production');
    });

    it('does not mutate the original entity', () => {
      const patcher = makePatcher({
        patchConfigs: [
          {
            name: 'comp-patch',
            mapping: { 'metadata.description': 'description' },
            sectionProperties: {},
          },
        ],
      });
      patcher.applyScalars(component, { 'comp-patch': { description: 'new' } });
      expect(component.metadata.description).toBe('original');
    });

    it('skips fields with empty, null or undefined values', () => {
      const patcher = makePatcher({
        patchConfigs: [
          {
            name: 'comp-patch',
            mapping: {
              'metadata.description': 'description',
              'spec.lifecycle': 'lifecycle',
            },
            sectionProperties: {},
          },
        ],
      });
      const patchData: PatchDataMap = {
        'comp-patch': { description: '', lifecycle: undefined },
      };
      const result = patcher.applyScalars(component, patchData);
      expect(result.metadata.description).toBe('original');
      expect((result.spec as any).lifecycle).toBe('experimental');
    });

    it('skips mappings where the entity filter does not match', () => {
      const patcher = makePatcher({
        patchConfigs: [
          {
            name: 'group-only',
            filter: { kind: 'group' },
            mapping: { 'metadata.description': 'description' },
            sectionProperties: {},
          },
        ],
      });
      const result = patcher.applyScalars(component, {
        'group-only': { description: 'should be ignored' },
      });
      expect(result.metadata.description).toBe('original');
    });

    it('renders Nunjucks templates using saved values as context', () => {
      const patcher = makePatcher({
        patchConfigs: [
          {
            name: 'link-patch',
            mapping: {
              'metadata.annotations["runbook-url"]':
                'https://wiki.example.com/{{ team }}/{{ service }}',
            },
            sectionProperties: {},
          },
        ],
      });
      const result = patcher.applyScalars(component, {
        'link-patch': { team: 'platform', service: 'my-service' },
      });
      expect(
        (result.metadata.annotations as Record<string, string>)['runbook-url'],
      ).toBe('https://wiki.example.com/platform/my-service');
    });

    it('writes to annotation keys with dots using bracket notation', () => {
      // Keys like "github.com/project-slug" contain a dot and must use bracket
      // notation so lodash set treats the whole key as a single path segment.
      const patcher = makePatcher({
        patchConfigs: [
          {
            name: 'ann-patch',
            mapping: {
              'metadata.annotations["github.com/project-slug"]': 'projectSlug',
              'metadata.annotations["backstage.io/techdocs-ref"]':
                'techdocsRef',
            },
            sectionProperties: {},
          },
        ],
      });
      const result = patcher.applyScalars(component, {
        'ann-patch': {
          projectSlug: 'myorg/my-service',
          techdocsRef: 'dir:.',
        },
      });
      const annotations = result.metadata.annotations as Record<string, string>;
      expect(annotations['github.com/project-slug']).toBe('myorg/my-service');
      expect(annotations['backstage.io/techdocs-ref']).toBe('dir:.');
    });

    it('returns entity unchanged when no patch data exists for the patch name', () => {
      const patcher = makePatcher({
        patchConfigs: [
          {
            name: 'comp-patch',
            mapping: { 'metadata.description': 'description' },
            sectionProperties: {},
          },
        ],
      });
      const result = patcher.applyScalars(component, {});
      expect(result).toEqual(component);
    });
  });

  describe('resolveRelations', () => {
    const relationPairs = new Map([
      ['ownedBy', { forward: 'ownedBy', reverse: 'ownerOf' }],
    ]);

    it('returns forward and reverse relations for a valid entity ref', () => {
      const patcher = makePatcher({
        patchConfigs: [
          {
            name: 'comp-patch',
            filter: { kind: 'component' },
            mapping: { 'relations.ownedBy': 'owner' },
            sectionProperties: {},
          },
        ],
        relationPairs,
      });
      const relations = patcher.resolveRelations(component, {
        'comp-patch': { owner: 'group:default/platform' },
      });

      expect(relations).toHaveLength(2);
      expect(relations).toContainEqual(
        expect.objectContaining({ type: 'ownedBy' }),
      );
      expect(relations).toContainEqual(
        expect.objectContaining({ type: 'ownerOf' }),
      );
    });

    it('handles an array of entity refs, expanding each to forward+reverse', () => {
      const patcher = makePatcher({
        patchConfigs: [
          {
            name: 'comp-patch',
            mapping: { 'relations.ownedBy': 'owner' },
            sectionProperties: {},
          },
        ],
        relationPairs,
      });
      const relations = patcher.resolveRelations(component, {
        'comp-patch': {
          owner: ['group:default/platform', 'group:default/infra'],
        },
      });

      expect(relations).toHaveLength(4);
    });

    it('skips and warns on invalid entity refs', () => {
      const logger = mockServices.logger.mock();
      const patcher = makePatcher({
        patchConfigs: [
          {
            name: 'comp-patch',
            mapping: { 'relations.ownedBy': 'owner' },
            sectionProperties: {},
          },
        ],
        relationPairs,
        logger,
      });
      const relations = patcher.resolveRelations(component, {
        'comp-patch': { owner: 'not-a-valid-ref' },
      });

      expect(relations).toHaveLength(0);
      expect(logger.warn).toHaveBeenCalledWith(
        expect.stringContaining('not-a-valid-ref'),
        expect.any(Object),
      );
    });

    it('returns empty array when no patch data exists for the patch name', () => {
      const patcher = makePatcher({
        patchConfigs: [
          {
            name: 'comp-patch',
            mapping: { 'relations.ownedBy': 'owner' },
            sectionProperties: {},
          },
        ],
        relationPairs,
      });
      expect(patcher.resolveRelations(component, {})).toEqual([]);
    });

    it('warns at construction time and skips relation mappings with no matching relation pair', () => {
      const logger = mockServices.logger.mock();
      makePatcher({
        patchConfigs: [
          {
            name: 'comp-patch',
            mapping: { 'relations.unknownRelation': 'target' },
            sectionProperties: {},
          },
        ],
        relationPairs: new Map(),
        logger,
      });
      expect(logger.warn).toHaveBeenCalledWith(
        expect.stringContaining('unknownRelation'),
      );
    });
  });
});
