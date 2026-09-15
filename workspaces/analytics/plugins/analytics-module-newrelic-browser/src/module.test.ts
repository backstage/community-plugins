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
import { webcrypto } from 'node:crypto';

import { configApiRef, identityApiRef } from '@backstage/frontend-plugin-api';
import {
  createExtensionTester,
  mockApis,
} from '@backstage/frontend-test-utils';
import { AnalyticsImplementationBlueprint } from '@backstage/plugin-app-react';

import { NewRelicBrowser } from './apis/implementations/AnalyticsApi';
import { newRelicBrowserImplementation, newRelicBrowserModule } from './module';

// The real agent boots a browser SDK, and hashing the user id needs
// `crypto.subtle`, which jsdom does not provide.
jest.mock('@newrelic/browser-agent/loaders/browser-agent', () => ({
  BrowserAgent: jest.fn().mockImplementation(() => ({ setUserId: jest.fn() })),
}));
Object.defineProperty(window, 'crypto', { value: webcrypto });

describe('New Relic browser analytics module', () => {
  it('should export an NFS frontend module for the app plugin', () => {
    expect(newRelicBrowserModule.$$type).toBe('@backstage/FrontendModule');
    expect(newRelicBrowserModule.pluginId).toBe('app');

    // The extension list is the module's internal shape; nothing public
    // reports what a module carries.
    const { extensions } = newRelicBrowserModule as unknown as {
      extensions: { id: string }[];
    };
    expect(extensions.map(extension => extension.id)).toEqual([
      'analytics:app/newrelic-browser',
    ]);
  });

  it('builds the analytics API from the apis the app injects', () => {
    const implementation = createExtensionTester(
      newRelicBrowserImplementation,
    ).get(AnalyticsImplementationBlueprint.dataRefs.factory);
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
          data: {
            app: {
              analytics: {
                newRelic: {
                  endpoint: 'https://example.test',
                  accountId: 'account',
                  applicationId: 'application',
                  licenseKey: 'license',
                },
              },
            },
          },
        }),
        identityApi: mockApis.identity(),
      }),
    ).toBeInstanceOf(NewRelicBrowser);
  });
});
