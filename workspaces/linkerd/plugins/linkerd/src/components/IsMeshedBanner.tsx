import React from 'react';

import { useEntity } from '@backstage/plugin-catalog-react';
import { Grid } from '@material-ui/core';
import Alert from '@material-ui/lab/Alert';
import ErrorIcon from '@material-ui/icons/Error';
import WarningIcon from '@material-ui/icons/Warning';
import { useStatsForEntity } from '../hooks/useStatsForEntity';

export const IsMeshedBanner = () => {
  const { entity } = useEntity();
  const { stats } = useStatsForEntity(entity);

  if (!stats || !stats.current.pods.meshedPodsPercentage) {
    return (
      <Grid item xs={12}>
        <Alert icon={<ErrorIcon fontSize="inherit" />} severity="error">
          Looks like this component is not currently meshed with Linkerd
        </Alert>
      </Grid>
    );
  }

  if (stats?.current) {
    if (stats.current.pods.meshedPodsPercentage === 0) {
      return (
        <Grid item xs={12}>
          <Alert icon={<ErrorIcon fontSize="inherit" />} severity="error">
            Looks like this component is not currently meshed with Linkerd
          </Alert>
        </Grid>
      );
    }

    if (stats.current.pods.meshedPodsPercentage < 1) {
      return (
        <Grid item xs={12}>
          <Alert icon={<WarningIcon fontSize="inherit" />} severity="warning">
            This component is partially meshed with Linkerd (
            {stats.current.pods.meshedPods} of {stats.current.pods.totalPods}{' '}
            pods are meshed)
          </Alert>
        </Grid>
      );
    }
  }

  return null;
};
