import React from 'react';

import { linkerdPluginRef } from '../plugin';
import { useApi } from '@backstage/core-plugin-api';
import { useEntity } from '@backstage/plugin-catalog-react';
import useAsync from 'react-use/lib/useAsync';
import { Grid } from '@material-ui/core';
import Alert from '@material-ui/lab/Alert';
import ErrorIcon from '@material-ui/icons/Error';
import WarningIcon from '@material-ui/icons/Warning';

export const IsMeshedBanner = () => {
  const l5d = useApi(linkerdPluginRef);
  const { entity } = useEntity();
  const { value, loading } = useAsync(() => l5d.getStatsForEntity(entity));

  if (loading || !value) {
    return null;
  }

  if (value.current) {
    if (value.current.pods.meshedPodsPercentage === 0) {
      return (
        <Grid item xs={12}>
          <Alert icon={<ErrorIcon fontSize="inherit" />} severity="error">
            Looks like this component is not currently meshed with Linkerd
          </Alert>
        </Grid>
      );
    }

    if (value.current.pods.meshedPodsPercentage < 1) {
      return (
        <Grid item xs={12}>
          <Alert icon={<WarningIcon fontSize="inherit" />} severity="warning">
            This component is partially meshed with Linkerd (
            {value.current.pods.meshedPods} of {value.current.pods.totalPods}{' '}
            pods are meshed)
          </Alert>
        </Grid>
      );
    }
  }

  return null;
};
