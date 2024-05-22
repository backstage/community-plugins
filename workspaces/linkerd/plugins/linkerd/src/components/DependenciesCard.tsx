import React from 'react';

import { useEntity } from '@backstage/plugin-catalog-react';
import { OctopusGraph } from './OctopusGraph/OctopusGraph';

import {
  Card,
  CardContent,
  CardHeader,
  CircularProgress,
  Divider,
  makeStyles,
  Typography,
} from '@material-ui/core';
import { useStatsForEntity } from '../hooks/useStatsForEntity';

const useStyles = makeStyles({
  gridItemCard: {
    display: 'flex',
    flexDirection: 'column',
    height: 'calc(100% - 10px)', // for pages without content header
    marginBottom: '10px',
  },

  gridItemCardContent: {
    flex: 1,
    minHeight: 400,
    alignItems: 'center',
    justifyContent: 'center',
    display: 'flex',
  },
  header: {
    padding: 16,
  },
});

export const DependenciesCard = () => {
  const styles = useStyles();
  const { entity } = useEntity();
  const { stats, loading } = useStatsForEntity(entity);

  const content = () => {
    if (!stats && loading) {
      return <CircularProgress />;
    }

    if (!stats || !stats.current || !stats.current.pods.meshedPodsPercentage) {
      return (
        <Typography paragraph>
          This service doesn't look like it's tagged with the right service, or
          linkerd is not injected.
        </Typography>
      );
    }

    if (!stats?.incoming.length && !stats?.outgoing.length) {
      return (
        <Typography paragraph>
          This service doesn't look like it's tagged with the right service, or
          linkerd is not injected.
        </Typography>
      );
    }

    return <OctopusGraph stats={stats} entity={entity} />;
  };

  return (
    <Card className={styles.gridItemCard}>
      <CardHeader
        title="Linkerd Runtime Dependencies"
        className={styles.header}
      />
      <Divider />
      <CardContent className={styles.gridItemCardContent}>
        {content()}
      </CardContent>
    </Card>
  );
};
