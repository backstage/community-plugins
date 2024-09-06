import React from 'react';

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

const Rollouts: React.FC = () => {
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
