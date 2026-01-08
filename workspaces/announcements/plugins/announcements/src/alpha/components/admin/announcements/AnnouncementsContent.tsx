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
import { useState, useMemo } from 'react';
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
import { useRouteRef } from '@backstage/core-plugin-api';
import { useNavigate } from 'react-router-dom';
import { RequirePermission } from '@backstage/plugin-permission-react';
import { Button, Grid } from '@backstage/ui';
import slugify from 'slugify';

import {
  useDeleteConfirmationDialogState,
  DeleteConfirmationDialog,
} from '../shared';
import { AnnouncementForm } from '../../../../components/Admin/AnnouncementsContent/AnnouncementForm';
import { AnnouncementsTableCard } from './AnnouncementsTableCard';
import { announcementViewRouteRef } from '../../../../routes';

/**
 * @internal
 */
export type AnnouncementsContentProps = {
  /** always sets the inactive switch form input to false by default */
  defaultInactive?: boolean;
};

/**
 * @internal
 */
export const AnnouncementsContent = ({
  defaultInactive,
}: AnnouncementsContentProps) => {
  const announcementsApi = useApi(announcementsApiRef);
  const alertApi = useApi(alertApiRef);
  const { t } = useAnnouncementsTranslation();
  const permissions = useAnnouncementsPermissions();
  const { categories } = useCategories();

  const [showCreateAnnouncementForm, setShowCreateAnnouncementForm] =
    useState(false);
  const [editingAnnouncementId, setEditingAnnouncementId] = useState<
    string | null
  >(null);

  const {
    announcements,
    loading,
    error,
    retry: refresh,
  } = useAnnouncements({});

  const {
    isOpen: isDeleteDialogOpen,
    close: closeDeleteDialog,
    open: openDeleteDialog,
    item: announcementToDelete,
  } = useDeleteConfirmationDialogState<Announcement>();

  const viewAnnouncementLink = useRouteRef(announcementViewRouteRef);
  const navigate = useNavigate();

  const onCreateButtonClick = () => {
    if (editingAnnouncementId) {
      // If editing, cancel the edit
      setEditingAnnouncementId(null);
      setShowCreateAnnouncementForm(false);
    } else {
      // If not editing, toggle create form
      setShowCreateAnnouncementForm(!showCreateAnnouncementForm);
    }
  };

  const onPreviewClick = (announcement: Announcement) => {
    navigate(viewAnnouncementLink({ id: announcement.id }));
  };

  const onEditClick = (announcement: Announcement) => {
    setEditingAnnouncementId(announcement.id);
    setShowCreateAnnouncementForm(false);
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
      refresh();
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
      refresh();
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

  if (loading) {
    return null; // Loading state handled by parent or can add spinner
  }

  if (error) {
    return null; // Error state handled by parent or can add error panel
  }

  return (
    <RequirePermission permission={announcementCreatePermission}>
      <Grid.Root columns="1">
        <Grid.Item>
          <Button
            isDisabled={!canCreate}
            variant="primary"
            onClick={() => onCreateButtonClick()}
          >
            {showCreateAnnouncementForm || editingAnnouncementId
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

        {editingAnnouncementId && announcementToEdit && (
          <Grid.Item>
            <AnnouncementForm
              initialData={announcementToEdit}
              onSubmit={onUpdate}
            />
          </Grid.Item>
        )}

        <Grid.Item>
          <AnnouncementsTableCard
            announcements={announcements?.results ?? []}
            onPreviewClick={onPreviewClick}
            onEditClick={onEditClick}
            onDeleteClick={onDeleteClick}
            canEdit={canEdit}
            canDelete={canDelete}
            editingAnnouncementId={editingAnnouncementId}
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
