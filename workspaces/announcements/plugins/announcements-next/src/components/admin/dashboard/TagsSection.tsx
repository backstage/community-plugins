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
import { useState, useEffect } from 'react';
import { alertApiRef, useApi } from '@backstage/core-plugin-api';
import {
  announcementsApiRef,
  CreateTagRequest,
  useAnnouncementsTranslation,
  useTags,
} from '@backstage-community/plugin-announcements-react';
import { Tag } from '@backstage-community/plugin-announcements-common';
import slugify from 'slugify';
import { useListData } from 'react-stately';
import type { Key } from 'react-aria-components';
import {
  Button,
  Text,
  Card,
  CardHeader,
  CardBody,
  TagGroup,
  Tag as TagComponent,
  Dialog,
  DialogHeader,
  DialogBody,
  Header,
  Box,
} from '@backstage/ui';
import { RiAddLine, RiHashtag } from '@remixicon/react';

import { TagsForm } from '../tags/TagsForm';
import {
  useAnnouncementsPermissions,
  DeleteConfirmationDialog,
  useDeleteConfirmationDialogState,
} from '../shared';

type TagsSectionProps = {
  onRefresh: () => void;
};

export const TagsSection = (props: TagsSectionProps) => {
  const { onRefresh } = props;

  const alertApi = useApi(alertApiRef);
  const announcementsApi = useApi(announcementsApiRef);
  const { t } = useAnnouncementsTranslation();
  const permissions = useAnnouncementsPermissions();

  const { tags: tagsData, retry: retryTags } = useTags();

  const [showCreateTagForm, setShowCreateTagForm] = useState(false);

  const {
    isOpen: isTagDeleteDialogOpen,
    open: openTagDeleteDialog,
    close: closeTagDeleteDialog,
    item: tagToDelete,
  } = useDeleteConfirmationDialogState<Tag>();

  const tagsList = useListData({
    initialItems: tagsData?.map(tag => ({ ...tag, id: tag.slug })) || [],
    getKey: (item: Tag & { id: string }) => item.id,
  });

  // Sync list when data changes
  useEffect(() => {
    if (tagsData) {
      const itemsWithId = tagsData.map(tag => ({ ...tag, id: tag.slug }));
      const currentKeys = new Set(tagsList.items.map(item => item.id));
      const newKeys = new Set(itemsWithId.map(item => item.id));

      // Remove items that are no longer in the data
      currentKeys.forEach(key => {
        if (!newKeys.has(key)) {
          tagsList.remove(key);
        }
      });

      // Add new items
      itemsWithId.forEach(item => {
        if (!currentKeys.has(item.id)) {
          tagsList.append(item);
        }
      });
    }
  }, [tagsData, tagsList]);

  const onCreateTagClick = () => {
    setShowCreateTagForm(true);
  };

  const onTagSubmit = async (request: CreateTagRequest) => {
    try {
      await announcementsApi.createTag(request);
      alertApi.post({
        message: `${request.title} ${t('admin.tagsContent.createdMessage')}`,
        severity: 'success',
      });
      setShowCreateTagForm(false);
      retryTags();
      // Update the list when a new tag is created
      if (tagsData) {
        const newTag = tagsData.find(
          tag => tag.slug === slugify(request.title, { lower: true }),
        );
        if (newTag) {
          tagsList.append({ ...newTag, id: newTag.slug });
        }
      }
      onRefresh();
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

  const onTagDelete = async () => {
    closeTagDeleteDialog();

    try {
      await announcementsApi.deleteTag(tagToDelete!.slug);
      alertApi.post({
        message: t('admin.tagsContent.table.tagDeleted'),
        severity: 'success',
      });
      tagsList.remove(tagToDelete!.slug);
      retryTags();
      onRefresh();
    } catch (err) {
      alertApi.post({
        message: (err as Error).message,
        severity: 'error',
      });
    }
  };

  const onTagRemove = (keys: Set<Key>) => {
    const key = Array.from(keys)[0];
    const tag = tagsList.getItem(key as string);
    if (tag) {
      // Extract the original Tag type (without id)
      const { id, ...tagWithoutId } = tag;
      openTagDeleteDialog(tagWithoutId as Tag);
    }
  };

  return (
    <>
      <Card>
        <CardHeader>
          <Header
            title="Tags"
            icon={<RiHashtag />}
            // customActions={
            //   <Button
            //     onClick={onCreateTagClick}
            //     iconEnd={<RiAddLine />}
            //     isDisabled={
            //       permissions.create.loading || !permissions.create.allowed
            //     }
            //     variant="primary"
            //   >
            //     Create tag
            //   </Button>
            // }
          />
        </CardHeader>
        <CardBody>
          {/* <Container> */}
          {tagsList.items.length > 0 ? (
            <TagGroup
              aria-label="Tags"
              items={tagsList.items}
              onRemove={permissions.delete.allowed ? onTagRemove : undefined}
            >
              {item => (
                <TagComponent textValue={item.title}>{item.title}</TagComponent>
              )}
            </TagGroup>
          ) : (
            <Box px="2">
              <Text>{t('admin.tagsContent.table.noTagsFound')}</Text>
            </Box>
          )}
          {/* </Container> */}
        </CardBody>
      </Card>

      <Dialog
        isOpen={showCreateTagForm}
        onOpenChange={setShowCreateTagForm}
        width="500px"
      >
        <DialogHeader>{t('tagsForm.newTag')}</DialogHeader>
        <DialogBody>
          <TagsForm initialData={{} as Tag} onSubmit={onTagSubmit} />
        </DialogBody>
      </Dialog>

      <DeleteConfirmationDialog
        type="tag"
        open={isTagDeleteDialogOpen}
        onCancel={closeTagDeleteDialog}
        onConfirm={onTagDelete}
      />
    </>
  );
};
