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
import type { FC } from 'react';

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

const AnalysisRunStatus: FC<{ status: AnalysisRunPhase | undefined }> = ({
  status,
}) => {
  const classes = useIconStyles();

  if (!status) {
    return null;
  }
  const commonProps = {
    ['data-testid']: `analysisrun-${status.toLocaleLowerCase('en-US')}-icon`,
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
