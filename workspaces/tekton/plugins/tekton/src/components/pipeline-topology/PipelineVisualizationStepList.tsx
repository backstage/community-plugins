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
import { RunStatus } from '@patternfly/react-topology';
import Box from '@mui/material/Box';
import { useTheme } from '@mui/material/styles';
import AutorenewOutlined from '@mui/icons-material/AutorenewOutlined';
import CheckCircleOutline from '@mui/icons-material/CheckCircleOutline';
import ErrorOutline from '@mui/icons-material/ErrorOutline';
import HourglassEmptyOutlined from '@mui/icons-material/HourglassEmptyOutlined';
import KeyboardDoubleArrowRight from '@mui/icons-material/KeyboardDoubleArrowRight';
import NotInterestedOutlined from '@mui/icons-material/NotInterestedOutlined';
import ReportProblemOutlined from '@mui/icons-material/ReportProblemOutlined';
import classNames from 'classnames';

import { StepStatus } from '../../types/taskRun';

import './PipelineVisualizationStepList.css';
import { useTranslationRef } from '@backstage/core-plugin-api/alpha';
import { tektonTranslationRef } from '../../translations/index.ts';

export type PipelineVisualizationStepListProps = {
  isSpecOverview: boolean;
  taskName: string;
  steps: StepStatus[];
  isFinallyTask?: boolean;
  hideHeader?: boolean;
};

type TooltipColoredStatusIconProps = {
  status: RunStatus;
};

const tooltipStatusIconSx = {
  display: 'block',
  fontSize: '1rem',
  height: '1rem',
  width: '1rem',
};

const TooltipColoredStatusIcon = ({
  status,
}: TooltipColoredStatusIconProps) => {
  const theme = useTheme();
  const statusLabel = String(status);

  switch (statusLabel) {
    case 'Succeeded':
    case 'Completed':
    case 'Synced':
      return (
        <CheckCircleOutline
          sx={{ ...tooltipStatusIconSx, color: theme.palette.status.ok }}
        />
      );
    case 'Failed':
    case 'Failure':
    case 'Error':
    case 'ImagePullBackOff':
    case 'CrashLoopBackOff':
    case 'ErrImagePull':
      return (
        <ErrorOutline
          sx={{ ...tooltipStatusIconSx, color: theme.palette.status.error }}
        />
      );
    case 'Warning':
    case 'RequiresApproval':
      return (
        <ReportProblemOutlined
          sx={{ ...tooltipStatusIconSx, color: theme.palette.status.warning }}
        />
      );
    case 'In Progress':
    case 'Progress':
    case 'Progressing':
    case 'Running':
    case 'Installing':
    case 'Updating':
      return (
        <AutorenewOutlined
          sx={{ ...tooltipStatusIconSx, color: theme.palette.status.running }}
        />
      );
    case 'Pending':
    case 'New':
    case 'Idle':
    case 'PipelineNotStarted':
      return (
        <HourglassEmptyOutlined
          sx={{ ...tooltipStatusIconSx, color: theme.palette.status.pending }}
        />
      );
    case 'Cancelled':
    case 'Cancelling':
    case 'Deleting':
    case 'Terminating':
    case 'Uninstalling':
      return (
        <NotInterestedOutlined
          sx={{ ...tooltipStatusIconSx, color: theme.palette.status.aborted }}
        />
      );
    case 'Skipped':
      return (
        <KeyboardDoubleArrowRight
          sx={{ ...tooltipStatusIconSx, color: theme.palette.text.secondary }}
        />
      );
    default:
      return (
        <Box
          component="span"
          sx={{
            ...tooltipStatusIconSx,
            borderRadius: '50%',
            backgroundColor: theme.palette.status.aborted,
          }}
        />
      );
  }
};

export const PipelineVisualizationStepList = ({
  isSpecOverview,
  taskName,
  steps,
  isFinallyTask,
  hideHeader,
}: PipelineVisualizationStepListProps) => {
  const { t } = useTranslationRef(tektonTranslationRef);
  return (
    <div className="bs-tkn-pipeline-visualization-step-list">
      {!hideHeader && (
        <div className="bs-tkn-pipeline-visualization-step-list__task-name">
          {taskName}
        </div>
      )}
      {isFinallyTask && (
        <div className="bs-tkn-pipeline-visualization-step-list__task-type">
          {t('pipelineVisualization.stepList.finallyTaskTitle')}
        </div>
      )}
      {steps?.map(({ duration, name, status }) => {
        return (
          <div
            className={classNames(
              'bs-tkn-pipeline-visualization-step-list__step',
              {
                'bs-tkn-pipeline-visualization-step-list__step--task-run':
                  !isSpecOverview,
              },
            )}
            key={name}
          >
            {!isSpecOverview ? (
              <div className="bs-tkn-pipeline-visualization-step-list__icon">
                <TooltipColoredStatusIcon status={status} />
              </div>
            ) : (
              <span className="bs-tkn-pipeline-visualization-step-list__bullet">
                &bull;
              </span>
            )}
            <div className="bs-tkn-pipeline-visualization-step-list__name">
              {name}
            </div>
            {!isSpecOverview && (
              <div className="bs-tkn-pipeline-visualization-step-list__duration">
                {duration}
              </div>
            )}
          </div>
        );
      })}
    </div>
  );
};
