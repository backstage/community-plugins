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
import {
  isMultiCIAvailableAndEnabled,
  multiSourceSecurityViewerPlugin,
} from './plugin';
import { MSSV_ENABLED_ANNOTATION } from '@backstage-community/plugin-multi-source-security-viewer-common';

describe('multi-source-security-viewer', () => {
  it('should export plugin', () => {
    expect(multiSourceSecurityViewerPlugin).toBeDefined();
  });

  it('should display when the annotation is set to "true"', () => {
    let entity: Entity = {
      apiVersion: 'backstage.io/v1alpha1',
      kind: 'Component',
      metadata: {
        namespace: 'default',
        name: 'sample',
        annotations: {
          [MSSV_ENABLED_ANNOTATION]: 'false',
        },
      },
    };
    expect(isMultiCIAvailableAndEnabled(entity)).toBe(false);
    entity = {
      apiVersion: 'backstage.io/v1alpha1',
      kind: 'Component',
      metadata: {
        namespace: 'default',
        name: 'sample',
        annotations: {
          [MSSV_ENABLED_ANNOTATION]: 'true',
          'github.com/project-slug': 'fake/repo',
        },
      },
    };
    expect(isMultiCIAvailableAndEnabled(entity)).toBe(true);
  });
});
