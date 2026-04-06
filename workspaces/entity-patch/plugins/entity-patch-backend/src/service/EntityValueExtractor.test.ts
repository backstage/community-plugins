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
import { extractEntityValues, getByPath } from './EntityValueExtractor';
import type { Entity } from '@backstage/catalog-model';

const entity: Entity = {
  apiVersion: 'backstage.io/v1alpha1',
  kind: 'Component',
  metadata: {
    name: 'my-service',
    namespace: 'default',
    description: 'My service description',
    annotations: { 'slack/channel': '#my-team' },
  },
  spec: {
    type: 'service',
    profile: { email: 'team@example.com' },
  },
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
});
