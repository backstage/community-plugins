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
import { Entity } from '@backstage/catalog-model';

import topologyPlugin from './plugin';
import { isTopologyAvailable } from './isTopologyAvailable';

describe('topology', () => {
  it('should export the new frontend system plugin', () => {
    expect(topologyPlugin).toBeDefined();
    expect(topologyPlugin.pluginId).toBe('topology');
  });

  it('isTopologyAvailable is true when kubernetes id or namespace annotations are set', () => {
    expect(
      isTopologyAvailable({
        apiVersion: 'backstage.io/v1alpha1',
        kind: 'Component',
        metadata: {
          name: 'example',
          annotations: { 'backstage.io/kubernetes-id': 'example' },
        },
      } as Entity),
    ).toBe(true);
    expect(
      isTopologyAvailable({
        apiVersion: 'backstage.io/v1alpha1',
        kind: 'Component',
        metadata: {
          name: 'example',
          annotations: { 'backstage.io/kubernetes-namespace': 'default' },
        },
      } as Entity),
    ).toBe(true);
    expect(
      isTopologyAvailable({
        apiVersion: 'backstage.io/v1alpha1',
        kind: 'Component',
        metadata: { name: 'example' },
      } as Entity),
    ).toBe(false);
  });
});
