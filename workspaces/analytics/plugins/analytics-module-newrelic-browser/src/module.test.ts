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
import newRelicBrowserModule from './alpha';
import { newRelicBrowserImplementation } from './module';

// Only the agent is mocked. Everything else on the identity path is real:
// `getBackstageIdentity`, the SHA-256 hash, and jsdom's missing `crypto.subtle`,
// which the polyfill below supplies.
const setUserId = jest.fn();
jest.mock('@newrelic/browser-agent/loaders/browser-agent', () => ({
  BrowserAgent: jest.fn().mockImplementation(() => ({
    setUserId: (userId: string) => setUserId(userId),
  })),
}));
Object.defineProperty(window, 'crypto', {
  value: webcrypto,
  configurable: true,
});

/** Resolve once the agent is told who the user is. */
const userIdentified = () =>
  new Promise<string>(resolve => {
    setUserId.mockImplementation(resolve);
  });

describe('New Relic browser analytics module', () => {
  it('exports a frontend module carrying the analytics implementation', () => {
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

  it('builds the analytics API from the apis the app injects, and identifies the user', async () => {
    const implementation = createExtensionTester(
      newRelicBrowserImplementation,
    ).get(AnalyticsImplementationBlueprint.dataRefs.factory);

    expect(implementation.deps).toEqual({
      configApi: configApiRef,
      identityApi: identityApiRef,
    });
    const identified = userIdentified();
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

    // The constructor starts getBackstageIdentity -> hash -> setUserId and returns
    // before it settles. Awaiting it covers that path and keeps it from landing in
    // whatever test runs next.
    expect(await identified).toMatch(/^[0-9a-f]{64}$/);
  });
});
