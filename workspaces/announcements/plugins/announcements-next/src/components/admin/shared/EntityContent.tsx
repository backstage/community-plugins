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
import { useState } from 'react';
import {
  ErrorPanel,
  Progress,
  Table,
  TableColumn,
} from '@backstage/core-components';
import {
  announcementsApiRef,
  useAnnouncementsTranslation,
  AnnouncementsApi,
} from '@backstage-community/plugin-announcements-react';
import { announcementCreatePermission } from '@backstage-community/plugin-announcements-common';
import { useApi, alertApiRef, AlertApi } from '@backstage/core-plugin-api';
import { RequirePermission } from '@backstage/plugin-permission-react';
import { ResponseError } from '@backstage/errors';
import DeleteIcon from '@material-ui/icons/Delete';
import { Button, Grid, IconButton, Typography } from '@material-ui/core';
import { Container } from '@backstage/ui';
import { DeleteConfirmationDialog } from './DeleteConfirmationDialog';
import { useDeleteConfirmationDialogState } from './useDeleteConfirmationDialogState';
import { useAnnouncementsPermissions } from './useAnnouncementsPermissions';

type EntityWithSlug = {
  slug: string;
  title: string;
};

type EntityContentConfig<T extends EntityWithSlug, TRequest> = {
  // Data fetching
  useEntityHook: () => {
    items: T[];
    loading: boolean;
    error: Error | undefined;
    retry: () => void;
  };

  // API methods
  createEntity: (api: AnnouncementsApi, request: TRequest) => Promise<void>;
  deleteEntity: (api: AnnouncementsApi, slug: string) => Promise<void>;

  // Form component
  FormComponent: React.ComponentType<{
    initialData: T;
    onSubmit: (data: TRequest) => Promise<void>;
  }>;

  // Translation keys
  translationKeys: {
    createButton: string;
    cancelButton: string;
    createdMessage: string;
    deletedMessage: string;
    noItemsFound: string;
    table: {
      title: string;
      slug: string;
      actions: string;
    };
    errors?: {
      alreadyExists?: string;
    };
  };

  // UI labels
  tableTitle: string;
  deleteDialogType: 'category' | 'tag';

  // Error handling
  handleCreateError?: (
    err: any,
    alertApi: AlertApi,
    t: (key: string) => string,
  ) => void;
};

type EntityContentProps<T extends EntityWithSlug, TRequest> = {
  config: EntityContentConfig<T, TRequest>;
};

export function EntityContent<
  T extends EntityWithSlug,
  TRequest extends { title: string },
>({ config }: EntityContentProps<T, TRequest>) {
  const {
    useEntityHook,
    createEntity,
    deleteEntity,
    FormComponent,
    translationKeys,
    tableTitle,
    deleteDialogType,
    handleCreateError,
  } = config;

  const [showForm, setShowForm] = useState(false);
  const { items, loading, error, retry: refresh } = useEntityHook();
  const announcementsApi = useApi(announcementsApiRef);
  const alertApi = useApi(alertApiRef);
  const { t } = useAnnouncementsTranslation();

  const {
    isOpen: isDeleteDialogOpen,
    open: openDeleteDialog,
    close: closeDeleteDialog,
    item: itemToDelete,
  } = useDeleteConfirmationDialogState<T>();

  const permissions = useAnnouncementsPermissions();

  const onSubmit = async (request: TRequest) => {
    const { title } = request;

    try {
      await createEntity(announcementsApi, request);

      alertApi.post({
        message: `${title} ${t(translationKeys.createdMessage)}`,
        severity: 'success',
      });

      setShowForm(false);
      refresh();
    } catch (err: any) {
      if (handleCreateError) {
        handleCreateError(err, alertApi, t);
      } else {
        alertApi.post({ message: (err as Error).message, severity: 'error' });
      }
    }
  };

  const onCreateButtonClick = () => {
    setShowForm(!showForm);
  };

  const onCancelDelete = () => {
    closeDeleteDialog();
  };

  const onConfirmDelete = async () => {
    closeDeleteDialog();

    try {
      await deleteEntity(announcementsApi, itemToDelete!.slug);

      alertApi.post({
        message: t(translationKeys.deletedMessage),
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

  const columns: TableColumn<T>[] = [
    {
      title: <Typography>{t(translationKeys.table.title)}</Typography>,
      sorting: true,
      field: 'title',
      render: rowData => rowData.title,
    },
    {
      title: <Typography>{t(translationKeys.table.slug)}</Typography>,
      sorting: true,
      field: 'slug',
      render: rowData => rowData.slug,
    },
    {
      title: <Typography>{t(translationKeys.table.actions)}</Typography>,
      render: rowData => {
        return (
          <IconButton
            aria-label="delete"
            disabled={permissions.delete.loading || !permissions.delete.allowed}
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
      <Container>
        <Grid container>
          <Grid item xs={12}>
            <Button
              disabled={
                permissions.create.loading || !permissions.create.allowed
              }
              variant="contained"
              onClick={onCreateButtonClick}
            >
              {showForm
                ? t(translationKeys.cancelButton)
                : t(translationKeys.createButton)}
            </Button>
          </Grid>

          {showForm && (
            <Grid item xs={12}>
              <FormComponent initialData={{} as T} onSubmit={onSubmit} />
            </Grid>
          )}

          <Grid item xs={12}>
            <Table
              title={tableTitle}
              options={{ pageSize: 20, search: true }}
              columns={columns}
              data={items ?? []}
              emptyContent={
                <Typography style={{ padding: 2, textAlign: 'center' }}>
                  {t(translationKeys.noItemsFound)}
                </Typography>
              }
            />
          </Grid>

          <DeleteConfirmationDialog
            type={deleteDialogType}
            open={isDeleteDialogOpen}
            onCancel={onCancelDelete}
            onConfirm={onConfirmDelete}
          />
        </Grid>
      </Container>
    </RequirePermission>
  );
}
