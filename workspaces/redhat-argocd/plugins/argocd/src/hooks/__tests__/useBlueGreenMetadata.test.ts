import { renderHook } from '@testing-library/react';

import { mockArgoResources } from '../../../dev/__data__/argoRolloutsObjects';
import { Revision } from '../../types/revision';
import { filterResourcesByOwnerName } from '../../utils/rollout-utils';
import useBlueGreenMetadata from '../useBlueGreenMetadata';

const blueGreenRollout = mockArgoResources.rollouts[1];
const revisions = filterResourcesByOwnerName(
  mockArgoResources.replicasets,
  blueGreenRollout.metadata.name,
);

const mockRevision: Revision = {
  ...revisions[0],
  rollout: blueGreenRollout,
  analysisRuns: [],
};

describe('useBlueGreenMetadata', () => {
  it('should return default metadata for missing revision data', () => {
    const { result } = renderHook(() =>
      useBlueGreenMetadata({ revision: undefined as unknown as Revision }),
    );

    expect(result.current.revisionName).toBe('');
    expect(result.current.revisionNumber).toBe('');
    expect(result.current.isStableRevision).toBe(false);
    expect(result.current.isActiveRevision).toBe(false);
    expect(result.current.isPreviewRevision).toBe(false);
  });
  it('should return correct metadata for stable revision', () => {
    const { result } = renderHook(() =>
      useBlueGreenMetadata({ revision: mockRevision }),
    );

    expect(result.current.revisionName).toBe('rollout-bluegreen-7479659dfb');
    expect(result.current.revisionNumber).toBe('1');
    expect(result.current.isStableRevision).toBe(true);
    expect(result.current.isActiveRevision).toBe(true);
    expect(result.current.isPreviewRevision).toBe(false);
  });

  it('should return correct metadata for active revision', () => {
    const mockRollout = {
      ...blueGreenRollout,
      status: {
        ...blueGreenRollout.status,
        blueGreen: {
          ...blueGreenRollout.status?.blueGreen,
          activeSelector: 'active-revision',
        },
      },
    };

    const mockActiveRevision: Revision = {
      ...mockRevision,
      metadata: { ...mockRevision.metadata, name: 'active-revision' },
      rollout: mockRollout,
    };

    const { result } = renderHook(() =>
      useBlueGreenMetadata({ revision: mockActiveRevision }),
    );

    expect(result.current.isActiveRevision).toBe(true);
    expect(result.current.isStableRevision).toBe(false);
    expect(result.current.isPreviewRevision).toBe(false);
  });

  it('should return correct metadata for preview revision', () => {
    const mockRollout = {
      ...blueGreenRollout,
      status: {
        ...blueGreenRollout.status,
        blueGreen: {
          ...blueGreenRollout.status?.blueGreen,
          previewSelector: 'preview-revision',
        },
      },
    };

    const mockPreviewRevision: Revision = {
      ...mockRevision,
      metadata: { ...mockRevision.metadata, name: 'preview-revision' },
      rollout: mockRollout,
    };

    const { result } = renderHook(() =>
      useBlueGreenMetadata({ revision: mockPreviewRevision }),
    );

    expect(result.current.isPreviewRevision).toBe(true);
    expect(result.current.isStableRevision).toBe(false);
    expect(result.current.isActiveRevision).toBe(false);
  });
});
