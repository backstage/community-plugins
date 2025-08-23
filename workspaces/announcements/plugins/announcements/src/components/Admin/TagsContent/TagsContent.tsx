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
  CreateTagRequest,
  announcementsApiRef,
  useAnnouncementsTranslation,
  useTags,
} from '@backstage-community/plugin-announcements-react';
import {
  announcementCreatePermission,
  announcementDeletePermission,
  Tag,
} from '@backstage-community/plugin-announcements-common';
import { TagsForm } from '../../TagsForm';
import { useApi, alertApiRef } from '@backstage/core-plugin-api';
import {
  RequirePermission,
  usePermission,
} from '@backstage/plugin-permission-react';
import { useDeleteTagDialogState } from '../../TagsPage/useDeleteTagDialogState';
import { ResponseError } from '@backstage/errors';
import { DeleteTagDialog } from '../../TagsPage/DeleteTagDialog';
import { Button, Grid, IconButton, Typography } from '@material-ui/core';
import DeleteIcon from '@material-ui/icons/Delete';

export const TagsContent = () => {
  const [showNewTagForm, setShowNewTagForm] = useState(false);
  const { tags, loading, error, retry: refresh } = useTags();
  const announcementsApi = useApi(announcementsApiRef);
  const alertApi = useApi(alertApiRef);
  const { t } = useAnnouncementsTranslation();

  const {
    isOpen: isDeleteDialogOpen,
    open: openDeleteDialog,
    close: closeDeleteDialog,
    tag: tagToDelete,
  } = useDeleteTagDialogState();

  const { loading: loadingCreatePermission, allowed: canCreateTag } =
    usePermission({
      permission: announcementCreatePermission,
    });

  const { loading: loadingDeletePermission, allowed: canDeleteAnnouncement } =
    usePermission({
      permission: announcementDeletePermission,
    });

  const onSubmit = async (request: CreateTagRequest) => {
    const { title } = request;

    try {
      await announcementsApi.createTag({
        title,
      });

      alertApi.post({
        message: `${title} ${t('admin.tagsContent.createdMessage')}`,
        severity: 'success',
      });

      refresh();
    } catch (err: any) {
      if (err.response?.status === 409) {
        alertApi.post({
          message: t('admin.tagsContent.errors.alreadyExists'),
          severity: 'error',
        });
      } else {
        alertApi.post({
          message: (err as Error).message,
          severity: 'error',
        });
      }
    }
  };

  const onCreateButtonClick = () => {
    setShowNewTagForm(!showNewTagForm);
  };

  const onCancelDelete = () => {
    closeDeleteDialog();
  };

  const onConfirmDelete = async () => {
    closeDeleteDialog();

    try {
      await announcementsApi.deleteTag(tagToDelete!.slug);

      alertApi.post({
        message: t('admin.tagsContent.table.tagDeleted'),
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

  const columns: TableColumn<Tag>[] = [
    {
      title: <Typography>{t('admin.tagsContent.table.title')}</Typography>,
      sorting: true,
      field: 'title',
      render: rowData => rowData.title,
    },
    {
      title: <Typography>{t('admin.tagsContent.table.slug')}</Typography>,
      sorting: true,
      field: 'slug',
      render: rowData => rowData.slug,
    },
    {
      title: <Typography>{t('admin.tagsContent.table.actions')}</Typography>,
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
            disabled={loadingCreatePermission || !canCreateTag}
            variant="contained"
            onClick={() => onCreateButtonClick()}
          >
            {showNewTagForm
              ? t('admin.tagsContent.cancelButton')
              : t('admin.tagsContent.createButton')}
          </Button>
        </Grid>

        {showNewTagForm && (
          <Grid item xs={12}>
            <TagsForm initialData={{} as Tag} onSubmit={onSubmit} />
          </Grid>
        )}

        <Grid item xs={12}>
          <Table
            title="Tags"
            options={{ pageSize: 20, search: true }}
            columns={columns}
            data={tags ?? []}
            emptyContent={
              <Typography style={{ padding: 2 }}>
                {t('admin.tagsContent.table.noTagsFound')}
              </Typography>
            }
          />
        </Grid>

        <DeleteTagDialog
          open={isDeleteDialogOpen}
          onCancel={onCancelDelete}
          onConfirm={onConfirmDelete}
        />
      </Grid>
    </RequirePermission>
  );
};
