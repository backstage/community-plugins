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

import {
  Announcement,
  Category,
} from '@backstage-community/plugin-announcements-common';
import { announcementsApiRef } from '@backstage-community/plugin-announcements-react';
import { alertApiRef, identityApiRef } from '@backstage/core-plugin-api';
import { renderInTestApp, TestApiProvider } from '@backstage/test-utils';
import { screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { catalogApiRef } from '@backstage/plugin-catalog-react';

import { AnnouncementForm } from './AnnouncementForm';

const mockCategories: Category[] = [
  { slug: 'platform-updates', title: 'Platform Updates' },
  { slug: 'security', title: 'Security' },
  { slug: 'maintenance', title: 'Maintenance' },
];

const createMockAnnouncementsApi = (
  categories: Category[] = mockCategories,
  loading: boolean = false,
) => {
  const categoriesMock = loading
    ? jest.fn().mockImplementation(() => new Promise(() => {}))
    : jest.fn().mockResolvedValue(categories);

  return {
    announcements: jest.fn().mockResolvedValue({
      count: 0,
      results: [],
    }),
    categories: categoriesMock,
    tags: jest.fn().mockResolvedValue([]),
    createCategory: jest.fn().mockResolvedValue({}),
  };
};

const mockAlertApi = {
  post: jest.fn(),
  alert$: jest.fn(),
};

const mockIdentityApi = {
  getBackstageIdentity: jest.fn().mockResolvedValue({
    userEntityRef: 'user:default/test-user',
  }),
};

const mockCatalogApi = {
  getEntities: async () => ({ items: [] }),
};

const renderAnnouncementForm = async ({
  active,
  category,
  categories = mockCategories,
  loading = false,
}: {
  active?: boolean;
  category?: Category;
  categories?: Category[];
  loading?: boolean;
} = {}) => {
  const mockAnnouncementsApi = createMockAnnouncementsApi(categories, loading);

  await renderInTestApp(
    <TestApiProvider
      apis={[
        [announcementsApiRef, mockAnnouncementsApi],
        [alertApiRef, mockAlertApi],
        [identityApiRef, mockIdentityApi],
        [catalogApiRef, mockCatalogApi],
      ]}
    >
      <AnnouncementForm
        initialData={{ active, category } as Announcement}
        onSubmit={jest.fn()}
      />
    </TestApiProvider>,
  );

  return mockAnnouncementsApi;
};

describe('AnnouncementForm', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe('category select', () => {
    it('renders disabled when categories are loading', async () => {
      await renderAnnouncementForm({ loading: true });

      await waitFor(() => {
        const select = screen.getByRole('button', {
          name: /Select a category/i,
        });
        expect(select).toBeInTheDocument();
        expect(select).toBeDisabled();
      });
    });

    it('renders disabled when no categories are available', async () => {
      await renderAnnouncementForm({ categories: [] });

      await waitFor(() => {
        const select = screen.getByRole('button', {
          name: /Select a category/i,
        });
        expect(select).toBeInTheDocument();
        expect(select).toBeDisabled();
      });
    });

    it('renders category select with categories available', async () => {
      await renderAnnouncementForm();

      const select = screen.getByRole('button', {
        name: /Select a category/i,
      });
      expect(select).toBeInTheDocument();
      expect(select).not.toBeDisabled();

      expect(screen.getByText('Platform Updates')).toBeInTheDocument();
      expect(screen.getByText('Security')).toBeInTheDocument();
      expect(screen.getByText('Maintenance')).toBeInTheDocument();
    });
  });

  describe('create category', () => {
    it('renders create category button', async () => {
      await renderAnnouncementForm();
      expect(
        screen.getByTestId('create-category-icon-button'),
      ).toBeInTheDocument();
    });

    it('creates a new category when submit button is clicked', async () => {
      const mockAnnouncementsApi = await renderAnnouncementForm();

      const createButton = screen.getByTestId('create-category-icon-button');
      expect(createButton).toBeInTheDocument();

      expect(screen.queryByRole('dialog')).not.toBeInTheDocument();
      await userEvent.click(createButton);
      expect(screen.getByRole('dialog')).toBeInTheDocument();
      expect(screen.getByText('New category')).toBeInTheDocument();
      expect(
        screen.getByRole('button', { name: 'Cancel' }),
      ).toBeInTheDocument();

      const submitButton = screen.getByTestId('title-submit-button');
      expect(submitButton).toBeDisabled();

      const titleInput = screen.getByTestId('title-input');
      expect(titleInput).toBeInTheDocument();
      await userEvent.type(
        titleInput.querySelector('input') as HTMLInputElement,
        'Baseball',
      );
      expect(submitButton).not.toBeDisabled();
      await userEvent.click(submitButton);
      expect(mockAnnouncementsApi.createCategory).toHaveBeenCalledWith({
        title: 'Baseball',
      });
    });

    it('closes create category dialog when cancel button is clicked', async () => {
      const mockAnnouncementsApi = await renderAnnouncementForm();

      await userEvent.click(screen.getByTestId('create-category-icon-button'));

      const titleInput = screen.getByTestId('title-input');
      expect(titleInput).toBeInTheDocument();
      await userEvent.type(
        titleInput.querySelector('input') as HTMLInputElement,
        'Baseball',
      );

      await userEvent.click(screen.getByRole('button', { name: 'Cancel' }));

      expect(titleInput).not.toBeInTheDocument();
      expect(mockAnnouncementsApi.createCategory).not.toHaveBeenCalledWith({
        title: 'Baseball',
      });
    });
  });

  describe('active switch', () => {
    it('renders "active" switch checked by default', async () => {
      await renderAnnouncementForm({});
      expect(screen.getByRole('checkbox', { name: 'Active' })).toBeChecked();
    });

    it('renders "active" switch checked when initial value is true', async () => {
      await renderAnnouncementForm({ active: true });
      expect(screen.getByRole('checkbox', { name: 'Active' })).toBeChecked();
    });

    it('renders "active" switch unchecked when initial value is false', async () => {
      await renderAnnouncementForm({ active: false });
      expect(
        screen.getByRole('checkbox', { name: 'Active' }),
      ).not.toBeChecked();
    });
  });
});
