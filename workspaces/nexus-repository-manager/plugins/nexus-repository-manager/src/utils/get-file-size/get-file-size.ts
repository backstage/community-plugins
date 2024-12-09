import { ComponentXO, DockerManifest } from '../../types';

export function getFileSize({
  component,
  dockerManifests,
}: {
  component: ComponentXO;
  dockerManifests: (DockerManifest | null)[];
}) {
  const componentsSize =
    component.assets?.reduce((acc, asset) => {
      return acc + (asset.fileSize ?? 0);
    }, 0) ?? 0;

  const dockerManifestsSize = dockerManifests.reduce((acc, dockerManifest) => {
    if (!dockerManifest) {
      return acc;
    }

    if (dockerManifest.schemaVersion === 1) {
      return acc;
    }

    const layerSize = dockerManifest.layers.reduce((layerAcc, layer) => {
      return layerAcc + layer.size;
    }, 0);

    return acc + dockerManifest.config.size + layerSize;
  }, 0);

  return componentsSize + dockerManifestsSize;
}
