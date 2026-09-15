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
import { configApiRef, identityApiRef } from '@backstage/frontend-plugin-api';
import {
  createExtensionTester,
  mockApis,
} from '@backstage/frontend-test-utils';
import { AnalyticsImplementationBlueprint } from '@backstage/plugin-app-react';

import { GoogleAnalytics4 } from './apis/implementations/AnalyticsApi';
import { ga4Implementation, ga4Module } from './module';

describe('ga4 analytics module', () => {
  it('should export an NFS frontend module for the app plugin', () => {
    expect(ga4Module.$$type).toBe('@backstage/FrontendModule');
    expect(ga4Module.pluginId).toBe('app');

    // The extension list is the module's internal shape; nothing public
    // reports what a module carries.
    const { extensions } = ga4Module as unknown as {
      extensions: { id: string }[];
    };
    expect(extensions.map(extension => extension.id)).toEqual([
      'analytics:app/ga4',
    ]);
  });

  it('builds the analytics API from the apis the app injects', () => {
    const implementation = createExtensionTester(ga4Implementation).get(
      AnalyticsImplementationBlueprint.dataRefs.factory,
    );
    if (!implementation) {
      throw new Error('the extension declares no analytics implementation');
    }

    expect(implementation.deps).toEqual({
      configApi: configApiRef,
      identityApi: identityApiRef,
    });
    expect(
      implementation.factory({
        configApi: mockApis.config({
          data: { app: { analytics: { ga4: { measurementId: 'G-TEST' } } } },
        }),
        identityApi: mockApis.identity(),
      }),
    ).toBeInstanceOf(GoogleAnalytics4);
  });
});
