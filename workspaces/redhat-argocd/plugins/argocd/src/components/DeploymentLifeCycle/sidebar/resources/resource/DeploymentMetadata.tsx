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
import { Link, makeStyles, Theme } from '@material-ui/core';
import { useDrawerContext } from '../../../DrawerContext';
import { Resource } from '@backstage-community/plugin-redhat-argocd-common';
import { isAppHelmChartType } from '../../../../../utils/utils';
import { useEntity } from '@backstage/plugin-catalog-react';
import { configApiRef, useApi } from '@backstage/core-plugin-api';
import Metadata from '../../../../Common/Metadata';
import MetadataItem from '../../../../Common/MetadataItem';
import MetadataItemWithTooltip from '../../../../Common/MetadataItemWithTooltip';
import AppCommitLink from '../../../../Common/AppCommitLink';
import { DeploymentHistory } from './DeploymentHistory';
import { useTranslation } from '../../../../../hooks/useTranslation';

const useDeploymentInfoStyles = makeStyles((theme: Theme) => ({
  latestDeploymentContainer: {
    marginBottom: theme.spacing(1),
    height: '100%',
    display: 'flex',
    flexDirection: 'row',
  },
  deploymentHistory: {
    flex: 1,
    width: '400px',
    margin: 0,
    padding: '0',
    minHeight: 0,
    maxHeight: '200px',
    overflowY: 'auto',
    display: 'flex',
    flexWrap: 'wrap',
    flexDirection: 'row',
    marginTop: theme.spacing(1),
    marginBottom: theme.spacing(1),
  },
  commitMessage: {
    wordBreak: 'break-word',
  },
}));

const DeploymentMetadata = ({ resource }: { resource: Resource }) => {
  const { entity } = useEntity();
  const configApi = useApi(configApiRef);
  const showFullDeploymentHistory = configApi.getOptionalBoolean(
    'argocd.fullDeploymentHistory',
  );

  const { application, latestRevision, revisions, appHistory } =
    useDrawerContext();
  const classes = useDeploymentInfoStyles();
  const ImageLinks = () => {
    const images = application?.status?.summary?.images;
    return images.map(image => {
      return (
        <div>
          <Link href={`https://${image}`} target="_blank" rel="noopener">
            {image.split('/').pop()}
          </Link>
        </div>
      );
    });
  };

  const { t } = useTranslation();
  return (
    <>
      <Metadata>
        <MetadataItem
          title={t(
            'deploymentLifecycle.sidebar.resources.resource.deploymentMetadata.namespace',
          )}
        >
          {resource?.namespace}
        </MetadataItem>
        {appHistory.length > 0 ? (
          <MetadataItemWithTooltip
            title={t(
              'deploymentLifecycle.sidebar.resources.resource.deploymentMetadata.metadataItemWithTooltip.title',
            )}
            tooltipText={t(
              'deploymentLifecycle.sidebar.resources.resource.deploymentMetadata.metadataItemWithTooltip.tooltipText',
            )}
          >
            <ImageLinks />
          </MetadataItemWithTooltip>
        ) : (
          <></>
        )}
        {!isAppHelmChartType(application) ? (
          <MetadataItem
            title={t(
              'deploymentLifecycle.sidebar.resources.resource.deploymentMetadata.commit',
            )}
          >
            <AppCommitLink
              application={application}
              entity={entity}
              latestRevision={latestRevision}
              revisions={revisions}
            />
          </MetadataItem>
        ) : (
          <></>
        )}
      </Metadata>
      {appHistory.length > 0 && (
        <DeploymentHistory
          application={application}
          revisions={revisions}
          appHistory={appHistory}
          styleClasses={classes}
          annotations={entity?.metadata?.annotations}
          showFullDeploymentHistory={showFullDeploymentHistory}
        />
      )}
    </>
  );
};
export default DeploymentMetadata;
