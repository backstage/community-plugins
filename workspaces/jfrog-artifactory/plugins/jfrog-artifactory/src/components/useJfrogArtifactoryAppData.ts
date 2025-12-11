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
import { Entity } from '@backstage/catalog-model';

export const JFROG_ARTIFACTORY_ANNOTATION_IMAGE_NAME =
  'jfrog-artifactory/image-name';

export const JFROG_ARTIFACTORY_ANNOTATION_TARGET_PROXY =
  'jfrog-artifactory/target-proxy';

export const useJfrogArtifactoryAppData = ({ entity }: { entity: Entity }) => {
  const imageName =
    entity?.metadata.annotations?.[JFROG_ARTIFACTORY_ANNOTATION_IMAGE_NAME] ??
    '';

  const targetProxy =
    entity?.metadata.annotations?.[JFROG_ARTIFACTORY_ANNOTATION_TARGET_PROXY];

  if (!imageName) {
    throw new Error("'Jfrog Artifactory' annotations are missing");
  }
  return { imageName, targetProxy };
};
