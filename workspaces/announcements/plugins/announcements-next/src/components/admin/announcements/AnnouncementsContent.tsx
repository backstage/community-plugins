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
  StatusOK,
  StatusPending,
} from '@backstage/core-components';
import { alertApiRef, useApi } from '@backstage/core-plugin-api';
import {
  announcementsApiRef,
  CreateAnnouncementRequest,
  useAnnouncementsTranslation,
  useCategories,
} from '@backstage-community/plugin-announcements-react';
import {
  Announcement,
  announcementCreatePermission,
  announcementDeletePermission,
  announcementUpdatePermission,
  Category,
} from '@backstage-community/plugin-announcements-common';
import useAsyncRetry from 'react-use/esm/useAsyncRetry';
import { useNavigate } from 'react-router-dom';
import slugify from 'slugify';
import {
  RequirePermission,
  usePermission,
} from '@backstage/plugin-permission-react';
import { Text, Box, ButtonIcon, Container, Grid, Button } from '@backstage/ui';
import DeleteIcon from '@material-ui/icons/Delete';
import EditIcon from '@material-ui/icons/Edit';
import PreviewIcon from '@material-ui/icons/Visibility';
import { DateTime } from 'luxon';
import { AnnouncementForm } from './AnnouncementForm';
import {
  DeleteConfirmationDialog,
  useDeleteConfirmationDialogState,
} from '../shared';

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

  const { loading: loadingCreatePermission, allowed: canCreateAnnouncement } =
    usePermission({
      permission: announcementCreatePermission,
    });

  const { loading: loadingUpdatePermission, allowed: canUpdateAnnouncement } =
    usePermission({
      permission: announcementUpdatePermission,
    });

  const { loading: loadingDeletePermission, allowed: canDeleteAnnouncement } =
    usePermission({
      permission: announcementDeletePermission,
    });

  const [showCreateAnnouncementForm, setShowCreateAnnouncementForm] =
    useState(true);

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
  } = useDeleteConfirmationDialogState<Announcement>();

  const onCreateButtonClick = () => {
    setShowCreateAnnouncementForm(!showCreateAnnouncementForm);
  };

  const onTitleClick = (announcement: Announcement) => {
    navigate(`/announcements/view/${announcement.id}`);
  };

  const onEdit = (announcement: Announcement) => {
    navigate(`/announcements/edit/${announcement.id}`);
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

  if (loading) {
    return <Progress />;
  }
  if (error) {
    return <ErrorPanel error={error} />;
  }

  const columns: TableColumn<Announcement>[] = [
    {
      title: t('admin.announcementsContent.table.title'),
      sorting: true,
      field: 'title',
      render: rowData => rowData.title,
    },
    {
      title: t('admin.announcementsContent.table.body'),
      sorting: true,
      field: 'body',
      render: rowData => rowData.body,
    },
    {
      title: t('admin.announcementsContent.table.publisher'),
      sorting: true,
      field: 'publisher',
      render: rowData => rowData.publisher,
    },
    {
      title: t('admin.announcementsContent.table.onBehalfOf'),
      sorting: true,
      field: 'on_behalf_of',
      render: rowData => rowData.on_behalf_of,
    },

    {
      title: t('admin.announcementsContent.table.category'),
      sorting: true,
      field: 'category',
      render: rowData => rowData.category?.title ?? '',
    },
    {
      title: t('admin.announcementsContent.table.tags'),
      sorting: true,
      field: 'tags',
      render: rowData => rowData.tags?.map(tag => tag.title).join(', ') || '',
    },
    {
      title: t('admin.announcementsContent.table.status'),
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
      title: t('admin.announcementsContent.table.created_at'),
      sorting: true,
      field: 'created_at',
      type: 'date',
      render: rowData =>
        DateTime.fromISO(rowData.created_at).toFormat('M/d/yyyy'),
    },
    {
      title: t('admin.announcementsContent.table.start_at'),
      sorting: true,
      field: 'start_at',
      type: 'date',
      render: rowData =>
        DateTime.fromISO(rowData.start_at).toFormat('M/d/yyyy'),
    },
    {
      title: t('admin.announcementsContent.table.until_date'),
      sorting: true,
      field: 'until_date',
      type: 'date',
      render: rowData =>
        rowData?.until_date
          ? DateTime.fromISO(rowData.until_date).toFormat('M/d/yyyy')
          : '-',
    },
    {
      title: t('admin.announcementsContent.table.actions'),
      render: rowData => {
        return (
          <Box display="flex">
            <ButtonIcon
              aria-label="preview"
              icon={<PreviewIcon fontSize="small" data-testid="preview" />}
              size="small"
              variant="tertiary"
              onClick={() => onTitleClick(rowData)}
            />
            <ButtonIcon
              aria-label="edit"
              icon={<EditIcon fontSize="small" data-testid="edit-icon" />}
              size="small"
              variant="tertiary"
              isDisabled={loadingUpdatePermission || !canUpdateAnnouncement}
              onClick={() => onEdit(rowData)}
            />

            <ButtonIcon
              aria-label="delete"
              icon={<DeleteIcon fontSize="small" data-testid="delete-icon" />}
              size="small"
              variant="tertiary"
              isDisabled={loadingDeletePermission || !canDeleteAnnouncement}
              onClick={() => openDeleteDialog(rowData)}
            />
          </Box>
        );
      },
    },
  ];

  return (
    <RequirePermission permission={announcementCreatePermission}>
      <Container>
        <Grid.Root columns="1">
          <Grid.Item>
            <Button
              isDisabled={loadingCreatePermission || !canCreateAnnouncement}
              variant="primary"
              onClick={() => onCreateButtonClick()}
            >
              {showCreateAnnouncementForm
                ? t('admin.announcementsContent.cancelButton')
                : t('admin.announcementsContent.createButton')}
            </Button>
          </Grid.Item>

          {showCreateAnnouncementForm && (
            <Grid.Item>
              <AnnouncementForm
                initialData={{ active: !defaultInactive } as Announcement}
                onSubmit={onSubmit}
              />
            </Grid.Item>
          )}

          <Grid.Item>
            <Table
              title={t('admin.announcementsContent.announcements')}
              options={{ pageSize: 20, search: true }}
              columns={columns}
              data={announcements?.results ?? []}
              emptyContent={
                <Text style={{ padding: 2, textAlign: 'center' }}>
                  {t('admin.announcementsContent.noAnnouncementsFound')}
                </Text>
              }
            />

            <DeleteConfirmationDialog
              type="announcement"
              open={isDeleteDialogOpen}
              onCancel={onCancelDelete}
              onConfirm={onConfirmDelete}
            />
          </Grid.Item>
        </Grid.Root>
      </Container>
    </RequirePermission>
  );
};
