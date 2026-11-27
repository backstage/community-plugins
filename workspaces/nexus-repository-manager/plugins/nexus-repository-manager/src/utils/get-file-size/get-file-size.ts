/*
 * Copyright 2026 The Backstage Authors
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
