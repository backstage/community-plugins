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

import { useEntity } from '@backstage/plugin-catalog-react';

import {
  Card,
  CardContent,
  createStyles,
  Drawer,
  Grid,
  IconButton,
  makeStyles,
  Theme,
  Typography,
} from '@material-ui/core';
import Close from '@material-ui/icons/Close';

import { isAppHelmChartType } from '../../utils/utils';
import AppNamespace from '../Common/AppNamespace';
import StatusHeading from '../AppStatus/StatusHeading';
import DeploymentLifecycledHeader from './DeploymentLifecycleHeader';
import { ResourcesTable } from './sidebar/resources/ResourcesTable';
import { useDrawerContext } from './DrawerContext';
import Metadata from '../Common/Metadata';
import MetadataItem from '../Common/MetadataItem';
import AppServerLink from '../Common/AppServerLink';
import AppCommitLink from '../Common/AppCommitLink';

interface DeploymentLifecycleDrawerProps {
  isOpen: boolean;
  onClose: () => void;
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
const DeploymentLifecycleDrawer: FC<DeploymentLifecycleDrawerProps> = ({
  isOpen,
  onClose,
}) => {
  const {
    application: app,
    revisionsMap,
    appHistory,
    latestRevision,
  } = useDrawerContext();

  const { entity } = useEntity();
  const classes = useDrawerStyles();

  const firstRevision = appHistory?.[0];
  const createdAt = firstRevision?.deployedAt;

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
            <Metadata>
              <MetadataItem title="Instance">
                {app?.metadata?.instance?.name ?? 'default'}
              </MetadataItem>

              <MetadataItem title="Cluster">
                <AppServerLink application={app} />
              </MetadataItem>

              <MetadataItem title="Namespace">
                <AppNamespace app={app} />
              </MetadataItem>

              {!isAppHelmChartType(app) ? (
                <MetadataItem title="Commit">
                  <AppCommitLink
                    application={app}
                    entity={entity}
                    revisionsMap={revisionsMap}
                    latestRevision={latestRevision}
                    showAuthor
                  />
                </MetadataItem>
              ) : (
                <></>
              )}

              <MetadataItem title="Revision">
                {app?.spec?.source?.targetRevision}
              </MetadataItem>
            </Metadata>
          </Grid>
          <Grid item xs={12}>
            <Typography color="textPrimary">Resources</Typography>
            <Card
              elevation={2}
              key="resoucres-container"
              style={{ padding: '25px', marginTop: '10px' }}
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
