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
import {
  coreExtensionData,
  OverridableFrontendPlugin,
} from '@backstage/frontend-plugin-api';
import { createExtensionTester } from '@backstage/frontend-test-utils';
import { EntityContentBlueprint } from '@backstage/plugin-catalog-react/alpha';

import topologyPlugin, { topologyEntityContent } from './plugin';
import { isTopologyAvailable } from './isTopologyAvailable';

const entityWith = (annotations?: Record<string, string>): Entity =>
  ({
    apiVersion: 'backstage.io/v1alpha1',
    kind: 'Component',
    metadata: { name: 'example', ...(annotations ? { annotations } : {}) },
  } as Entity);

const withKubernetesId = entityWith({
  'backstage.io/kubernetes-id': 'example',
});
const withKubernetesNamespace = entityWith({
  'backstage.io/kubernetes-namespace': 'default',
});
const withoutAnnotations = entityWith();

describe('topology', () => {
  it('should export the new frontend system plugin', () => {
    expect(topologyPlugin).toBeDefined();
    expect(topologyPlugin.pluginId).toBe('topology');
  });

  it('isTopologyAvailable is true when kubernetes id or namespace annotations are set', () => {
    expect(isTopologyAvailable(withKubernetesId)).toBe(true);
    expect(isTopologyAvailable(withKubernetesNamespace)).toBe(true);
    expect(isTopologyAvailable(withoutAnnotations)).toBe(false);
  });

  it('registers the entity content under the id the app resolves', () => {
    // `getExtension` lives on the value `createFrontendPlugin` returns; the
    // exported `FrontendPlugin` type does not carry it.
    const plugin = topologyPlugin as OverridableFrontendPlugin;
    expect(
      plugin.getExtension('entity-content:topology/topology'),
    ).toBeDefined();
  });

  it('declares the catalog tab, and which entities get it', () => {
    const tester = createExtensionTester(topologyEntityContent);

    expect(tester.get(EntityContentBlueprint.dataRefs.title)).toBe('Topology');
    expect(tester.get(coreExtensionData.routePath)).toBe('/topology');

    const filter = tester.get(EntityContentBlueprint.dataRefs.filterFunction);
    if (!filter) {
      throw new Error('the entity content declares no filter');
    }
    expect(filter(withKubernetesId)).toBe(true);
    expect(filter(withKubernetesNamespace)).toBe(true);
    expect(filter(withoutAnnotations)).toBe(false);
  });

  // The tab is hidden rather than failing at render time for users without
  // Kubernetes read access, so the predicate is part of the contract.
  it('is only attached for users allowed to read kubernetes resources', () => {
    expect(topologyEntityContent).toHaveProperty('if', {
      $all: [
        { permissions: { $contains: 'kubernetes.clusters.read#read' } },
        { permissions: { $contains: 'kubernetes.resources.read#read' } },
      ],
    });
  });
});
