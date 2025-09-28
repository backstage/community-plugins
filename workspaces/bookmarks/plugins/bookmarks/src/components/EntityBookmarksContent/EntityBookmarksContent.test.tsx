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

import { useEntity } from '@backstage/plugin-catalog-react';
import { renderInTestApp } from '@backstage/test-utils';
import { screen } from '@testing-library/react';
import { EntityBookmarksContent } from './EntityBookmarksContent';

jest.mock('@backstage/plugin-catalog-react', () => ({
  useEntity: jest.fn(),
}));

const validBookmarks = { foo: { bar: 'https://example.com' } };
const useEntityMock = useEntity as jest.Mock;

describe('EntityBookmarksContent', () => {
  afterEach(() => {
    jest.clearAllMocks();
  });

  it('shows empty state when no bookmarks', async () => {
    useEntityMock.mockReturnValue({ entity: { metadata: {} } });
    await renderInTestApp(<EntityBookmarksContent />);
    expect(
      screen.getByText('entityBookmarksContent.notFound.title'),
    ).toBeInTheDocument();
    expect(
      screen.getByText('entityBookmarksContent.notFound.description'),
    ).toBeInTheDocument();
  });

  it('shows invalid format state when bookmarks are invalid', async () => {
    useEntityMock.mockReturnValue({
      entity: { metadata: { bookmarks: { foo: 123 } } },
    });
    await renderInTestApp(<EntityBookmarksContent />);
    expect(
      screen.getByText('entityBookmarksContent.invalid.title'),
    ).toBeInTheDocument();
    expect(
      screen.getByText('entityBookmarksContent.invalid.description'),
    ).toBeInTheDocument();
    expect(
      screen.queryByText('entityBookmarksContent.notFound.title'),
    ).not.toBeInTheDocument();
    expect(
      screen.queryByText('entityBookmarksContent.notFound.description'),
    ).not.toBeInTheDocument();
  });

  it('renders BookmarksViewer when bookmarks are valid', async () => {
    useEntityMock.mockReturnValue({
      entity: { metadata: { bookmarks: validBookmarks } },
    });
    await renderInTestApp(<EntityBookmarksContent />);

    expect(
      screen.queryByText('entityBookmarksContent.invalid.title'),
    ).not.toBeInTheDocument();
    expect(
      screen.queryByText('entityBookmarksContent.notFound.title'),
    ).not.toBeInTheDocument();
  });
});
