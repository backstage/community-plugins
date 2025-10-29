/*
 * Copyright 2025 The Backstage Authors
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

import { renderInTestApp } from '@backstage/test-utils';
import { screen } from '@testing-library/react';
import { BookmarksViewer } from './BookmarksViewer';
import { TEST_IDS } from '../../consts/testids';
import { useIsDesktop } from '../../hooks/useIsDesktop';
import { act } from 'react';

jest.mock('../../hooks/useIsDesktop', () => ({
  useIsDesktop: jest.fn(),
}));

const mockUseIsDesktop = useIsDesktop as jest.Mock;

const simpleTree = {
  foo: {
    bar: 'https://example.com/bar',
    baz: 'https://example.com/baz',
  },
};

const complexTree = {
  foo: {
    bar: {
      baz: 'https://example.com/baz',
      qux: 'https://example.com/qux',
    },
    quux1: 'https://example.com/quux1',
    quux2: 'https://example.com/quux2',
    quux3: 'https://example.com/quux3',
  },
  quuz: {
    corge: 'https://example.com/corge',
    grault: 'https://example.com/grault',
    garply: 'https://example.com/garply',
  },
};

const flattenedComplexTree = [
  { label: 'baz', href: 'https://example.com/baz' },
  { label: 'qux', href: 'https://example.com/qux' },
  { label: 'quux1', href: 'https://example.com/quux1' },
  { label: 'quux2', href: 'https://example.com/quux2' },
  { label: 'quux3', href: 'https://example.com/quux3' },
  { label: 'corge', href: 'https://example.com/corge' },
  { label: 'grault', href: 'https://example.com/grault' },
  { label: 'garply', href: 'https://example.com/garply' },
];

describe('BookmarksViewer', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('renders viewer, TOC, and navigation buttons', async () => {
    mockUseIsDesktop.mockReturnValue(true);

    await renderInTestApp(<BookmarksViewer tree={simpleTree} />);
    expect(
      screen.getByTestId(TEST_IDS.BookmarkViewerFrame.iframe),
    ).toBeInTheDocument();
    expect(
      screen.getByTestId(TEST_IDS.TableOfContents.wrapper),
    ).toBeInTheDocument();
    expect(
      screen.queryByTestId(TEST_IDS.NavButton.previous),
    ).not.toBeInTheDocument();
    expect(screen.getByTestId(TEST_IDS.NavButton.next)).toBeInTheDocument();
    expect(
      screen.getByTestId(TEST_IDS.BookmarksViewer.newTab),
    ).toBeInTheDocument();

    // when clicking the next button, the previous button should be enabled
    act(() => {
      screen.getByTestId(TEST_IDS.NavButton.next).click();
    });
    expect(screen.getByTestId(TEST_IDS.NavButton.previous)).toBeEnabled();
    expect(
      screen.queryByTestId(TEST_IDS.NavButton.next),
    ).not.toBeInTheDocument();
  });

  it('renders open in new tab button with correct href', async () => {
    await renderInTestApp(<BookmarksViewer tree={simpleTree} />);
    const openTabButton = screen.getByTestId(TEST_IDS.BookmarksViewer.newTab);
    expect(openTabButton).toHaveAttribute('href', 'https://example.com/bar');
    expect(openTabButton).toHaveAttribute('target', '_blank');
  });

  it('has correct next and previous labels', async () => {
    mockUseIsDesktop.mockReturnValue(true);

    await renderInTestApp(<BookmarksViewer tree={complexTree} />);

    const iframe = screen.queryByTestId(TEST_IDS.BookmarkViewerFrame.iframe);
    const tableOfContents = screen.getByTestId(
      TEST_IDS.TableOfContents.wrapper,
    );

    /* forwards */
    // i = 0
    expect(
      screen.queryByTestId(TEST_IDS.NavButton.previous),
    ).not.toBeInTheDocument();
    expect(screen.getByTestId(TEST_IDS.NavButton.next)).toHaveTextContent(
      flattenedComplexTree[1].label,
    );
    expect(tableOfContents).toHaveTextContent(flattenedComplexTree[1].label);
    expect(iframe).toHaveAttribute('src', flattenedComplexTree[0].href);

    act(() => {
      screen.getByTestId(TEST_IDS.NavButton.next).click(); // i ++
    });

    // i = 1 to i = last - 1
    for (let i = 1; i < flattenedComplexTree.length - 1; i++) {
      expect(tableOfContents).toHaveTextContent(flattenedComplexTree[i].label);
      expect(screen.getByTestId(TEST_IDS.NavButton.previous)).toBeEnabled();
      expect(screen.getByTestId(TEST_IDS.NavButton.next)).toHaveTextContent(
        flattenedComplexTree[i + 1].label,
      );
      expect(iframe).toHaveAttribute('src', flattenedComplexTree[i].href);

      act(() => {
        screen.getByTestId(TEST_IDS.NavButton.next).click(); // i ++
      });
    }

    // i = last
    expect(screen.getByTestId(TEST_IDS.NavButton.previous)).toBeEnabled();
    expect(
      screen.queryByTestId(TEST_IDS.NavButton.next),
    ).not.toBeInTheDocument();
    expect(tableOfContents).toHaveTextContent(
      flattenedComplexTree[flattenedComplexTree.length - 1].label,
    );
    expect(iframe).toHaveAttribute(
      'src',
      flattenedComplexTree[flattenedComplexTree.length - 1].href,
    );

    /* backwards */
    // i = last
    act(() => {
      screen.getByTestId(TEST_IDS.NavButton.previous).click(); // i --
    });

    // i = last - 1 to i = 1
    for (let i = flattenedComplexTree.length - 2; i > 0; i--) {
      expect(screen.getByTestId(TEST_IDS.NavButton.previous)).toBeEnabled();
      expect(screen.getByTestId(TEST_IDS.NavButton.next)).toHaveTextContent(
        flattenedComplexTree[i + 1].label,
      );
      expect(tableOfContents).toHaveTextContent(flattenedComplexTree[i].label);
      expect(iframe).toHaveAttribute('src', flattenedComplexTree[i].href);

      act(() => {
        screen.getByTestId(TEST_IDS.NavButton.previous).click(); // i --
      });
    }

    // i = 0
    expect(
      screen.queryByTestId(TEST_IDS.NavButton.previous),
    ).not.toBeInTheDocument();
    expect(screen.getByTestId(TEST_IDS.NavButton.next)).toHaveTextContent(
      flattenedComplexTree[1].label,
    );
    expect(tableOfContents).toHaveTextContent(flattenedComplexTree[0].label);
    expect(iframe).toHaveAttribute('src', flattenedComplexTree[0].href);
  });
});
