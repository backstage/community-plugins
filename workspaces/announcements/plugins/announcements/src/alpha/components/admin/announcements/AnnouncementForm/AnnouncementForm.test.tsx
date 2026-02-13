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
  Tag,
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

const mockTags: Tag[] = [
  { slug: 'important', title: 'Important' },
  { slug: 'urgent', title: 'Urgent' },
  { slug: 'general', title: 'General' },
];

const createMockAnnouncementsApi = (
  categories: Category[] = mockCategories,
  categoriesLoading: boolean = false,
  tags: Tag[] = mockTags,
  tagsLoading: boolean = false,
) => {
  const categoriesMock = categoriesLoading
    ? jest.fn().mockImplementation(() => new Promise(() => {}))
    : jest.fn().mockResolvedValue(categories);

  const tagsMock = tagsLoading
    ? jest.fn().mockImplementation(() => new Promise(() => {}))
    : jest.fn().mockResolvedValue(tags);

  return {
    announcements: jest.fn().mockResolvedValue({
      count: 0,
      results: [],
    }),
    categories: categoriesMock,
    tags: tagsMock,
    createCategory: jest.fn().mockResolvedValue({}),
    createTag: jest.fn().mockResolvedValue(undefined),
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
  categoriesLoading = false,
  tags = mockTags,
  tagsLoading = false,
  initialTags,
  onSubmit: onSubmitProp,
}: {
  active?: boolean;
  category?: Category;
  categories?: Category[];
  categoriesLoading?: boolean;
  tags?: Tag[];
  tagsLoading?: boolean;
  initialTags?: Tag[];
  onSubmit?: jest.Mock;
} = {}) => {
  const mockAnnouncementsApi = createMockAnnouncementsApi(
    categories,
    categoriesLoading,
    tags,
    tagsLoading,
  );
  const onSubmit = onSubmitProp ?? jest.fn();

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
        initialData={
          { active, category, tags: initialTags ?? null } as Announcement
        }
        onSubmit={onSubmit}
      />
    </TestApiProvider>,
  );

  return { mockAnnouncementsApi, onSubmit };
};

describe('AnnouncementForm', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe('category select', () => {
    it('renders disabled when categories are loading', async () => {
      await renderAnnouncementForm({ categoriesLoading: true });

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

  describe('tags select', () => {
    it('renders disabled when tags are loading', async () => {
      await renderAnnouncementForm({ tagsLoading: true });

      await waitFor(() => {
        const select = screen.getByRole('button', {
          name: /Select tags/i,
        });
        expect(select).toBeInTheDocument();
        expect(select).toBeDisabled();
      });
    });

    it('renders disabled when no tags are available', async () => {
      await renderAnnouncementForm({ tags: [] });

      await waitFor(() => {
        const select = screen.getByRole('button', {
          name: /Select tags/i,
        });
        expect(select).toBeInTheDocument();
        expect(select).toBeDisabled();
      });
    });

    it('renders tags select with tags available', async () => {
      await renderAnnouncementForm();

      await waitFor(() => {
        const select = screen.getByRole('button', {
          name: /Select tags/i,
        });
        expect(select).toBeInTheDocument();
        expect(select).not.toBeDisabled();
      });

      expect(screen.getByText('Important')).toBeInTheDocument();
      expect(screen.getByText('Urgent')).toBeInTheDocument();
      expect(screen.getByText('General')).toBeInTheDocument();
    });
  });

  describe('create tag', () => {
    it('renders create tag button', async () => {
      await renderAnnouncementForm();
      expect(screen.getByTestId('create-tag-icon-button')).toBeInTheDocument();
    });

    it('creates a new tag when dialog submit is clicked', async () => {
      const { mockAnnouncementsApi } = await renderAnnouncementForm();

      const createButton = screen.getByTestId('create-tag-icon-button');
      expect(createButton).toBeInTheDocument();

      expect(screen.queryByRole('dialog')).not.toBeInTheDocument();
      await userEvent.click(createButton);
      expect(screen.getByRole('dialog')).toBeInTheDocument();
      expect(screen.getByText('New tag')).toBeInTheDocument();
      expect(
        screen.getByRole('button', { name: 'Cancel' }),
      ).toBeInTheDocument();

      const submitButton = screen.getByTestId('title-submit-button');
      expect(submitButton).toBeDisabled();

      const titleInput = screen.getByTestId('title-input');
      expect(titleInput).toBeInTheDocument();
      await userEvent.type(
        titleInput.querySelector('input') as HTMLInputElement,
        'Breaking',
      );
      expect(submitButton).not.toBeDisabled();
      await userEvent.click(submitButton);
      expect(mockAnnouncementsApi.createTag).toHaveBeenCalledWith({
        title: 'Breaking',
      });
    });

    it('closes create tag dialog when cancel button is clicked', async () => {
      const { mockAnnouncementsApi } = await renderAnnouncementForm();

      await userEvent.click(screen.getByTestId('create-tag-icon-button'));

      const titleInput = screen.getByTestId('title-input');
      expect(titleInput).toBeInTheDocument();
      await userEvent.type(
        titleInput.querySelector('input') as HTMLInputElement,
        'Breaking',
      );

      await userEvent.click(screen.getByRole('button', { name: 'Cancel' }));

      expect(screen.queryByRole('dialog')).not.toBeInTheDocument();
      expect(mockAnnouncementsApi.createTag).not.toHaveBeenCalled();
    });
  });

  describe('form submit with tags', () => {
    it('includes selected tag slugs in submit request when initial tags are set', async () => {
      const { onSubmit } = await renderAnnouncementForm({
        initialTags: [mockTags[0], mockTags[1]],
      });

      const titleInput = screen.getByRole('textbox', { name: /Title/i });
      await userEvent.type(titleInput, 'Test announcement');

      const excerptInput = screen.getByRole('textbox', { name: /Excerpt/i });
      await userEvent.type(excerptInput, 'Short excerpt');

      const bodyEditor = document.querySelector('.w-md-editor-text-input');
      if (bodyEditor) {
        await userEvent.type(bodyEditor as HTMLElement, 'Body content');
      }

      await userEvent.click(screen.getByRole('button', { name: 'Submit' }));

      await waitFor(() => {
        expect(onSubmit).toHaveBeenCalledWith(
          expect.objectContaining({
            tags: ['important', 'urgent'],
          }),
        );
      });
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
      const { mockAnnouncementsApi } = await renderAnnouncementForm();

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
      const { mockAnnouncementsApi } = await renderAnnouncementForm();

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
      expect(screen.getByRole('switch', { name: 'Active' })).toBeChecked();
    });

    it('renders "active" switch checked when initial value is true', async () => {
      await renderAnnouncementForm({ active: true });
      expect(screen.getByRole('switch', { name: 'Active' })).toBeChecked();
    });

    it('renders "active" switch unchecked when initial value is false', async () => {
      await renderAnnouncementForm({ active: false });
      expect(screen.getByRole('switch', { name: 'Active' })).not.toBeChecked();
    });
  });
});
