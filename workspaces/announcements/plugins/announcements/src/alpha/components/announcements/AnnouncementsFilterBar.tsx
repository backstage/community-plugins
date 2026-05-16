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

import { useMemo } from 'react';
import { Button, Card, CardBody, Flex, Text } from '@backstage/ui';
import {
  useCategories,
  useTags,
  useAnnouncementsTranslation,
} from '@backstage-community/plugin-announcements-react';
import {
  Category,
  Tag,
} from '@backstage-community/plugin-announcements-common';

import { CategorySelectInput, TagsSelectInput } from '../shared';
import { useSearchParams } from 'react-router-dom';

export const AnnouncementsFilters = () => {
  const { t } = useAnnouncementsTranslation();

  const [searchParams, setSearchParams] = useSearchParams();

  const { categories, loading: categoriesLoading } = useCategories();
  const { tags, loading: tagsLoading } = useTags();

  const handleCategoryChange = (category: Category | null) => {
    const newParams = new URLSearchParams(searchParams);
    if (category) {
      newParams.set('category', category.slug);
    } else {
      newParams.delete('category');
    }
    setSearchParams(newParams, { replace: true });
  };

  const handleTagsChange = (selectedTags: Tag[] | null) => {
    const newParams = new URLSearchParams(searchParams);
    if (selectedTags && selectedTags.length > 0) {
      newParams.set('tags', selectedTags.map(tag => tag.slug).join(','));
    } else {
      newParams.delete('tags');
    }
    setSearchParams(newParams, { replace: true });
  };

  const handleClearFilters = () => {
    const newParams = new URLSearchParams(searchParams);
    newParams.delete('category');
    newParams.delete('tags');
    setSearchParams(newParams, { replace: true });
  };

  const selectedTagsFromUrl = useMemo(() => {
    const tagsParam = searchParams.get('tags');
    if (!tagsParam || !tags) return [];

    const tagSlugs = tagsParam.split(',').filter(Boolean);
    return tagSlugs
      .map(slug => tags.find(tag => tag.slug === slug))
      .filter((tag): tag is Tag => tag !== undefined);
  }, [searchParams, tags]);

  const hasActiveFilters = useMemo(() => {
    return (
      searchParams.get('category') !== null || searchParams.get('tags') !== null
    );
  }, [searchParams]);

  return (
    <Flex justify="between">
      <Flex>
        <Flex align="center">
          <Text variant="body-medium" weight="bold">
            {t('announcementsPage.filter.label')}
          </Text>
        </Flex>

        <CategorySelectInput
          initialCategory={
            categories?.find(c => c.slug === searchParams.get('category')) ??
            undefined
          }
          categories={categories}
          setCategory={handleCategoryChange}
          isLoading={categoriesLoading}
          hideLabel
        />

        <TagsSelectInput
          initialTags={
            selectedTagsFromUrl.length > 0 ? selectedTagsFromUrl : undefined
          }
          setTags={handleTagsChange}
          tags={tags}
          isLoading={tagsLoading}
          hideLabel
        />
      </Flex>

      <Flex justify="end">
        <Button
          variant="secondary"
          onClick={handleClearFilters}
          isDisabled={!hasActiveFilters}
        >
          {t('announcementsPage.filter.clear')}
        </Button>
      </Flex>
    </Flex>
  );
};

export const AnnouncementsFilterBar = () => {
  return (
    <Card>
      <CardBody>
        <AnnouncementsFilters />
      </CardBody>
    </Card>
  );
};
