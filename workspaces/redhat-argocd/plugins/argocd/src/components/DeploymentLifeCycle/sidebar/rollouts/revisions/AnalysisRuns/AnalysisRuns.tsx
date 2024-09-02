import React from 'react';

import { Box, Chip, Tooltip, Typography } from '@material-ui/core';
import moment from 'moment';

import { AnalysisRun } from '../../../../../../types/analysisRuns';
import AnalysisRunStatus from './AnalysisRunStatus';

interface AnalysisRunsProps {
  analysisruns: AnalysisRun[];
}

const AnalysisRuns: React.FC<AnalysisRunsProps> = ({ analysisruns }) => {
  if (!analysisruns || analysisruns?.length === 0) {
    return null;
  }
  return (
    <>
      <Typography color="textPrimary" gutterBottom>
        Analysis Runs
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
                    Name: {ar.metadata.name}
                    <br />
                    Created at:{' '}
                    {moment(ar.metadata.creationTimestamp)
                      .local()
                      .format('MMM DD YYYY, h:mm:ss A')}
                    <br />
                    Status: {analysisRunStatus}
                  </div>
                );
              })()}
            >
              <Chip
                variant="outlined"
                size="small"
                color="default"
                icon={<AnalysisRunStatus status={analysisRunStatus} />}
                label={`Analysis ${ar?.metadata?.name
                  ?.split('-')
                  .slice(-2)
                  .join('-')}`}
              />
            </Tooltip>
          );
        })}
      </Box>
    </>
  );
};
export default AnalysisRuns;
