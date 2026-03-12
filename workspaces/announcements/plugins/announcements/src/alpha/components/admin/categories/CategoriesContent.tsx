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
import { useState } from 'react';
import { useApi, alertApiRef } from '@backstage/core-plugin-api';
import { ResponseError } from '@backstage/errors';
import {
  CreateCategoryRequest,
  announcementsApiRef,
  useAnnouncementsTranslation,
  useCategories,
  useAnnouncementsPermissions,
} from '@backstage-community/plugin-announcements-react';
import { Category } from '@backstage-community/plugin-announcements-common';

import {
  useDeleteConfirmationDialogState,
  DeleteConfirmationDialog,
} from '../shared';
import { CreateCategoryDialog } from './CreateCategoryDialog';
import { CategoriesTableCard } from './CategoriesTableCard';

/**
 * @internal
 */
export const CategoriesContent = () => {
  const announcementsApi = useApi(announcementsApiRef);
  const alertApi = useApi(alertApiRef);

  const [showNewCategoryForm, setShowNewCategoryForm] = useState(false);
  const { t } = useAnnouncementsTranslation();
  const permissions = useAnnouncementsPermissions();

  const { categories, retry: refresh } = useCategories();

  const {
    isOpen: isDeleteDialogOpen,
    close: closeDeleteDialog,
    open: openDeleteDialog,
    item: categoryToDelete,
  } = useDeleteConfirmationDialogState<Category>();

  const onConfirmCreate = async (request: CreateCategoryRequest) => {
    const { title } = request;

    try {
      await announcementsApi.createCategory({
        title,
      });

      alertApi.post({
        message: `${title} ${t('admin.categoriesContent.createdMessage')}`,
        severity: 'success',
      });

      setShowNewCategoryForm(false);
      refresh();
    } catch (err) {
      alertApi.post({ message: (err as Error).message, severity: 'error' });
    }
  };

  const onCreateButtonClick = () => {
    setShowNewCategoryForm(true);
  };

  const onCancelCreate = () => {
    setShowNewCategoryForm(false);
  };

  const onCancelDelete = () => {
    closeDeleteDialog();
  };

  const onConfirmDelete = async () => {
    closeDeleteDialog();

    try {
      await announcementsApi.deleteCategory(categoryToDelete!.slug);

      alertApi.post({
        message: t('admin.categoriesContent.table.categoryDeleted'),
        severity: 'success',
      });
    } catch (err) {
      alertApi.post({
        message: (err as ResponseError).body.error.message,
        severity: 'error',
      });
    }

    refresh();
  };

  const onDeleteClick = (category: Category) => {
    openDeleteDialog(category);
  };

  const canCreate = !permissions.create.loading && permissions.create.allowed;
  const canDelete = !permissions.delete.loading && permissions.delete.allowed;

  return (
    <>
      <CategoriesTableCard
        categories={categories ?? []}
        onCreateClick={onCreateButtonClick}
        onDeleteClick={onDeleteClick}
        canCreate={canCreate}
        canDelete={canDelete}
      />

      <CreateCategoryDialog
        open={showNewCategoryForm}
        onConfirm={onConfirmCreate}
        onCancel={onCancelCreate}
        canSubmit={canCreate}
      />

      <DeleteConfirmationDialog
        type="category"
        itemTitle={categoryToDelete?.title}
        open={isDeleteDialogOpen}
        onCancel={onCancelDelete}
        onConfirm={onConfirmDelete}
        canDelete={canDelete}
      />
    </>
  );
};
