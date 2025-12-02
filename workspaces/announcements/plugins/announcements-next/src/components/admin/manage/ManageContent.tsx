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
import { ErrorPanel, Progress } from '@backstage/core-components';
import { alertApiRef, useApi } from '@backstage/core-plugin-api';
import {
  announcementsApiRef,
  CreateAnnouncementRequest,
  CreateCategoryRequest,
  CreateTagRequest,
  useAnnouncementsTranslation,
  useCategories,
  useTags,
} from '@backstage-community/plugin-announcements-react';
import {
  Announcement,
  announcementCreatePermission,
  Category,
  Tag,
} from '@backstage-community/plugin-announcements-common';
import useAsyncRetry from 'react-use/esm/useAsyncRetry';
import slugify from 'slugify';
import { useListData } from 'react-stately';
import type { Key } from 'react-aria-components';
import { RequirePermission } from '@backstage/plugin-permission-react';
import {
  Container,
  Grid,
  Button,
  Text,
  Flex,
  Box,
  MenuTrigger,
  MenuItem,
  Menu,
  Card,
  CardHeader,
  CardBody,
  TagGroup,
  Tag as TagComponent,
  Dialog,
  DialogHeader,
  DialogBody,
  Header,
  ButtonIcon,
} from '@backstage/ui';
import {
  RiAddLine,
  RiCloudy2Line,
  RiEmotionHappyLine,
  RiHeartLine,
  RiBook2Fill,
} from '@remixicon/react';

import { AnnouncementForm } from '../announcements/AnnouncementForm';
import { AnnouncementsTable } from '../announcements/AnnouncementsTable';
import { CategoriesForm } from '../categories/CategoriesForm';
import { TagsForm } from '../tags/TagsForm';
import {
  useAnnouncementsPermissions,
  DeleteConfirmationDialog,
  useDeleteConfirmationDialogState,
} from '../shared';

type ManageContentProps = {
  defaultInactive?: boolean;
};

