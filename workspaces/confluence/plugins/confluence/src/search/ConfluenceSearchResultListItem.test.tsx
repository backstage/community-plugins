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
import { screen } from '@testing-library/react';
import { renderInTestApp } from '@backstage/test-utils';
import {
  ConfluenceSearchResultListItem,
  maxExcerptLength,
} from './ConfluenceSearchResultListItem';

const mockResult = {
  location: '/test-location',
  title: 'Getting Started Developer Portal',
  text: 'COE',
  spaceName: 'SWCOE',
  lastModified: '2024-02-22',
  lastModifiedFriendly: '22 Feb 2024',
  lastModifiedBy: 'Test User',
  ancestors: [
    {
      title: 'Ancestor Title',
      location: '/ancestor-location',
    },
  ],
};

describe('<ConfluenceSearchResultListItem/>', () => {
  it('should render without exploding', async () => {
    await renderInTestApp(
      <ConfluenceSearchResultListItem result={mockResult} />,
    );
    expect(
      screen.getByText(/Getting Started Developer Portal/i),
    ).toBeInTheDocument();
    expect(screen.getByText(/Ancestor Title/i)).toBeInTheDocument();
    expect(
      screen.getByText(/Getting Started Developer Portal/i).closest('a'),
    ).toHaveAttribute('href', '/test-location');
  });

  it('should render last modified details', async () => {
    await renderInTestApp(
      <ConfluenceSearchResultListItem result={mockResult} />,
    );
    expect(
      screen.getByText(/Last Updated: 22 Feb 2024 by Test User/i),
    ).toBeInTheDocument();
  });

  it('should render text', async () => {
    await renderInTestApp(
      <ConfluenceSearchResultListItem result={mockResult} />,
    );
    expect(screen.getByText(/Developer Portal/i)).toBeInTheDocument();
    expect(screen.getByText(/COE/i)).toBeInTheDocument();
  });

  it('should not render if result is not provided', async () => {
    const { container } = await renderInTestApp(
      <ConfluenceSearchResultListItem result={undefined} />,
    );
    expect(container.firstChild).toBeNull();
  });

  it('should render highlighted title and text when highlight prop is provided', async () => {
    const highlight = {
      fields: {
        title: 'Highlighted Title',
        text: 'Highlighted Text',
      },
      preTag: '<xyz>',
      postTag: '</xyz>',
    };

    await renderInTestApp(
      <ConfluenceSearchResultListItem
        result={mockResult}
        highlight={highlight}
      />,
    );

    expect(screen.getByText(/Highlighted Title/i)).toBeInTheDocument();
    expect(screen.getByText(/Highlighted Text/i)).toBeInTheDocument();
  });

  it('should render maxExcerptLength of the result text (instead of a full wall of text)', async () => {
    const longResult = {
      location: '/test-location',
      title: 'Getting Started Developer Portal',
      text: 'a'.repeat(1000000),
      spaceName: 'SWCOE',
      lastModified: '2024-02-22',
      lastModifiedFriendly: '22 Feb 2024',
      lastModifiedBy: 'Test User',
      ancestors: [
        {
          title: 'Ancestor Title',
          location: '/ancestor-location',
        },
      ],
    };

    await renderInTestApp(
      <ConfluenceSearchResultListItem result={longResult} />,
    );
    const truncatedExcerpt = `${'a'.repeat(maxExcerptLength)}...`;

    expect(
      screen.getByText(new RegExp(truncatedExcerpt, 'i')),
    ).toBeInTheDocument();
  });

  it('should render maxExcerptLength of the text which includes a highlighted portion (instead of a full wall of text)', async () => {
    const preTag = '<xyz>';
    const postTag = '</xyz>';
    const highlight = {
      fields: {
        title: 'Highlighted Title',
        text:
          'a'.repeat(1000) +
          preTag +
          'b'.repeat(100) +
          postTag +
          'c'.repeat(1000),
      },
      preTag: preTag,
      postTag: postTag,
    };

    await renderInTestApp(
      <ConfluenceSearchResultListItem
        result={mockResult}
        highlight={highlight}
      />,
    );
    // Should start at the pretag, and stop after maxExcerptLength. Includes ellipses since text is longer than the excerpt.
    const highlightedExcerpt = 'b'.repeat(100);
    const remainingExcerpt = `${'c'.repeat(
      maxExcerptLength -
        highlightedExcerpt.length -
        preTag.length -
        postTag.length,
    )}...`;

    expect(screen.getByText(/Highlighted Title/i)).toBeInTheDocument();
    expect(
      screen.getByText(new RegExp(highlightedExcerpt, 'i')),
    ).toBeInTheDocument();
    expect(
      screen.getByText(new RegExp(remainingExcerpt, 'i')),
    ).toBeInTheDocument();
  });
});
