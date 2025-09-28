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
import { BookmarkViewerFrame } from './BookmarkViewerFrame';
import { TEST_IDS } from '../../../consts/testids';
import { useIsIframeLoading } from '../../../hooks/useIsIframeLoading';

jest.mock('../../../hooks/useIsIframeLoading', () => ({
  useIsIframeLoading: jest.fn(),
}));

const mockUseIsIframeLoading = useIsIframeLoading as jest.Mock;

describe('BookmarkViewerFrame', () => {
  afterEach(() => {
    jest.clearAllMocks();
  });

  it('shows loading spinner when iframe is loading', async () => {
    process.env.NODE_ENV = 'production';
    mockUseIsIframeLoading.mockReturnValue(true);
    await renderInTestApp(<BookmarkViewerFrame src="https://example.com" />);
    expect(screen.getByRole('progressbar')).toBeInTheDocument();
    const iframe = screen.getByTestId(TEST_IDS.BookmarkViewerFrame.iframe);
    expect(iframe).toHaveStyle('visibility: hidden');
    expect(iframe).toHaveAttribute('src', 'https://example.com');
    expect(
      screen.queryByText('bookmarkViewerFrame.devModeWarning'),
    ).not.toBeInTheDocument();
  });

  it('shows iframe when not loading', async () => {
    mockUseIsIframeLoading.mockReturnValue(false);
    await renderInTestApp(<BookmarkViewerFrame src="https://example.com" />);
    expect(screen.queryByRole('progressbar')).not.toBeInTheDocument();
    const iframe = screen.getByTestId(TEST_IDS.BookmarkViewerFrame.iframe);
    expect(iframe).toHaveStyle('visibility: visible');
    expect(iframe).toHaveAttribute('src', 'https://example.com');
  });

  it('shows dev mode warning in development', async () => {
    process.env.NODE_ENV = 'development';
    mockUseIsIframeLoading.mockReturnValue(true);
    await renderInTestApp(<BookmarkViewerFrame src="https://example.com" />);
    expect(
      screen.getByText('bookmarkViewerFrame.devModeWarning'),
    ).toBeInTheDocument();
  });
});
