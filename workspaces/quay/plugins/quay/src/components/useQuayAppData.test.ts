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

import { useQuayAppData } from '../hooks';

describe('useQuayAppData', () => {
  it('should correctly get the repository flag from the entity', () => {
    const entity: Entity = {
      apiVersion: 'backstage.io/v1alpha1',
      kind: 'Component',
      metadata: {
        name: 'foo',
        annotations: { 'quay.io/repository-slug': 'foo/bar' },
      },
    };

    const result = useQuayAppData({ entity });

    expect(result).toEqual({ repositorySlug: 'foo/bar' });
  });

  it('should throw an error when the annotation is not present', () => {
    const entity: Entity = {
      apiVersion: 'backstage.io/v1alpha1',
      kind: 'Component',
      metadata: {
        name: 'foo',
      },
    };

    const useResult = () => useQuayAppData({ entity });

    expect(useResult).toThrow("'Quay' annotations are missing");
  });
});
