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
import { coreExtensionData } from '@backstage/frontend-plugin-api';
import {
  createExtensionTester,
  renderInTestApp,
} from '@backstage/frontend-test-utils';
import { screen } from '@testing-library/react';

import rbacPlugin from '.';
import rbacTranslationsModule from './alpha/translations';
import { rbacPage } from './pages';
import { rootRouteRef } from './pluginRoutes';

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

  it('declares the page the app mounts, and what it renders', async () => {
    const tester = createExtensionTester(rbacPage);

    expect(tester.get(coreExtensionData.title)).toBe('RBAC');
    expect(tester.get(coreExtensionData.routePath)).toBe('/rbac');
    expect(tester.get(coreExtensionData.routeRef)).toBe(rootRouteRef);

    renderInTestApp(tester.reactElement());
    expect(await screen.findByText('rbac router')).toBeInTheDocument();
  });

  it('ships translations as a module on the app plugin', () => {
    expect(rbacTranslationsModule.$$type).toBe('@backstage/FrontendModule');
    expect(rbacTranslationsModule.pluginId).toBe('app');
  });
});
