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
  AnalysisRunPhase,
  AnalysisRunPhases,
} from '../../../../../../types/analysisRuns';
import { Typography } from '@material-ui/core';
import {
  StatusError,
  StatusOK,
  StatusRunning,
} from '@backstage/core-components';

const AnalysisRunStatus: React.FC<{ status: AnalysisRunPhase | undefined }> = ({
  status,
}) => {
  if (!status) {
    return null;
  }

  const commonProps = {
    style: {
      marginLeft: '4.8px',
      marginBottom: '5px',
      marginRight: '8px',
      width: '0.8em',
    },
    'data-testid': `analysisrun-${status.toLocaleLowerCase('en-US')}-icon`,
  };

  switch (status) {
    case AnalysisRunPhases.Successful:
      return (
        <Typography {...commonProps}>
          <StatusOK />
        </Typography>
      );
    case AnalysisRunPhases.Running:
      return (
        <Typography {...commonProps}>
          <StatusRunning />
        </Typography>
      );
    case AnalysisRunPhases.Failed:
      return (
        <Typography {...commonProps}>
          <StatusError />
        </Typography>
      );

    default:
      return null;
  }
};
export default AnalysisRunStatus;
