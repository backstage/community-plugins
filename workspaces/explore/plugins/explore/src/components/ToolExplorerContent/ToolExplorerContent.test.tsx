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

import { ExploreTool } from '@backstage-community/plugin-explore-common';
import { renderInTestApp, TestApiProvider } from '@backstage/test-utils';
import { waitFor } from '@testing-library/react';
import React from 'react';
import { exploreApiRef } from '../../api';
import { ToolExplorerContent } from './ToolExplorerContent';

describe('<ToolExplorerContent />', () => {
  const exploreApi: jest.Mocked<typeof exploreApiRef.T> = {
    getTools: jest.fn(),
  };

  const Wrapper = ({ children }: { children?: React.ReactNode }) => (
    <TestApiProvider apis={[[exploreApiRef, exploreApi]]}>
      {children}
    </TestApiProvider>
  );

  beforeEach(() => {
    jest.resetAllMocks();
  });

  it('renders a grid of tools', async () => {
    const tools: ExploreTool[] = [
      {
        title: 'Lighthouse',
        description:
          "Google's Lighthouse tool is a great resource for benchmarking and improving the accessibility, performance, SEO, and best practices of your website.",
        url: '/lighthouse',
        image:
          'https://raw.githubusercontent.com/GoogleChrome/lighthouse/8b3d7f052b2e64dd857e741d7395647f487697e7/assets/lighthouse-logo.png',
        tags: ['web', 'seo', 'accessibility', 'performance'],
      },
      {
        title: 'Tech Radar',
        description:
          'Tech Radar is a list of technologies, complemented by an assessment result, called ring assignment.',
        url: '/tech-radar',
        image:
          'https://storage.googleapis.com/wf-blogs-engineering-media/2018/09/fe13bb32-wf-tech-radar-hero-1024x597.png',
        tags: ['standards', 'landscape'],
      },
    ];
    exploreApi.getTools.mockResolvedValue({ tools });

    const { getByText } = await renderInTestApp(
      <Wrapper>
        <ToolExplorerContent />
      </Wrapper>,
    );

    await waitFor(() => {
      expect(getByText('Lighthouse')).toBeInTheDocument();
      expect(getByText('Tech Radar')).toBeInTheDocument();
    });
  });

  it('renders a custom title', async () => {
    exploreApi.getTools.mockResolvedValue({ tools: [] });

    const { getByText } = await renderInTestApp(
      <Wrapper>
        <ToolExplorerContent title="Our Tools" />
      </Wrapper>,
    );

    await waitFor(() => expect(getByText('Our Tools')).toBeInTheDocument());
  });

  it('renders empty state', async () => {
    exploreApi.getTools.mockResolvedValue({ tools: [] });

    const { getByText } = await renderInTestApp(
      <Wrapper>
        <ToolExplorerContent />
      </Wrapper>,
    );

    await waitFor(() =>
      expect(getByText('No tools to display')).toBeInTheDocument(),
    );
  });
});
