/*
 * Copyright 2021 The Backstage Authors
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

import Typography from '@material-ui/core/Typography';
import React, { useState } from 'react';

import { ResponseStep } from '../types/types';

export function useResponseSteps() {
  const [responseSteps, setResponseSteps] = useState<ResponseStep[]>([]);

  const addStepToResponseSteps = (responseStep: ResponseStep) => {
    setResponseSteps([...responseSteps, responseStep]);
  };

  const asyncCatcher = (error: Error): never => {
    const responseStepError: ResponseStep = {
      message: (
        <b>
          Something went wrong{' '}
          <Typography component="span" role="img" aria-label="fire">
            🔥
          </Typography>
        </b>
      ),
      secondaryMessage: `Error message: ${
        error?.message ? error.message : 'unknown'
      }`,
      icon: 'failure',
    };

    addStepToResponseSteps(responseStepError);
    throw error;
  };

  const abortIfError = (error?: Error) => {
    if (error) {
      throw error;
    }
  };

  return {
    responseSteps,
    addStepToResponseSteps,
    asyncCatcher,
    abortIfError,
  };
}
