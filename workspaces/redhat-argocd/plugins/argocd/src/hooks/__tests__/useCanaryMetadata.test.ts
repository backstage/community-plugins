import { renderHook } from '@testing-library/react';

import { mockArgoResources } from '../../../dev/__data__/argoRolloutsObjects';
import { Revision } from '../../types/revision';
import { Rollout } from '../../types/rollouts';
import { filterResourcesByOwnerName } from '../../utils/rollout-utils';
import useCanaryMetadata from '../useCanaryMetadata';

const canaryRollout = {
  ...mockArgoResources.rollouts[0],
  spec: {
    ...mockArgoResources.rollouts[0].spec,
    strategy: {
      ...mockArgoResources.rollouts[0].spec.strategy,
      canary: {
        steps: [
          {
            setWeight: 10,
          },
          {
            setWeight: 25,
          },
          {
            pause: {},
          },
          {
            setWeight: 100,
          },
        ],
      },
    },
  },
};
const revisions = filterResourcesByOwnerName(
  mockArgoResources.replicasets,
  canaryRollout.metadata.name,
);

const mockRevision: Revision = {
  ...revisions[2],
  rollout: canaryRollout,
  analysisRuns: [],
};

describe('useCanaryMetadata', () => {
  it('should return default metadata for missing revision data', () => {
    const { result } = renderHook(() =>
      useCanaryMetadata({
        revision: {
          metadata: { name: 'invalid-revision' },
          status: {},
        } as Revision,
      }),
    );

    expect(result.current.percentage).toBe(0);
    expect(result.current.isStableRevision).toBe(false);
    expect(result.current.isCanaryRevision).toBe(false);
  });
  it('should return correct metadata for stable revision', () => {
    const mockRollout: Rollout = {
      ...canaryRollout,
      status: {
        ...canaryRollout.status,
        stableRS: 'stable-revision',
        currentPodHash: 'stable-revision',
      },
    };

    const mockStableRevision: Revision = {
      ...mockRevision,
      metadata: { ...mockRevision.metadata, name: 'stable-revision' },
      rollout: mockRollout,
    };

    const { result } = renderHook(() =>
      useCanaryMetadata({ revision: mockStableRevision }),
    );

    expect(result.current.percentage).toBe(100);
    expect(result.current.isStableRevision).toBe(true);
    expect(result.current.isCanaryRevision).toBe(false);
  });

  it('should return correct metadata for canary revision', () => {
    const progressingRollout: Rollout = {
      ...canaryRollout,
      status: {
        ...canaryRollout.status,
        currentStepIndex: 2,
        phase: 'Progressing',
        stableRS: 'stable-revision',
        currentPodHash: 'canary-revision',
      },
    };

    const mockStableRevision: Revision = {
      ...mockRevision,
      metadata: { ...mockRevision.metadata, name: 'canary-revision' },
      rollout: progressingRollout,
    };

    const { result } = renderHook(() =>
      useCanaryMetadata({ revision: mockStableRevision }),
    );

    expect(result.current.percentage).toBe(25);
    expect(result.current.isStableRevision).toBe(false);
    expect(result.current.isCanaryRevision).toBe(true);
  });

  it('should return 0% if the canary revision step is paused initially', () => {
    const progressingCanaryRollout: Rollout = {
      ...canaryRollout,
      spec: {
        strategy: {
          ...canaryRollout.spec.strategy,
          canary: {
            steps: [
              {
                pause: {},
              },
            ],
          },
        },
      },
      status: {
        ...canaryRollout.status,
        currentStepIndex: 0,
        phase: 'Progressing',
        stableRS: 'stable-revision',
        currentPodHash: 'canary-revision',
      },
    };

    const mockStableRevision: Revision = {
      ...mockRevision,
      metadata: { ...mockRevision.metadata, name: 'canary-revision' },
      rollout: progressingCanaryRollout,
    };

    const { result } = renderHook(() =>
      useCanaryMetadata({ revision: mockStableRevision }),
    );

    expect(result.current.percentage).toBe(0);
    expect(result.current.isStableRevision).toBe(false);
    expect(result.current.isCanaryRevision).toBe(true);
  });

  it('should return previously used setWeight if the canary revision step is paused in middle', () => {
    const mockRollout: Rollout = {
      ...canaryRollout,
      spec: {
        strategy: {
          ...canaryRollout.spec.strategy,
          canary: {
            steps: [
              {
                setWeight: 50,
              },
              {
                pause: {},
              },
              {
                setWeight: 100,
              },
            ],
          },
        },
      },
      status: {
        ...canaryRollout.status,
        currentStepIndex: 1,
        phase: 'Progressing',
        stableRS: 'stable-revision',
        currentPodHash: 'canary-revision',
      },
    };

    const mockStableRevision: Revision = {
      ...mockRevision,
      metadata: { ...mockRevision.metadata, name: 'canary-revision' },
      rollout: mockRollout,
    };

    const { result } = renderHook(() =>
      useCanaryMetadata({ revision: mockStableRevision }),
    );

    expect(result.current.percentage).toBe(50);
    expect(result.current.isStableRevision).toBe(false);
    expect(result.current.isCanaryRevision).toBe(true);
  });

  it('should return 25% for paused canary revision', async () => {
    const pausedCanaryRollout: Rollout = {
      ...canaryRollout,
      status: {
        ...canaryRollout.status,
        currentStepIndex: 3,
        currentPodHash: 'canary-revision',
        phase: 'Paused',
      },
    };

    const mockCanaryRevision: Revision = {
      ...mockRevision,
      metadata: { ...mockRevision.metadata, name: 'canary-revision' },
      rollout: pausedCanaryRollout,
    };

    const { result } = renderHook(() =>
      useCanaryMetadata({ revision: mockCanaryRevision }),
    );

    expect(result.current.percentage).toBe(25);
    expect(result.current.isCanaryRevision).toBe(true);
    expect(result.current.isStableRevision).toBe(false);
  });

  it('should return 75% for paused stable revision', async () => {
    const pausedStableRollout: Rollout = {
      ...canaryRollout,
      status: {
        ...canaryRollout.status,
        currentStepIndex: 3,
        stableRS: 'stable-revision',
        phase: 'Paused',
      },
    };

    const mockCanaryRevision: Revision = {
      ...mockRevision,
      metadata: { ...mockRevision.metadata, name: 'stable-revision' },
      rollout: pausedStableRollout,
    };

    const { result } = renderHook(() =>
      useCanaryMetadata({ revision: mockCanaryRevision }),
    );

    expect(result.current.percentage).toBe(75);
    expect(result.current.isCanaryRevision).toBe(false);
    expect(result.current.isStableRevision).toBe(true);
  });

  it('should return 100% for the stable revision if the rollout is in Degraded phase', async () => {
    const degradedRollout: Rollout = {
      ...canaryRollout,
      status: {
        ...canaryRollout.status,
        currentStepIndex: 3,
        stableRS: 'stable-revision',
        phase: 'Degraded',
      },
    };

    const mockCanaryRevision: Revision = {
      ...mockRevision,
      metadata: { ...mockRevision.metadata, name: 'stable-revision' },
      rollout: degradedRollout,
    };

    const { result } = renderHook(() =>
      useCanaryMetadata({ revision: mockCanaryRevision }),
    );

    expect(result.current.percentage).toBe(100);
    expect(result.current.isCanaryRevision).toBe(false);
    expect(result.current.isStableRevision).toBe(true);
  });
});
