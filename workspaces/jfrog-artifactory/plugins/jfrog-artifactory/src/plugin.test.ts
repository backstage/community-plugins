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

import jfrogArtifactoryPlugin from './plugin';
import { isJfrogArtifactoryAvailable } from './isJfrogArtifactoryAvailable';

describe('jfrog artifactory', () => {
  it('should export the new frontend system plugin', () => {
    expect(jfrogArtifactoryPlugin).toBeDefined();
    expect(jfrogArtifactoryPlugin.pluginId).toBe('jfrog-artifactory');
  });

  it('isJfrogArtifactoryAvailable is true when the image-name annotation is set', () => {
    expect(
      isJfrogArtifactoryAvailable({
        apiVersion: 'backstage.io/v1alpha1',
        kind: 'Component',
        metadata: {
          name: 'example',
          annotations: { 'jfrog-artifactory/image-name': 'backstage' },
        },
      } as Entity),
    ).toBe(true);
    expect(
      isJfrogArtifactoryAvailable({
        apiVersion: 'backstage.io/v1alpha1',
        kind: 'Component',
        metadata: { name: 'example' },
      } as Entity),
    ).toBe(false);
  });
});
