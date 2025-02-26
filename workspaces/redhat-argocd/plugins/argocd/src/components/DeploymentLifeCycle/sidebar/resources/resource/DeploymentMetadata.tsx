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
import React from 'react';
import { useDrawerContext } from '../../../DrawerContext';
import { Resource } from '@backstage-community/plugin-redhat-argocd-common';
import { isAppHelmChartType } from '../../../../../utils/utils';
import { useEntity } from '@backstage/plugin-catalog-react';
import Metadata from '../../../../Common/Metadata';
import MetadataItem from '../../../../Common/MetadataItem';
import AppCommitLink from '../../../../Common/AppCommitLink';
import { DeploymentHistory } from './DeploymentHistory';

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
  const { application, latestRevision, revisionsMap, appHistory } =
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
  return (
    <>
      <Metadata>
        <MetadataItem title="Namespace">{resource?.namespace}</MetadataItem>
        {appHistory.length > 0 ? (
          <MetadataItem title="Image(s)">
            <ImageLinks />
          </MetadataItem>
        ) : (
          <></>
        )}
        {!isAppHelmChartType(application) ? (
          <MetadataItem title="Commit">
            <AppCommitLink
              application={application}
              entity={entity}
              latestRevision={latestRevision}
              revisionsMap={revisionsMap}
            />
          </MetadataItem>
        ) : (
          <></>
        )}
      </Metadata>
      {appHistory.length > 0 && (
        <DeploymentHistory
          application={application}
          revisionsMap={revisionsMap}
          appHistory={appHistory}
          styleClasses={classes}
          annotations={entity?.metadata?.annotations}
        />
      )}
    </>
  );
};
export default DeploymentMetadata;
