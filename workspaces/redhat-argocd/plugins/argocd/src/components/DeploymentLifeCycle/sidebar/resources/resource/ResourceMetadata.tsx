import React from 'react';
import { Resource } from '../../../../../types/application';
import DeploymentMetadata from './DeploymentMetadata';
import RolloutMetadata from './RolloutMetadata';
import Metadata from '../../../../Common/Metadata';
import MetadataItem from '../../../../Common/MetadataItem';

type ResourceMetadataProps = {
  resource: Resource;
};
const ResourceMetadata: React.FC<ResourceMetadataProps> = ({ resource }) => {
  switch (resource.kind) {
    case 'Deployment':
      return <DeploymentMetadata resource={resource} />;
    case 'Rollout':
      return <RolloutMetadata resource={resource} />;
    default:
      return (
        <Metadata>
          <MetadataItem title="Namespace">{resource?.namespace}</MetadataItem>
        </Metadata>
      );
  }
};
export default ResourceMetadata;
