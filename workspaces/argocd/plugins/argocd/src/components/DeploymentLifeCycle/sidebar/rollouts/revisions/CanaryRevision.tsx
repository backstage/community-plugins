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

import { memo } from 'react';

import Box from '@mui/material/Box';
import Card from '@mui/material/Card';
import CardContent from '@mui/material/CardContent';
import Grid from '@mui/material/Grid';
import Typography from '@mui/material/Typography';

import useCanaryMetadata from '../../../../../hooks/useCanaryMetadata';
import { Revision } from '../../../../../types/revision';
import { ROLLOUT_REVISION_ANNOTATION } from '../../../../../types/rollouts';
import AnalysisRuns from './AnalysisRuns/AnalysisRuns';
import ProgressBar from './ProgressBar';
import RevisionStatus from './RevisionStatus';
import RevisionType from './RevisionType';
import { useTranslation } from '../../../../../hooks/useTranslation';

interface RevisionCardProps {
  revision: Revision;
  animateProgressBar: boolean;
}

const CanaryRevision: FC<RevisionCardProps> = ({
  revision,
  animateProgressBar = true,
}) => {
  const { percentage, isStableRevision, isCanaryRevision } = useCanaryMetadata({
    revision,
  });
  const { t } = useTranslation();

  if (!revision) {
    return null;
  }

  return (
    <Card
      elevation={2}
      sx={{
        width: '500px',
        overflowY: 'auto',
        margin: '1px',
      }}
      data-testid={`${revision?.metadata?.name}`}
    >
      <CardContent>
        <Grid container>
          <Grid item xs={9}>
            <Typography color="textPrimary" gutterBottom>
              {`${t(
                'deploymentLifecycle.sidebar.rollouts.revisions.canaryRevision.revision',
              )} ${
                revision?.metadata?.annotations?.[ROLLOUT_REVISION_ANNOTATION]
              }`}
            </Typography>
          </Grid>
          {(isStableRevision || isCanaryRevision) && (
            <Grid item xs={3}>
              <Box sx={{ width: '100%' }}>
                <RevisionType
                  label={
                    isStableRevision
                      ? t(
                          'deploymentLifecycle.sidebar.rollouts.revisions.canaryRevision.revisionType.stable',
                        )
                      : t(
                          'deploymentLifecycle.sidebar.rollouts.revisions.canaryRevision.revisionType.canary',
                        )
                  }
                />
              </Box>
            </Grid>
          )}
        </Grid>
        <Box sx={{ width: '100%' }}>
          <Grid container alignItems="flex-end">
            <Grid item xs={11} style={{ marginBottom: '3px' }}>
              <ProgressBar
                revision={revision}
                percentage={percentage}
                duration={animateProgressBar ? 0 : 2000}
              />
            </Grid>
            <Grid item xs={1}>
              <RevisionStatus revision={revision} />
            </Grid>
          </Grid>
        </Box>
        <br />
        {revision.analysisRuns?.length > 0 && (
          <AnalysisRuns analysisruns={revision.analysisRuns} />
        )}
      </CardContent>
    </Card>
  );
};
export default memo(CanaryRevision);
