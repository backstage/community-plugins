import { useEntity } from '@backstage/plugin-catalog-react';

import { AZURE_CONTAINER_REGISTRY_ANNOTATION_IMAGE_NAME } from '../consts';

export const useAcrAppData = () => {
  const { entity } = useEntity();
  const imageName =
    entity?.metadata?.annotations?.[
      AZURE_CONTAINER_REGISTRY_ANNOTATION_IMAGE_NAME
    ] ?? '';

  if (!imageName) {
    throw new Error("'Azure container registry' annotations are missing");
  }
  return { imageName };
};
