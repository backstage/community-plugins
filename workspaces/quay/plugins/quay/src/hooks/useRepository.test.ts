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
import { renderHook } from '@testing-library/react';

import { useRepository } from './quay';

const mockUseEntity = jest.fn();

jest.mock('@backstage/plugin-catalog-react', () => ({
  useEntity: () => mockUseEntity(),
}));

describe('useRepository', () => {
  beforeEach(() => {
    mockUseEntity.mockReturnValue({
      entity: {
        apiVersion: 'backstage.io/v1alpha1',
        kind: 'Component',
        metadata: {
          name: 'foo',
          annotations: {
            'quay.io/repository-slug': 'foo/bar',
            'quay.io/instance-name': 'devel',
          },
        },
      },
    });
  });

  it('should return instanceName, organization and repository', () => {
    const { result } = renderHook(() => useRepository());
    expect(result.current).toEqual({
      instanceName: 'devel',
      organization: 'foo',
      repository: 'bar',
    });
  });

  it('should return undefined instanceName when not set', () => {
    mockUseEntity.mockReturnValue({
      entity: {
        apiVersion: 'backstage.io/v1alpha1',
        kind: 'Component',
        metadata: {
          name: 'foo',
          annotations: {
            'quay.io/repository-slug': 'foo/bar',
          },
        },
      },
    });

    const { result } = renderHook(() => useRepository());
    expect(result.current).toEqual({
      instanceName: undefined,
      organization: 'foo',
      repository: 'bar',
    });
  });
});
