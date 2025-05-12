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
import {
  MissingAnnotationEmptyState,
  useEntity,
} from '@backstage/plugin-catalog-react';

import {
  AZURE_CONTAINER_REGISTRY_ANNOTATION_IMAGE_NAME,
  AZURE_CONTAINER_REGISTRY_ANNOTATION_REGISTRY_NAME,
} from '../../annotations';
import { AcrImages } from '../AcrImages';

export const AcrImagesEntityContent = () => {
  const { entity } = useEntity();
  const imageName =
    entity.metadata.annotations?.[
      AZURE_CONTAINER_REGISTRY_ANNOTATION_IMAGE_NAME
    ];

  const registryName =
    entity.metadata.annotations?.[
      AZURE_CONTAINER_REGISTRY_ANNOTATION_REGISTRY_NAME
    ];

  if (!imageName) {
    return (
      <MissingAnnotationEmptyState
        annotation={AZURE_CONTAINER_REGISTRY_ANNOTATION_IMAGE_NAME}
      />
    );
  }

  return <AcrImages image={imageName} registryName={registryName} />;
};
