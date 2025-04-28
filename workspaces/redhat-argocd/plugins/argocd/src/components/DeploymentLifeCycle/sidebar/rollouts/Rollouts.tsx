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

import { Grid, makeStyles, Theme, Typography } from '@material-ui/core';

import Rollout from './Rollout';
import { useArgoResources } from './RolloutContext';

const useRolloutStyles = makeStyles((theme: Theme) => ({
  rolloutContainer: {
    marginBottom: theme.spacing(1),
    height: '100%',
    display: 'flex',
    flexDirection: 'row',
  },
}));

const Rollouts: FC = () => {
  const { rollouts } = useArgoResources();
  const rolloutClasses = useRolloutStyles();

  if (rollouts.length === 0) {
    return null;
  }

  return (
    <Grid
      container
      className={rolloutClasses.rolloutContainer}
      data-testid="rollouts-list"
    >
      <Grid item xs={12}>
        <Typography color="textPrimary">Rollout</Typography>
      </Grid>

      {rollouts?.map(rollout => (
        <Rollout key={rollout?.metadata?.uid} rollout={rollout} />
      ))}
    </Grid>
  );
};
export default Rollouts;
