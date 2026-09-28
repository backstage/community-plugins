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
import {
  OCTOPUS_DEPLOY_PROJECT_ID_ANNOTATION,
  OCTOPUS_DEPLOY_PROJECT_SLUG_ANNOTATION,
} from '../constants';
import { getProjectReferenceAnnotationFromEntity } from './getAnnotationFromEntity';

describe('getProjectReferenceAnnotationFromEntity', () => {
  const entity = (annotations: Record<string, string>): Entity => ({
    apiVersion: 'backstage.io/v1alpha1',
    kind: 'Component',
    metadata: {
      name: 'example',
      annotations,
    },
  });

  it('supports project id annotations', () => {
    expect(
      getProjectReferenceAnnotationFromEntity(
        entity({
          [OCTOPUS_DEPLOY_PROJECT_ID_ANNOTATION]: 'Spaces-2/Projects-102',
        }),
      ),
    ).toEqual({ projectId: 'Projects-102', spaceId: 'Spaces-2' });
  });

  it('supports project slug annotations', () => {
    expect(
      getProjectReferenceAnnotationFromEntity(
        entity({
          [OCTOPUS_DEPLOY_PROJECT_SLUG_ANNOTATION]: 'Spaces-2/my-project',
        }),
      ),
    ).toEqual({ projectSlug: 'my-project', spaceId: 'Spaces-2' });
  });

  it('prefers the project id annotation when both are set', () => {
    expect(
      getProjectReferenceAnnotationFromEntity(
        entity({
          [OCTOPUS_DEPLOY_PROJECT_ID_ANNOTATION]: 'Projects-102',
          [OCTOPUS_DEPLOY_PROJECT_SLUG_ANNOTATION]: 'my-project',
        }),
      ),
    ).toEqual({ projectId: 'Projects-102' });
  });
});
