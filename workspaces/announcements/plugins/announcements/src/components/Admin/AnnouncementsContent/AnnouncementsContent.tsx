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
import {
  ErrorPanel,
  Progress,
  Table,
  TableColumn,
  StatusOK,
  StatusPending,
} from '@backstage/core-components';
import { alertApiRef, useApi } from '@backstage/core-plugin-api';
import {
  announcementsApiRef,
  CreateAnnouncementRequest,
  useAnnouncementsTranslation,
  useCategories,
  useAnnouncementsPermissions,
} from '@backstage-community/plugin-announcements-react';
import {
  Announcement,
  announcementCreatePermission,
  Category,
} from '@backstage-community/plugin-announcements-common';
import useAsyncRetry from 'react-use/esm/useAsyncRetry';
import { useDeleteDialogState, DeleteDialog } from '../shared';
import { useNavigate } from 'react-router-dom';
import { AnnouncementForm } from './AnnouncementForm';
import slugify from 'slugify';
import { RequirePermission } from '@backstage/plugin-permission-react';
import { Box, Button, Grid, IconButton, Typography } from '@material-ui/core';
import DeleteIcon from '@material-ui/icons/Delete';
import EditIcon from '@material-ui/icons/Edit';
import PreviewIcon from '@material-ui/icons/Visibility';
import { DateTime } from 'luxon';

type AnnouncementsContentProps = {
  defaultInactive?: boolean;
};

