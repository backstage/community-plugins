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
  storageApiRef,
} from '@backstage/frontend-plugin-api';
import {
  createExtensionTester,
  mockApis,
  renderInTestApp,
  TestApiProvider,
} from '@backstage/frontend-test-utils';
import {
  GuidedTourApi,
  GuidedTourBlueprint,
  guidedTourApiRef,
} from '@backstage-community/plugin-guided-tours-react';
import { screen } from '@testing-library/react';
import { DefaultGuidedTourApi } from '../api/DefaultGuidedTourApi';
import { guidedTourApi } from './api';
import { guidedToursPage } from './page';

const introTour = GuidedTourBlueprint.make({
  name: 'intro',
  params: {
    title: 'Intro tour',
    steps: [{ id: 'one', content: 'One' }],
  },
});

describe('extensions', () => {
  it('collects the tours and the autoStart config into the api', () => {
    const factory = createExtensionTester(guidedTourApi, {
      config: { autoStart: false },
    })
      // the tester installs the api under the `test` plugin id
      .add(introTour.override({ attachTo: { id: 'api:test', input: 'tours' } }))
      .get(ApiBlueprint.dataRefs.factory);
    expect(factory.api).toBe(guidedTourApiRef);
    expect(factory.deps).toEqual({ storageApi: storageApiRef });

    const api = factory.factory({
      storageApi: mockApis.storage(),
    }) as GuidedTourApi;
    expect(api.isAutoStartEnabled()).toBe(false);
    expect(api.getTours().map(t => t.id)).toEqual(['intro']);
  });

  it('mounts the overview page at /guided-tours', async () => {
    const tester = createExtensionTester(guidedToursPage);
    expect(tester.get(coreExtensionData.routePath)).toBe('/guided-tours');

    const api = new DefaultGuidedTourApi({
      tours: [],
      storageApi: mockApis.storage(),
    });
    await renderInTestApp(
      <TestApiProvider apis={[[guidedTourApiRef, api]]}>
        {tester.get(coreExtensionData.reactElement)}
      </TestApiProvider>,
    );
    expect(
      await screen.findByText('No guided tours are installed.'),
    ).toBeVisible();
  });
});
