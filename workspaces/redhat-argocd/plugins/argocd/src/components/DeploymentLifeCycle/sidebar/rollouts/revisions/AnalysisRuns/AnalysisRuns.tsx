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
import type { FC } from 'react';

import { Box, Chip, Tooltip, Typography } from '@material-ui/core';
import moment from 'moment';

import { AnalysisRun } from '../../../../../../types/analysisRuns';
import AnalysisRunStatus from './AnalysisRunStatus';
import { useTranslation } from '../../../../../../hooks/useTranslation';

interface AnalysisRunsProps {
  analysisruns: AnalysisRun[];
}

const AnalysisRuns: FC<AnalysisRunsProps> = ({ analysisruns }) => {
  const { t } = useTranslation();

  if (!analysisruns || analysisruns?.length === 0) {
    return null;
  }

  return (
    <>
      <Typography color="textPrimary" gutterBottom>
        {t(
          'deploymentLifecycle.sidebar.rollouts.revisions.analysisRuns.analysisRuns.textPrimary',
        )}
      </Typography>
      <Box sx={{ width: '100%' }}>
        {analysisruns.map(ar => {
          const analysisRunStatus = ar?.status?.phase;

          return (
            <Tooltip
              key={ar?.metadata?.uid}
              title={(() => {
                return (
                  <div data-testid={`${ar.metadata.name}-tooltip`}>
                    {t(
                      'deploymentLifecycle.sidebar.rollouts.revisions.analysisRuns.analysisRuns.name',
                    )}{' '}
                    {ar.metadata.name}
                    <br />
                    {t(
                      'deploymentLifecycle.sidebar.rollouts.revisions.analysisRuns.analysisRuns.createdAt',
                    )}{' '}
                    {moment(ar.metadata.creationTimestamp)
                      .local()
                      .format('MMM DD YYYY, h:mm:ss A')}
                    <br />
                    {t(
                      'deploymentLifecycle.sidebar.rollouts.revisions.analysisRuns.analysisRuns.createdAt',
                    )}{' '}
                    {analysisRunStatus}
                  </div>
                );
              })()}
            >
              <Chip
                variant="outlined"
                size="small"
                color="default"
                icon={<AnalysisRunStatus status={analysisRunStatus} />}
                label={`${t(
                  'deploymentLifecycle.sidebar.rollouts.revisions.analysisRuns.analysisRuns.chipLabel',
                )} ${ar?.metadata?.name?.split('-').slice(-2).join('-')}`}
              />
            </Tooltip>
          );
        })}
      </Box>
    </>
  );
};
export default AnalysisRuns;
