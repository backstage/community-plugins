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

import { SegmentAnalytics } from './apis/implementations/AnalyticsApi';
import segmentModule from '.';
import { segmentImplementation } from './module';

// The real constructor calls AnalyticsBrowser().load(), which leaves a worker behind in
// jsdom. The sibling Segment.test.ts mocks it for the same reason.
jest.mock('@segment/analytics-next', () => ({
  AnalyticsBrowser: function AnalyticsBrowser() {
    return {
      load: jest.fn(),
      identify: jest.fn(),
      page: jest.fn(),
      track: jest.fn(),
    };
  },
}));

describe('Segment analytics module', () => {
  it('exports a frontend module carrying the analytics implementation', () => {
    expect(segmentModule.$$type).toBe('@backstage/FrontendModule');
    expect(segmentModule.pluginId).toBe('app');

    // The extension list is the module's internal shape; nothing public
    // reports what a module carries.
    const { extensions } = segmentModule as unknown as {
      extensions: { id: string }[];
    };
    expect(extensions.map(extension => extension.id)).toEqual([
      'analytics:app/segment',
    ]);
  });

  it('builds the analytics API from the apis the app injects', () => {
    const implementation = createExtensionTester(segmentImplementation).get(
      AnalyticsImplementationBlueprint.dataRefs.factory,
    );

    expect(implementation.deps).toEqual({
      configApi: configApiRef,
      identityApi: identityApiRef,
    });
    expect(
      implementation.factory({
        configApi: mockApis.config({
          data: {
            app: {
              analytics: { segment: { writeKey: 'key', testMode: true } },
            },
          },
        }),
        identityApi: mockApis.identity(),
      }),
    ).toBeInstanceOf(SegmentAnalytics);
  });
});
