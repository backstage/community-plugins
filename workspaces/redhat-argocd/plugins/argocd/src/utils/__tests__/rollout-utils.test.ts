import { mockArgoResources } from '../../../dev/__data__/argoRolloutsObjects';
import { ArgoResources, ReplicaSet } from '../../types/resources';
import {
  APP_KUBERNETES_INSTANCE_LABEL,
  ROLLOUT_REVISION_ANNOTATION,
} from '../../types/rollouts';
import {
  filterByOwnerName,
  filterResourcesByApplicationName,
  filterResourcesByOwnerName,
  filterResourcesByOwnerRef,
  getRevision,
  getRolloutUIResources,
  sortByDate,
} from '../rollout-utils';

const mockReplicaSet = {
  metadata: {
    annotations: {
      [ROLLOUT_REVISION_ANNOTATION]: '1',
    },
  },
};

const mockResource = {
  metadata: {
    ownerReferences: [{ name: 'owner1' }],
    creationTimestamp: new Date('2024-08-27T12:34:56Z'),
  },
} as ReplicaSet;

const mockResources = [
  { metadata: { creationTimestamp: new Date('2024-08-27T12:34:56Z') } },
  { metadata: { creationTimestamp: new Date('2024-08-26T12:34:56Z') } },
];

describe('getRevision', () => {
  it('should return the correct revision from the annotations', () => {
    expect(getRevision(mockReplicaSet)).toBe('1');
  });

  it('should return an empty string if the revision annotation is not found', () => {
    expect(getRevision({})).toBe('');
  });
});

describe('filterByOwnerName', () => {
  it('should return true if the resource has an owner with the given name', () => {
    expect(filterByOwnerName(mockResource, 'owner1')).toBe(true);
  });

  it('should return false if the resource does not have an owner with the given name', () => {
    expect(filterByOwnerName(mockResource, 'owner2')).toBe(false);
  });

  it('should return false if the ownerReferences is missing', () => {
    expect(filterByOwnerName({}, 'owner1')).toBe(false);
  });
});

describe('filterResourcesByOwnerName', () => {
  it('should filter resources by owner name', () => {
    const filtered = filterResourcesByOwnerName([mockResource], 'owner1');
    expect(filtered).toHaveLength(1);
  });

  it('should return an empty array if no resources match the owner name', () => {
    const filtered = filterResourcesByOwnerName([mockResource], 'owner2');
    expect(filtered).toHaveLength(0);
  });
});

describe('filterResourcesByOwnerRef', () => {
  const mockOwnerRef = {
    uid: '1',
    apiVersion: 'v1alpha1',
    kind: 'Rollout',
    name: 'owner1',
  };

  it('should filter resources by owner reference', () => {
    const filtered = filterResourcesByOwnerRef([mockResource], mockOwnerRef);
    expect(filtered).toHaveLength(1);
  });

  it('should filter resources by owner reference with extra conditions', () => {
    const extraCondition = jest.fn().mockReturnValue(true);
    const filtered = filterResourcesByOwnerRef(
      [mockResource],
      mockOwnerRef,
      extraCondition,
    );
    expect(filtered).toHaveLength(1);
    expect(extraCondition).toHaveBeenCalled();
  });

  it('should return an empty array if no resources match the owner reference', () => {
    const filtered = filterResourcesByOwnerRef([mockResource], {
      ...mockOwnerRef,
      name: 'owner2',
    });
    expect(filtered).toHaveLength(0);
  });
});

describe('filterResourcesByKubernetesId', () => {
  it('should return an empty array if no resources are passed', () => {
    const filtered = filterResourcesByApplicationName([], 'quarkus-app');
    expect(filtered).toHaveLength(0);
  });

  it('should return an empty array if resources are missing labels', () => {
    const filtered = filterResourcesByApplicationName(
      [mockResource],
      'quarkus-app',
    );
    expect(filtered).toHaveLength(0);
  });

  it('should return a empty array if the matching value is not set', () => {
    const resource = {
      ...mockResource,
      metadata: {
        labels: {
          [APP_KUBERNETES_INSTANCE_LABEL]: 'quarkus-app',
        },
      },
    };
    const filtered = filterResourcesByApplicationName([resource], undefined);
    expect(filtered).toHaveLength(0);
  });
  it('should return a filtered array if resources has matching kubernetes label value', () => {
    const resource = {
      ...mockResource,
      metadata: {
        labels: {
          [APP_KUBERNETES_INSTANCE_LABEL]: 'quarkus-app',
        },
      },
    };
    const filtered = filterResourcesByApplicationName(
      [resource],
      'quarkus-app',
    );
    expect(filtered).toHaveLength(1);
  });
});

describe('SortByDate', () => {
  it('should handle null or undefined resources', () => {
    const sorted = sortByDate(null as any);
    expect(sorted).toEqual([]);

    const sortedUndefined = sortByDate(undefined as any);
    expect(sortedUndefined).toEqual([]);
  });

  it('should return empty array', () => {
    const sorted = sortByDate([]);
    expect(sorted).toHaveLength(0);
  });
  it('should sort resources by creation timestamp', () => {
    const sorted = sortByDate(mockResources);
    expect(
      new Date(sorted[0]?.metadata?.creationTimestamp || '').getTime(),
    ).toBeLessThan(
      new Date(sorted[1]?.metadata?.creationTimestamp || '').getTime(),
    );
  });

  it('should handle missing creation timestamps', () => {
    const resourcesWithMissingDates = [{}, ...mockResources];
    const sorted = sortByDate(resourcesWithMissingDates);
    expect(sorted).toHaveLength(3);
  });

  it('should handle resources with missing creation timestamps', () => {
    const resourcesWithMissingDates = [{}, {}, ...mockResources];
    const sorted = sortByDate(resourcesWithMissingDates);
    expect(sorted).toHaveLength(4);
    // The resources with missing timestamp should come last since `now()` is used
    expect(sorted[2]).toEqual({});
    expect(sorted[3]).toEqual({});
  });
});

describe('getRolloutUIResources', () => {
  it('should return empty array', () => {
    expect(getRolloutUIResources({} as ArgoResources, undefined)).toHaveLength(
      0,
    );
  });

  it('should return empty array if the kubernetes label is not matched', () => {
    expect(
      getRolloutUIResources(mockArgoResources, 'invalid-label-value'),
    ).toHaveLength(0);
  });

  it('should return rollouts array if the kubernetes label is matched', () => {
    expect(
      getRolloutUIResources(mockArgoResources, 'quarkus-app'),
    ).toHaveLength(2);
  });

  it('should return rollouts, revisions and analysisRuns', () => {
    const mockArogResources: ArgoResources = {
      pods: [],
      rollouts: [mockArgoResources.rollouts[1]],
      replicasets: filterResourcesByOwnerName(
        mockArgoResources.replicasets,
        mockArgoResources.rollouts[1].metadata?.name,
      ),
      analysisruns: mockArgoResources.analysisruns,
    };

    const rollouts = getRolloutUIResources(mockArogResources, 'quarkus-app');
    expect(rollouts).toHaveLength(1);
    expect(rollouts[0].revisions).toHaveLength(1);
    expect(rollouts[0].revisions[0].analysisRuns).toHaveLength(0);
  });
});
