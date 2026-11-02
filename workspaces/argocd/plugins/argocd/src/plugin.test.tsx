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
  ApiBlueprint,
  configApiRef,
  coreExtensionData,
  discoveryApiRef,
  fetchApiRef,
  type ExtensionDefinition,
  type OverridableFrontendPlugin,
} from '@backstage/frontend-plugin-api';
import {
  createExtensionTester,
  mockApis,
  renderInTestApp,
} from '@backstage/frontend-test-utils';
import { EntityContentBlueprint } from '@backstage/plugin-catalog-react/alpha';
import { Permission } from '@backstage/plugin-permission-common';
import { argocdViewPermission } from '@backstage-community/plugin-argocd-common';
import { screen } from '@testing-library/react';

import { argoCDApiRef, argoCDInstanceApiRef } from './api';
import { ArgoCDApiClient } from './api/ArgoCDApiClient';
import { ArgoCDInstanceApiClient } from './api/ArgoCDInstanceApiClient';
import argocdFrontendPlugin, {
  argoCDApi,
  argoCDInstanceApi,
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

// The app parses the predicate's `name#action` string back into a Permission and
// authorizes that, so this asserts the string hardcoded in plugin.tsx still matches
// the permission argocd-common publishes.
const granted = (...permissions: Permission[]) => ({
  featureFlags: [],
  permissions: permissions.map(
    permission => `${permission.name}#${permission.attributes.action}`,
  ),
});

const gatesOnArgocdView = (extension: ExtensionDefinition) => {
  // `if` is an internal property of the extension, so the guard below is
  // load-bearing: it fails loudly if Backstage ever relocates it.
  const { if: predicate } = extension as { if?: FilterPredicate };
  if (!predicate) {
    throw new Error('the entity content declares no permission predicate');
  }
  expect(
    evaluateFilterPredicate(predicate, granted(argocdViewPermission)),
  ).toBe(true);
  expect(evaluateFilterPredicate(predicate, granted())).toBe(false);
};

describe('argocdPlugin (new frontend system)', () => {
  it('exposes the plugin, its route, and the extension ids the app resolves', () => {
    expect(argocdFrontendPlugin.pluginId).toBe('backstage-community-argocd');
    expect(argocdFrontendPlugin.routes.root).toBe(rootRouteRef);

    // `getExtension` lives on the value `createFrontendPlugin` returns; the
    // exported `FrontendPlugin` type does not carry it. It throws on an
    // unknown id rather than returning undefined.
    const overridable = argocdFrontendPlugin as OverridableFrontendPlugin;
    for (const id of [
      'api:backstage-community-argocd/argocd',
      'api:backstage-community-argocd/argocd-instance',
      'entity-content:backstage-community-argocd/deployment-lifecycle',
      'entity-content:backstage-community-argocd/deployment-summary',
    ]) {
      expect(() => overridable.getExtension(id)).not.toThrow();
    }
  });

  it('builds both apis from the apis the app injects', () => {
    // The two blueprints differ only in name, ref and client, so a copy-paste slip
    // between them survives every assertion that only checks the ids resolve.
    const deps = {
      discoveryApi: mockApis.discovery(),
      fetchApi: mockApis.fetch(),
      configApi: mockApis.config({
        data: {
          argocd: {
            namespacedApps: true,
            appLocatorMethods: [
              {
                type: 'config',
                instances: [{ name: 'main', url: 'https://argocd.test' }],
              },
            ],
          },
        },
      }),
    };

    const api = createExtensionTester(argoCDApi).get(
      ApiBlueprint.dataRefs.factory,
    );
    expect(api.api).toBe(argoCDApiRef);
    expect(api.deps).toEqual({
      discoveryApi: discoveryApiRef,
      fetchApi: fetchApiRef,
      configApi: configApiRef,
    });
    expect(api.factory(deps)).toBeInstanceOf(ArgoCDApiClient);

    const instanceApi = createExtensionTester(argoCDInstanceApi).get(
      ApiBlueprint.dataRefs.factory,
    );
    expect(instanceApi.api).toBe(argoCDInstanceApiRef);
    expect(
      instanceApi.factory({
        configApi: deps.configApi,
        argoCDApi: api.factory(deps),
      }),
    ).toBeInstanceOf(ArgoCDInstanceApiClient);
  });

  it('declares the deployment lifecycle tab, which entities get it, and mounts its content', async () => {
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

  it('declares the deployment summary tab, which entities get it, and mounts its content', async () => {
    const tester = createExtensionTester(deploymentSummaryEntityContent);

    expect(tester.get(EntityContentBlueprint.dataRefs.title)).toBe(
      'Deployment Summary',
    );
    expect(tester.get(coreExtensionData.routePath)).toBe('/deployment-summary');
    // Unlike the lifecycle tab, summary declares no route ref. Recorded so the
    // asymmetry is a decision rather than something nobody noticed.
    expect(tester.get(coreExtensionData.routeRef)).toBeUndefined();

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
