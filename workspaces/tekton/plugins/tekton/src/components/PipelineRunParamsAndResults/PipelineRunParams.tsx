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

import { useTranslationRef } from '@backstage/core-plugin-api/alpha';
import { PipelineRunKind } from '@janus-idp/shared-react';
import { Typography } from '@material-ui/core';
import { tektonTranslationRef } from '../../translations';
import { Output } from './Output';

type PipelineRunParamsProps = {
  pipelineRun: PipelineRunKind;
};

export const PipelineRunParams = ({ pipelineRun }: PipelineRunParamsProps) => {
  const { t } = useTranslationRef(tektonTranslationRef);
  const noDataAvailable =
    pipelineRun.spec?.params === undefined ||
    pipelineRun.spec?.params.length === 0;

  if (noDataAvailable) {
    return (
      <Typography align="center" variant="body2">
        {t('pipelineRunParamsAndResults.noParams')}
      </Typography>
    );
  }

  return <Output results={pipelineRun?.spec.params ?? []} />;
};
