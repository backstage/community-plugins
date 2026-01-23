/*
 * Copyright 2026 The Backstage Authors
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
  CreateAnnouncementRequest,
  announcementsApiRef,
  useAnnouncementsTranslation,
  useAnnouncements,
  useAnnouncementsPermissions,
  useCategories,
} from '@backstage-community/plugin-announcements-react';
import {
  Announcement,
  Category,
  announcementCreatePermission,
} from '@backstage-community/plugin-announcements-common';
import { useRouteRef } from '@backstage/frontend-plugin-api';
import { useNavigate } from 'react-router-dom';
import { RequirePermission } from '@backstage/plugin-permission-react';
import { Box, Grid } from '@backstage/ui';
import slugify from 'slugify';

import {
  useDeleteConfirmationDialogState,
  DeleteConfirmationDialog,
} from '../shared';
import { AnnouncementsTableCard } from './AnnouncementsTableCard';
import { announcementViewRouteRef } from '../../../../routes';
import { AnnouncementDialog } from './AnnouncementDialog';

/**
 * @internal
 */
export type AnnouncementsContentProps = {
  /** default form values when creating a new announcement */
  formDefaults: {
    /** sets active switch form input to false by default when creating a new announcement */
    defaultInactive?: boolean;
  };
};

type DialogState = {
  open: boolean;
  mode: 'create' | 'edit';
  announcement?: Announcement;
};

/**
 * @internal
 */
export const AnnouncementsContent = (_props: AnnouncementsContentProps) => {
  const announcementsApi = useApi(announcementsApiRef);
  const alertApi = useApi(alertApiRef);
  const { t } = useAnnouncementsTranslation();
  const permissions = useAnnouncementsPermissions();
  const { categories } = useCategories();

  const [dialogState, setDialogState] = useState<DialogState>({
    open: false,
    mode: 'create',
  });

  const { announcements, retry: refresh } = useAnnouncements({});

  const {
    isOpen: isDeleteDialogOpen,
    close: closeDeleteDialog,
    open: openDeleteDialog,
    item: announcementToDelete,
  } = useDeleteConfirmationDialogState<Announcement>();

  const viewAnnouncementLink = useRouteRef(announcementViewRouteRef);
  const navigate = useNavigate();

  const onCreateButtonClick = () => {
    setDialogState({ open: true, mode: 'create' });
  };

  const onPreviewClick = (announcement: Announcement) => {
    const link = viewAnnouncementLink?.({ id: announcement.id }) ?? '';
    navigate(`${link}?from=admin`);
  };

  const onEditClick = (announcement: Announcement) => {
    setDialogState({ open: true, mode: 'edit', announcement });
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

      setDialogState({ open: false, mode: 'create' });
      refresh();
    } catch (err) {
      alertApi.post({ message: (err as Error).message, severity: 'error' });
    }
  };

  const onUpdate = async (request: CreateAnnouncementRequest) => {
    const announcementId = dialogState.announcement?.id;
    if (!announcementId) {
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

      await announcementsApi.updateAnnouncement(announcementId, request);
      alertApi.post({ message: updateMsg, severity: 'success' });

      setDialogState({ open: false, mode: 'create' });
      refresh();
    } catch (err) {
      alertApi.post({ message: (err as Error).message, severity: 'error' });
    }
  };

  const onDialogCancel = () => {
    setDialogState({ open: false, mode: 'create' });
  };

  const onCancelDelete = () => {
    closeDeleteDialog();
  };

  const onConfirmDelete = async () => {
    closeDeleteDialog();

    try {
      await announcementsApi.deleteAnnouncementByID(announcementToDelete!.id);

      alertApi.post({
        message: t('admin.announcementsContent.deletedMessage'),
        severity: 'success',
      });
    } catch (err) {
      alertApi.post({
        message:
          (err as ResponseError).body?.error?.message || (err as Error).message,
        severity: 'error',
      });
    }

    refresh();
  };

  const onDeleteClick = (announcement: Announcement) => {
    openDeleteDialog(announcement);
  };

  const canCreate = !permissions.create.loading && permissions.create.allowed;
  const canEdit = !permissions.update.loading && permissions.update.allowed;
  const canDelete = !permissions.delete.loading && permissions.delete.allowed;

  return (
    <RequirePermission permission={announcementCreatePermission}>
      <Grid.Root columns="1">
        <Grid.Item>
          <Box mb="12">
            <AnnouncementsTableCard
              announcements={announcements?.results ?? []}
              onPreviewClick={onPreviewClick}
              onEditClick={onEditClick}
              onDeleteClick={onDeleteClick}
              onCreateClick={onCreateButtonClick}
              canEdit={canEdit}
              canDelete={canDelete}
              canCreate={canCreate}
            />
          </Box>

          <AnnouncementDialog
            open={dialogState.open}
            initialData={dialogState.announcement}
            onSubmit={dialogState.mode === 'edit' ? onUpdate : onSubmit}
            onCancel={onDialogCancel}
            canSubmit={dialogState.mode === 'edit' ? canEdit : canCreate}
          />

          <DeleteConfirmationDialog
            type="announcement"
            itemTitle={announcementToDelete?.title}
            open={isDeleteDialogOpen}
            onCancel={onCancelDelete}
            onConfirm={onConfirmDelete}
            canDelete={canDelete}
          />
        </Grid.Item>
      </Grid.Root>
    </RequirePermission>
  );
};
