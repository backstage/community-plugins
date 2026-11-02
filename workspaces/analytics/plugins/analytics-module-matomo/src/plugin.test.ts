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
import { analyticsApiRef } from '@backstage/core-plugin-api';
import { configApiRef, identityApiRef } from '@backstage/frontend-plugin-api';
import {
  createExtensionTester,
  mockApis,
} from '@backstage/frontend-test-utils';
import { AnalyticsImplementationBlueprint } from '@backstage/plugin-app-react';

import { MatomoAnalytics } from './api';
import {
  analyticsModuleMatomoPlugin,
  analyticsProviderMatomoPlugin,
  matomoImplementation,
  MatomoAnalyticsApi,
} from './plugin';

// `MatomoAnalytics.fromConfig` injects the Matomo snippet into the document,
// which jsdom has no <script> to anchor to.
jest.mock('./api/loadMatomo', () => ({ loadMatomo: jest.fn() }));

const matomoConfig = mockApis.config({
  data: {
    app: { analytics: { matomo: { host: 'https://example.test', siteId: 1 } } },
  },
});

describe('matomo analytics', () => {
  it('registers the analytics api on the legacy plugin, and builds it', () => {
    const apis = Array.from(analyticsModuleMatomoPlugin.getApis());
    expect(apis).toContain(MatomoAnalyticsApi);

    expect(MatomoAnalyticsApi.api).toBe(analyticsApiRef);
    expect(MatomoAnalyticsApi.deps).toEqual({
      configApi: configApiRef,
      identityApi: identityApiRef,
    });
    expect(
      MatomoAnalyticsApi.factory({
        configApi: matomoConfig,
        identityApi: mockApis.identity(),
      }),
    ).toBeInstanceOf(MatomoAnalytics);
  });

  it('exports an NFS plugin carrying the analytics implementation', () => {
    expect(analyticsProviderMatomoPlugin.pluginId).toBe(
      'analytics-module-matomo',
    );

    // The extension list is the plugin's internal shape; the exported
    // `FrontendPlugin` type does not report what a plugin carries.
    const { extensions } = analyticsProviderMatomoPlugin as unknown as {
      extensions: { id: string }[];
    };
    expect(extensions.map(extension => extension.id)).toEqual([
      'analytics:analytics-module-matomo',
    ]);
  });

  it('builds the analytics API from the apis the app injects', () => {
    const implementation = createExtensionTester(matomoImplementation).get(
      AnalyticsImplementationBlueprint.dataRefs.factory,
    );

    expect(implementation.deps).toEqual({
      configApi: configApiRef,
      identityApi: identityApiRef,
    });
    expect(
      implementation.factory({
        configApi: matomoConfig,
        identityApi: mockApis.identity(),
      }),
    ).toBeInstanceOf(MatomoAnalytics);
  });
});
