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

import { ScaffolderRelationEntityProcessor } from './ScaffolderRelationEntityProcessor';

describe('ScaffolderRelationEntityProcessor', () => {
  describe('postProcessEntity', () => {
    const processor = new ScaffolderRelationEntityProcessor();
    const location = { type: 'url', target: 'test-url' };
    const emit = jest.fn();

    afterEach(() => jest.resetAllMocks());

    it('generates relations for any arbitrary entity', async () => {
      const entity: Entity = {
        apiVersion: 'backstage.io/v1alpha1',
        kind: 'Component',
        metadata: { name: 'test-entity' },
        spec: {
          scaffoldedFrom: 'test-template',
        },
      };

      await processor.postProcessEntity(entity, location, emit);
      expect(emit).toHaveBeenCalledTimes(2);
      expect(emit).toHaveBeenCalledWith({
        type: 'relation',
        relation: {
          source: {
            kind: 'Template',
            namespace: 'default',
            name: 'test-template',
          },
          type: 'scaffolderOf',
          target: {
            kind: 'Component',
            namespace: 'default',
            name: 'test-entity',
          },
        },
      });
      expect(emit).toHaveBeenCalledWith({
        type: 'relation',
        relation: {
          source: {
            kind: 'Component',
            namespace: 'default',
            name: 'test-entity',
          },
          type: 'scaffoldedFrom',
          target: {
            kind: 'Template',
            namespace: 'default',
            name: 'test-template',
          },
        },
      });
    });
    it('generates no relations if the `spec.scaffoldedFrom` field is empty or does not exist', async () => {
      const entity: Entity = {
        apiVersion: 'backstage.io/v1alpha1',
        kind: 'Component',
        metadata: { name: 'n' },
        spec: {
          type: 'service',
        },
      };
      await processor.postProcessEntity(entity, location, emit);
      expect(emit).toHaveBeenCalledTimes(0);

      const entity2: Entity = {
        apiVersion: 'backstage.io/v1alpha1',
        kind: 'Component',
        metadata: { name: 'n' },
        spec: {
          scaffoldedFrom: '',
        },
      };
      await processor.postProcessEntity(entity2, location, emit);
      expect(emit).toHaveBeenCalledTimes(0);
    });
  });
});
