import { useEntity } from '@backstage/plugin-catalog-react';

import { renderHook } from '@testing-library/react';

import { useKubernetesObjects } from '@janus-idp/shared-react';

import { useArgocdRollouts } from '../useArgoRollouts';

jest.mock('@backstage/plugin-catalog-react', () => ({
  useEntity: jest.fn(),
}));

jest.mock('@janus-idp/shared-react', () => ({
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

  it('should return empty arrays for all Argo resources if resource type is not recognized', () => {
    const unrecognizedResources = {
      items: [
        {
          resources: [
            {
              type: 'unknownType',
              resources: [
                { kind: 'UnknownType', metadata: { name: 'unknown' } },
              ],
            },
          ],
        },
      ],
    };

    (useKubernetesObjects as jest.Mock).mockReturnValue({
      kubernetesObjects: unrecognizedResources,
    });

    const { result } = renderHook(() => useArgocdRollouts());

    Object.values(result.current).forEach(value => {
      expect(value).toEqual([]);
    });
  });
});
