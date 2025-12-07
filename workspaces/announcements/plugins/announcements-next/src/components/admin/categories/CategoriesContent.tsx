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
import { useMemo } from 'react';
import {
  CreateCategoryRequest,
  useCategories,
  AnnouncementsApi,
} from '@backstage-community/plugin-announcements-react';
import { Category } from '@backstage-community/plugin-announcements-common';

import { CategoriesForm } from './CategoriesForm';
import { EntityContent } from '../shared';

export const CategoriesContent = () => {
  const { categories, loading, error, retry } = useCategories();

  const config = useMemo(
    () => ({
      useEntityHook: () => ({
        items: categories ?? [],
        loading,
        error,
        retry,
      }),
      createEntity: async (
        api: AnnouncementsApi,
        request: CreateCategoryRequest,
      ) => {
        await api.createCategory(request);
      },
      deleteEntity: async (api: AnnouncementsApi, slug: string) => {
        await api.deleteCategory(slug);
      },
      FormComponent: CategoriesForm,
      translationKeys: {
        createButton: 'admin.categoriesContent.createButton',
        cancelButton: 'admin.categoriesContent.cancelButton',
        dialogTitle: 'categoriesForm.newCategory',
        createdMessage: 'admin.categoriesContent.createdMessage',
        deletedMessage: 'admin.categoriesContent.table.categoryDeleted',
        noItemsFound: 'admin.categoriesContent.table.noCategoriesFound',
        table: {
          title: 'admin.categoriesContent.table.title',
          slug: 'admin.categoriesContent.table.slug',
          actions: 'admin.categoriesContent.table.actions',
        },
      },
      tableTitle: 'Categories',
      deleteDialogType: 'category' as const,
    }),
    [categories, loading, error, retry],
  );

  return <EntityContent<Category, CreateCategoryRequest> config={config} />;
};
