/*
 * Copyright 2025 The Backstage Authors
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

import { Fragment } from 'react';

import { ComputedStatus, TaskStatusTypes } from '../../types';
import { getRunStatusColor } from '../../utils';

import './TaskStatusTooltip.css';

interface TaskStatusToolTipProps {
  taskStatus: TaskStatusTypes;
}

export const TaskStatusTooltip = ({ taskStatus }: TaskStatusToolTipProps) => {
  return (
    <div className="bs-shared-task-status-tooltip">
      {Object.keys(ComputedStatus).map(status => {
        const { message, color } = getRunStatusColor(status);
        return taskStatus[status as keyof TaskStatusTypes] ? (
          <Fragment key={status}>
            <div
              className="bs-shared-task-status-tooltip__legend"
              style={{ background: color }}
            />
            <div>
              {status === ComputedStatus.PipelineNotStarted ||
              status === ComputedStatus.FailedToStart
                ? message
                : `${taskStatus[status as keyof TaskStatusTypes]} ${message}`}
            </div>
          </Fragment>
        ) : null;
      })}
    </div>
  );
};
