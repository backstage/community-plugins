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
import { PipelineRunStepper } from './PipelineRunStepper';
import { Paper, Box } from '@material-ui/core';
import Grid from '@mui/material/Grid';
import { PipelineRunStepViewer } from './PipelineRunStepViewer';
import { PipelineRunLogsDownloader } from './PipelineRunLogsDownloader';
import { PipelineRunResult } from '../../models/pipelineRunResult';

type PipelineRunLogsProps = {
  pr: PipelineRunResult;
  step?: number;
};

export const PipelineRunLogs: React.FC<PipelineRunLogsProps> = ({
  pr,
  step,
}) => {
  const [activeStep, setActiveStep] = React.useState(
    step && step !== -1 ? step : 0,
  );
  const handleStepChange = (value: number) => {
    setActiveStep(value);
  };

  return (
    <React.Fragment>
      <Box data-testid="dialog-logs">
        <Grid container>
          <Grid item xs={12}>
            <PipelineRunLogsDownloader pr={pr} activeStep={activeStep} />
          </Grid>
          <Grid item xs={3}>
            <Paper>
              <PipelineRunStepper
                steps={pr.steps}
                activeStep={activeStep}
                handleStepChange={handleStepChange}
              />
            </Paper>
          </Grid>
          <Grid item xs={9}>
            <PipelineRunStepViewer
              activeStepLog={pr?.steps[activeStep]?.logs || ''}
            />
          </Grid>
        </Grid>
      </Box>
    </React.Fragment>
  );
};
