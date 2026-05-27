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
  CHECKMARX_DEFAULT_BRANCH_ANNOTATION,
  CHECKMARX_PROJECT_ID_ANNOTATION,
} from '../components';
import { getProjectInfo } from './useProjectInfo';

describe('getProjectInfo', () => {
  it('reads Checkmarx annotations from the entity', () => {
    const entity = {
      apiVersion: 'backstage.io/v1alpha1',
      kind: 'Component',
      metadata: {
        name: 'service-a',
        annotations: {
          [CHECKMARX_PROJECT_ID_ANNOTATION]: 'project-123',
          [CHECKMARX_DEFAULT_BRANCH_ANNOTATION]: 'main',
        },
      },
      spec: {
        type: 'service',
        lifecycle: 'production',
        owner: 'guests',
      },
    } as Entity;

    expect(getProjectInfo(entity)).toEqual({
      projectId: 'project-123',
      defaultBranch: 'main',
    });
  });

  it('returns undefined values when annotations are missing', () => {
    const entity = {
      apiVersion: 'backstage.io/v1alpha1',
      kind: 'Component',
      metadata: {
        name: 'service-b',
      },
      spec: {
        type: 'service',
        lifecycle: 'production',
        owner: 'guests',
      },
    } as Entity;

    expect(getProjectInfo(entity)).toEqual({
      projectId: undefined,
      defaultBranch: undefined,
    });
  });
});
