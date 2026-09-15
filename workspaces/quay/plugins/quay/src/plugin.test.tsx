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
  coreExtensionData,
  type OverridableFrontendPlugin,
} from '@backstage/frontend-plugin-api';
import { createExtensionTester } from '@backstage/frontend-test-utils';
import { EntityContentBlueprint } from '@backstage/plugin-catalog-react/alpha';

import quayPlugin, { quayEntityContent } from './plugin';
import { rootRouteRef, tagRouteRef } from './routes';

const entityWith = (annotations?: Record<string, string>): Entity => ({
  apiVersion: 'backstage.io/v1alpha1',
  kind: 'Component',
  metadata: { name: 'example', ...(annotations ? { annotations } : {}) },
});

const withRepositorySlug = entityWith({
  'quay.io/repository-slug': 'example/repo',
});
const withoutAnnotations = entityWith();

describe('quay', () => {
  it('should export plugin', () => {
    expect(quayPlugin).toBeDefined();
    expect(quayPlugin.pluginId).toBe('quay');
  });

  it('exposes the routes an app binds to', () => {
    expect(quayPlugin.routes.root).toBe(rootRouteRef);
    expect(quayPlugin.routes.tag).toBe(tagRouteRef);
  });

  it('registers its extensions under the ids the app resolves', () => {
    // `getExtension` lives on the value `createFrontendPlugin` returns; the
    // exported `FrontendPlugin` type does not carry it.
    const plugin = quayPlugin as OverridableFrontendPlugin;
    expect(plugin.getExtension('api:quay/quay')).toBeDefined();
    expect(plugin.getExtension('entity-content:quay/quay')).toBeDefined();
  });

  it('declares the catalog tab, and which entities get it', () => {
    const tester = createExtensionTester(quayEntityContent);

    expect(tester.get(EntityContentBlueprint.dataRefs.title)).toBe('Quay');
    expect(tester.get(coreExtensionData.routePath)).toBe('/quay');
    // Without this the tab renders but `useRouteRef(rootRouteRef)` inside it
    // has nothing to resolve against.
    expect(tester.get(coreExtensionData.routeRef)).toBe(rootRouteRef);

    const filter = tester.get(EntityContentBlueprint.dataRefs.filterFunction);
    if (!filter) {
      throw new Error('the entity content declares no filter');
    }
    expect(filter(withRepositorySlug)).toBe(true);
    expect(filter(withoutAnnotations)).toBe(false);
  });
});
