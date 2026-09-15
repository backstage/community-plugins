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
  evaluateFilterPredicate,
  type FilterPredicate,
} from '@backstage/filter-predicates';
import {
  coreExtensionData,
  type OverridableFrontendPlugin,
} from '@backstage/frontend-plugin-api';
import {
  createExtensionTester,
  renderInTestApp,
} from '@backstage/frontend-test-utils';
import { EntityContentBlueprint } from '@backstage/plugin-catalog-react/alpha';
import {
  kubernetesClustersReadPermission,
  kubernetesResourcesReadPermission,
} from '@backstage/plugin-kubernetes-common';
import { Permission } from '@backstage/plugin-permission-common';
import { screen } from '@testing-library/react';

import topologyPlugin, { topologyEntityContent } from './plugin';
import { isTopologyAvailable } from './isTopologyAvailable';

jest.mock('./components/Topology', () => ({
  TopologyEntityContent: () => <div>topology entity content</div>,
  TopologyComponent: () => <div>legacy topology component</div>,
}));

const entityWith = (annotations?: Record<string, string>): Entity => ({
  apiVersion: 'backstage.io/v1alpha1',
  kind: 'Component',
  metadata: { name: 'example', ...(annotations ? { annotations } : {}) },
});

const withKubernetesId = entityWith({
  'backstage.io/kubernetes-id': 'example',
});
const withKubernetesNamespace = entityWith({
  'backstage.io/kubernetes-namespace': 'default',
});
const withoutAnnotations = entityWith();

// How the app encodes a permission before matching it against the predicate.
const granted = (...permissions: Permission[]) => ({
  featureFlags: [],
  permissions: permissions.map(
    permission => `${permission.name}#${permission.attributes.action}`,
  ),
});

describe('topology', () => {
  it('exposes the plugin and the extension id the app resolves', () => {
    expect(topologyPlugin.pluginId).toBe('topology');
    // `getExtension` lives on the value `createFrontendPlugin` returns; the
    // exported `FrontendPlugin` type does not carry it. It throws on an
    // unknown id rather than returning undefined.
    const plugin = topologyPlugin as OverridableFrontendPlugin;
    expect(() =>
      plugin.getExtension('entity-content:topology/topology'),
    ).not.toThrow();
  });

  it('isTopologyAvailable follows the kubernetes id and namespace annotations', () => {
    expect(isTopologyAvailable(withKubernetesId)).toBe(true);
    expect(isTopologyAvailable(withKubernetesNamespace)).toBe(true);
    expect(isTopologyAvailable(withoutAnnotations)).toBe(false);
  });

  it('declares the catalog tab, which entities get it, and what it renders', async () => {
    const tester = createExtensionTester(topologyEntityContent);

    expect(tester.get(EntityContentBlueprint.dataRefs.title)).toBe('Topology');
    expect(tester.get(coreExtensionData.routePath)).toBe('/topology');

    const filter = tester.get(EntityContentBlueprint.dataRefs.filterFunction);
    if (!filter) {
      throw new Error('the entity content declares no filter function');
    }
    expect(filter(withKubernetesId)).toBe(true);
    expect(filter(withKubernetesNamespace)).toBe(true);
    expect(filter(withoutAnnotations)).toBe(false);

    renderInTestApp(tester.reactElement());
    expect(
      await screen.findByText('topology entity content'),
    ).toBeInTheDocument();
  });

  // The tab is hidden rather than failing at render time for users without
  // Kubernetes read access, so the predicate is part of the contract.
  it('gates the tab on both kubernetes read permissions', () => {
    const { if: predicate } = topologyEntityContent as unknown as {
      if?: FilterPredicate;
    };
    if (!predicate) {
      throw new Error('the entity content declares no permission predicate');
    }

    expect(
      evaluateFilterPredicate(
        predicate,
        granted(
          kubernetesClustersReadPermission,
          kubernetesResourcesReadPermission,
        ),
      ),
    ).toBe(true);
    expect(
      evaluateFilterPredicate(
        predicate,
        granted(kubernetesClustersReadPermission),
      ),
    ).toBe(false);
    expect(
      evaluateFilterPredicate(
        predicate,
        granted(kubernetesResourcesReadPermission),
      ),
    ).toBe(false);
  });
});
