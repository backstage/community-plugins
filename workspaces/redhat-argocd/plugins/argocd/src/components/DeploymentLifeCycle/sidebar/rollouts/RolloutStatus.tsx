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

import { Chip } from '@material-ui/core';

import { RolloutPhase } from '../../../../types/rollouts';
import RolloutStatusIcon from './RolloutStatusIcon';

interface RolloutStatusProps {
  status: keyof typeof RolloutPhase;
}
const RolloutStatus: React.FC<RolloutStatusProps> = ({ status }) => {
  if (!status) {
    return null;
  }
  return (
    <Chip
      data-testid="rollout-status-chip"
      size="small"
      variant="outlined"
      icon={<RolloutStatusIcon status={status} />}
      label={status}
    />
  );
};

export default RolloutStatus;
