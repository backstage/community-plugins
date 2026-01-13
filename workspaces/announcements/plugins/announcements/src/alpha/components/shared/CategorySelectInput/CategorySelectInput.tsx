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
import { Key, useMemo } from 'react';
import { Select } from '@backstage/ui';
import {
  useAnnouncementsTranslation,
  useCategories,
} from '@backstage-community/plugin-announcements-react';
import { Category } from '@backstage-community/plugin-announcements-common';

type CategorySelectInputProps = {
  initialCategory?: Category;
  setCategory: (category: Category) => void;
  hideLabel?: boolean;
};

export const CategorySelectInput = ({
  setCategory,
  initialCategory,
  hideLabel = false,
}: CategorySelectInputProps) => {
  const { t } = useAnnouncementsTranslation();

  const { categories, loading: categoriesLoading } = useCategories();

  const selectOptions = useMemo(() => {
    if (!categories) return [];
    return categories.map(category => ({
      value: category.slug,
      label: category.title,
    }));
  }, [categories]);

  const selectedCategory = useMemo(() => {
    if (!initialCategory) return undefined;

    const category = categories?.find(cat => cat.slug === initialCategory.slug);

    return category ?? initialCategory;
  }, [initialCategory, categories]);

  const handleChange = (value: Key[] | Key | null) => {
    if (!value) return;

    let stringValue: string | null = null;

    if (Array.isArray(value)) {
      stringValue = String(value[0] ?? '');
    } else {
      stringValue = String(value);
    }

    if (!stringValue) return;

    const category = categories?.find(cat => cat.slug === stringValue);

    if (!category) return;

    setCategory(category);
  };

  return (
    <Select
      name="category"
      label={hideLabel ? null : t('announcementsPage.filter.category')}
      searchable
      placeholder={t('announcementsPage.filter.categoryPlaceholder')}
      searchPlaceholder={t(
        'announcementsPage.filter.categorySearchPlaceholder',
      )}
      value={selectedCategory?.slug}
      onChange={handleChange}
      options={selectOptions}
      isDisabled={categoriesLoading}
    />
  );
};
