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

import { useEntity } from '@backstage/plugin-catalog-react';

import {
  Card,
  CardContent,
  CardHeader,
  createStyles,
  Divider,
  makeStyles,
  Theme,
} from '@material-ui/core';

import {
  Application,
  RevisionInfo,
} from '@backstage-community/plugin-redhat-argocd-common';
import { isAppHelmChartType } from '../../utils/utils';
import AppNamespace from '../Common/AppNamespace';
import StatusHeading from '../AppStatus/StatusHeading';
import DeploymentLifecycleHeader from './DeploymentLifecycleHeader';
import MetadataItem from '../Common/MetadataItem';
import Metadata from '../Common/Metadata';
import AppServerLink from '../Common/AppServerLink';
import AppCommitLink from '../Common/AppCommitLink';

const useCardStyles = makeStyles<Theme>(theme =>
  createStyles({
    card: {
      flex: '0 0 auto',
      marginRight: theme.spacing(2.5),
      maxWidth: '300px',
    },
  }),
);

interface DeploymentLifecycleCardProps {
  app: Application;
  revisionsMap: { [key: string]: RevisionInfo };
  onclick?: () => void;
}

const DeploymentLifecycleCard: React.FC<DeploymentLifecycleCardProps> = ({
  app,
  onclick,
  revisionsMap,
}) => {
  const appName = app?.metadata?.instance?.name ?? 'default';
  const appHistory = app?.status?.history ?? [];
  const latestRevision = appHistory[appHistory.length - 1];
  const commitTitle = latestRevision?.revisions?.length
    ? `Commit (1 of ${latestRevision?.revisions?.length})`
    : 'Commit';

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
        <Metadata direction={{ sm: 'column' }} gap={{ sm: 'gapMd' }}>
          <MetadataItem title="Instance">{appName}</MetadataItem>

          <MetadataItem title="Server">
            <AppServerLink application={app} />
          </MetadataItem>

          <MetadataItem title="Namespace">
            <AppNamespace app={app} />
          </MetadataItem>

          {!isAppHelmChartType(app) ? (
            <MetadataItem title={commitTitle}>
              <AppCommitLink
                application={app}
                entity={entity}
                revisionsMap={revisionsMap}
                latestRevision={latestRevision}
              />
            </MetadataItem>
          ) : (
            <></>
          )}

          <MetadataItem title="Resources">
            {app.status.resources?.length ?? 0} resources deployed
          </MetadataItem>
        </Metadata>
      </CardContent>
    </Card>
  );
};
export default DeploymentLifecycleCard;
