import { useAsync } from 'react-use';

import { Progress } from '@backstage/core-components';
import { useApi } from '@backstage/core-plugin-api';
import { useEntity } from '@backstage/plugin-catalog-react';

import { NexusRepositoryManagerApiRef } from '../../api';
import { useNexusRepositoryManagerAppData } from '../../hooks';
import { ComponentXO } from '../../types';
import { getFileSize, getHash, isPrimaryAsset, formatDate } from '../../utils';
import { ArtifactTable } from '../ArtifactTable';

// Artifact types that we want to display: either classifiers (e.g. javadoc) or extensions (e.g. zip)
export function getAssetVariants(component: ComponentXO) {
  return new Set<string>(
    component.assets?.flatMap(asset => {
      if (!asset.maven2) {
        return [];
      }

      const { classifier, extension } = asset.maven2;
      if (extension === 'jar' && classifier) {
        return `+${classifier}`;
      }
      if (isPrimaryAsset(asset) && extension) {
        return extension;
      }
      return [];
    }),
  );
}

export const NexusRepositoryManager = () => {
  const nexusClient = useApi(NexusRepositoryManagerApiRef);
  const { entity } = useEntity();
  const { ANNOTATIONS } = nexusClient.getAnnotations();

  const { title, query } = useNexusRepositoryManagerAppData({
    entity,
    ANNOTATIONS,
  });

  const { value: components = [], loading } = useAsync(async () => {
    const res = await nexusClient.getComponents(query);

    return res.components;
  });

  if (loading) {
    return (
      <div data-testid="nexus-repository-manager-loading">
        <Progress />
      </div>
    );
  }

  const artifacts = components?.map(v => {
    const { component } = v;

    // theres only one asset per docker.image-name component
    // if we want to support multiple repository types
    // this will probably need to change in the future,
    const firstAsset = component.assets?.find(isPrimaryAsset);

    return {
      id: component.id,
      version: component.version,
      artifact:
        // Include groupID for maven components
        component.format === 'maven2' && component.group
          ? `${component.group}:${component.name}`
          : component.name,
      assetVariants: getAssetVariants(component),
      repositoryType: component.repository,
      hash: getHash(firstAsset),
      lastModified: formatDate(firstAsset?.lastModified),
      // TODO for a maven component that uploads e.g. a protobuf, jar, and zip,
      // this will combine all of their sizes.
      sizeBytes: getFileSize(v),
    };
  });

  return (
    <div
      style={{ border: '1px solid #ddd' }}
      data-testid="nexus-repository-manager-table"
    >
      <ArtifactTable title={title} artifacts={artifacts} />
    </div>
  );
};
