import React from 'react';

import { Box, Card, CardContent, Grid, Typography } from '@material-ui/core';

import useBlueGreenMetadata from '../../../../../hooks/useBlueGreenMetadata';
import { Revision } from '../../../../../types/revision';
import AnalysisRuns from './AnalysisRuns/AnalysisRuns';
import RevisionImage from './RevisionImage';
import RevisionStatus from './RevisionStatus';
import RevisionType from './RevisionType';

interface RevisionCardProps {
  revision: Revision;
}

const BlueGreenRevision: React.FC<RevisionCardProps> = ({ revision }) => {
  const {
    revisionName,
    revisionNumber,
    isStableRevision,
    isActiveRevision,
    isPreviewRevision,
  } = useBlueGreenMetadata({ revision });
  const { analysisRuns = [] } = revision || {};

  if (!revision) {
    return null;
  }

  return (
    <Card elevation={2} style={{ margin: '10px' }} data-testid={revisionName}>
      <CardContent>
        <Grid container>
          <Grid item xs={8}>
            <Typography color="textPrimary" gutterBottom>
              {`Revision ${revisionNumber}`}
            </Typography>
          </Grid>
          <Grid item xs={4}>
            <Box sx={{ width: '100%' }} textAlign="end">
              {isStableRevision && <RevisionType label="Stable" />}
              {isActiveRevision && <RevisionType label="Active" />}
              {isPreviewRevision && <RevisionType label="Preview" />}
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
