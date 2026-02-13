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
import { useAnnouncementsTranslation } from '@backstage-community/plugin-announcements-react';
import { Category } from '@backstage-community/plugin-announcements-common';

type CategorySelectInputProps = {
  initialCategory?: Category;
  setCategory: (category: Category | null) => void;
  categories: Category[];
  isLoading?: boolean;
  hideLabel?: boolean;
};

export const CategorySelectInput = ({
  setCategory,
  initialCategory,
  categories,
  isLoading = false,
  hideLabel = false,
}: CategorySelectInputProps) => {
  const { t } = useAnnouncementsTranslation();

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
    if (!value) {
      setCategory(null);
      return;
    }

    let stringValue: string | null = null;

    if (Array.isArray(value)) {
      stringValue = String(value[0] ?? '');
    } else {
      stringValue = String(value);
    }

    if (!stringValue) {
      setCategory(null);
      return;
    }

    const category = categories?.find(cat => cat.slug === stringValue);

    if (!category) {
      setCategory(null);
      return;
    }

    setCategory(category);
  };

  return (
    <Select
      key={selectedCategory?.slug ?? 'none'}
      name="category"
      label={hideLabel ? null : t('announcementsPage.filter.category')}
      searchable
      placeholder={t('announcementsPage.filter.categoryPlaceholder')}
      searchPlaceholder={t(
        'announcementsPage.filter.categorySearchPlaceholder',
      )}
      value={selectedCategory?.slug ?? null}
      onChange={handleChange}
      options={selectOptions}
      isDisabled={isLoading || selectOptions.length === 0}
    />
  );
};
