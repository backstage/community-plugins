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
import React from 'react';
import { screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { TestApiProvider, renderInTestApp } from '@backstage/test-utils';
import TagsInput from './TagsInput';
import { announcementsApiRef } from '@backstage-community/plugin-announcements-react';

const tags = [
  { title: 'Kubernetes', slug: 'kubernetes' },
  { title: 'Docker', slug: 'docker' },
];

jest.mock('@backstage-community/plugin-announcements-react', () => ({
  ...jest.requireActual('@backstage-community/plugin-announcements-react'),
  useTags: () => {
    return {
      tags,
      loading: false,
      error: undefined,
      retry: jest.fn(),
    };
  },
}));

describe('TagsInput', () => {
  const mockSetForm: (
    value: React.SetStateAction<{
      category: string | undefined;
      id: string;
      publisher: string;
      title: string;
      excerpt: string;
      body: string;
      created_at: string;
      active: boolean;
      start_at: string;
      tags: string[] | undefined;
    }>,
  ) => void = jest.fn();

  const mockForm = {
    category: 'category',
    id: 'id',
    publisher: 'publisher',
    title: 'title',
    excerpt: 'excerpt',
    body: 'body',
    created_at: 'created_at',
    active: true,
    start_at: 'start_at',
    tags: undefined,
  };

  const announcementsApiMock = { tags: jest.fn() };

  const render = async () => {
    await renderInTestApp(
      <TestApiProvider apis={[[announcementsApiRef, announcementsApiMock]]}>
        <TagsInput setForm={mockSetForm} form={mockForm} initialValue="" />
      </TestApiProvider>,
    );
  };

  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('should render the TagsInput component', async () => {
    await render();

    await waitFor(() => {
      screen.getByRole('combobox');
    });

    const autocomplete = screen.getByRole('combobox');

    expect(autocomplete).toBeInTheDocument();
    expect(screen.getByLabelText('Tags')).toBeInTheDocument();

    await userEvent.click(autocomplete);

    const expectedOption1 = screen.getByRole('option', {
      name: tags[0].title,
    });

    const expectedOption2 = screen.getByRole('option', {
      name: tags[1].title,
    });

    expect(expectedOption1).toBeInTheDocument();
    expect(expectedOption2).toBeInTheDocument();

    expect(expectedOption1.textContent).toEqual('Kubernetes');
    expect(expectedOption2.textContent).toEqual('Docker');
  });

  it('should set tag when a tag is selected', async () => {
    await render();

    await waitFor(() => {
      screen.getByRole('combobox');
    });

    const autocomplete = screen.getByRole('combobox');

    await userEvent.click(autocomplete);

    const expectedOption = screen.getByRole('option', {
      name: tags[0].title,
    });

    await userEvent.click(expectedOption);

    expect(mockSetForm).toHaveBeenCalledWith({
      ...mockForm,
      tags: ['Kubernetes'],
    });
  });

  it('should set tag when a new tag is created', async () => {
    await render();

    await waitFor(() => {
      screen.getByRole('combobox');
    });

    const autocomplete = screen.getByRole('combobox');
    const newTagMock = 'New Tag';

    await userEvent.click(autocomplete);
    await userEvent.type(autocomplete, newTagMock);
    await userEvent.click(screen.getByText(`Create "${newTagMock}"`));

    expect(mockSetForm).toHaveBeenCalledWith({
      ...mockForm,
      tags: ['New Tag'],
    });
  });

  it('should clear tags when null is selected', async () => {
    await render();

    await waitFor(() => {
      screen.getByRole('combobox');
    });

    const autocomplete = screen.getByRole('combobox');

    await userEvent.click(autocomplete);
    const option = screen.getByRole('option', { name: tags[0].title });
    await userEvent.click(option);

    await userEvent.click(autocomplete);
    await userEvent.clear(autocomplete);

    await userEvent.click(document.body);

    expect(mockSetForm).toHaveBeenCalledWith({
      ...mockForm,
      tags: [],
    });
  });

  it('should show loading indicator when tags are loading', async () => {
    jest
      .spyOn(
        require('@backstage-community/plugin-announcements-react'),
        'useTags',
      )
      .mockReturnValue({
        tags: [],
        loading: true,
        error: undefined,
        retry: jest.fn(),
      });

    await render();

    await waitFor(() => {
      const circularProgress = screen.getByRole('progressbar');
      expect(circularProgress).toBeInTheDocument();
    });
  });
});
