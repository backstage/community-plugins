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
  extractEntityValues,
  extractRelationValues,
  getByPath,
} from './EntityValueExtractor';
import type { RelationPair } from '@backstage-community/plugin-entity-patch-common';
import type { Entity } from '@backstage/catalog-model';

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

describe('extractEntityValues', () => {
  it('extracts multiple mapped fields', () => {
    const result = extractEntityValues(entity, {
      description: 'metadata.description',
      slackChannel: 'metadata.annotations.slack/channel',
    });
    expect(result).toEqual({
      description: 'My service description',
      slackChannel: '#my-team',
    });
  });

  it('omits fields whose path is not present on the entity', () => {
    const result = extractEntityValues(entity, {
      description: 'metadata.description',
      missing: 'spec.doesNotExist',
    });
    expect(result).toEqual({ description: 'My service description' });
  });

  it('extracts dotted annotation keys using bracket notation', () => {
    const result = extractEntityValues(entity, {
      pagerdutyKey: 'metadata.annotations["pagerduty.com/integration-key"]',
      runbook: 'metadata.annotations["backstage.io/runbook-url"]',
    });
    expect(result).toEqual({
      pagerdutyKey: 'abc123',
      runbook: 'https://runbooks.example.com/my-service',
    });
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

describe('extractEntityValues — relations support', () => {
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
    const result = extractEntityValues(
      entity,
      { designers: 'relations.hasDesigner' },
      { relationPairs, sectionProperties },
    );
    expect(result).toEqual({
      designers: ['user:default/alice', 'user:default/bob'],
    });
  });

  it('extracts single relation value when type is not "array"', () => {
    const result = extractEntityValues(
      entity,
      { techLead: 'relations.hasTechLead' },
      { relationPairs, sectionProperties },
    );
    expect(result).toEqual({ techLead: 'user:default/carol' });
  });

  it('omits relation fields when no matching relations exist on entity', () => {
    const result = extractEntityValues(
      entity,
      { managers: 'relations.hasManager' },
      {
        relationPairs: new Map([
          ['hasManager', { forward: 'hasManager', reverse: 'managerOn' }],
        ]),
        sectionProperties: { managers: { type: 'array' } },
      },
    );
    expect(result).toEqual({});
  });

  it('omits relation field when type is not in the registry', () => {
    const result = extractEntityValues(
      entity,
      { unknown: 'relations.unknownType' },
      { relationPairs, sectionProperties },
    );
    expect(result).toEqual({});
  });

  it('skips relation fields when relationPairs is not provided', () => {
    const result = extractEntityValues(entity, {
      designers: 'relations.hasDesigner',
    });
    expect(result).toEqual({});
  });

  it('mixes scalar and relation fields correctly', () => {
    const result = extractEntityValues(
      entity,
      {
        description: 'metadata.description',
        designers: 'relations.hasDesigner',
      },
      { relationPairs, sectionProperties },
    );
    expect(result).toEqual({
      description: 'My service description',
      designers: ['user:default/alice', 'user:default/bob'],
    });
  });
});
