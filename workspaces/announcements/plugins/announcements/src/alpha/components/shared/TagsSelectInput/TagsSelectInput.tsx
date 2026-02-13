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
import { Tag } from '@backstage-community/plugin-announcements-common';

type TagsSelectInputProps = {
  initialTags?: Tag[];
  setTags: (tags: Tag[] | null) => void;
  tags: Tag[];
  isLoading?: boolean;
  hideLabel?: boolean;
};

export const TagsSelectInput = ({
  setTags,
  initialTags,
  tags,
  isLoading = false,
  hideLabel = false,
}: TagsSelectInputProps) => {
  const { t } = useAnnouncementsTranslation();

  const selectOptions = useMemo(() => {
    if (!tags) return [];
    return tags.map(tag => ({
      value: tag.slug,
      label: tag.title,
    }));
  }, [tags]);

  const selectedTags = useMemo(() => {
    if (!initialTags || initialTags.length === 0) return [];

    return initialTags.map(initialTag => {
      const tag = tags?.find(tagItem => tagItem.slug === initialTag.slug);
      return tag ?? initialTag;
    });
  }, [initialTags, tags]);

  const selectedTagSlugs = useMemo(() => {
    return selectedTags.map(tag => tag.slug);
  }, [selectedTags]);

  const handleChange = (value: Key[] | Key | null) => {
    if (!value) {
      setTags(null);
      return;
    }

    let stringValues: string[] = [];

    if (Array.isArray(value)) {
      stringValues = value.map(v => String(v));
    } else {
      stringValues = [String(value)];
    }

    if (stringValues.length === 0) {
      setTags(null);
      return;
    }

    const selectedTagsList = stringValues
      .map(slug => tags?.find(tag => tag.slug === slug))
      .filter((tag): tag is Tag => tag !== undefined);

    setTags(selectedTagsList.length > 0 ? selectedTagsList : null);
  };

  return (
    <Select
      key={selectedTagSlugs.join(',') || 'none'}
      name="tags"
      label={hideLabel ? null : t('announcementsPage.filter.tags')}
      placeholder={t('announcementsPage.filter.tagsPlaceholder')}
      searchPlaceholder={t('announcementsPage.filter.tagsSearchPlaceholder')}
      searchable
      selectionMode="multiple"
      value={selectedTagSlugs}
      onChange={handleChange}
      options={selectOptions}
      isDisabled={isLoading || selectOptions.length === 0}
    />
  );
};
