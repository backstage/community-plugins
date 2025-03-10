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
import { LogViewer } from '@backstage/core-components';
import { Paper } from '@material-ui/core';
import React from 'react';

interface PipelineRunStepViewerProps {
  activeStepLog: string;
}

export const PipelineRunStepViewer: React.FC<PipelineRunStepViewerProps> = ({
  activeStepLog,
}) => {
  return (
    <React.Fragment>
      <Paper
        data-testid="step-log"
        style={{ height: '100%', width: '100%', minHeight: '30rem' }}
      >
        <LogViewer text={activeStepLog} />
      </Paper>
    </React.Fragment>
  );
};
