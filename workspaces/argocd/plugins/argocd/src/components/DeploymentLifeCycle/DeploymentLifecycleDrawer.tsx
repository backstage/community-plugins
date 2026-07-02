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
import Rollouts from './sidebar/rollouts/Rollouts';
import { useEntity } from '@backstage/plugin-catalog-react';

import Card from '@mui/material/Card';
import CardContent from '@mui/material/CardContent';
import Drawer from '@mui/material/Drawer';
import Grid from '@mui/material/Grid';
import IconButton from '@mui/material/IconButton';
import Typography from '@mui/material/Typography';
import Close from '@mui/icons-material/Close';

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
import { useTranslation } from '../../hooks/useTranslation';

interface DeploymentLifecycleDrawerProps {
  isOpen: boolean;
  onClose: () => void;
  showInstance?: boolean;
  showServer?: boolean;
}

const DeploymentLifecycleDrawer: FC<DeploymentLifecycleDrawerProps> = ({
  isOpen,
  onClose,
  showInstance = true,
  showServer = true,
}) => {
  const {
    application: app,
    revisions,
    appHistory,
    latestRevision,
  } = useDrawerContext();

  const { entity } = useEntity();

  const firstRevision = appHistory?.[0];
  const createdAt = firstRevision?.deployedAt;
  const { t } = useTranslation();

  if (!app) {
    return null;
  }
  return (
    <Drawer
      data-testid={`${app?.metadata?.name}-drawer`}
      anchor="right"
      open={isOpen}
      onClose={onClose}
      PaperProps={{
        'data-testid': `${app?.metadata?.name}-sidebar`,
        sx: {
          width: '75%',
          p: 2.5,
          gap: '3%',
        },
      }}
    >
      <CardContent>
        <Grid container alignItems="stretch">
          <Grid item xs={12}>
            <div
              style={{
                display: 'flex',
                flexDirection: 'row',
                justifyContent: 'space-between',
                alignItems: 'baseline',
              }}
            >
              <Typography variant="h4">
                <DeploymentLifecycledHeader app={app} />
              </Typography>

              <IconButton
                key="dismiss"
                title={t(
                  'deploymentLifecycle.deploymentLifecycleDrawer.iconButtonTitle',
                )}
                onClick={onClose}
                color="inherit"
              >
                <Close sx={{ fontSize: 20 }} />
              </IconButton>
            </div>
            <div style={{ display: 'flex' }}>
              <StatusHeading app={app} />
            </div>
          </Grid>

          <Grid item xs={12}>
            <Metadata>
              {showInstance && (
                <MetadataItem
                  key="instance"
                  title={t(
                    'deploymentLifecycle.deploymentLifecycleDrawer.instance',
                  )}
                >
                  {app?.metadata?.instance?.name ??
                    t(
                      'deploymentLifecycle.deploymentLifecycleDrawer.instanceDefaultValue',
                    )}
                </MetadataItem>
              )}
              {showServer && (
                <MetadataItem
                  key="cluster"
                  title={t(
                    'deploymentLifecycle.deploymentLifecycleDrawer.cluster',
                  )}
                >
                  <AppServerLink application={app} />
                </MetadataItem>
              )}
              <MetadataItem
                key="namespace"
                title={t(
                  'deploymentLifecycle.deploymentLifecycleDrawer.namespace',
                )}
              >
                <AppNamespace app={app} />
              </MetadataItem>
              {!isAppHelmChartType(app) && (
                <MetadataItem
                  key="commit"
                  title={t(
                    'deploymentLifecycle.deploymentLifecycleDrawer.commit',
                  )}
                >
                  <AppCommitLink
                    application={app}
                    entity={entity}
                    revisions={revisions}
                    latestRevision={latestRevision}
                    showAuthor
                  />
                </MetadataItem>
              )}
              <MetadataItem
                key="revision"
                title={t(
                  'deploymentLifecycle.deploymentLifecycleDrawer.revision',
                )}
              >
                {app?.spec?.source?.targetRevision}
              </MetadataItem>
            </Metadata>
          </Grid>
          <Grid item xs={12}>
            <Typography color="textPrimary">
              {t('deploymentLifecycle.deploymentLifecycleDrawer.resources')}
            </Typography>
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
          <Grid item xs={12}>
            <Rollouts />
          </Grid>
        </Grid>
      </CardContent>
    </Drawer>
  );
};
export default DeploymentLifecycleDrawer;
