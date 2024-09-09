import React from 'react';

import { Box, makeStyles, Theme } from '@material-ui/core';

import { Revision, RolloutUI } from '../../../../types/revision';
import BlueGreenRevision from './revisions/BlueGreenRevision';
import CanaryRevision from './revisions/CanaryRevision';
import MetadataItem from '../../../Common/MetadataItem';
import Metadata from '../../../Common/Metadata';

const useRevisionStyles = makeStyles((theme: Theme) => ({
  revisionContainer: {
    flex: 1,
    gap: 10,
    width: '100%',
    marginTop: 10,
    padding: '0',
    minHeight: 0,
    maxHeight: theme.spacing(40),
    display: 'flex',
    flexWrap: 'wrap',
    flexDirection: 'column',
    overflowX: 'auto',
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

  return (
    <Metadata>
      <MetadataItem title="Revisions">
        <Box className={classes.revisionContainer}>
          {[...rollout.revisions].map((revision: Revision) => {
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
      </MetadataItem>
    </Metadata>
  );
};
export default React.memo(Rollout);
