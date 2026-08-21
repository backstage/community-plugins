/*
 * Copyright 2025 The Backstage Authors
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
import { coreExtensionData } from '@backstage/frontend-plugin-api';
import { createExtensionTester } from '@backstage/frontend-test-utils';
import { EntityContentBlueprint } from '@backstage/plugin-catalog-react/alpha';

import { mockEntity } from './__fixtures__/mockEntity';
import nfsPlugin, { acrImagesEntityContent } from './alpha';

/**
 * These assert the plugin's *wiring* under the new frontend system: the title the
 * catalog will print on the tab, the path it mounts at, and the entities it shows
 * for. Under the new frontend system those are declared by the extension rather
 * than configured by the app, so an end-to-end test that clicks the tab is really
 * checking these three facts through a browser and a deployment.
 *
 * Rendering is covered a layer down by AcrImagesEntityContent.test.tsx; the only
 * render here is through the extension itself, which is the part that test cannot
 * reach.
 */
describe('alpha (new frontend system)', () => {
  it('declares the tab title the catalog will render', () => {
    const tester = createExtensionTester(acrImagesEntityContent);

    expect(tester.get(EntityContentBlueprint.dataRefs.title)).toBe(
      'ACR images',
    );
  });

  it('declares the path the tab mounts at', () => {
    const tester = createExtensionTester(acrImagesEntityContent);

    expect(tester.get(coreExtensionData.routePath)).toBe('acr-images');
  });

  describe('the filter that decides which entities show the tab', () => {
    const filter = () => {
      const fn = createExtensionTester(acrImagesEntityContent).get(
        EntityContentBlueprint.dataRefs.filterFunction,
      );
      // The blueprint makes this output optional, and an extension without it
      // shows the tab on every entity in the catalog — so its absence is a
      // defect rather than a variant, and worth failing on by name.
      if (!fn)
        throw new Error('acrImagesEntityContent declares no entity filter');
      return fn;
    };

    it('shows the tab for an entity annotated with a repository name', () => {
      expect(filter()(mockEntity)).toBe(true);
    });

    it('hides the tab for an entity with no ACR annotation', () => {
      const withoutAnnotation: Entity = {
        ...mockEntity,
        metadata: { ...mockEntity.metadata, annotations: {} },
      };

      expect(filter()(withoutAnnotation)).toBe(false);
    });
  });

  /**
   * Not optional, and not covered by any assertion above.
   *
   * `createExtensionTester` instantiates an extension in isolation, so it cannot
   * see whether the plugin actually registers it. Deleting `acrImagesEntityContent`
   * from the plugin's `extensions` array leaves every test above green while the
   * tab disappears from a real app — and because a plugin that contributes nothing
   * still boots cleanly, nothing else would report it either.
   */
  describe('registration', () => {
    it('registers the entity content and the API on the plugin', () => {
      expect(
        nfsPlugin.getExtension('entity-content:acr/acrImagesEntityContent'),
      ).toBeDefined();
      expect(nfsPlugin.getExtension('api:acr/acrApi')).toBeDefined();
    });

    it('is a frontend plugin the app can install, under the expected id', () => {
      expect(nfsPlugin.$$type).toBe('@backstage/FrontendPlugin');
      expect(nfsPlugin.pluginId).toBe('acr');
    });
  });
});
