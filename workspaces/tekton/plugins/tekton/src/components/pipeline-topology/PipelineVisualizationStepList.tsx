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
import classNames from 'classnames';

import { Status } from '../common/Status';
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

const TooltipColoredStatusIcon = ({
  status,
}: TooltipColoredStatusIconProps) => {
  const icon = <Status status={status} iconOnly />;
  return icon;
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
