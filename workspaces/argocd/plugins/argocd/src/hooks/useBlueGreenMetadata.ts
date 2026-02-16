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
