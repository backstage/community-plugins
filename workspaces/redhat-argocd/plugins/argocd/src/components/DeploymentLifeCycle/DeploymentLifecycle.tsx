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
import * as React from 'react';

import { Progress, ResponseErrorPanel } from '@backstage/core-components';
import { useApi } from '@backstage/core-plugin-api';
import { useEntity } from '@backstage/plugin-catalog-react';

import { createStyles, makeStyles, Theme, Typography } from '@material-ui/core';

import { argoCDApiRef } from '../../api';
import { useApplications } from '../../hooks/useApplications';
import { useArgocdConfig } from '../../hooks/useArgocdConfig';
import { useArgocdViewPermission } from '../../hooks/useArgocdViewPermission';
import {
  Application,
  RevisionInfo,
} from '@backstage-community/plugin-redhat-argocd-common';
import {
  getArgoCdAppConfig,
  getInstanceName,
  getUniqueRevisions,
} from '../../utils/utils';
import PermissionAlert from '../Common/PermissionAlert';
import DeploymentLifecycleCard from './DeploymentLifecycleCard';
import DeploymentLifecycleDrawer from './DeploymentLifecycleDrawer';
import { ArgoResourcesProvider } from './sidebar/rollouts/RolloutContext';
import { DrawerProvider } from './DrawerContext';

const useDrawerStyles = makeStyles<Theme>(theme =>
  createStyles({
    lifecycle: {
      display: 'flex',
      flexWrap: 'nowrap',
      overflowX: 'auto',
      background:
        theme.palette.type === 'dark'
          ? theme.palette.grey[700]
          : theme.palette.grey[200],
      color: 'black',
      margin: '1px solid red',
      padding: '20px',
      borderRadius: '10px',
    },
  }),
);

const DeploymentLifecycle = () => {
  const { entity } = useEntity();
  const classes = useDrawerStyles();

  const api = useApi(argoCDApiRef);

  const { instances, intervalMs } = useArgocdConfig();
  const instanceName = getInstanceName(entity) || instances?.[0]?.name;
  const { appSelector, appName, projectName, appNamespace } =
    getArgoCdAppConfig({ entity });

  const { apps, loading, error } = useApplications({
    instanceName,
    intervalMs,
    appSelector,
    appName,
    appNamespace,
    projectName,
  });

  const hasArgocdViewAccess = useArgocdViewPermission();

  const [open, setOpen] = React.useState(false);
  const [activeItem, setActiveItem] = React.useState<string>();
  const [, setRevisions] = React.useState<{
    [key: string]: RevisionInfo;
  }>();
  const revisionCache = React.useRef<{ [key: string]: RevisionInfo }>({});

  const uniqRevisions: string[] = React.useMemo(
    () => getUniqueRevisions(apps),
    [apps],
  );

  React.useEffect(() => {
    if (uniqRevisions.length !== Object.keys(revisionCache.current).length) {
      api
        .getRevisionDetailsList({
          apps: apps,
          instanceName,
          revisionIDs: uniqRevisions,
        })
        .then(data => {
          uniqRevisions.forEach(rev => {
            // The backend will return the revisionID with the metadata from ArgoCD.
            // We can use the revisionID here to correctly assign data to the correct revision
            // instead of traversing the data by index and assigning revisions to data that way.
            revisionCache.current[rev] =
              data.find(r => r.revisionID === rev) ?? ({} as RevisionInfo);
          });
          setRevisions(revisionCache.current);
        })
        .catch(e => {
          // eslint-disable-next-line no-console
          console.warn(e);
        });
    }
  }, [api, apps, entity, instanceName, uniqRevisions]);

  const toggleDrawer = () => setOpen(e => !e);

  const activeApp = apps.find(a => a.metadata.name === activeItem);

  if (!hasArgocdViewAccess) {
    return <PermissionAlert />;
  }

  if (error) {
    return <ResponseErrorPanel data-testid="error-panel" error={error} />;
  }

  if (loading) {
    return (
      <div data-testid="argocd-loader">
        <Progress />
      </div>
    );
  } else if (apps?.length === 0) {
    return null;
  }

  return (
    <>
      <Typography variant="h2" gutterBottom>
        Deployment lifecycle
      </Typography>

      <Typography variant="subtitle1" gutterBottom>
        Review deployed components/systems in the namespace using ArgoCD plugin
      </Typography>

      <div className={classes.lifecycle}>
        {apps.map((app: Application, idx: number) => (
          <DeploymentLifecycleCard
            app={app}
            key={app.metadata.uid ?? idx}
            revisionsMap={revisionCache.current}
            onclick={() => {
              toggleDrawer();
              setActiveItem(app.metadata.name);
            }}
          />
        ))}
      </div>
      <DrawerProvider
        application={activeApp as Application}
        revisionsMap={revisionCache.current}
      >
        <ArgoResourcesProvider application={activeApp}>
          <DeploymentLifecycleDrawer
            isOpen={open}
            onClose={() => setOpen(false)}
          />
        </ArgoResourcesProvider>
      </DrawerProvider>
    </>
  );
};

export default DeploymentLifecycle;
