import { useMemo } from 'react';

import { Revision } from '../types/revision';
import { ROLLOUT_REVISION_ANNOTATION } from '../types/rollouts';

interface UseBlueGreenMetadata {
  revision: Revision;
}

interface BlueGreenMetadata {
  revisionName: string;
  revisionNumber: string;
  isStableRevision: boolean;
  isActiveRevision: boolean;
  isPreviewRevision: boolean;
}

const useBlueGreenMetadata = ({
  revision,
}: UseBlueGreenMetadata): BlueGreenMetadata => {
  const { rollout } = revision || {};

  const revisionName = revision?.metadata?.name || '';
  const revisionNumber =
    revision?.metadata?.annotations?.[ROLLOUT_REVISION_ANNOTATION] ?? '';

  const { status: rolloutStatus = {} } = rollout || {};
  const { stableRS = '', blueGreen = {} } = rolloutStatus;
  const { activeSelector = '', previewSelector = '' } = blueGreen;

  const isStableRevision = useMemo(
    () => !!revisionName && revisionName.includes(stableRS),
    [revisionName, stableRS],
  );
  const isActiveRevision = useMemo(
    () => !!revisionName && revisionName.includes(activeSelector),
    [revisionName, activeSelector],
  );
  const isPreviewRevision = useMemo(
    () =>
      !!revisionName &&
      revisionName.includes(previewSelector) &&
      previewSelector !== activeSelector,
    [revisionName, previewSelector, activeSelector],
  );

  return {
    revisionName,
    revisionNumber,
    isStableRevision,
    isActiveRevision,
    isPreviewRevision,
  };
};

export default useBlueGreenMetadata;
