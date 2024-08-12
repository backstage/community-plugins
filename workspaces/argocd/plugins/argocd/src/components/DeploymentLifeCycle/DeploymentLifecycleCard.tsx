import * as React from 'react';

import { useEntity } from '@backstage/plugin-catalog-react';

import {
  Card,
  CardContent,
  CardHeader,
  Chip,
  createStyles,
  Divider,
  Grid,
  Link,
  makeStyles,
  Theme,
  Tooltip,
  Typography,
} from '@material-ui/core';
import { Skeleton } from '@material-ui/lab';
import GitLabIcon from '@patternfly/react-icons/dist/esm/icons/gitlab-icon';
import moment from 'moment';

import { Application, Revision } from '../../types';
import { getCommitUrl, isAppHelmChartType } from '../../utils/utils';
import AppNamespace from '../AppStatus/AppNamespace';
import StatusHeading from '../AppStatus/StatusHeading';
import DeploymentLifecycleHeader from './DeploymentLifecycleHeader';

const useCardStyles = makeStyles<Theme>(theme =>
  createStyles({
    card: {
      flex: '0 0 auto',
      marginRight: theme.spacing(2.5),
      maxWidth: '300px',
    },
    commitMessage: {
      textOverflow: 'ellipsis',
      whiteSpace: 'nowrap',
      overflow: 'hidden',
    },
  }),
);

interface DeploymentLifecycleCardProps {
  app: Application;
  revisionsMap: { [key: string]: Revision };
  onclick?: () => void;
}

const DeploymentLifecycleCard: React.FC<DeploymentLifecycleCardProps> = ({
  app,
  onclick,
  revisionsMap,
}) => {
  const appHistory = app?.status?.history ?? [];
  const latestRevision = appHistory[appHistory.length - 1];
  const appDeployedAt = latestRevision?.deployedAt;

  const classes = useCardStyles();
  const { entity } = useEntity();

  if (!app) {
    return null;
  }

  return (
    <Card
      data-testid={`${app?.metadata?.name}-card`}
      key={app?.metadata?.uid}
      className={classes.card}
      style={{ justifyContent: 'space-between' }}
      onClick={onclick}
    >
      <CardHeader
        title={<DeploymentLifecycleHeader app={app} />}
        titleTypographyProps={{
          variant: 'subtitle2',
        }}
        subheader={<StatusHeading app={app} />}
      />
      <Divider />

      <CardContent>
        <Grid container spacing={1} alignItems="flex-start">
          <Grid item xs={12}>
            <Typography variant="body1">Instance</Typography>

            <Typography variant="body2" color="textSecondary" gutterBottom>
              {app?.metadata?.instance?.name}
            </Typography>
          </Grid>

          <Grid item xs={12}>
            <Typography variant="body1">Server</Typography>

            <Typography
              style={{ overflowWrap: 'anywhere' }}
              variant="body2"
              color="textSecondary"
              gutterBottom
            >
              {app?.spec?.destination?.server}{' '}
              {app?.spec?.destination?.server ===
              'https://kubernetes.default.svc' ? (
                <Tooltip
                  data-testid="local-cluster-tooltip"
                  title="This is the local cluster where Argo CD is installed."
                >
                  <span>(in-cluster) </span>
                </Tooltip>
              ) : (
                ''
              )}
            </Typography>
          </Grid>
          <Grid item xs={12}>
            <Typography variant="body1" color="textPrimary">
              Namespace
            </Typography>

            <AppNamespace app={app} />
          </Grid>
          {!isAppHelmChartType(app) && (
            <Grid item xs={12}>
              <Typography color="textPrimary">Commit</Typography>
              {revisionsMap && latestRevision ? (
                <>
                  <Chip
                    data-testid={`${latestRevision?.revision?.slice(
                      0,
                      5,
                    )}-commit-link`}
                    size="small"
                    variant="outlined"
                    onClick={e => {
                      e.stopPropagation();
                      const repoUrl = app?.spec?.source?.repoURL ?? '';
                      if (repoUrl.length) {
                        window.open(
                          getCommitUrl(
                            repoUrl,
                            latestRevision?.revision,
                            entity?.metadata?.annotations ?? {},
                          ),
                          '_blank',
                        );
                      }
                    }}
                    icon={<GitLabIcon />}
                    color="primary"
                    label={latestRevision?.revision.slice(0, 7)}
                  />
                  <Typography
                    variant="body2"
                    color="textSecondary"
                    className={classes.commitMessage}
                  >
                    {revisionsMap?.[latestRevision?.revision] ? (
                      <Tooltip
                        data-testid={`${latestRevision?.revision?.slice(
                          0,
                          5,
                        )}-commit-message`}
                        title={
                          revisionsMap?.[latestRevision?.revision]?.message
                        }
                      >
                        <span>
                          {revisionsMap?.[latestRevision?.revision]?.message}
                        </span>
                      </Tooltip>
                    ) : (
                      <Skeleton />
                    )}
                  </Typography>
                </>
              ) : (
                <>-</>
              )}
            </Grid>
          )}

          <Grid item xs={12}>
            <Typography variant="body1" color="textPrimary">
              Deployment
            </Typography>
            {appHistory.length >= 1 ? (
              <Typography variant="body2" color="textSecondary">
                Image{' '}
                <Link
                  href={`https://${app?.status?.summary?.images?.[0]}`}
                  target="_blank"
                  rel="noopener"
                >
                  {app?.status?.summary?.images?.[0].split('/').pop()}
                </Link>{' '}
                deployed {moment(appDeployedAt).local().fromNow()}
              </Typography>
            ) : (
              <>-</>
            )}
          </Grid>
        </Grid>
      </CardContent>
    </Card>
  );
};
export default DeploymentLifecycleCard;
