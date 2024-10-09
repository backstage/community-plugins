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
