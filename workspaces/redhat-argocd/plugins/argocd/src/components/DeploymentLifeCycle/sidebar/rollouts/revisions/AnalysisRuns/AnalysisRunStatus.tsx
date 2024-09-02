import React from 'react';

import {
  CheckCircleIcon,
  CircleNotchIcon,
  ExclamationCircleIcon,
} from '@patternfly/react-icons';

import useIconStyles from '../../../../../../hooks/useIconStyles';
import {
  AnalysisRunPhase,
  AnalysisRunPhases,
} from '../../../../../../types/analysisRuns';
import { getStatusColor } from '../../RolloutStatusIcon';

const AnalysisRunStatus: React.FC<{ status: AnalysisRunPhase | undefined }> = ({
  status,
}) => {
  const classes = useIconStyles();

  if (!status) {
    return null;
  }
  const commonProps = {
    ['data-testid']: `analysisrun-${status.toLowerCase()}-icon`,
    className: classes.icon,
    style: { color: getStatusColor(status) },
  };

  switch (status) {
    case AnalysisRunPhases.Successful:
      return <CheckCircleIcon {...commonProps} />;
    case AnalysisRunPhases.Running:
      return (
        <CircleNotchIcon
          {...commonProps}
          className={`${classes.icon} ${classes['icon-spin']}`}
        />
      );
    case AnalysisRunPhases.Failed:
      return <ExclamationCircleIcon {...commonProps} />;

    default:
      return null;
  }
};
export default AnalysisRunStatus;
