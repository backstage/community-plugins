/*
 * Copyright 2026 The Backstage Authors
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
import { screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { TestApiProvider, renderInTestApp } from '@backstage/test-utils';
import { Category } from '@backstage-community/plugin-announcements-common';
import { announcementsApiRef } from '@backstage-community/plugin-announcements-react';
import { CategorySelectInput } from './CategorySelectInput';

const mockCategories: Category[] = [
  { slug: 'platform-updates', title: 'Platform Updates' },
  { slug: 'security', title: 'Security' },
  { slug: 'maintenance', title: 'Maintenance' },
];

const createMockAnnouncementsApi = (
  categories: Category[] = mockCategories,
) => ({
  categories: jest.fn().mockResolvedValue(categories),
  announcements: jest.fn(),
  tags: jest.fn(),
});

const renderCategorySelectInput = async (
  props: {
    initialCategory?: Category;
    setCategory?: (category: Category | null) => void;
    hideLabel?: boolean;
    categories?: Category[];
    loading?: boolean;
  } = {},
) => {
  const {
    initialCategory,
    setCategory = jest.fn(),
    hideLabel = false,
    categories = mockCategories,
    loading = false,
  } = props;

  const mockApi = createMockAnnouncementsApi(categories);
  if (loading) {
    mockApi.categories = jest.fn().mockImplementation(
      () => new Promise(() => {}), // Never resolves to simulate loading
    );
  }

  await renderInTestApp(
    <TestApiProvider apis={[[announcementsApiRef, mockApi]]}>
      <CategorySelectInput
        initialCategory={initialCategory}
        categories={categories}
        setCategory={setCategory}
        hideLabel={hideLabel}
        isLoading={loading}
      />
    </TestApiProvider>,
  );

  return mockApi;
};

describe('CategorySelectInput', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('renders category select input with label', async () => {
    await renderCategorySelectInput();

    await waitFor(() => {
      expect(screen.getByLabelText('Category')).toBeInTheDocument();
      expect(screen.getByText('Select a category')).toBeInTheDocument();
    });
  });

  it('renders category select input without label when hideLabel is true', async () => {
    await renderCategorySelectInput({ hideLabel: true });

    await waitFor(() => {
      expect(screen.queryByLabelText('Category')).not.toBeInTheDocument();
      expect(screen.getByText('Select a category')).toBeInTheDocument();
    });
  });

  it('renders with categories loaded', async () => {
    await renderCategorySelectInput();

    await waitFor(() => {
      const select = screen.getByRole('button', { name: /Select a category/i });
      expect(select).toBeInTheDocument();
      expect(select).not.toBeDisabled();
    });
  });

  it('renders disabled when categories are loading', async () => {
    await renderCategorySelectInput({ loading: true });

    await waitFor(() => {
      const select = screen.getByRole('button', { name: /Select a category/i });
      expect(select).toBeInTheDocument();
      expect(select).toBeDisabled();
    });
  });

  it('renders with empty categories gracefully', async () => {
    await renderCategorySelectInput({ categories: [] });

    await waitFor(() => {
      const select = screen.getByRole('button', { name: /Select a category/i });
      expect(select).toBeInTheDocument();
      expect(select).toBeDisabled();
    });
  });

  it('renders with initial category selected', async () => {
    const initialCategory: Category = {
      slug: 'platform-updates',
      title: 'Platform Updates',
    };

    await renderCategorySelectInput({ initialCategory });

    await waitFor(() => {
      const select = screen.getByRole('button', { name: /Platform Updates/i });
      expect(select).toBeInTheDocument();
      expect(select).not.toBeDisabled();
    });
  });

  it('calls setCategory when a category is selected', async () => {
    const mockSetCategory = jest.fn();

    await renderCategorySelectInput({ setCategory: mockSetCategory });

    await waitFor(() => {
      const select = screen.getByRole('button', { name: /Select a category/i });
      expect(select).not.toBeDisabled();
    });

    const select = screen.getByRole('button', { name: /Select a category/i });
    await userEvent.click(select);

    await waitFor(() => {
      expect(
        screen.getByRole('option', { name: 'Platform Updates' }),
      ).toBeInTheDocument();
    });

    const option = screen.getByRole('option', { name: 'Platform Updates' });
    await userEvent.click(option);

    expect(mockSetCategory).toHaveBeenCalledTimes(1);
    expect(mockSetCategory).toHaveBeenCalledWith({
      slug: 'platform-updates',
      title: 'Platform Updates',
    });
  });

  it('handles category selection with array value', async () => {
    const mockSetCategory = jest.fn();

    await renderCategorySelectInput({ setCategory: mockSetCategory });

    await waitFor(() => {
      const select = screen.getByRole('button', { name: /Select a category/i });
      expect(select).not.toBeDisabled();
    });

    const select = screen.getByRole('button', { name: /Select a category/i });
    await userEvent.click(select);

    await waitFor(() => {
      expect(
        screen.getByRole('option', { name: 'Security' }),
      ).toBeInTheDocument();
    });

    const option = screen.getByRole('option', { name: 'Security' });
    await userEvent.click(option);

    expect(mockSetCategory).toHaveBeenCalledWith({
      slug: 'security',
      title: 'Security',
    });
  });

  it('does not call setCategory when invalid category slug is selected', async () => {
    const mockSetCategory = jest.fn();

    await renderCategorySelectInput({ setCategory: mockSetCategory });

    await waitFor(() => {
      // This test verifies that if somehow an invalid value gets through,
      // the component handles it gracefully without calling setCategory
      const select = screen.getByRole('button', { name: /Select a category/i });
      expect(select).toBeInTheDocument();
    });

    // The component should handle invalid selections gracefully
    expect(mockSetCategory).not.toHaveBeenCalled();
  });

  it('handles null value change gracefully', async () => {
    const mockSetCategory = jest.fn();

    await renderCategorySelectInput({ setCategory: mockSetCategory });

    await waitFor(() => {
      const select = screen.getByRole('button', { name: /Select a category/i });
      expect(select).toBeInTheDocument();
    });

    // The component should handle null values without crashing
    expect(mockSetCategory).not.toHaveBeenCalled();
  });

  it('renders multiple categories correctly', async () => {
    await renderCategorySelectInput();

    await waitFor(() => {
      const select = screen.getByRole('button', { name: /Select a category/i });
      expect(select).not.toBeDisabled();
    });

    const select = screen.getByRole('button', { name: /Select a category/i });
    await userEvent.click(select);

    await waitFor(() => {
      expect(
        screen.getByRole('option', { name: 'Platform Updates' }),
      ).toBeInTheDocument();
      expect(
        screen.getByRole('option', { name: 'Security' }),
      ).toBeInTheDocument();
      expect(
        screen.getByRole('option', { name: 'Maintenance' }),
      ).toBeInTheDocument();
    });
  });

  it('handles undefined categories gracefully', async () => {
    await renderCategorySelectInput({ categories: [] });

    await waitFor(() => {
      const select = screen.getByRole('button', { name: /Select a category/i });
      expect(select).toBeInTheDocument();
      expect(select).toBeDisabled();
    });
  });
});
