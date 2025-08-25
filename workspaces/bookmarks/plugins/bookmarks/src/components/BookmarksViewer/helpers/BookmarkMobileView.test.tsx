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
import { act, screen, waitFor } from '@testing-library/react';
import { BookmarkMobileView } from './BookmarkMobileView';
import { TEST_IDS } from '../../../consts/testids';

describe('BookmarkMobileView', () => {
  it('should render the bookmark mobile view with all the required elements', async () => {
    await renderInTestApp(
      <BookmarkMobileView
        toc={<div data-testid="toc" />}
        openInNewTab={<div data-testid="openInNewTab" />}
        viewer={<div data-testid="viewer" />}
        nextButton={<div data-testid="nextButton" />}
        previousButton={<div data-testid="previousButton" />}
      />,
    );

    expect(
      screen.getByTestId(TEST_IDS.BookmarkMobileView.wrapper),
    ).toBeInTheDocument();
    expect(
      screen.getByTestId(TEST_IDS.BookmarkMobileView.toggleToc),
    ).toBeInTheDocument();
    expect(screen.getByTestId('openInNewTab')).toBeInTheDocument();
    expect(screen.getByTestId('viewer')).toBeInTheDocument();
    expect(screen.getByTestId('nextButton')).toBeInTheDocument();

    // toc is hidden by default and expanded by clicking the toggle
    expect(screen.queryByTestId('toc')).not.toBeInTheDocument();

    // we hide the previous button in mobile view
    expect(screen.queryByTestId('previousButton')).not.toBeInTheDocument();

    // clicking the toc toggle should open the drawer
    act(() => {
      screen.getByTestId(TEST_IDS.BookmarkMobileView.toggleToc).click();
    });
    expect(screen.getByTestId('toc')).toBeInTheDocument();

    // clicking the backdrop should close the drawer
    act(() => {
      screen.getByTestId(TEST_IDS.BookmarkMobileView.backdrop).click();
    });
    await waitFor(() => {
      expect(
        screen.queryByTestId(TEST_IDS.BookmarkMobileView.backdrop),
      ).not.toBeInTheDocument();
    });
    expect(screen.queryByTestId('toc')).not.toBeInTheDocument();
  });
});
