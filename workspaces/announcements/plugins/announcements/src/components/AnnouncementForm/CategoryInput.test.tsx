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
import { SetStateAction } from 'react';
import { screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { TestApiProvider, renderInTestApp } from '@backstage/test-utils';
import CategoryInput from './CategoryInput';
import { announcementsApiRef } from '@backstage-community/plugin-announcements-react';

const categories = [
  { title: 'Hello', slug: 'hello' },
  { title: 'World', slug: 'world' },
];

jest.mock('@backstage-community/plugin-announcements-react', () => ({
  ...jest.requireActual('@backstage-community/plugin-announcements-react'),
  useCategories: () => {
    return {
      categories,
      loading: false,
      error: undefined,
      retry: jest.fn(),
    };
  },
}));

describe('CategoryInput', () => {
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
    tags: ['kubernetes', 'go'],
  };

  const announcementsApiMock = { categories: jest.fn() };

  const render = async () => {
    await renderInTestApp(
      <TestApiProvider apis={[[announcementsApiRef, announcementsApiMock]]}>
        <CategoryInput setForm={mockSetForm} form={mockForm} initialValue="" />
      </TestApiProvider>,
    );
  };

  it('should render the CategoryInput component', async () => {
    await render();

    await waitFor(() => {
      screen.getByRole('combobox');
    });

    const autocomplete = screen.getByRole('combobox');

    expect(autocomplete).toBeInTheDocument();
    expect(screen.getByLabelText('Category')).toBeInTheDocument();

    await userEvent.click(autocomplete);

    const expectedOption1 = screen.getByRole('option', {
      name: categories[0].title,
    });

    const expectedOption2 = screen.getByRole('option', {
      name: categories[1].title,
    });

    expect(expectedOption1).toBeInTheDocument();
    expect(expectedOption2).toBeInTheDocument();

    expect(expectedOption1.textContent).toEqual('Hello');
    expect(expectedOption2.textContent).toEqual('World');
  });

  it('should set category when a category is selected', async () => {
    await render();

    await waitFor(() => {
      screen.getByRole('combobox');
    });

    const autocomplete = screen.getByRole('combobox');

    await userEvent.click(autocomplete);

    const expectedOption = screen.getByRole('option', {
      name: categories[0].title,
    });

    await userEvent.click(expectedOption);

    expect(mockSetForm).toHaveBeenCalledWith({
      ...mockForm,
      category: 'Hello',
    });
  });

  it('should set category when a new category is created', async () => {
    await render();

    await waitFor(() => {
      screen.getByRole('combobox');
    });

    const autocomplete = screen.getByRole('combobox');
    const newCategoryMock = 'New Category';

    await userEvent.click(autocomplete);
    await userEvent.type(autocomplete, 'New Category');
    await userEvent.click(screen.getByText(`Create "${newCategoryMock}"`));

    expect(mockSetForm).toHaveBeenCalledWith({
      ...mockForm,
      category: 'New Category',
    });
  });
});
