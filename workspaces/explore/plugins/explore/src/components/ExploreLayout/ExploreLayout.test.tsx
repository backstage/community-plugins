/*
 * Copyright 2020 The Backstage Authors
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

import { FeatureFlagged } from '@backstage/core-app-api';
import {
  FeatureFlagsApi,
  featureFlagsApiRef,
} from '@backstage/core-plugin-api';
import { renderInTestApp, TestApiProvider } from '@backstage/test-utils';
import { waitFor } from '@testing-library/react';
import type { ReactNode } from 'react';
import { ExploreLayout } from './ExploreLayout';
import { exploreRouteRef } from '../../routes';

const featureFlagsApi: jest.Mocked<FeatureFlagsApi> = {
  isActive: jest.fn(),
  save: jest.fn(),
  getRegisteredFlags: jest.fn(),
  registerFlag: jest.fn(),
};

describe('<ExploreLayout />', () => {
  const Wrapper = ({ children }: { children?: ReactNode }) => (
    <TestApiProvider apis={[[featureFlagsApiRef, featureFlagsApi]]}>
      {children}
    </TestApiProvider>
  );

  const mountedRoutes = {
    mountedRoutes: {
      '/explore': exploreRouteRef,
    },
  };

  afterEach(() => {
    jest.resetAllMocks();
  });

  it('renders an explore tabbed layout page with defaults', async () => {
    const { getByText } = await renderInTestApp(
      <Wrapper>
        <ExploreLayout>
          <ExploreLayout.Route path="/tools" title="Tools">
            <div>Tools Content</div>
          </ExploreLayout.Route>
        </ExploreLayout>
      </Wrapper>,
      mountedRoutes,
    );

    await waitFor(() => {
      expect(getByText('Explore our ecosystem')).toBeInTheDocument();
    });
  });

  it('renders a custom page title', async () => {
    const { getByText } = await renderInTestApp(
      <Wrapper>
        <ExploreLayout title="Explore our universe">
          <ExploreLayout.Route path="/tools" title="Tools">
            <div>Tools Content</div>
          </ExploreLayout.Route>
        </ExploreLayout>
      </Wrapper>,
      mountedRoutes,
    );

    await waitFor(() =>
      expect(getByText('Explore our universe')).toBeInTheDocument(),
    );
  });

  it('renders feature flagged route', async () => {
    featureFlagsApi.isActive.mockReturnValue(true);

    const { getByText } = await renderInTestApp(
      <Wrapper>
        <ExploreLayout>
          <FeatureFlagged with="test-flag">
            <ExploreLayout.Route path="/tools" title="Tools">
              <div>Tools Content</div>
            </ExploreLayout.Route>
          </FeatureFlagged>
          <FeatureFlagged without="test-flag">
            <ExploreLayout.Route path="/tools-v2" title="Tools V2">
              <div>Tools V2 Content</div>
            </ExploreLayout.Route>
          </FeatureFlagged>
        </ExploreLayout>
      </Wrapper>,
      mountedRoutes,
    );

    await waitFor(() => expect(getByText('Tools')).toBeInTheDocument());
  });

  it('skips feature flagged route', async () => {
    featureFlagsApi.isActive.mockReturnValue(false);

    const { getByText } = await renderInTestApp(
      <Wrapper>
        <ExploreLayout>
          <FeatureFlagged with="test-flag">
            <ExploreLayout.Route path="/tools" title="Tools">
              <div>Tools Content</div>
            </ExploreLayout.Route>
          </FeatureFlagged>
          <FeatureFlagged without="test-flag">
            <ExploreLayout.Route path="/tools-v2" title="Tools V2">
              <div>Tools V2 Content</div>
            </ExploreLayout.Route>
          </FeatureFlagged>
        </ExploreLayout>
      </Wrapper>,
      mountedRoutes,
    );

    await waitFor(() => expect(getByText('Tools V2')).toBeInTheDocument());
  });
});
