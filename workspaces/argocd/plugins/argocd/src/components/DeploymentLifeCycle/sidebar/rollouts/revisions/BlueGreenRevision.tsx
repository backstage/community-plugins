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

import { Box, Card, CardContent, Grid, Typography } from '@material-ui/core';

import useBlueGreenMetadata from '../../../../../hooks/useBlueGreenMetadata';
import { Revision } from '../../../../../types/revision';
import AnalysisRuns from './AnalysisRuns/AnalysisRuns';
import RevisionImage from './RevisionImage';
import RevisionStatus from './RevisionStatus';
import RevisionType from './RevisionType';
import { useTranslation } from '../../../../../hooks/useTranslation';

interface RevisionCardProps {
  revision: Revision;
}

const BlueGreenRevision: FC<RevisionCardProps> = ({ revision }) => {
  const {
    revisionName,
    revisionNumber,
    isStableRevision,
    isActiveRevision,
    isPreviewRevision,
  } = useBlueGreenMetadata({ revision });
  const { analysisRuns = [] } = revision || {};
  const { t } = useTranslation();

  if (!revision) {
    return null;
  }

  return (
    <Card
      elevation={2}
      style={{ margin: '1px', width: '500px' }}
      data-testid={revisionName}
    >
      <CardContent>
        <Grid container>
          <Grid item xs={6}>
            <Typography color="textPrimary" gutterBottom>
              {`${t(
                'deploymentLifecycle.sidebar.rollouts.revisions.blueGreenRevision.revision',
              )} ${revisionNumber}`}
            </Typography>
          </Grid>
          <Grid item xs={6}>
            <Box style={{ width: '100%' }} textAlign="end">
              {isStableRevision && (
                <RevisionType
                  label={t(
                    'deploymentLifecycle.sidebar.rollouts.revisions.blueGreenRevision.stable',
                  )}
                />
              )}
              {isActiveRevision && (
                <RevisionType
                  label={t(
                    'deploymentLifecycle.sidebar.rollouts.revisions.blueGreenRevision.active',
                  )}
                />
              )}
              {isPreviewRevision && (
                <RevisionType
                  label={t(
                    'deploymentLifecycle.sidebar.rollouts.revisions.blueGreenRevision.preview',
                  )}
                />
              )}
            </Box>
          </Grid>
        </Grid>
        <Box sx={{ width: '100%' }}>
          <Grid container alignItems="flex-end">
            <Grid item xs={11} style={{ marginBottom: '3px' }}>
              <RevisionImage revision={revision} />
            </Grid>
            <Grid item xs={1}>
              <RevisionStatus revision={revision} />
            </Grid>
          </Grid>
        </Box>

        {analysisRuns.length > 0 && (
          <>
            <br />
            <AnalysisRuns analysisruns={analysisRuns} />
          </>
        )}
      </CardContent>
    </Card>
  );
};
export default BlueGreenRevision;