export const ManageContent = (props: ManageContentProps) => {
  const { defaultInactive } = props;

  const alertApi = useApi(alertApiRef);
  const announcementsApi = useApi(announcementsApiRef);
  const { categories } = useCategories();
  const { t } = useAnnouncementsTranslation();
  const [searchText, setSearchText] = useState('');
  const permissions = useAnnouncementsPermissions();

  const [showCreateAnnouncementForm, setShowCreateAnnouncementForm] =
    useState(false);
  const [showCreateCategoryForm, setShowCreateCategoryForm] = useState(false);
  const [showCreateTagForm, setShowCreateTagForm] = useState(false);

  const {
    isOpen: isCategoryDeleteDialogOpen,
    open: openCategoryDeleteDialog,
    close: closeCategoryDeleteDialog,
    item: categoryToDelete,
  } = useDeleteConfirmationDialogState<Category>();

  const {
    isOpen: isTagDeleteDialogOpen,
    open: openTagDeleteDialog,
    close: closeTagDeleteDialog,
    item: tagToDelete,
  } = useDeleteConfirmationDialogState<Tag>();

  const {
    loading: announcementsLoading,
    error: announcementsError,
    value: announcements,
    retry: retryAnnouncements,
  } = useAsyncRetry(async () => await announcementsApi.announcements({}));

  const {
    categories: categoriesData,
    loading: categoriesLoading,
    error: categoriesError,
    retry: retryCategories,
  } = useCategories();

  const {
    tags: tagsData,
    loading: tagsLoading,
    error: tagsError,
    retry: retryTags,
  } = useTags();

  const categoriesList = useListData({
    initialItems: categoriesData?.map(cat => ({ ...cat, id: cat.slug })) || [],
    getKey: (item: Category & { id: string }) => item.id,
  });

  const tagsList = useListData({
    initialItems: tagsData?.map(tag => ({ ...tag, id: tag.slug })) || [],
    getKey: (item: Tag & { id: string }) => item.id,
  });

  // Sync lists when data changes
  useEffect(() => {
    if (categoriesData) {
      const itemsWithId = categoriesData.map(cat => ({ ...cat, id: cat.slug }));
      const currentKeys = new Set(categoriesList.items.map(item => item.id));
      const newKeys = new Set(itemsWithId.map(item => item.id));

      // Remove items that are no longer in the data
      currentKeys.forEach(key => {
        if (!newKeys.has(key)) {
          categoriesList.remove(key);
        }
      });

      // Add new items
      itemsWithId.forEach(item => {
        if (!currentKeys.has(item.id)) {
          categoriesList.append(item);
        }
      });
    }
  }, [categoriesData, categoriesList]);

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

  const onCreateAnnouncementClick = () => {
    setShowCreateAnnouncementForm(true);
  };

  const onCreateCategoryClick = () => {
    setShowCreateCategoryForm(true);
  };

  const onCreateTagClick = () => {
    setShowCreateTagForm(true);
  };

  const onAnnouncementSubmit = async (request: CreateAnnouncementRequest) => {
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
      retryAnnouncements();
      retryCategories();
    } catch (err) {
      alertApi.post({ message: (err as Error).message, severity: 'error' });
    }
  };

  const onCategorySubmit = async (request: CreateCategoryRequest) => {
    try {
      await announcementsApi.createCategory(request);
      alertApi.post({
        message: `${request.title} ${t(
          'admin.categoriesContent.createdMessage',
        )}`,
        severity: 'success',
      });
      setShowCreateCategoryForm(false);
      retryCategories();
      // Update the list when a new category is created
      if (categoriesData) {
        const newCategory = categoriesData.find(
          c => c.slug === slugify(request.title, { lower: true }),
        );
        if (newCategory) {
          categoriesList.append({ ...newCategory, id: newCategory.slug });
        }
      }
    } catch (err) {
      alertApi.post({ message: (err as Error).message, severity: 'error' });
    }
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

  const onCategoryDelete = async () => {
    closeCategoryDeleteDialog();

    try {
      await announcementsApi.deleteCategory(categoryToDelete!.slug);
      alertApi.post({
        message: t('admin.categoriesContent.table.categoryDeleted'),
        severity: 'success',
      });
      categoriesList.remove(categoryToDelete!.slug);
      retryCategories();
    } catch (err) {
      alertApi.post({
        message: (err as Error).message,
        severity: 'error',
      });
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
    } catch (err) {
      alertApi.post({
        message: (err as Error).message,
        severity: 'error',
      });
    }
  };

  const onCategoryRemove = (keys: Set<Key>) => {
    const key = Array.from(keys)[0];
    const category = categoriesList.getItem(key as string);
    if (category) {
      // Extract the original Category type (without id)
      const { id, ...categoryWithoutId } = category;
      openCategoryDeleteDialog(categoryWithoutId as Category);
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

  if (announcementsLoading || categoriesLoading || tagsLoading) {
    return <Progress />;
  }

  if (announcementsError || categoriesError || tagsError) {
    const error = announcementsError || categoriesError || tagsError;
    return <ErrorPanel error={error!} />;
  }

  return (
    <RequirePermission permission={announcementCreatePermission}>
      <Container>
        <Grid.Root columns="12">
          {/* First Column: Create Menu and Forms */}

          {/* <Grid.Item colSpan="12">
            <Header
              title="Announcements"
              customActions={
                <>
                  <ButtonIcon variant="tertiary" icon={<RiCloudy2Line />} />
                  <ButtonIcon
                    variant="tertiary"
                    icon={<RiEmotionHappyLine />}
                  />
                  <ButtonIcon variant="tertiary" icon={<RiHeartLine />} />
                </>
              }
            />
          </Grid.Item> */}

          <Grid.Item colSpan="1">
            <Box
              p="4"
              style={{
                borderRight: '1px solid #e0e0e0',
                height: '100%',
              }}
            >
              <Flex direction="column" gap="3">
                <MenuTrigger>
                  <Button
                    iconEnd={<RiAddLine />}
                    isDisabled={
                      permissions.create.loading || !permissions.create.allowed
                    }
                    variant="primary"
                  >
                    New
                  </Button>
                  <Menu placement="right top">
                    <MenuItem
                      onClick={onCreateAnnouncementClick}
                      isDisabled={
                        permissions.create.loading ||
                        !permissions.create.allowed
                      }
                    >
                      Announcement
                    </MenuItem>
                    <MenuItem
                      onClick={onCreateCategoryClick}
                      isDisabled={
                        permissions.create.loading ||
                        !permissions.create.allowed
                      }
                    >
                      Category
                    </MenuItem>
                    <MenuItem
                      onClick={onCreateTagClick}
                      isDisabled={
                        permissions.create.loading ||
                        !permissions.create.allowed
                      }
                    >
                      Tag
                    </MenuItem>
                  </Menu>
                </MenuTrigger>
              </Flex>
            </Box>
          </Grid.Item>

          {/* Tables */}
          <Grid.Item colSpan="12">
            <Flex direction="column">
              {/* Announcements Table */}
              <Card>
                <CardHeader>
                  <Header title="Announcements" icon={<RiBook2Fill />} />
                </CardHeader>
                <CardBody>
                  <AnnouncementsTable
                    announcements={announcements?.results ?? []}
                    searchText={searchText}
                  />
                </CardBody>
              </Card>

              {/* Categories TagGroup */}
              <Card>
                <CardHeader>
                  <Text variant="title-medium">Categories</Text>
                </CardHeader>
                <CardBody>
                  {categoriesList.items.length > 0 ? (
                    <TagGroup
                      aria-label="Categories"
                      items={categoriesList.items}
                      onRemove={
                        permissions.delete.allowed
                          ? onCategoryRemove
                          : undefined
                      }
                    >
                      {item => (
                        <TagComponent textValue={item.title}>
                          {item.title}
                        </TagComponent>
                      )}
                    </TagGroup>
                  ) : (
                    <Text>
                      {t('admin.categoriesContent.table.noCategoriesFound')}
                    </Text>
                  )}
                </CardBody>
              </Card>

              {/* Tags TagGroup */}
              <Card>
                <CardHeader>
                  <Text variant="title-medium">Tags</Text>
                </CardHeader>
                <CardBody>
                  {tagsList.items.length > 0 ? (
                    <TagGroup
                      aria-label="Tags"
                      items={tagsList.items}
                      onRemove={
                        permissions.delete.allowed ? onTagRemove : undefined
                      }
                    >
                      {item => (
                        <TagComponent textValue={item.title}>
                          {item.title}
                        </TagComponent>
                      )}
                    </TagGroup>
                  ) : (
                    <Text>{t('admin.tagsContent.table.noTagsFound')}</Text>
                  )}
                </CardBody>
              </Card>
            </Flex>
          </Grid.Item>
        </Grid.Root>

        {/* Create Announcement Dialog */}
        <Dialog
          isOpen={showCreateAnnouncementForm}
          onOpenChange={setShowCreateAnnouncementForm}
          width="90%"
          style={{ maxWidth: '800px' }}
        >
          <DialogHeader>{t('announcementForm.newAnnouncement')}</DialogHeader>
          <DialogBody>
            <AnnouncementForm
              initialData={{ active: !defaultInactive } as Announcement}
              onSubmit={onAnnouncementSubmit}
            />
          </DialogBody>
        </Dialog>

        {/* Create Category Dialog */}
        <Dialog
          isOpen={showCreateCategoryForm}
          onOpenChange={setShowCreateCategoryForm}
          width="500px"
        >
          <DialogHeader>{t('categoriesForm.newCategory')}</DialogHeader>
          <DialogBody>
            <CategoriesForm
              initialData={{} as Category}
              onSubmit={onCategorySubmit}
            />
          </DialogBody>
        </Dialog>

        {/* Create Tag Dialog */}
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
          type="category"
          open={isCategoryDeleteDialogOpen}
          onCancel={closeCategoryDeleteDialog}
          onConfirm={onCategoryDelete}
        />

        <DeleteConfirmationDialog
          type="tag"
          open={isTagDeleteDialogOpen}
          onCancel={closeTagDeleteDialog}
          onConfirm={onTagDelete}
        />
      </Container>
    </RequirePermission>
  );
};
