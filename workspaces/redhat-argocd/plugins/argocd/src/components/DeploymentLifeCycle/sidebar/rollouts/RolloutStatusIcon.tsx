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

import {
  CheckCircleIcon,
  CircleNotchIcon,
  ErrorCircleOIcon,
  PauseCircleIcon,
} from '@patternfly/react-icons';

import useIconStyles from '../../../../hooks/useIconStyles';
import {
  AnalysisRunPhase,
  AnalysisRunPhases,
} from '../../../../types/analysisRuns';
import { HealthStatus } from '@backstage-community/plugin-redhat-argocd-common';
import { RolloutPhase, RolloutPhaseType } from '../../../../types/rollouts';

export const getStatusColor = (
  status: HealthStatus | RolloutPhaseType | AnalysisRunPhase,
) => {
  switch (status) {
    case HealthStatus.Healthy:
    case RolloutPhase.Healthy:
    case AnalysisRunPhases.Successful:
      return 'green';
    case RolloutPhase.Paused:
      return '#766F94';
    case RolloutPhase.Degraded:
    case HealthStatus.Degraded:
    case AnalysisRunPhases.Failed:
      return '#E96D76';
    case RolloutPhase.Progressing:
    case AnalysisRunPhases.Running:
      return '#0DADEA';
    default:
      return 'gray'; // Default color
  }
};

const RolloutStatusIcon: React.FC<{ status: keyof typeof RolloutPhase }> = ({
  status,
}): React.ReactNode => {
  const classes = useIconStyles();

  const commonProps = {
    ['data-testid']: `rollout-${status.toLocaleLowerCase('en-US')}-icon`,
    className: classes.icon,
    style: { color: getStatusColor(status) },
  };

  switch (status) {
    case RolloutPhase.Healthy:
      return <CheckCircleIcon {...commonProps} />;

    case RolloutPhase.Paused:
      return <PauseCircleIcon {...commonProps} />;

    case RolloutPhase.Degraded:
      return <ErrorCircleOIcon {...commonProps} />;
    case RolloutPhase.Progressing:
      return (
        <CircleNotchIcon
          {...commonProps}
          className={`${classes.icon} ${classes['icon-spin']}`}
        />
      );
    default:
      return null;
  }
};

export default RolloutStatusIcon;
