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

import { useState, useEffect, useMemo } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { TextField, Grid, Button, Flex, Card, CardBody } from '@backstage/ui';
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

export const AnnouncementsFilters = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const queryParams = useMemo(
    () => new URLSearchParams(location.search),
    [location.search],
  );
  const { t } = useAnnouncementsTranslation();
  const { categories } = useCategories();
  const { tags } = useTags();

  const [searchQuery, setSearchQuery] = useState(
    queryParams.get('search') || '',
  );
  const [selectedCategory, setSelectedCategory] = useState<Category | null>(
    null,
  );
  const [selectedTags, setSelectedTags] = useState<Tag[]>([]);

  // Initialize from URL params
  useEffect(() => {
    const categorySlug = queryParams.get('category');
    if (categorySlug && categories.length > 0) {
      const category = categories.find(c => c.slug === categorySlug);
      setSelectedCategory(category || null);
    } else {
      setSelectedCategory(null);
    }
  }, [categories, queryParams]);

  useEffect(() => {
    const tagsParam = queryParams.get('tags');
    if (tagsParam && tags.length > 0) {
      const tagSlugs = tagsParam.split(',').filter(Boolean);
      const foundTags = tags.filter(tag => tagSlugs.includes(tag.slug));
      setSelectedTags(foundTags);
    } else {
      setSelectedTags([]);
    }
  }, [queryParams, tags]);

  const handleApplyFilters = () => {
    const newParams = new URLSearchParams();
    if (searchQuery.trim()) {
      newParams.set('search', searchQuery.trim());
    }
    if (selectedCategory) {
      newParams.set('category', selectedCategory.slug);
    }
    if (selectedTags.length > 0) {
      newParams.set('tags', selectedTags.map(tag => tag.slug).join(','));
    }

    navigate({ search: newParams.toString() }, { replace: true });
  };

  const handleClearFilters = () => {
    setSearchQuery('');
    setSelectedCategory(null);
    setSelectedTags([]);
    navigate({ search: '' }, { replace: true });
  };

  const hasActiveFilters = useMemo(() => {
    return (
      searchQuery.trim() !== '' ||
      selectedCategory !== null ||
      selectedTags.length > 0
    );
  }, [searchQuery, selectedCategory, selectedTags]);

  return (
    <Grid.Root columns={{ xs: '6', md: '6' }}>
      <Grid.Item colSpan={{ xs: '6', md: '2', lg: '3' }}>
        <TextField
          label={t('announcementsPage.filter.search')}
          placeholder={t('announcementsPage.filter.searchPlaceholder')}
          value={searchQuery}
          onChange={v => setSearchQuery(v)}
          size="small"
          onKeyDown={e => {
            if (e.key === 'Enter') {
              handleApplyFilters();
            }
          }}
        />
      </Grid.Item>

      <Grid.Item colSpan={{ xs: '6', md: '2', lg: '1' }}>
        <CategorySelectInput
          initialCategory={selectedCategory ?? undefined}
          setCategory={setSelectedCategory}
        />
      </Grid.Item>

      <Grid.Item colSpan={{ xs: '6', md: '2', lg: '1' }}>
        <TagsSelectInput
          initialTags={selectedTags ?? undefined}
          setTags={setSelectedTags}
        />
      </Grid.Item>

      <Grid.Item colSpan={{ xs: '6', md: '6', lg: '1' }}>
        <Flex align="end" style={{ height: '100%' }}>
          <Button
            variant="secondary"
            onClick={handleClearFilters}
            isDisabled={!hasActiveFilters}
          >
            {t('announcementsPage.filter.clear')}
          </Button>

          <Button variant="primary" onClick={handleApplyFilters}>
            {t('announcementsPage.filter.apply')}
          </Button>
        </Flex>
      </Grid.Item>
    </Grid.Root>
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
