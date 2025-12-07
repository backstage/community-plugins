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
import { useMemo } from 'react';
import {
  CreateTagRequest,
  useAnnouncementsTranslation,
  useTags,
  AnnouncementsApi,
} from '@backstage-community/plugin-announcements-react';
import { Tag } from '@backstage-community/plugin-announcements-common';
import { AlertApi } from '@backstage/core-plugin-api';
import { TagsForm } from './TagsForm';
import { EntityContent } from '../shared';

export const TagsContent = () => {
  const { tags, loading, error, retry } = useTags();
  const { t } = useAnnouncementsTranslation();

  const config = useMemo(
    () => ({
      useEntityHook: () => ({
        items: tags ?? [],
        loading,
        error,
        retry,
      }),
      createEntity: async (
        api: AnnouncementsApi,
        request: CreateTagRequest,
      ) => {
        await api.createTag(request);
      },
      deleteEntity: async (api: AnnouncementsApi, slug: string) => {
        await api.deleteTag(slug);
      },
      FormComponent: TagsForm,
      translationKeys: {
        createButton: 'admin.tagsContent.createButton',
        cancelButton: 'admin.tagsContent.cancelButton',
        dialogTitle: 'tagsForm.newTag',
        createdMessage: 'admin.tagsContent.createdMessage',
        deletedMessage: 'admin.tagsContent.table.tagDeleted',
        noItemsFound: 'admin.tagsContent.table.noTagsFound',
        table: {
          title: 'admin.tagsContent.table.title',
          slug: 'admin.tagsContent.table.slug',
          actions: 'admin.tagsContent.table.actions',
        },
        errors: {
          alreadyExists: 'admin.tagsContent.errors.alreadyExists',
        },
      },
      tableTitle: 'Tags',
      deleteDialogType: 'tag' as const,
      handleCreateError: (err: any, alert: AlertApi, translate: typeof t) => {
        if (err.response?.status === 409) {
          alert.post({
            message: translate('admin.tagsContent.errors.alreadyExists'),
            severity: 'error',
          });
        } else {
          alert.post({
            message: (err as Error).message,
            severity: 'error',
          });
        }
      },
    }),
    [tags, loading, error, retry],
  );

  return <EntityContent<Tag, CreateTagRequest> config={config} />;
};
