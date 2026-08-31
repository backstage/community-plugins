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
import { useState, memo } from 'react';
import useInterval from 'react-use/lib/useInterval';

import Box from '@mui/material/Box';
import CircularProgress from '@mui/material/CircularProgress';
import Step from '@mui/material/Step';
import StepButton from '@mui/material/StepButton';
import StepLabel from '@mui/material/StepLabel';
import type { StepIconProps } from '@mui/material/StepIcon';
import Stepper from '@mui/material/Stepper';
import Typography from '@mui/material/Typography';
import Cancel from '@mui/icons-material/Cancel';
import Check from '@mui/icons-material/Check';
import FiberManualRecordIcon from '@mui/icons-material/FiberManualRecord';
import classNames from 'classnames';

import { ComputedStatus } from '@backstage-community/plugin-tekton-react';

import { TaskStep } from '../../utils/taskRun-utils';
import { calculateDuration } from '../../utils/tekton-utils';
import { useTranslationRef } from '@backstage/core-plugin-api/alpha';
import { tektonTranslationRef } from '../../translations/index.ts';

const StepTimeTicker = ({ step }: { step: TaskStep }) => {
  const [time, setTime] = useState('');
  const { t } = useTranslationRef(tektonTranslationRef);

  useInterval(() => {
    if (!step.startedAt) {
      setTime('');
      return;
    }

    setTime(calculateDuration(t, step.startedAt, step.endedAt));
  }, 1000);

  return <Typography variant="caption">{time}</Typography>;
};

const TaskStepIconComponent = ({ active, completed, error }: StepIconProps) => {
  const getMiddle = () => {
    if (active) {
      return <CircularProgress size="24px" />;
    }
    if (completed) {
      return <Check />;
    }
    if (error) {
      return <Cancel />;
    }
    return <FiberManualRecordIcon />;
  };

  return (
    <Box
      sx={{
        color: theme => theme.palette.text.disabled,
        display: 'flex',
        height: 22,
        alignItems: 'center',
        ...(completed && {
          color: theme => theme.palette.status.ok,
        }),
        ...(error && {
          color: theme => theme.palette.status.error,
        }),
      }}
      className={classNames({
        completed,
        error,
      })}
    >
      {getMiddle()}
    </Box>
  );
};

type TaskStatusStepperProps = {
  steps: TaskStep[];
  currentStepId: string | undefined;
  onUserStepChange: (id: string) => void;
  classes?: {
    root?: string;
  };
};

export const TaskStatusStepper = memo((props: TaskStatusStepperProps) => {
  const { steps, currentStepId, onUserStepChange } = props;
  const { t } = useTranslationRef(tektonTranslationRef);

  return (
    <Box className={props.classes?.root} sx={{ width: '100%' }}>
      <Stepper
        activeStep={steps.findIndex(s => s.id === currentStepId)}
        orientation="vertical"
        nonLinear
      >
        {steps.map((step, _) => {
          const isCancelled = step.status === ComputedStatus.Cancelled;
          const isActive = step.status === ComputedStatus.Running;
          const isCompleted = step.status === ComputedStatus.Succeeded;
          const isFailed = step.status === ComputedStatus.Failed;
          const isSkipped = step.status === ComputedStatus.Skipped;

          return (
            <Step key={step.id} expanded>
              <StepButton onClick={() => onUserStepChange(step.id)}>
                <StepLabel
                  StepIconProps={{
                    completed: isCompleted,
                    error: isFailed || isCancelled,
                    active: isActive,
                  }}
                  StepIconComponent={TaskStepIconComponent}
                  sx={{ width: '100%' }}
                >
                  <Box
                    sx={{
                      display: 'flex',
                      flex: 1,
                      flexDirection: 'row',
                      justifyContent: 'space-between',
                    }}
                  >
                    <Typography variant="subtitle2">{step.name}</Typography>
                    {isSkipped ? (
                      <Typography variant="caption">
                        {t('pipelineRunLogs.taskStatusStepper.skipped')}
                      </Typography>
                    ) : (
                      <StepTimeTicker step={step} />
                    )}
                  </Box>
                </StepLabel>
              </StepButton>
            </Step>
          );
        })}
      </Stepper>
    </Box>
  );
});
