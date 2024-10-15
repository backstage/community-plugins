import React, { useState } from 'react';
import {
  Page,
  Header,
  Content,
  Table,
  TableColumn,
  ErrorPanel,
} from '@backstage/core-components';
import { Button, IconButton, makeStyles } from '@material-ui/core';
import AddIcon from '@material-ui/icons/Add';
import DeleteIcon from '@material-ui/icons/Delete';
import { NewCategoryDialog } from '../NewCategoryDialog';
import { useCategories } from '@backstage-community/plugin-announcements-react';
import { Category } from '@backstage-community/plugin-announcements-common';
import { useDeleteCategoryDialogState } from './useDeleteCategoryDialogState';
import { alertApiRef, useApi } from '@backstage/core-plugin-api';
import { announcementsApiRef } from '@backstage-community/plugin-announcements-react';
import { DeleteCategoryDialog } from './DeleteCategoryDialog';
import { ResponseError } from '@backstage/errors';

const useStyles = makeStyles(theme => ({
  container: {
    width: 850,
  },
  empty: {
    padding: theme.spacing(1),
    display: 'flex',
    justifyContent: 'center',
    flexDirection: 'column',
    textAlign: 'center',
  },
}));

const CategoriesTable = () => {
  const classes = useStyles();
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
            tooltip: 'Add',
            isFreeAction: true,
            onClick: _event => setNewCategoryDialogOpen(true),
          },
        ]}
        emptyContent={
          <div className={classes.empty}>
            <p>No category was created yet.</p>
            <p>
              <Button
                color="primary"
                variant="outlined"
                onClick={() => setNewCategoryDialogOpen(true)}
              >
                Add category
              </Button>
            </p>
          </div>
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
