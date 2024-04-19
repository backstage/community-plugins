/*
 * Copyright 2020 The Backstage Authors
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
import ButtonBase from '@material-ui/core/ButtonBase';
import { useBarChartStepperStyles as useStyles } from '../../utils/styles';

export type BarChartStepsProps = {
  steps: number;
  activeStep: number;
  onClick: (index: number) => void;
};

export const BarChartSteps = ({
  steps,
  activeStep,
  onClick,
}: BarChartStepsProps) => {
  const classes = useStyles();
  const handleOnClick =
    (index: number) =>
    (event: React.MouseEvent<HTMLButtonElement, MouseEvent>) => {
      event.preventDefault();
      onClick(index);
    };

  return (
    <div className={classes.steps}>
      {[...new Array(steps)].map((_, index) => (
        <ButtonBase key={index} centerRipple onClick={handleOnClick(index)}>
          <div
            data-testid="bar-chart-step"
            className={`${classes.step} ${
              index === activeStep ? classes.stepActive : ''
            }`}
          />
        </ButtonBase>
      ))}
    </div>
  );
};
