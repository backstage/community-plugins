import React, { useState } from 'react';
import {
  Card,
  CardContent,
  CardHeader,
  Divider,
  Typography,
  makeStyles,
} from '@material-ui/core';
import { linkerdPluginRef } from '../plugin';
import { useApi } from '@backstage/core-plugin-api';
import { DeploymentResponse } from '../api/types';
import useInterval from 'react-use/lib/useInterval';
import { useEntity } from '@backstage/plugin-catalog-react';
import { OctopusGraph } from './OctopusGraph/OctopusGraph';

const useStyles = makeStyles({
  gridItemCard: {
    display: 'flex',
    flexDirection: 'column',
    height: 'calc(100% - 10px)', // for pages without content header
    marginBottom: '10px',
  },

  gridItemCardContent: {
    flex: 1,
  },
  header: {
    padding: 16,
  },
});
export const LinkerdDependenciesCard = () => {
  const styles = useStyles();
  const l5d = useApi(linkerdPluginRef);
  const { entity } = useEntity();
  const [stats, setStats] = useState<null | DeploymentResponse>(null);

  useInterval(async () => {
    setStats(await l5d.getStatsForEntity(entity));
  }, 10000);

  const content = () => {
    if (!stats) {
      return <Typography paragraph>Loading...</Typography>;
    }
    if (stats) {
      if (
        !Object.values(stats.incoming).length &&
        !Object.values(stats.outgoing).length
      ) {
        return (
          <Typography paragraph>
            This service doesn't look like it's tagged with the right service,
            or linkerd is not injected.
          </Typography>
        );
      }
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
