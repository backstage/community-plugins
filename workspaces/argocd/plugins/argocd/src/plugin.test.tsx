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
import { Permission } from '@backstage/plugin-permission-common';
import { argocdViewPermission } from '@backstage-community/plugin-argocd-common';
import { screen } from '@testing-library/react';

import argocdPlugin, {
  deploymentLifecycleEntityContent,
  deploymentSummaryEntityContent,
} from './plugin';
import { rootRouteRef } from './routes';

jest.mock('./components/DeploymentLifeCycle', () => ({
  DeploymentLifecycle: () => <div>deployment lifecycle</div>,
}));

jest.mock('./components/DeploymentSummary', () => ({
  DeploymentSummary: () => <div>deployment summary</div>,
}));

const entityWith = (annotations?: Record<string, string>): Entity => ({
  apiVersion: 'backstage.io/v1alpha1',
  kind: 'Component',
  metadata: { name: 'example', ...(annotations ? { annotations } : {}) },
});

const withAppSelector = entityWith({ 'argocd/app-selector': 'app=example' });
const withAppName = entityWith({ 'argocd/app-name': 'example' });
const withoutAnnotations = entityWith();

// How the app encodes a permission before matching it against the predicate.
const granted = (...permissions: Permission[]) => ({
  featureFlags: [],
  permissions: permissions.map(
    permission => `${permission.name}#${permission.attributes.action}`,
  ),
});

const gatesOnArgocdView = (extension: unknown) => {
  const { if: predicate } = extension as { if?: FilterPredicate };
  if (!predicate) {
    throw new Error('the entity content declares no permission predicate');
  }
  expect(
    evaluateFilterPredicate(predicate, granted(argocdViewPermission)),
  ).toBe(true);
  expect(evaluateFilterPredicate(predicate, granted())).toBe(false);
};

describe('argocd', () => {
  it('exposes the plugin, its route, and the extension ids the app resolves', () => {
    expect(argocdPlugin.pluginId).toBe('backstage-community-argocd');
    expect(argocdPlugin.routes.root).toBe(rootRouteRef);

    // `getExtension` lives on the value `createFrontendPlugin` returns; the
    // exported `FrontendPlugin` type does not carry it. It throws on an
    // unknown id rather than returning undefined.
    const plugin = argocdPlugin as OverridableFrontendPlugin;
    for (const id of [
      'api:backstage-community-argocd/argocd',
      'api:backstage-community-argocd/argocd-instance',
      'entity-content:backstage-community-argocd/deployment-lifecycle',
      'entity-content:backstage-community-argocd/deployment-summary',
    ]) {
      expect(() => plugin.getExtension(id)).not.toThrow();
    }
  });

  it('declares the deployment lifecycle tab, which entities get it, and what it renders', async () => {
    const tester = createExtensionTester(deploymentLifecycleEntityContent);

    expect(tester.get(EntityContentBlueprint.dataRefs.title)).toBe(
      'Deployment Lifecycle',
    );
    expect(tester.get(coreExtensionData.routePath)).toBe(
      '/deployment-lifecycle',
    );
    expect(tester.get(coreExtensionData.routeRef)).toBe(rootRouteRef);

    const filter = tester.get(EntityContentBlueprint.dataRefs.filterFunction);
    if (!filter) {
      throw new Error('the entity content declares no filter function');
    }
    expect(filter(withAppSelector)).toBe(true);
    expect(filter(withAppName)).toBe(true);
    expect(filter(withoutAnnotations)).toBe(false);

    renderInTestApp(tester.reactElement());
    expect(await screen.findByText('deployment lifecycle')).toBeInTheDocument();
  });

  it('declares the deployment summary tab, which entities get it, and what it renders', async () => {
    const tester = createExtensionTester(deploymentSummaryEntityContent);

    expect(tester.get(EntityContentBlueprint.dataRefs.title)).toBe(
      'Deployment Summary',
    );
    expect(tester.get(coreExtensionData.routePath)).toBe('/deployment-summary');

    const filter = tester.get(EntityContentBlueprint.dataRefs.filterFunction);
    if (!filter) {
      throw new Error('the entity content declares no filter function');
    }
    expect(filter(withAppSelector)).toBe(true);
    expect(filter(withAppName)).toBe(true);
    expect(filter(withoutAnnotations)).toBe(false);

    renderInTestApp(tester.reactElement());
    expect(await screen.findByText('deployment summary')).toBeInTheDocument();
  });

  // Both tabs are hidden rather than failing at render time for users without
  // ArgoCD read access, so the predicate is part of the contract.
  it('gates both tabs on the argocd view permission', () => {
    gatesOnArgocdView(deploymentLifecycleEntityContent);
    gatesOnArgocdView(deploymentSummaryEntityContent);
  });
});
