import * as React from 'react';

import { Progress, ResponseErrorPanel } from '@backstage/core-components';
import { useApi } from '@backstage/core-plugin-api';
import { useEntity } from '@backstage/plugin-catalog-react';

import { createStyles, makeStyles, Theme, Typography } from '@material-ui/core';

import { argoCDApiRef } from '../../api';
import { useApplications } from '../../hooks/useApplications';
import { useArgocdConfig } from '../../hooks/useArgocdConfig';
import { useArgocdViewPermission } from '../../hooks/useArgocdViewPermission';
import { Application, RevisionInfo } from '../../types/application';
import {
  getArgoCdAppConfig,
  getInstanceName,
  getUniqueRevisions,
} from '../../utils/utils';
import PermissionAlert from '../Common/PermissionAlert';
import DeploymentLifecycleCard from './DeploymentLifecycleCard';
import DeploymentLifecycleDrawer from './DeploymentLifecycleDrawer';
import { ArgoResourcesProvider } from './sidebar/rollouts/RolloutContext';

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
          uniqRevisions.forEach((rev, i) => {
            revisionCache.current[rev] = data[i];
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
      <ArgoResourcesProvider application={activeApp}>
        <DeploymentLifecycleDrawer
          app={activeApp}
          isOpen={open}
          onClose={() => setOpen(false)}
          revisionsMap={revisionCache.current}
        />
      </ArgoResourcesProvider>
    </>
  );
};

export default DeploymentLifecycle;
