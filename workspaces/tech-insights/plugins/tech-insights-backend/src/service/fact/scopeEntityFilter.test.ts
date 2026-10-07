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

import { CATALOG_FILTER_EXISTS } from '@backstage/catalog-client';
import { scopeEntityFilter } from './scopeEntityFilter';

describe('scopeEntityFilter', () => {
  const entityRef = {
    kind: 'Component',
    namespace: 'default',
    name: 'my-service',
  };
  const identity = {
    kind: 'Component',
    'metadata.namespace': 'default',
    'metadata.name': 'my-service',
  };

  it('scopes a retriever without a filter to the entity', () => {
    expect(scopeEntityFilter(undefined, entityRef)).toEqual([identity]);
    expect(scopeEntityFilter([], entityRef)).toEqual([identity]);
  });

  it('keeps the conditions of each clause that can match', () => {
    expect(
      scopeEntityFilter(
        [
          { kind: ['component', 'api'], 'spec.type': 'service' },
          {
            kind: 'system',
            'metadata.annotations.backstage.io/techdocs-ref':
              CATALOG_FILTER_EXISTS,
          },
          { 'metadata.annotations.backstage.io/techdocs-ref': 'dir:.' },
        ],
        entityRef,
      ),
    ).toEqual([
      { ...identity, 'spec.type': 'service' },
      {
        ...identity,
        'metadata.annotations.backstage.io/techdocs-ref': 'dir:.',
      },
    ]);
  });

  it('accepts a single clause and any casing of keys and values', () => {
    expect(
      scopeEntityFilter(
        { Kind: 'COMPONENT', 'metadata.name': CATALOG_FILTER_EXISTS },
        entityRef,
      ),
    ).toEqual([identity]);
  });

  it('returns undefined when no clause can match the entity', () => {
    expect(scopeEntityFilter({ kind: 'system' }, entityRef)).toBeUndefined();
    expect(
      scopeEntityFilter(
        [{ 'metadata.namespace': 'other' }, { 'metadata.name': 'other' }],
        entityRef,
      ),
    ).toBeUndefined();
  });
});
