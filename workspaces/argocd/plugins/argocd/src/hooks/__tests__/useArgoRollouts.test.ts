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
import { useEntity } from '@backstage/plugin-catalog-react';

import { renderHook } from '@testing-library/react';

import { useKubernetesObjects } from '@backstage/plugin-kubernetes-react';

import { useArgocdRollouts } from '../useArgoRollouts';

jest.mock('@backstage/plugin-catalog-react', () => ({
  useEntity: jest.fn(),
}));

jest.mock('@backstage/plugin-kubernetes-react', () => ({
  useKubernetesObjects: jest.fn(),
}));

const mockEntity = {
  metadata: {
    name: 'mock-entity',
  },
};

const mockKubernetesObjects = {
  items: [
    {
      resources: [
        {
          type: 'replicasets',
          resources: [{ kind: 'ReplicaSet', metadata: { name: 'rs1' } }],
        },
        {
          type: 'customresources',
          resources: [{ kind: 'Rollout', metadata: { name: 'rollout1' } }],
        },
      ],
    },
  ],
};

describe('useArgocdRollouts', () => {
  beforeEach(() => {
    (useEntity as jest.Mock).mockReturnValue({ entity: mockEntity });
    (useKubernetesObjects as jest.Mock).mockReturnValue({
      kubernetesObjects: mockKubernetesObjects,
      loaded: true,
    });
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  it('should return argo resources mapped correctly', () => {
    const { result } = renderHook(() => useArgocdRollouts());

    expect(result.current.replicasets).toEqual([
      { kind: 'ReplicaSet', metadata: { name: 'rs1' } },
    ]);
    expect(result.current.rollouts).toEqual([
      { kind: 'Rollout', metadata: { name: 'rollout1' } },
    ]);
  });

  it('should return initial empty argo resources if no kubernetes objects are present', () => {
    (useKubernetesObjects as jest.Mock).mockReturnValue({
      kubernetesObjects: { items: [] },
    });

    const { result } = renderHook(() => useArgocdRollouts());
    expect(result.current.replicasets).toEqual([]);
    expect(result.current.rollouts).toEqual([]);
  });
});
