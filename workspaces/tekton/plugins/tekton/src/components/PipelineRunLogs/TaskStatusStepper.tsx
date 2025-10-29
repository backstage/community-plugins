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

import {
  CircularProgress,
  createStyles,
  makeStyles,
  StepButton,
  StepIconProps,
  Theme,
} from '@material-ui/core';
import Step from '@material-ui/core/Step';
import StepLabel from '@material-ui/core/StepLabel';
import Stepper from '@material-ui/core/Stepper';
import Typography from '@material-ui/core/Typography';
import Cancel from '@material-ui/icons/Cancel';
import Check from '@material-ui/icons/Check';
import FiberManualRecordIcon from '@material-ui/icons/FiberManualRecord';
import classNames from 'classnames';

import { ComputedStatus } from '@janus-idp/shared-react';

import { TaskStep } from '../../utils/taskRun-utils';
import { calculateDuration } from '../../utils/tekton-utils';
import { useTranslationRef } from '@backstage/core-plugin-api/alpha';
import { tektonTranslationRef } from '../../translations/index.ts';

const useStyles = makeStyles((theme: Theme) =>
  createStyles({
    root: {
      width: '100%',
    },
    titleContainer: {
      display: 'flex',
      alignItems: 'center',
      gap: theme.spacing(1),
    },
    closeButton: {
      position: 'absolute',
      right: theme.spacing(1),
      top: theme.spacing(1),
      color: theme.palette.grey[500],
    },
    labelWrapper: {
      display: 'flex',
      flex: 1,
      flexDirection: 'row',
      justifyContent: 'space-between',
    },
    stepWrapper: {
      width: '100%',
    },
  }),
);

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

const useStepIconStyles = makeStyles((theme: Theme) =>
  createStyles({
    root: {
      color: theme.palette.text.disabled,
      display: 'flex',
      height: 22,
      alignItems: 'center',
    },
    completed: {
      color: theme.palette.status.ok,
    },
    error: {
      color: theme.palette.status.error,
    },
  }),
);

const TaskStepIconComponent = ({ active, completed, error }: StepIconProps) => {
  const classes = useStepIconStyles();

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
    <div
      className={classNames(classes.root, {
        [classes.completed]: completed,
        [classes.error]: error,
      })}
    >
      {getMiddle()}
    </div>
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
  const classes = useStyles(props);
  const { t } = useTranslationRef(tektonTranslationRef);

  return (
    <div className={classes.root}>
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
                  className={classes.stepWrapper}
                >
                  <div className={classes.labelWrapper}>
                    <Typography variant="subtitle2">{step.name}</Typography>
                    {isSkipped ? (
                      <Typography variant="caption">
                        {t('pipelineRunLogs.taskStatusStepper.skipped')}
                      </Typography>
                    ) : (
                      <StepTimeTicker step={step} />
                    )}
                  </div>
                </StepLabel>
              </StepButton>
            </Step>
          );
        })}
      </Stepper>
    </div>
  );
});
