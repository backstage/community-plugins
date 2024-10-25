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
import React, { useState } from 'react';
import {
  Page,
  Header,
  Content,
  Table,
  TableColumn,
  ErrorPanel,
} from '@backstage/core-components';
import AddIcon from '@mui/icons-material/Add';
import DeleteIcon from '@mui/icons-material/Delete';
import { NewCategoryDialog } from '../NewCategoryDialog';
import { useCategories } from '@backstage-community/plugin-announcements-react';
import { Category } from '@backstage-community/plugin-announcements-common';
import { useDeleteCategoryDialogState } from './useDeleteCategoryDialogState';
import { alertApiRef, useApi } from '@backstage/core-plugin-api';
import { announcementsApiRef } from '@backstage-community/plugin-announcements-react';
import { DeleteCategoryDialog } from './DeleteCategoryDialog';
import { ResponseError } from '@backstage/errors';
import IconButton from '@mui/material/IconButton';
import Typography from '@mui/material/Typography';

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

      alertApi.post({ message: 'Category deleted.', severity: 'success' });
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
      title: 'Slug',
      field: 'slug',
      highlight: true,
    },
    {
      title: 'Title',
      field: 'title',
    },
    {
      title: 'Actions',
      field: 'actions',
      render: category => {
        return (
          <IconButton onClick={() => openDeleteDialog(category)} size="large">
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
            tooltip: 'Add',
            isFreeAction: true,
            onClick: _event => setNewCategoryDialogOpen(true),
          },
        ]}
        emptyContent={<Typography p={2}>No categories found</Typography>}
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
};

export const CategoriesPage = (props: CategoriesPageProps) => {
  return (
    <Page themeId={props.themeId}>
      <Header title="Categories" subtitle="Manage announcement categories" />

      <Content>
        <CategoriesTable />
      </Content>
    </Page>
  );
};
