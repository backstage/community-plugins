/*
 * Copyright 2022 The Backstage Authors
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
  getHostnameFromEntity,
  getProjectNameFromEntity,
} from './useEntityGithubRepositories';

describe('getProjectNameFromEntity', () => {
  it('returns the project slug annotation', () => {
    const entity: Entity = {
      apiVersion: 'backstage.io/v1alpha1',
      kind: 'Component',
      metadata: {
        name: 'my-service',
        annotations: {
          'github.com/project-slug': 'my-org/my-service',
        },
      },
    };
    expect(getProjectNameFromEntity(entity)).toBe('my-org/my-service');
  });

  it('returns empty string when annotation is missing', () => {
    const entity: Entity = {
      apiVersion: 'backstage.io/v1alpha1',
      kind: 'Component',
      metadata: {
        name: 'my-service',
      },
    };
    expect(getProjectNameFromEntity(entity)).toBe('');
  });
});

describe('getHostnameFromEntity', () => {
  it('returns hostname from url type source-location', () => {
    const entity: Entity = {
      apiVersion: 'backstage.io/v1alpha1',
      kind: 'Component',
      metadata: {
        name: 'my-service',
        annotations: {
          'backstage.io/source-location':
            'url:https://github.com/my-org/my-service/tree/main/',
        },
      },
    };
    expect(getHostnameFromEntity(entity)).toBe('github.com');
  });

  it('returns hostname for GitHub Enterprise source-location', () => {
    const entity: Entity = {
      apiVersion: 'backstage.io/v1alpha1',
      kind: 'Component',
      metadata: {
        name: 'my-service',
        annotations: {
          'backstage.io/source-location':
            'url:https://github.mycompany.com/my-org/my-service/',
        },
      },
    };
    expect(getHostnameFromEntity(entity)).toBe('github.mycompany.com');
  });

  it('returns github.com for file type source-location', () => {
    const entity: Entity = {
      apiVersion: 'backstage.io/v1alpha1',
      kind: 'Component',
      metadata: {
        name: 'my-service',
        annotations: {
          'backstage.io/source-location':
            'file:./catalog-entities/my-service.yaml',
        },
      },
    };
    expect(getHostnameFromEntity(entity)).toBe('github.com');
  });

  it('returns github.com for managed-by-location fallback with file type', () => {
    const entity: Entity = {
      apiVersion: 'backstage.io/v1alpha1',
      kind: 'Component',
      metadata: {
        name: 'my-service',
        annotations: {
          'backstage.io/managed-by-location':
            'file:/opt/app-root/src/catalog-info.yaml',
        },
      },
    };
    expect(getHostnameFromEntity(entity)).toBe('github.com');
  });
});
