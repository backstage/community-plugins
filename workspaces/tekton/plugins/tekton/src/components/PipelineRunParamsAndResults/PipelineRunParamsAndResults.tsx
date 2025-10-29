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

import { PipelineRunKind } from '@janus-idp/shared-react';
import { useTranslationRef } from '@backstage/core-plugin-api/alpha';
import { tektonTranslationRef } from '../../translations';
import { Typography } from '@material-ui/core';
import { PipelineRunParams } from './PipelineRunParams';
import { PipelineRunResults } from './PipelineRunResults';

type PipelineRunParamsAndResultsProps = {
  pipelineRun: PipelineRunKind;
};
export const PipelineRunParamsAndResults = ({
  pipelineRun,
}: PipelineRunParamsAndResultsProps) => {
  const { t } = useTranslationRef(tektonTranslationRef);

  return (
    <div style={{ height: '80vh' }}>
      <div>
        <Typography variant="h6" align="left" gutterBottom>
          {t('pipelineRunParamsAndResults.params')}
        </Typography>
        <PipelineRunParams pipelineRun={pipelineRun} />
      </div>
      <div style={{ marginTop: '20px' }}>
        <Typography variant="h6" align="left" gutterBottom>
          {t('pipelineRunParamsAndResults.results')}
        </Typography>
        <PipelineRunResults pipelineRun={pipelineRun} />
      </div>
    </div>
  );
};
