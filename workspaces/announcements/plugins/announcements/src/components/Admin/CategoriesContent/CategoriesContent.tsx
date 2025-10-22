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
import {
  ErrorPanel,
  Progress,
  Table,
  TableColumn,
} from '@backstage/core-components';
import {
  CreateCategoryRequest,
  announcementsApiRef,
  useAnnouncementsTranslation,
  useCategories,
} from '@backstage-community/plugin-announcements-react';
import {
  announcementCreatePermission,
  announcementDeletePermission,
  Category,
} from '@backstage-community/plugin-announcements-common';
import { CategoriesForm } from '../../CategoriesForm';
import { useApi, alertApiRef } from '@backstage/core-plugin-api';
import {
  RequirePermission,
  usePermission,
} from '@backstage/plugin-permission-react';
import { useDeleteCategoryDialogState } from '../../CategoriesPage/useDeleteCategoryDialogState';
import { ResponseError } from '@backstage/errors';
import { DeleteCategoryDialog } from '../../CategoriesPage/DeleteCategoryDialog';
import { Button, Grid, IconButton, Typography } from '@material-ui/core';
import DeleteIcon from '@material-ui/icons/Delete';

export const CategoriesContent = () => {
  const [showNewCategoryForm, setShowNewCategoryForm] = useState(false);
  const { categories, loading, error, retry: refresh } = useCategories();
  const announcementsApi = useApi(announcementsApiRef);
  const alertApi = useApi(alertApiRef);
  const { t } = useAnnouncementsTranslation();

  const {
    isOpen: isDeleteDialogOpen,
    open: openDeleteDialog,
    close: closeDeleteDialog,
    category: categoryToDelete,
  } = useDeleteCategoryDialogState();

  const { loading: loadingCreatePermission, allowed: canCreateCategory } =
    usePermission({
      permission: announcementCreatePermission,
    });

  const { loading: loadingDeletePermission, allowed: canDeleteAnnouncement } =
    usePermission({
      permission: announcementDeletePermission,
    });

  const onSubmit = async (request: CreateCategoryRequest) => {
    const { title } = request;

    try {
      await announcementsApi.createCategory({
        title,
      });

      alertApi.post({
        message: `${title} ${t('admin.categoriesContent.createdMessage')}`,
        severity: 'success',
      });

      refresh();
    } catch (err) {
      alertApi.post({ message: (err as Error).message, severity: 'error' });
    }
  };

  const onCreateButtonClick = () => {
    setShowNewCategoryForm(!showNewCategoryForm);
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

  if (loading) {
    return <Progress />;
  }
  if (error) {
    return <ErrorPanel error={error} />;
  }

  const columns: TableColumn<Category>[] = [
    {
      title: (
        <Typography>{t('admin.categoriesContent.table.title')}</Typography>
      ),
      sorting: true,
      field: 'title',
      render: rowData => rowData.title,
    },
    {
      title: <Typography>{t('admin.categoriesContent.table.slug')}</Typography>,
      sorting: true,
      field: 'slug',
      render: rowData => rowData.slug,
    },
    {
      title: (
        <Typography>{t('admin.categoriesContent.table.actions')}</Typography>
      ),
      render: rowData => {
        return (
          <IconButton
            aria-label="delete"
            disabled={loadingDeletePermission || !canDeleteAnnouncement}
            onClick={() => openDeleteDialog(rowData)}
          >
            <DeleteIcon fontSize="small" data-testid="delete-icon" />
          </IconButton>
        );
      },
    },
  ];

  return (
    <RequirePermission permission={announcementCreatePermission}>
      <Grid container>
        <Grid item xs={12}>
          <Button
            disabled={loadingCreatePermission || !canCreateCategory}
            variant="contained"
            onClick={() => onCreateButtonClick()}
          >
            {showNewCategoryForm
              ? t('admin.categoriesContent.cancelButton')
              : t('admin.categoriesContent.createButton')}
          </Button>
        </Grid>

        {showNewCategoryForm && (
          <Grid item xs={12}>
            <CategoriesForm initialData={{} as Category} onSubmit={onSubmit} />
          </Grid>
        )}

        <Grid item xs={12}>
          <Table
            title="Categories"
            options={{ pageSize: 20, search: true }}
            columns={columns}
            data={categories ?? []}
            emptyContent={
              <Typography style={{ padding: 2, textAlign: 'center' }}>
                {t('admin.categoriesContent.table.noCategoriesFound')}
              </Typography>
            }
          />
        </Grid>

        <DeleteCategoryDialog
          open={isDeleteDialogOpen}
          onCancel={onCancelDelete}
          onConfirm={onConfirmDelete}
        />
      </Grid>
    </RequirePermission>
  );
};
