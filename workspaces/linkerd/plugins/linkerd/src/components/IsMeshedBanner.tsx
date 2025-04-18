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
import { useEntity } from '@backstage/plugin-catalog-react';
import { Grid } from '@material-ui/core';
import Alert from '@material-ui/lab/Alert';
import ErrorIcon from '@material-ui/icons/Error';
import WarningIcon from '@material-ui/icons/Warning';
import { useStatsForEntity } from '../hooks/useStatsForEntity';

export const IsMeshedBanner = () => {
  const { entity } = useEntity();
  const { stats, loading, error } = useStatsForEntity(entity);

  if (loading && !stats && !error) {
    return null;
  }

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
