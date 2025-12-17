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
import { useState, useMemo } from 'react';
import { ErrorPanel, Progress } from '@backstage/core-components';
import {
  CreateCategoryRequest,
  announcementsApiRef,
  useAnnouncementsTranslation,
  useCategories,
  useAnnouncementsPermissions,
} from '@backstage-community/plugin-announcements-react';
import {
  announcementCreatePermission,
  Category,
} from '@backstage-community/plugin-announcements-common';
import { useApi, alertApiRef } from '@backstage/core-plugin-api';
import { RequirePermission } from '@backstage/plugin-permission-react';
import { ResponseError } from '@backstage/errors';
import {
  Button,
  Grid,
  Table,
  TableHeader,
  Column,
  TableBody,
  Row,
  CellText,
  TablePagination,
  Card,
  CardBody,
} from '@backstage/ui';

import {
  useDeleteConfirmationDialogState,
  DeleteConfirmationDialog,
  TitleForm,
} from '../shared';

export const CategoriesContent = () => {
  const [showNewCategoryForm, setShowNewCategoryForm] = useState(false);
  const [pageSize, setPageSize] = useState(20);
  const [offset, setOffset] = useState(0);
  const { categories, loading, error, retry: refresh } = useCategories();
  const announcementsApi = useApi(announcementsApiRef);
  const alertApi = useApi(alertApiRef);
  const { t } = useAnnouncementsTranslation();

  const {
    isOpen: isDeleteDialogOpen,
    open: openDeleteDialog,
    close: closeDeleteDialog,
    item: categoryToDelete,
  } = useDeleteConfirmationDialogState<Category>();

  const permissions = useAnnouncementsPermissions();

  const translationKeys = {
    new: t('categoriesForm.newCategory'),
    edit: t('categoriesForm.editCategory'),
    titleLabel: t('categoriesForm.titleLabel'),
    submit: t('categoriesForm.submit'),
  };

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

  // Paginate categories
  const paginatedCategories = useMemo(() => {
    const start = offset;
    const end = offset + pageSize;
    return categories.slice(start, end);
  }, [categories, offset, pageSize]);

  if (loading) {
    return <Progress />;
  }
  if (error) {
    return <ErrorPanel error={error} />;
  }

  return (
    <RequirePermission permission={announcementCreatePermission}>
      <Grid.Root columns="1">
        <Grid.Item colSpan="1">
          <Button
            isDisabled={
              permissions.create.loading || !permissions.create.allowed
            }
            onClick={() => onCreateButtonClick()}
          >
            {showNewCategoryForm
              ? t('admin.categoriesContent.cancelButton')
              : t('admin.categoriesContent.createButton')}
          </Button>
        </Grid.Item>

        {showNewCategoryForm && (
          <Grid.Item colSpan="1">
            <TitleForm<Category>
              translationKeys={translationKeys}
              onSubmit={onSubmit}
            />
          </Grid.Item>
        )}

        <Grid.Item colSpan="1">
          <Grid.Root columns="1">
            <Grid.Item colSpan="1">
              <Card>
                <CardBody>
                  <Table>
                    <TableHeader>
                      <Column id="title" allowsSorting isRowHeader>
                        {t('admin.categoriesContent.table.title')}
                      </Column>
                      <Column id="slug" allowsSorting>
                        {t('admin.categoriesContent.table.slug')}
                      </Column>
                    </TableHeader>
                    <TableBody>
                      {paginatedCategories.length === 0 ? (
                        <Row>
                          <CellText
                            colSpan={2}
                            title={t(
                              'admin.categoriesContent.table.noCategoriesFound',
                            )}
                          />
                        </Row>
                      ) : (
                        paginatedCategories.map(category => (
                          <Row key={category.slug} id={category.slug}>
                            <CellText title={category.title} />
                            <CellText title={category.slug} />
                          </Row>
                        ))
                      )}
                    </TableBody>
                  </Table>
                </CardBody>
              </Card>
            </Grid.Item>

            {categories.length > 0 && (
              <Grid.Item colSpan="1">
                <TablePagination
                  offset={offset}
                  pageSize={pageSize}
                  setOffset={setOffset}
                  setPageSize={setPageSize}
                  rowCount={categories.length}
                />
              </Grid.Item>
            )}
          </Grid.Root>
        </Grid.Item>

        <DeleteConfirmationDialog
          type="category"
          open={isDeleteDialogOpen}
          onCancel={onCancelDelete}
          onConfirm={onConfirmDelete}
        />
      </Grid.Root>
    </RequirePermission>
  );
};
