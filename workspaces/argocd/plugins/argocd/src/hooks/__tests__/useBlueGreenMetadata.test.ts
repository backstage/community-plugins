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
