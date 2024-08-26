import * as React from 'react';

import { useEntity } from '@backstage/plugin-catalog-react';

import {
  Box,
  Card,
  CardContent,
  Chip,
  createStyles,
  Drawer,
  Grid,
  IconButton,
  Link,
  makeStyles,
  Theme,
  Tooltip,
  Typography,
} from '@material-ui/core';
import Close from '@material-ui/icons/Close';
import { Skeleton } from '@material-ui/lab';
import GitLabIcon from '@patternfly/react-icons/dist/esm/icons/gitlab-icon';
import moment from 'moment';

import { Application, Revision } from '../../types';
import { getCommitUrl, isAppHelmChartType } from '../../utils/utils';
import AppNamespace from '../AppStatus/AppNamespace';
import StatusHeading from '../AppStatus/StatusHeading';
import DeploymentLifecycledHeader from './DeploymentLifecycleHeader';
import { ResourcesTable } from '../Resources/ResourcesTable';

interface DeploymentLifecycleDrawerProps {
  app: Application | undefined;
  isOpen: boolean;
  onClose: () => void;
  revisionsMap: { [key: string]: Revision };
}

const useDrawerStyles = makeStyles<Theme>(theme =>
  createStyles({
    icon: {
      fontSize: 20,
    },
    paper: {
      width: '75%',
      padding: theme.spacing(2.5),
      gap: '3%',
    },
    header: {
      display: 'flex',
      flexDirection: 'row',
      justifyContent: 'space-between',
      alignItems: 'baseline',
    },
    commitMessage: {
      wordBreak: 'break-word',
    },
  }),
);
const DeploymentLifecycleDrawer: React.FC<DeploymentLifecycleDrawerProps> = ({
  app,
  isOpen,
  onClose,
  revisionsMap,
}) => {
  const appHistory = app?.status?.history ?? [];
  const latestRevision = appHistory[appHistory.length - 1];
  const appDeployedAt = latestRevision?.deployedAt;
  const firstRevision = appHistory[0];
  const createdAt = firstRevision?.deployedAt;

  const { entity } = useEntity();
  const classes = useDrawerStyles();

  if (!app) {
    return null;
  }
  return (
    <Drawer
      data-testid={`${app?.metadata?.name}-drawer`}
      anchor="right"
      open={isOpen}
      onClose={onClose}
      classes={{
        paper: classes.paper,
      }}
    >
      <CardContent>
        <Grid container alignItems="stretch">
          <Grid item xs={12}>
            <div className={classes.header}>
              <Typography variant="h4">
                <DeploymentLifecycledHeader app={app} />
              </Typography>

              <IconButton
                key="dismiss"
                title="Close the drawer"
                onClick={onClose}
                color="inherit"
              >
                <Close className={classes.icon} />
              </IconButton>
            </div>
            <div style={{ display: 'flex' }}>
              <StatusHeading app={app} />
            </div>
          </Grid>

          <Grid item xs={12}>
            <Typography color="textPrimary">Instance</Typography>

            <Typography color="textSecondary" gutterBottom>
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
                <Tooltip title="This is the local cluster where Argo CD is installed.">
                  <span>(in-cluster) </span>
                </Tooltip>
              ) : (
                ''
              )}
            </Typography>
          </Grid>
          <Grid item xs={12}>
            <Typography color="textPrimary">Namespace</Typography>

            <AppNamespace app={app} />
          </Grid>
          {!isAppHelmChartType(app) && (
            <Grid item xs={12}>
              <Typography color="textPrimary">Commit</Typography>
              {latestRevision ? (
                <>
                  <Chip
                    data-testid={`${latestRevision?.revision?.slice(
                      0,
                      5,
                    )}-commit-link`}
                    size="small"
                    variant="outlined"
                    icon={<GitLabIcon />}
                    color="primary"
                    onClick={e => {
                      e.stopPropagation();

                      const repoUrl = app?.spec?.source?.repoURL ?? '';
                      if (repoUrl) {
                        window.open(
                          isAppHelmChartType(app)
                            ? repoUrl
                            : getCommitUrl(
                                repoUrl,
                                latestRevision?.revision,
                                entity?.metadata?.annotations ?? {},
                              ),
                          '_blank',
                        );
                      }
                    }}
                    label={latestRevision?.revision.slice(0, 7)}
                  />
                  <Typography
                    color="textSecondary"
                    className={classes.commitMessage}
                  >
                    {revisionsMap?.[latestRevision?.revision] ? (
                      <>
                        {revisionsMap?.[latestRevision?.revision]?.message} by{' '}
                        {revisionsMap?.[latestRevision?.revision]?.author}
                      </>
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
          {appHistory.length >= 1 && (
            <Grid item xs={12}>
              <Typography color="textPrimary">Latest deployment</Typography>

              <Card elevation={2} style={{ margin: '10px' }}>
                <CardContent>
                  <Typography color="textPrimary" gutterBottom>
                    Deployment
                  </Typography>

                  <Typography
                    variant="body2"
                    color="textSecondary"
                    className={classes.commitMessage}
                  >
                    Image{' '}
                    <Link
                      href={`https://${app?.status?.summary?.images?.[0]}`}
                      target="_blank"
                      rel="noopener"
                    >
                      {app?.status?.summary?.images?.[0].split('/').pop()}
                    </Link>
                    <br />
                    {revisionsMap[latestRevision?.revision]?.message}{' '}
                    <Link
                      href={
                        isAppHelmChartType(app)
                          ? app?.spec?.source?.repoURL
                          : getCommitUrl(
                              app?.spec?.source?.repoURL ?? '',
                              latestRevision?.revision,
                              entity?.metadata?.annotations ?? {},
                            )
                      }
                      target="_blank"
                      rel="noopener"
                    >
                      {latestRevision?.revision.slice(0, 7)}
                    </Link>{' '}
                    deployed {moment(appDeployedAt).local().fromNow()}
                  </Typography>
                </CardContent>
              </Card>
            </Grid>
          )}
          {appHistory.length > 1 && (
            <Grid item xs={12}>
              <Typography color="textPrimary">Deployment history</Typography>
              <Box
                style={{
                  width: '100%',
                  margin: 0,
                  padding: '0',
                  height: '35vh',
                  overflowY: 'auto',
                }}
              >
                <br />
                {app?.status?.history
                  ?.slice()
                  ?.reverse()
                  .slice(1)
                  ?.map(dep => {
                    const commitUrl = app?.spec?.source?.repoURL
                      ? getCommitUrl(
                          app.spec.source.repoURL,
                          dep?.revision,
                          entity?.metadata?.annotations ?? {},
                        )
                      : null;
                    return (
                      <Card
                        elevation={2}
                        key={dep.id}
                        style={{ margin: '10px' }}
                      >
                        <CardContent>
                          <Typography color="textPrimary" gutterBottom>
                            Deployment
                          </Typography>

                          <Typography
                            variant="body2"
                            color="textSecondary"
                            className={classes.commitMessage}
                          >
                            {revisionsMap[dep.revision]?.message}{' '}
                            <Link
                              aria-disabled={!!commitUrl}
                              href={commitUrl ?? ''}
                              target="_blank"
                              rel="noopener"
                            >
                              {dep.revision.slice(0, 7)}
                            </Link>{' '}
                            deployed {moment(dep.deployedAt).local().fromNow()}
                          </Typography>
                        </CardContent>
                      </Card>
                    );
                  })}
              </Box>
            </Grid>
          )}
          <Grid item xs={12}>
            <Typography variant="h6" color="textPrimary">
              Resources
            </Typography>
            <Card
              elevation={2}
              key="resoucres-container"
              style={{ padding: '25px' }}
            >
              <ResourcesTable
                resources={app?.status?.resources || []}
                createdAt={createdAt}
              />
            </Card>
          </Grid>
        </Grid>
      </CardContent>
    </Drawer>
  );
};
export default DeploymentLifecycleDrawer;
