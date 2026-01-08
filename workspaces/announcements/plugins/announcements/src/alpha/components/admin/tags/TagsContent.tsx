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
  CreateTagRequest,
  announcementsApiRef,
  useAnnouncementsTranslation,
  useTags,
  useAnnouncementsPermissions,
} from '@backstage-community/plugin-announcements-react';
import { Tag } from '@backstage-community/plugin-announcements-common';
import { useApi, alertApiRef } from '@backstage/core-plugin-api';
import { ResponseError } from '@backstage/errors';

import {
  useDeleteConfirmationDialogState,
  DeleteConfirmationDialog,
} from '../shared';
import { CreateTagDialog } from './CreateTagDialog';
import { TagsTableCard } from './TagsTableCard';

/**
 * @internal
 */
export const TagsContent = () => {
  const [showNewTagForm, setShowNewTagForm] = useState(false);
  const { tags, retry: refresh } = useTags();
  const announcementsApi = useApi(announcementsApiRef);
  const alertApi = useApi(alertApiRef);
  const { t } = useAnnouncementsTranslation();
  const permissions = useAnnouncementsPermissions();

  const {
    isOpen: isDeleteDialogOpen,
    close: closeDeleteDialog,
    open: openDeleteDialog,
    item: tagToDelete,
  } = useDeleteConfirmationDialogState<Tag>();

  const onConfirmCreate = async (request: CreateTagRequest) => {
    const { title } = request;

    try {
      await announcementsApi.createTag({
        title,
      });

      alertApi.post({
        message: `${title} ${t('admin.tagsContent.createdMessage')}`,
        severity: 'success',
      });

      setShowNewTagForm(false);
      refresh();
    } catch (err: any) {
      if (err.response?.status === 409) {
        alertApi.post({
          message: t('admin.tagsContent.errors.alreadyExists'),
          severity: 'error',
        });
      } else {
        alertApi.post({ message: (err as Error).message, severity: 'error' });
      }
    }
  };

  const onCreateButtonClick = () => {
    setShowNewTagForm(true);
  };

  const onCancelCreate = () => {
    setShowNewTagForm(false);
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

  const onDeleteClick = (tag: Tag) => {
    openDeleteDialog(tag);
  };

  const canCreate = !permissions.create.loading && permissions.create.allowed;
  const canDelete = !permissions.delete.loading && permissions.delete.allowed;

  return (
    <>
      <TagsTableCard
        tags={tags ?? []}
        onCreateClick={onCreateButtonClick}
        onDeleteClick={onDeleteClick}
        canCreate={canCreate}
        canDelete={canDelete}
      />

      <CreateTagDialog
        open={showNewTagForm}
        onConfirm={onConfirmCreate}
        onCancel={onCancelCreate}
        canSubmit={canCreate}
      />

      <DeleteConfirmationDialog
        type="tag"
        itemTitle={tagToDelete?.title}
        open={isDeleteDialogOpen}
        onCancel={onCancelDelete}
        onConfirm={onConfirmDelete}
        canDelete={canDelete}
      />
    </>
  );
};
