import React from 'react';
import { Resource } from '../../../../../types/application';
import { useArgoResources } from '../../rollouts/RolloutContext';
import Rollout from '../../rollouts/Rollout';
import { RolloutUI } from '../../../../../types/revision';
import RolloutStatus from '../../rollouts/RolloutStatus';
import Metadata from '../../../../Common/Metadata';
import MetadataItem from '../../../../Common/MetadataItem';

const RolloutMetadata = ({ resource }: { resource: Resource }) => {
  const { rollouts } = useArgoResources();
  const rollout = rollouts.find(
    r => r.metadata.name === resource?.name,
  ) as RolloutUI;

  const rolloutStrategy = rollout?.spec?.strategy?.canary
    ? 'Canary'
    : 'BlueGreen';

  if (!rollout) {
    return null;
  }

  return (
    <>
      <Metadata>
        <MetadataItem title="Namespace">{resource?.namespace}</MetadataItem>
        <MetadataItem title="Strategy">{rolloutStrategy}</MetadataItem>
        <MetadataItem title="Status">
          <RolloutStatus status={rollout?.status?.phase as any} />
        </MetadataItem>
      </Metadata>
      <Rollout rollout={rollout} />
    </>
  );
};
export default RolloutMetadata;
