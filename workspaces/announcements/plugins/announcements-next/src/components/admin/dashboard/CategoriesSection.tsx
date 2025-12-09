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
  CreateCategoryRequest,
  useAnnouncementsTranslation,
  useCategories,
} from '@backstage-community/plugin-announcements-react';
import { Category } from '@backstage-community/plugin-announcements-common';
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
import { RiAddLine, RiBookmarkLine } from '@remixicon/react';

import { CategoriesForm } from '../categories/CategoriesForm';
import {
  useAnnouncementsPermissions,
  DeleteConfirmationDialog,
  useDeleteConfirmationDialogState,
} from '../shared';

type CategoriesSectionProps = {
  onRefresh: () => void;
};

export const CategoriesSection = (props: CategoriesSectionProps) => {
  const { onRefresh } = props;

  const alertApi = useApi(alertApiRef);
  const announcementsApi = useApi(announcementsApiRef);
  const { t } = useAnnouncementsTranslation();
  const permissions = useAnnouncementsPermissions();

  const { categories: categoriesData, retry: retryCategories } =
    useCategories();

  const [showCreateCategoryForm, setShowCreateCategoryForm] = useState(false);

  const {
    isOpen: isCategoryDeleteDialogOpen,
    open: openCategoryDeleteDialog,
    close: closeCategoryDeleteDialog,
    item: categoryToDelete,
  } = useDeleteConfirmationDialogState<Category>();

  const categoriesList = useListData({
    initialItems: categoriesData?.map(cat => ({ ...cat, id: cat.slug })) || [],
    getKey: (item: Category & { id: string }) => item.id,
  });

  // Sync list when data changes
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

  const onCreateCategoryClick = () => {
    setShowCreateCategoryForm(true);
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
      onRefresh();
    } catch (err) {
      alertApi.post({ message: (err as Error).message, severity: 'error' });
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
      onRefresh();
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

  return (
    <>
      <Card>
        <CardHeader>
          <Header
            title="Categories"
            icon={<RiBookmarkLine />}
            // customActions={
            //   <Button
            //     onClick={onCreateCategoryClick}
            //     iconEnd={<RiAddLine />}
            //     isDisabled={
            //       permissions.create.loading || !permissions.create.allowed
            //     }
            //     variant="primary"
            //   >
            //     Create category
            //   </Button>
            // }
          />
        </CardHeader>
        <CardBody>
          {categoriesList.items.length > 0 ? (
            <TagGroup
              aria-label="Categories"
              items={categoriesList.items}
              onRemove={
                permissions.delete.allowed ? onCategoryRemove : undefined
              }
            >
              {item => (
                <TagComponent textValue={item.title}>{item.title}</TagComponent>
              )}
            </TagGroup>
          ) : (
            <Box px="2">
              <Text>
                {t('admin.categoriesContent.table.noCategoriesFound')}
              </Text>
            </Box>
          )}
        </CardBody>
      </Card>

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

      <DeleteConfirmationDialog
        type="category"
        open={isCategoryDeleteDialogOpen}
        onCancel={closeCategoryDeleteDialog}
        onConfirm={onCategoryDelete}
      />
    </>
  );
};
