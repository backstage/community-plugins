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
import {
  EntityValueExtractor,
  extractRelationValues,
  getByPath,
} from './EntityValueExtractor';
import { mockServices } from '@backstage/backend-test-utils';
import type { RelationPair } from '@backstage-community/plugin-entity-patch-common';
import type { Entity } from '@backstage/catalog-model';

/** Test helper — builds a single-patch extractor via fromConfig. */
function makeExtractor(
  mapping: Record<string, string>,
  options: {
    relationPairs?: Map<string, RelationPair>;
    sectionProperties?: Record<string, unknown>;
  } = {},
) {
  // Deduplicate relation pairs (the map indexes both forward and reverse).
  const seenPairs = new Set<RelationPair>();
  const relations: { forward: string; reverse: string }[] = [];
  for (const pair of options.relationPairs?.values() ?? []) {
    if (!seenPairs.has(pair)) {
      seenPairs.add(pair);
      relations.push({ forward: pair.forward, reverse: pair.reverse });
    }
  }
  const sections = options.sectionProperties
    ? [{ properties: options.sectionProperties }]
    : [];
  const config = mockServices.rootConfig({
    data: {
      entityPatch: {
        patches: [{ name: 'test', mapping, sections }] as any,
        relations,
      },
    },
  });
  const e = EntityValueExtractor.fromConfig(config, {
    catalogService: {} as any,
  });
  return { extract: (entity: Entity) => e.extractAll(entity).test ?? {} };
}

const entity: Entity = {
  apiVersion: 'backstage.io/v1alpha1',
  kind: 'Component',
  metadata: {
    name: 'my-service',
    namespace: 'default',
    description: 'My service description',
    annotations: {
      'slack/channel': '#my-team',
      'pagerduty.com/integration-key': 'abc123',
      'backstage.io/runbook-url': 'https://runbooks.example.com/my-service',
    },
  },
  spec: {
    type: 'service',
    profile: { email: 'team@example.com' },
  },
  relations: [
    { type: 'hasDesigner', targetRef: 'user:default/alice' },
    { type: 'hasDesigner', targetRef: 'user:default/bob' },
    { type: 'hasTechLead', targetRef: 'user:default/carol' },
  ],
};

describe('getByPath', () => {
  it('resolves a top-level key', () => {
    expect(getByPath(entity, 'kind')).toBe('Component');
  });

  it('resolves a nested dot-path', () => {
    expect(getByPath(entity, 'metadata.description')).toBe(
      'My service description',
    );
  });

  it('resolves a deeply nested path', () => {
    expect(getByPath(entity, 'spec.profile.email')).toBe('team@example.com');
  });

  it('returns undefined for a missing path without throwing', () => {
    expect(getByPath(entity, 'spec.nonexistent.field')).toBeUndefined();
  });

  it('resolves annotation keys containing dots using bracket notation', () => {
    expect(
      getByPath(
        entity,
        'metadata.annotations["pagerduty.com/integration-key"]',
      ),
    ).toBe('abc123');
  });

  it('resolves annotation keys with dots and slashes using bracket notation', () => {
    expect(
      getByPath(entity, 'metadata.annotations["backstage.io/runbook-url"]'),
    ).toBe('https://runbooks.example.com/my-service');
  });

  it('resolves annotation keys without dots using plain dot notation', () => {
    expect(getByPath(entity, 'metadata.annotations.slack/channel')).toBe(
      '#my-team',
    );
  });
});

