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
} from '@backstage/frontend-plugin-api';
import type { OAuthApi } from '@backstage/core-plugin-api';
import {
  createExtensionTester,
  mockApis,
  renderTestApp,
} from '@backstage/frontend-test-utils';
import { screen } from '@testing-library/react';

import { GitReleaseClient } from './api/GitReleaseClient';
import { gitReleaseManagerApiRef } from './api/serviceApiRef';
import { gitReleaseManagerApi, gitReleaseManagerPage } from './frontendPlugin';
import { rootRouteRef } from './routes';

jest.mock('./GitReleaseManager', () => ({
  GitReleaseManager: () => (
    <section aria-label="Git Release Manager content">
      <h1>Git Release Manager</h1>
    </section>
  ),
}));

describe('git release manager frontend plugin behavior', () => {
  it('creates the API client from the app APIs', () => {
    const factory = createExtensionTester(gitReleaseManagerApi).get(
      ApiBlueprint.dataRefs.factory,
    );

    expect(factory.api).toBe(gitReleaseManagerApiRef);
    const githubAuthApi: OAuthApi = {
      getAccessToken: jest.fn(),
    };
    expect(
      factory.factory({
        configApi: mockApis.config(),
        githubAuthApi,
      }),
    ).toBeInstanceOf(GitReleaseClient);
  });

  it('registers a navigable page without adding a second page header', async () => {
    const tester = createExtensionTester(gitReleaseManagerPage);

    expect(tester.get(coreExtensionData.routePath)).toBe(
      '/git-release-manager',
    );
    expect(tester.get(coreExtensionData.routeRef)).toBe(rootRouteRef);
    expect(tester.get(coreExtensionData.title)).toBe('Git Release Manager');
    expect(tester.get(coreExtensionData.icon)).toBeDefined();

    renderTestApp({
      extensions: [gitReleaseManagerPage],
      initialRouteEntries: ['/git-release-manager'],
    });
    await screen.findByRole('region', {
      name: 'Git Release Manager content',
    });
    expect(
      screen.getAllByRole('heading', {
        name: 'Git Release Manager',
        level: 1,
      }),
    ).toHaveLength(1);
  });
});
