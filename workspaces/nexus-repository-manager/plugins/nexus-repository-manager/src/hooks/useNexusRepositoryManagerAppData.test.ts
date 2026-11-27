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
import { renderHook } from '@testing-library/react';

import { NEXUS_REPOSITORY_MANAGER_ANNOTATIONS } from '../annotations';
import { useNexusRepositoryManagerAppData } from './useNexusRepositoryManagerAppData';

describe('useNexusRepositoryManagerAppData', () => {
  it('should require annotations', () => {
    const { result } = renderHook(() => {
      try {
        useNexusRepositoryManagerAppData({
          entity: {
            apiVersion: 'backstage.io/v1alpha1',
            kind: 'Component',
            metadata: {
              name: 'backstage',
              annotations: {
                'nexus-repository-manager/docker.image-name':
                  'janus-idp/backstage-showcase',
              },
            },
          },
          ANNOTATIONS: [],
        });
      } catch (e) {
        // eslint-disable-next-line jest/no-conditional-expect
        expect(e).toEqual(
          Error('A Nexus Repository Manager annotation could not be found'),
        );
      }
    });
    expect(result.current).toBe(undefined);
  });

  it('should require an entity with an annotation', () => {
    const { result } = renderHook(() => {
      try {
        useNexusRepositoryManagerAppData({
          entity: {
            apiVersion: 'backstage.io/v1alpha1',
            kind: 'Component',
            metadata: {
              name: 'backstage',
            },
          },
          ANNOTATIONS: NEXUS_REPOSITORY_MANAGER_ANNOTATIONS,
        });
      } catch (e) {
        // eslint-disable-next-line jest/no-conditional-expect
        expect(e).toEqual(
          Error('A Nexus Repository Manager annotation could not be found'),
        );
      }
    });
    expect(result.current).toBe(undefined);
  });

  it('should return title and query', () => {
    const { result } = renderHook(() =>
      useNexusRepositoryManagerAppData({
        entity: {
          apiVersion: 'backstage.io/v1alpha1',
          kind: 'Component',
          metadata: {
            name: 'backstage',
            annotations: {
              'nexus-repository-manager/docker.image-name':
                'janus-idp/backstage-showcase',
            },
          },
        },
        ANNOTATIONS: NEXUS_REPOSITORY_MANAGER_ANNOTATIONS,
      }),
    );

    expect(result.current).toEqual({
      title: 'janus-idp/backstage-showcase',
      query: {
        dockerImageName: 'janus-idp/backstage-showcase',
        sort: 'version',
      },
    });
  });

  it('should return title and query with multiple repositories', () => {
    const { result } = renderHook(() =>
      useNexusRepositoryManagerAppData({
        entity: {
          apiVersion: 'backstage.io/v1alpha1',
          kind: 'Component',
          metadata: {
            name: 'backstage',
            annotations: {
              'nexus-repository-manager/docker.image-name': 'janus-idp',
              'nexus-repository-manager/docker.image-tag': 'latest',
            },
          },
        },
        ANNOTATIONS: NEXUS_REPOSITORY_MANAGER_ANNOTATIONS,
      }),
    );

    expect(result.current).toEqual({
      title: 'janus-idp | latest',
      query: {
        dockerImageName: 'janus-idp',
        dockerImageTag: 'latest',
        sort: 'version',
      },
    });
  });

  it('should have a custom title', () => {
    const { result } = renderHook(() =>
      useNexusRepositoryManagerAppData({
        entity: {
          apiVersion: 'backstage.io/v1alpha1',
          kind: 'Component',
          metadata: {
            name: 'backstage',
            annotations: {
              'nexus-repository-manager/docker.image-name':
                'janus-idp/backstage-showcase',
              'nexus-repository-manager/config.title': 'Custom Title',
            },
          },
        },
        ANNOTATIONS: NEXUS_REPOSITORY_MANAGER_ANNOTATIONS,
      }),
    );

    expect(result.current).toEqual({
      title: 'Custom Title',
      query: {
        dockerImageName: 'janus-idp/backstage-showcase',
        sort: 'version',
      },
    });
  });
});
