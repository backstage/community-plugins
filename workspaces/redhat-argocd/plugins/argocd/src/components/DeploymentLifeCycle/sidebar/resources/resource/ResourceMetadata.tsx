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
import { Resource } from '@backstage-community/plugin-redhat-argocd-common';
import DeploymentMetadata from './DeploymentMetadata';
import RolloutMetadata from './RolloutMetadata';
import Metadata from '../../../../Common/Metadata';
import MetadataItem from '../../../../Common/MetadataItem';
import { useTranslation } from '../../../../../hooks/useTranslation';

type ResourceMetadataProps = {
  resource: Resource;
};
const ResourceMetadata: FC<ResourceMetadataProps> = ({ resource }) => {
  const { t } = useTranslation();
  switch (resource.kind) {
    case 'Deployment':
      return <DeploymentMetadata resource={resource} />;
    case 'Rollout':
      return <RolloutMetadata resource={resource} />;
    default:
      return (
        <Metadata>
          <MetadataItem
            title={t(
              'deploymentLifecycle.sidebar.resources.resource.resourceMetadata.namespace',
            )}
          >
            {resource?.namespace}
          </MetadataItem>
        </Metadata>
      );
  }
};
export default ResourceMetadata;
