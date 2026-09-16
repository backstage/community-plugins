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
import {
  ApiBlueprint,
  coreExtensionData,
} from '@backstage/frontend-plugin-api';
import {
  createExtensionTester,
  mockApis,
  renderInTestApp,
} from '@backstage/frontend-test-utils';
import { screen } from '@testing-library/react';

import rbacPlugin from '.';
import {
  LicensedUsersAPIClient,
  licensedUsersApiRef,
} from './api/LicensedUsersClient';
import { RBACBackendClient, rbacApiRef } from './api/RBACBackendClient';
import { licensedUsersApi, rbacApi } from './apis';
import rbacTranslationsModule, {
  rbacTranslationRef,
  rbacTranslations,
} from './alpha/translations';
import { rbacPage } from './pages';
import { rootRouteRef } from './pluginRoutes';

// Mocked so the render assertion covers only what the blueprint can break: the module
// the loader imports and the export it names. Router's own behaviour is covered by
// components/Router.test.tsx, which imports it directly.
jest.mock('./components/Router', () => ({
  Router: () => <div>rbac router</div>,
}));

describe('RBAC plugin', () => {
  it('exposes the plugin, its route, and the extension ids the app resolves', () => {
    expect(rbacPlugin.pluginId).toBe('rbac');
    expect(rbacPlugin.routes.root).toBe(rootRouteRef);

    // `getExtension` throws on an unknown id rather than returning undefined.
    expect(() => rbacPlugin.getExtension('api:rbac/rbac')).not.toThrow();
    expect(() =>
      rbacPlugin.getExtension('api:rbac/licensed-users'),
    ).not.toThrow();
    expect(() => rbacPlugin.getExtension('page:rbac')).not.toThrow();
  });

  it('builds both apis from the apis the app injects', () => {
    // The two blueprints differ only in name, ref and client, so a copy-paste slip
    // between them survives every assertion that only checks the ids resolve.
    const factoryOf = (extension: typeof rbacApi) =>
      createExtensionTester(extension).get(ApiBlueprint.dataRefs.factory);
    const apis = {
      configApi: mockApis.config(),
      identityApi: mockApis.identity(),
    };

    const rbac = factoryOf(rbacApi);
    expect(rbac.api).toBe(rbacApiRef);
    expect(rbac.factory(apis)).toBeInstanceOf(RBACBackendClient);

    const licensedUsers = factoryOf(licensedUsersApi);
    expect(licensedUsers.api).toBe(licensedUsersApiRef);
    expect(licensedUsers.factory(apis)).toBeInstanceOf(LicensedUsersAPIClient);
  });

  it('declares the page the app mounts, and how the app reaches its content', async () => {
    const tester = createExtensionTester(rbacPage);

    expect(tester.get(coreExtensionData.title)).toBe('RBAC');
    expect(tester.get(coreExtensionData.routePath)).toBe('/rbac');
    expect(tester.get(coreExtensionData.routeRef)).toBe(rootRouteRef);
    // Without it the nav entry renders untitled-looking, with nothing logged.
    expect(tester.get(coreExtensionData.icon)).toBeDefined();

    renderInTestApp(tester.reactElement());
    expect(await screen.findByText('rbac router')).toBeInTheDocument();
  });

  it('registers translations against the ref the plugin reads them through', () => {
    expect(rbacTranslationsModule.pluginId).toBe('app');
    // Binding the resource to a different ref switches off every translation in the
    // plugin, with no error anywhere.
    expect(rbacTranslations.id).toBe(rbacTranslationRef.id);
  });
});
