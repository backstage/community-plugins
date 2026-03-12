/*
 * Copyright 2023 The Backstage Authors
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
  createExtensionTester,
  renderInTestApp,
  TestApiProvider,
} from '@backstage/frontend-test-utils';
import { screen } from '@testing-library/react';
import { techRadarPage } from './alpha';
import { techRadarApiRef } from './api';
import { DefaultTechRadarApi } from './defaultApi';

describe('TechRadarPage', () => {
  const discoveryApi = {
    getBaseUrl: jest.fn().mockResolvedValue('https://example.com'),
  };
  const fetchApi = {
    fetch: jest.fn().mockResolvedValue({
      ok: true,
      json: jest.fn().mockResolvedValue([]),
    }),
  };
  const identityApi = {
    getProfileInfo: jest.fn(),
    getBackstageIdentity: jest.fn(),
    async getCredentials() {
      return { token: 'fake-jwt-token' };
    },
    signOut: jest.fn(),
  };
  beforeAll(() => {
    Object.defineProperty(window.SVGElement.prototype, 'getBBox', {
      value: () => ({ width: 100, height: 100 }),
      configurable: true,
    });
  });

  it('renders without exploding', async () => {
    renderInTestApp(
      <TestApiProvider
        apis={[
          [
            techRadarApiRef,
            new DefaultTechRadarApi({ discoveryApi, fetchApi, identityApi }),
          ] as const,
        ]}
      >
        {createExtensionTester(techRadarPage).reactElement()}
      </TestApiProvider>,
    );

    await expect(screen.findByText('Tech Radar')).resolves.toBeInTheDocument();
  });
});
