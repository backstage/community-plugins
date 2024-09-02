import React from 'react';

import {
  Box,
  Chip,
  Grid,
  makeStyles,
  Theme,
  Typography,
} from '@material-ui/core';
import { Flex, FlexItem } from '@patternfly/react-core';

import { Revision, RolloutUI } from '../../../../types/revision';
import BlueGreenRevision from './revisions/BlueGreenRevision';
import CanaryRevision from './revisions/CanaryRevision';
import RolloutStatus from './RolloutStatus';

const useRevisionStyles = makeStyles((theme: Theme) => ({
  revisionContainer: {
    flex: 1,
    width: '100%',
    margin: 0,
    padding: '0',
    minHeight: 0,
    maxHeight: '50vh',
    overflowY: 'auto',
    marginBottom: theme.spacing(1),
  },
}));

interface RolloutProps {
  rollout: RolloutUI;
}

const Rollout: React.FC<RolloutProps> = ({ rollout }) => {
  const classes = useRevisionStyles();
  const [isFirstRender, setIsFirstRender] = React.useState(true);

  React.useEffect(() => {
    let timer: NodeJS.Timeout;

    if (isFirstRender) {
      timer = setTimeout(() => {
        setIsFirstRender(false);
      }, 100);
    }

    return () => clearTimeout(timer);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  if (!rollout) {
    return null;
  }

  const rolloutStrategy = rollout.spec?.strategy?.canary
    ? 'Canary'
    : 'BlueGreen';

  return (
    <Grid item xs={12}>
      <Flex
        gap={{ default: 'gapXs' }}
        alignItems={{ default: 'alignItemsFlexStart' }}
      >
        <FlexItem>
          <Typography variant="body1" color="textPrimary" gutterBottom>
            {`${rollout.metadata?.name}`}
          </Typography>
        </FlexItem>
        <FlexItem>
          <Chip size="small" color="default" label={rolloutStrategy} />
        </FlexItem>
        <FlexItem>
          {rollout.status?.phase && (
            <RolloutStatus status={rollout.status.phase} />
          )}
        </FlexItem>
      </Flex>

      <Box className={classes.revisionContainer}>
        {rollout.revisions.map((revision: Revision) => {
          return rollout.spec?.strategy?.canary ? (
            <CanaryRevision
              key={revision?.metadata?.uid}
              revision={revision}
              animateProgressBar={isFirstRender}
            />
          ) : (
            <BlueGreenRevision
              key={revision?.metadata?.uid}
              revision={revision}
            />
          );
        })}
      </Box>
    </Grid>
  );
};
export default React.memo(Rollout);
