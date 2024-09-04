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
import { HealthStatus } from '../../../../types/application';
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
    ['data-testid']: `rollout-${status.toLowerCase()}-icon`,
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