export const AnnouncementsContent = ({
  defaultInactive,
}: AnnouncementsContentProps) => {
  const alertApi = useApi(alertApiRef);
  const announcementsApi = useApi(announcementsApiRef);
  const navigate = useNavigate();
  const { categories } = useCategories();
  const { t } = useAnnouncementsTranslation();
  const permissions = useAnnouncementsPermissions();

  const [showCreateAnnouncementForm, setShowCreateAnnouncementForm] =
    useState(false);
  const [editingAnnouncementId, setEditingAnnouncementId] = useState<
    string | null
  >(null);

  const {
    loading,
    error,
    value: announcements,
    retry,
  } = useAsyncRetry(async () => await announcementsApi.announcements({}));

  const {
    isOpen: isDeleteDialogOpen,
    open: openDeleteDialog,
    close: closeDeleteDialog,
    item: announcementToDelete,
  } = useDeleteDialogState<Announcement>();

  const onCreateButtonClick = () => {
    setShowCreateAnnouncementForm(!showCreateAnnouncementForm);
    setEditingAnnouncementId(null);
  };

  const onTitleClick = (announcement: Announcement) => {
    navigate(`/announcements/view/${announcement.id}`);
  };

  const onEdit = (announcement: Announcement) => {
    setEditingAnnouncementId(announcement.id);
    setShowCreateAnnouncementForm(false);
  };

  const onCancelEdit = () => {
    setEditingAnnouncementId(null);
  };

  const onCancelDelete = () => {
    closeDeleteDialog();
  };
  const onConfirmDelete = async () => {
    closeDeleteDialog();

    try {
      await announcementsApi.deleteAnnouncementByID(announcementToDelete!.id);

      alertApi.post({ message: 'Announcement deleted.', severity: 'success' });
    } catch (err) {
      alertApi.post({ message: (err as Error).message, severity: 'error' });
    }

    retry();
  };

  const onSubmit = async (request: CreateAnnouncementRequest) => {
    const { category } = request;

    const slugs = categories.map((c: Category) => c.slug);
    let alertMsg = t('admin.announcementsContent.alertMessage') as string;

    try {
      if (category) {
        const categorySlug = slugify(category, {
          lower: true,
        });
        if (slugs.indexOf(categorySlug) === -1) {
          alertMsg = alertMsg.replace('.', '');
          alertMsg = `${alertMsg} ${t(
            'admin.announcementsContent.alertMessageWithNewCategory',
          )} ${category}.`;

          await announcementsApi.createCategory({
            title: category,
          });
        }
      }

      await announcementsApi.createAnnouncement({
        ...request,
        category: request.category?.toLocaleLowerCase('en-US'),
      });
      alertApi.post({ message: alertMsg, severity: 'success' });

      setShowCreateAnnouncementForm(false);
      retry();
    } catch (err) {
      alertApi.post({ message: (err as Error).message, severity: 'error' });
    }
  };

  const onUpdate = async (request: CreateAnnouncementRequest) => {
    if (!editingAnnouncementId) {
      return;
    }

    const { category } = request;

    const slugs = categories.map((c: Category) => c.slug);
    let updateMsg = t('editAnnouncementPage.updatedMessage') as string;

    try {
      if (category) {
        const categorySlug = slugify(category, {
          lower: true,
        });

        if (slugs.indexOf(categorySlug) === -1) {
          updateMsg = updateMsg.replace('.', '');
          updateMsg = `${updateMsg} ${t(
            'editAnnouncementPage.updatedMessageWithNewCategory',
          )} ${category}.`;

          await announcementsApi.createCategory({
            title: category,
          });
        }
      }

      await announcementsApi.updateAnnouncement(editingAnnouncementId, request);
      alertApi.post({ message: updateMsg, severity: 'success' });

      setEditingAnnouncementId(null);
      retry();
    } catch (err) {
      alertApi.post({ message: (err as Error).message, severity: 'error' });
    }
  };

  const announcementToEdit = useMemo(() => {
    if (!editingAnnouncementId || !announcements?.results) {
      return null;
    }
    return (
      announcements.results.find(a => a.id === editingAnnouncementId) ?? null
    );
  }, [editingAnnouncementId, announcements?.results]);

  if (loading) {
    return <Progress />;
  }
  if (error) {
    return <ErrorPanel error={error} />;
  }

  const columns: TableColumn<Announcement>[] = [
    {
      title: (
        <Typography>{t('admin.announcementsContent.table.title')}</Typography>
      ),
      sorting: true,
      field: 'title',
      render: rowData => rowData.title,
    },
    {
      title: (
        <Typography>{t('admin.announcementsContent.table.body')}</Typography>
      ),
      sorting: true,
      field: 'body',
      render: rowData => rowData.body,
    },
    {
      title: (
        <Typography>
          {t('admin.announcementsContent.table.publisher')}
        </Typography>
      ),
      sorting: true,
      field: 'publisher',
      render: rowData => rowData.publisher,
    },
    {
      title: (
        <Typography>
          {t('admin.announcementsContent.table.onBehalfOf')}
        </Typography>
      ),
      sorting: true,
      field: 'on_behalf_of',
      render: rowData => rowData.on_behalf_of,
    },

    {
      title: (
        <Typography>
          {t('admin.announcementsContent.table.category')}
        </Typography>
      ),
      sorting: true,
      field: 'category',
      render: rowData => rowData.category?.title ?? '',
    },
    {
      title: (
        <Typography>{t('admin.announcementsContent.table.tags')}</Typography>
      ),
      sorting: true,
      field: 'tags',
      render: rowData => rowData.tags?.map(tag => tag.title).join(', ') || '',
    },
    {
      title: (
        <Typography>{t('admin.announcementsContent.table.status')}</Typography>
      ),
      sorting: true,
      field: 'active',
      render: rowData =>
        rowData.active ? (
          <StatusOK>{t('admin.announcementsContent.table.active')}</StatusOK>
        ) : (
          <StatusPending>
            {t('admin.announcementsContent.table.inactive')}
          </StatusPending>
        ),
    },
    {
      title: (
        <Typography>
          {t('admin.announcementsContent.table.created_at')}
        </Typography>
      ),
      sorting: true,
      field: 'created_at',
      type: 'date',
      render: rowData =>
        DateTime.fromISO(rowData.created_at).toFormat('M/d/yyyy'),
    },
    {
      title: (
        <Typography>
          {t('admin.announcementsContent.table.start_at')}
        </Typography>
      ),
      sorting: true,
      field: 'start_at',
      type: 'date',
      render: rowData =>
        DateTime.fromISO(rowData.start_at).toFormat('M/d/yyyy'),
    },
    {
      title: (
        <Typography>
          {t('admin.announcementsContent.table.until_date')}
        </Typography>
      ),
      sorting: true,
      field: 'until_date',
      type: 'date',
      render: rowData =>
        rowData?.until_date
          ? DateTime.fromISO(rowData.until_date).toFormat('M/d/yyyy')
          : '-',
    },
    {
      title: (
        <Typography>{t('admin.announcementsContent.table.actions')}</Typography>
      ),
      render: rowData => {
        return (
          <Box display="flex" flexDirection="row">
            <IconButton
              aria-label="preview"
              onClick={() => onTitleClick(rowData)}
              size="small"
            >
              <PreviewIcon fontSize="small" data-testid="preview" />
            </IconButton>

            <IconButton
              aria-label="edit"
              disabled={
                permissions.update.loading ||
                !permissions.update.allowed ||
                editingAnnouncementId === rowData.id
              }
              onClick={() => onEdit(rowData)}
              size="small"
            >
              <EditIcon fontSize="small" data-testid="edit-icon" />
            </IconButton>

            <IconButton
              aria-label="delete"
              disabled={
                permissions.delete.loading || !permissions.delete.allowed
              }
              onClick={() => openDeleteDialog(rowData)}
              size="small"
            >
              <DeleteIcon fontSize="small" data-testid="delete-icon" />
            </IconButton>
          </Box>
        );
      },
    },
  ];

  return (
    <RequirePermission permission={announcementCreatePermission}>
      <Grid container>
        {!editingAnnouncementId && (
          <Grid item xs={12}>
            <Button
              disabled={
                permissions.create.loading || !permissions.create.allowed
              }
              variant="contained"
              onClick={() => onCreateButtonClick()}
            >
              {showCreateAnnouncementForm
                ? t('admin.announcementsContent.cancelButton')
                : t('admin.announcementsContent.createButton')}
            </Button>
          </Grid>
        )}

        {showCreateAnnouncementForm && (
          <Grid item xs={12}>
            <AnnouncementForm
              initialData={{ active: !defaultInactive } as Announcement}
              onSubmit={onSubmit}
            />
          </Grid>
        )}

        {editingAnnouncementId && announcementToEdit && (
          <Grid item xs={12}>
            <Box>
              <Box
                display="flex"
                justifyContent="space-between"
                style={{ marginBottom: 16 }}
              >
                <Typography variant="h6">
                  {t('announcementForm.editAnnouncement')}
                </Typography>
                <Button variant="outlined" onClick={onCancelEdit} size="small">
                  {t('admin.announcementsContent.cancelButton')}
                </Button>
              </Box>
              <AnnouncementForm
                initialData={announcementToEdit}
                onSubmit={onUpdate}
              />
            </Box>
          </Grid>
        )}

        <Grid item xs={12}>
          <Table
            title={t('admin.announcementsContent.announcements')}
            options={{ pageSize: 20, search: true }}
            columns={columns}
            data={announcements?.results ?? []}
            emptyContent={
              <Typography style={{ padding: 2, textAlign: 'center' }}>
                {t('admin.announcementsContent.noAnnouncementsFound')}
              </Typography>
            }
          />

          <DeleteDialog
            isOpen={isDeleteDialogOpen}
            onCancel={onCancelDelete}
            onConfirm={onConfirmDelete}
          />
        </Grid>
      </Grid>
    </RequirePermission>
  );
};
