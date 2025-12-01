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
import type { SetStateAction } from 'react';
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
    value: SetStateAction<{
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
        <TagsInput setForm={mockSetForm} form={mockForm} />
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

    const input = screen.getByRole('combobox');
    await userEvent.click(input);

    await waitFor(() => {
      const options = screen.getAllByRole('option', { hidden: true });
      expect(options.length).toBe(2);

      expect(options[0]).toHaveTextContent('Kubernetes');
      expect(options[1]).toHaveTextContent('Docker');
    });
  });

  it('should set tag when a tag is selected', async () => {
    await render();

    const input = screen.getByRole('combobox');
    await userEvent.click(input);

    await waitFor(() => {
      const options = screen.getAllByRole('option', { hidden: true });
      expect(options.length).toBe(2);
    });

    const options = screen.getAllByRole('option', { hidden: true });
    await userEvent.click(options[0]);

    expect(mockSetForm).toHaveBeenCalledWith({
      ...mockForm,
      tags: ['kubernetes'],
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
      tags: ['new tag'],
    });
  });

  it('should clear tags when null is selected', async () => {
    const mockFormWithTag = {
      ...mockForm,
      tags: ['kubernetes'],
    };

    await renderInTestApp(
      <TestApiProvider apis={[[announcementsApiRef, announcementsApiMock]]}>
        <TagsInput setForm={mockSetForm} form={mockFormWithTag} />
      </TestApiProvider>,
    );

    const tagChip = await screen.findByText('Kubernetes');
    expect(tagChip).toBeInTheDocument();

    const deleteButton = screen.getByTitle('Clear');
    await userEvent.click(deleteButton);

    expect(mockSetForm).toHaveBeenCalledWith({
      ...mockFormWithTag,
      tags: [],
    });
  });
});