describe('EntityValueExtractor', () => {
  it('extracts multiple mapped fields (entityPath → fieldName)', () => {
    const result = makeExtractor({
      'metadata.description': 'description',
      'metadata.annotations.slack/channel': 'slackChannel',
    }).extract(entity);
    expect(result).toEqual({
      description: 'My service description',
      slackChannel: '#my-team',
    });
  });

  it('omits fields whose path is not present on the entity', () => {
    const result = makeExtractor({
      'metadata.description': 'description',
      'spec.doesNotExist': 'missing',
    }).extract(entity);
    expect(result).toEqual({ description: 'My service description' });
  });

  it('extracts dotted annotation keys using bracket notation', () => {
    const result = makeExtractor({
      'metadata.annotations["pagerduty.com/integration-key"]': 'pagerdutyKey',
      'metadata.annotations["backstage.io/runbook-url"]': 'runbook',
    }).extract(entity);
    expect(result).toEqual({
      pagerdutyKey: 'abc123',
      runbook: 'https://runbooks.example.com/my-service',
    });
  });

  it('supports fan-out: multiple entity paths mapping to the same form field', () => {
    // Last entity path with a defined value wins
    const result = makeExtractor({
      'metadata.description': 'description',
      'metadata.annotations.slack/channel': 'description', // fan-out, same field
    }).extract(entity);
    // Both paths resolve — last one wins
    expect(result).toEqual({ description: '#my-team' });
  });

  it('skips template values — they cannot be reverse-extracted from the entity', () => {
    const result = makeExtractor({
      'metadata.description': 'description',
      'metadata.annotations.slack/channel': '{{ channelId }}', // template
    }).extract(entity);
    // Template path skipped; only the plain field is extracted
    expect(result).toEqual({ description: 'My service description' });
  });
});

describe('extractRelationValues', () => {
  it('returns all target refs for a given type as array when multiple=true', () => {
    expect(extractRelationValues(entity, 'hasDesigner', true)).toEqual([
      'user:default/alice',
      'user:default/bob',
    ]);
  });

  it('returns the first target ref as a string when multiple=false', () => {
    expect(extractRelationValues(entity, 'hasDesigner', false)).toBe(
      'user:default/alice',
    );
  });

  it('returns undefined when no relations match and multiple=false', () => {
    expect(extractRelationValues(entity, 'unknownType', false)).toBeUndefined();
  });

  it('returns undefined when no relations match and multiple=true', () => {
    expect(extractRelationValues(entity, 'unknownType', true)).toBeUndefined();
  });
});

describe('EntityValueExtractor — relations support', () => {
  const relationPairs = new Map<string, RelationPair>([
    ['hasDesigner', { forward: 'hasDesigner', reverse: 'designerOn' }],
    ['designerOn', { forward: 'hasDesigner', reverse: 'designerOn' }],
    ['hasTechLead', { forward: 'hasTechLead', reverse: 'techLeadOf' }],
  ]);

  const sectionProperties = {
    designers: { type: 'array' },
    techLead: { type: 'string' },
  };

  it('extracts array relation values when type is "array"', () => {
    const result = makeExtractor(
      { 'relations.hasDesigner': 'designers' },
      { relationPairs, sectionProperties },
    ).extract(entity);
    expect(result).toEqual({
      designers: ['user:default/alice', 'user:default/bob'],
    });
  });

  it('extracts single relation value when type is not "array"', () => {
    const result = makeExtractor(
      { 'relations.hasTechLead': 'techLead' },
      { relationPairs, sectionProperties },
    ).extract(entity);
    expect(result).toEqual({ techLead: 'user:default/carol' });
  });

  it('omits relation fields when no matching relations exist on entity', () => {
    const result = makeExtractor(
      { 'relations.hasManager': 'managers' },
      {
        relationPairs: new Map([
          ['hasManager', { forward: 'hasManager', reverse: 'managerOn' }],
        ]),
        sectionProperties: { managers: { type: 'array' } },
      },
    ).extract(entity);
    expect(result).toEqual({});
  });

  it('omits relation field when type is not in the registry', () => {
    const result = makeExtractor(
      { 'relations.unknownType': 'unknown' },
      { relationPairs, sectionProperties },
    ).extract(entity);
    expect(result).toEqual({});
  });

  it('skips relation fields when relationPairs is not provided', () => {
    const result = makeExtractor({
      'relations.hasDesigner': 'designers',
    }).extract(entity);
    expect(result).toEqual({});
  });

  it('mixes scalar and relation fields correctly', () => {
    const result = makeExtractor(
      {
        'metadata.description': 'description',
        'relations.hasDesigner': 'designers',
      },
      { relationPairs, sectionProperties },
    ).extract(entity);
    expect(result).toEqual({
      description: 'My service description',
      designers: ['user:default/alice', 'user:default/bob'],
    });
  });
});
