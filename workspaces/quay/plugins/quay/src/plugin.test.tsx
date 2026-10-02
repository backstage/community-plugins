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
  ApiBlueprint,
  configApiRef,
  coreExtensionData,
  discoveryApiRef,
  identityApiRef,
  type OverridableFrontendPlugin,
} from '@backstage/frontend-plugin-api';
import {
  createExtensionTester,
  renderInTestApp,
} from '@backstage/frontend-test-utils';
import { EntityContentBlueprint } from '@backstage/plugin-catalog-react/alpha';

import { screen } from '@testing-library/react';

import { quayApiRef } from './api';
import quayPlugin, { quayApi, quayEntityContent } from './plugin';
import { rootRouteRef, tagRouteRef } from './routes';

jest.mock('./components/Router', () => ({
  Router: () => <div>quay router</div>,
}));

const entityWith = (annotations?: Record<string, string>): Entity => ({
  apiVersion: 'backstage.io/v1alpha1',
  kind: 'Component',
  metadata: { name: 'example', ...(annotations ? { annotations } : {}) },
});

const withRepositorySlug = entityWith({
  'quay.io/repository-slug': 'example/repo',
});
const withoutRepositorySlug = entityWith();

describe('quayPlugin (new frontend system)', () => {
  it('registers the extensions and routes an app resolves', () => {
    expect(quayPlugin.pluginId).toBe('quay');
    expect(quayPlugin.routes.root).toBe(rootRouteRef);
    expect(quayPlugin.routes.tag).toBe(tagRouteRef);

    // `getExtension` lives on the value `createFrontendPlugin` returns; the
    // exported `FrontendPlugin` type does not carry it. It throws on an
    // unknown id rather than returning undefined.
    const plugin = quayPlugin as OverridableFrontendPlugin;
    expect(() => plugin.getExtension('api:quay/quay')).not.toThrow();
    expect(() => plugin.getExtension('entity-content:quay/quay')).not.toThrow();
  });

  it('declares the api the tab reads the registry through', () => {
    const api = createExtensionTester(quayApi).get(
      ApiBlueprint.dataRefs.factory,
    );
    if (!api) {
      throw new Error('the extension declares no api factory');
    }

    expect(api.api).toBe(quayApiRef);
    expect(api.deps).toEqual({
      discoveryApi: discoveryApiRef,
      configApi: configApiRef,
      identityApi: identityApiRef,
    });
  });

  it('declares the catalog tab, which entities get it, and what it renders', async () => {
    const tester = createExtensionTester(quayEntityContent);

    expect(tester.get(EntityContentBlueprint.dataRefs.title)).toBe('Quay');
    expect(tester.get(coreExtensionData.routePath)).toBe('/quay');
    // Without this the tab renders but `useRouteRef(rootRouteRef)` inside it
    // has nothing to resolve against.
    expect(tester.get(coreExtensionData.routeRef)).toBe(rootRouteRef);

    const filter = tester.get(EntityContentBlueprint.dataRefs.filterFunction);
    if (!filter) {
      throw new Error('the entity content declares no filter function');
    }
    expect(filter(withRepositorySlug)).toBe(true);
    expect(filter(withoutRepositorySlug)).toBe(false);

    renderInTestApp(tester.reactElement());
    expect(await screen.findByText('quay router')).toBeInTheDocument();
  });
});
