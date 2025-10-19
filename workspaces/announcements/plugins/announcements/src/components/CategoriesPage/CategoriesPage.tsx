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
  Page,
  Header,
  Content,
  Table,
  TableColumn,
  ErrorPanel,
} from '@backstage/core-components';
import { NewCategoryDialog } from '../NewCategoryDialog';
import {
  useAnnouncementsTranslation,
  useCategories,
  announcementsApiRef,
} from '@backstage-community/plugin-announcements-react';
import {
  announcementCreatePermission,
  Category,
} from '@backstage-community/plugin-announcements-common';
import { useDeleteCategoryDialogState } from './useDeleteCategoryDialogState';
import { alertApiRef, useApi } from '@backstage/core-plugin-api';
import { DeleteCategoryDialog } from './DeleteCategoryDialog';
import { ResponseError } from '@backstage/errors';
import { IconButton, Typography } from '@material-ui/core';
import AddIcon from '@material-ui/icons/Add';
import DeleteIcon from '@material-ui/icons/Delete';
import { usePermission } from '@backstage/plugin-permission-react';
import { ContextMenu } from '../AnnouncementsPage/ContextMenu';

const CategoriesTable = () => {
  const [newCategoryDialogOpen, setNewCategoryDialogOpen] = useState(false);
  const announcementsApi = useApi(announcementsApiRef);
  const alertApi = useApi(alertApiRef);

  const { categories, loading, error, retry: refresh } = useCategories();

  const {
    isOpen: isDeleteDialogOpen,
    open: openDeleteDialog,
    close: closeDeleteDialog,
    category: categoryToDelete,
  } = useDeleteCategoryDialogState();
  const { t } = useAnnouncementsTranslation();

  if (error) {
    return <ErrorPanel error={error} />;
  }

  const onNewCategoryDialogClose = () => {
    setNewCategoryDialogOpen(false);
    refresh();
  };

  const onCancelDelete = () => {
    closeDeleteDialog();
  };
  const onConfirmDelete = async () => {
    closeDeleteDialog();

    try {
      await announcementsApi.deleteCategory(categoryToDelete!.slug);

      alertApi.post({
        message: t('categoriesTable.categoryDeleted'),
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

  const columns: TableColumn<Category>[] = [
    {
      title: t('categoriesTable.slug'),
      field: 'slug',
      highlight: true,
    },
    {
      title: t('categoriesTable.title'),
      field: 'title',
    },
    {
      title: t('categoriesTable.actions'),
      field: 'actions',
      render: category => {
        return (
          <IconButton onClick={() => openDeleteDialog(category)}>
            <DeleteIcon />
          </IconButton>
        );
      },
    },
  ];

  return (
    <>
      <Table
        options={{ paging: false }}
        data={categories || []}
        columns={columns}
        isLoading={loading}
        title="Categories"
        actions={[
          {
            icon: () => <AddIcon />,
            tooltip: t('categoriesTable.addTooltip'),
            isFreeAction: true,
            onClick: _event => setNewCategoryDialogOpen(true),
          },
        ]}
        emptyContent={
          <Typography style={{ padding: 2, textAlign: 'center' }}>
            {t('categoriesTable.noCategoriesFound')}
          </Typography>
        }
      />
      <NewCategoryDialog
        open={newCategoryDialogOpen}
        onClose={onNewCategoryDialogClose}
      />
      <DeleteCategoryDialog
        open={isDeleteDialogOpen}
        onCancel={onCancelDelete}
        onConfirm={onConfirmDelete}
      />
    </>
  );
};

type CategoriesPageProps = {
  themeId: string;
  hideContextMenu?: boolean;
};

export const CategoriesPage = (props: CategoriesPageProps) => {
  const { t } = useAnnouncementsTranslation();
  const { allowed: canCreate } = usePermission({
    permission: announcementCreatePermission,
  });
  const { themeId, hideContextMenu = false } = props;

  return (
    <Page themeId={themeId}>
      <Header
        title={t('categoriesPage.title')}
        subtitle={t('categoriesPage.subtitle')}
      >
        {!hideContextMenu && canCreate && <ContextMenu />}
      </Header>

      <Content>
        <CategoriesTable />
      </Content>
    </Page>
  );
};
