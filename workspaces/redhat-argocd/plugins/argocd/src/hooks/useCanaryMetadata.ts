import { useCallback, useEffect, useMemo, useState } from 'react';

import { Revision } from '../types/revision';
import { RolloutPhase } from '../types/rollouts';

interface UseCanaryMetadataParams {
  revision: Revision;
}

interface RevisionMetadata {
  percentage: number;
  isStableRevision: boolean;
  isCanaryRevision: boolean;
}

const useCanaryMetadata = ({
  revision,
}: UseCanaryMetadataParams): RevisionMetadata => {
  const [percentage, setPercentage] = useState<number>(0);

  const { rollout } = revision || {};
  const rolloutStatus = rollout?.status || {};

  const canarySteps = useMemo(
    () => rollout?.spec?.strategy?.canary?.steps ?? [],
    [rollout],
  );
  const rolloutPhase = rolloutStatus?.phase || RolloutPhase.Progressing;
  const totalSteps = canarySteps.length;
  const currentStepIndex = rolloutStatus?.currentStepIndex || 0;
  const isStableRevision = !!revision?.metadata?.name?.includes(
    rolloutStatus?.stableRS as string,
  );
  const isCanaryRevision =
    !!revision?.metadata?.name?.includes(
      rolloutStatus?.currentPodHash as string,
    ) && rolloutStatus?.currentPodHash !== rolloutStatus?.stableRS;

  const isFullyPromoted =
    rolloutStatus?.stableRS === rolloutStatus?.currentPodHash;

  const getPreviousSetWeight = useCallback(
    (index: number) =>
      canarySteps
        .slice(0, index)
        .reduceRight((accumulator: number, step: any) => {
          if (accumulator !== 0) {
            return accumulator;
          } else if (step?.setWeight) {
            return step.setWeight;
          }

          return accumulator;
        }, 0),
    [canarySteps],
  );

  useEffect(() => {
    let newPercentage = 0;

    if (rolloutPhase !== RolloutPhase.Degraded) {
      if (isFullyPromoted && isStableRevision) {
        newPercentage = 100;
      }
      if (!isFullyPromoted && isCanaryRevision) {
        if (
          rolloutPhase === RolloutPhase.Paused ||
          rolloutPhase === RolloutPhase.Progressing
        ) {
          newPercentage = getPreviousSetWeight(currentStepIndex);
        }
      }

      if (
        !isFullyPromoted &&
        isStableRevision &&
        currentStepIndex < totalSteps
      ) {
        newPercentage = 100 - getPreviousSetWeight(currentStepIndex);
      }
    } else if (isStableRevision) {
      newPercentage = 100;
    }

    setPercentage(Math.max(0, Math.min(newPercentage, 100)));
  }, [
    rollout,
    canarySteps,
    rolloutPhase,
    isStableRevision,
    isCanaryRevision,
    currentStepIndex,
    totalSteps,
    isFullyPromoted,
    getPreviousSetWeight,
  ]);

  return {
    percentage,
    isStableRevision,
    isCanaryRevision,
  };
};

export default useCanaryMetadata;
