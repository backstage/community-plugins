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
import * as React from 'react';
import TextField from '@mui/material/TextField';
import Autocomplete, { createFilterOptions } from '@mui/material/Autocomplete';
import { Tag } from '@backstage-community/plugin-announcements-common';
import {
  useAnnouncementsTranslation,
  useTags,
  announcementsApiRef,
} from '@backstage-community/plugin-announcements-react';
import { useApi } from '@backstage/core-plugin-api';
import CircularProgress from '@mui/material/CircularProgress';

type TagsInputProps = {
  setForm: (
    value: React.SetStateAction<{
      category: string | undefined;
      id: string;
      publisher: string;
      title: string;
      excerpt: string;
      body: string;
      created_at: string;
      active: boolean;
      start_at: string;
      tags: string[] | undefined;
    }>,
  ) => void;
  form: {
    category: string | undefined;
    id: string;
    publisher: string;
    title: string;
    excerpt: string;
    body: string;
    created_at: string;
    active: boolean;
    start_at: string;
    tags: string[] | undefined;
  };
  initialValue: string;
};

interface TagOption extends Tag {
  inputValue?: string;
  isNew?: boolean;
}

const filter = createFilterOptions<TagOption>();

function prepareTagFromInput(input: string | TagOption): string {
  if (typeof input === 'string') {
    return input.toLocaleLowerCase('en-US');
  }

  if (input.inputValue) {
    return input.inputValue.toLocaleLowerCase('en-US');
  }

  return input.title.toLocaleLowerCase('en-US');
}

export default function TagsInput({ setForm, form }: TagsInputProps) {
  const { tags, loading: tagsLoading, retry: refetchTags } = useTags();
  const announcementsApi = useApi(announcementsApiRef);
  const { t } = useAnnouncementsTranslation();
  const createLabel = t('announcementForm.tagsInput.create');
  const [creatingTag, setCreatingTag] = React.useState(false);

  const existingTags = React.useMemo(() => {
    if (!form.tags || form.tags.length === 0) return [];

    return form.tags.map(tagSlug => {
      const foundTag = tags?.find(tag => tag.slug === tagSlug);
      return foundTag || { title: tagSlug, slug: tagSlug };
    });
  }, [form.tags, tags]);

  const handleTagChange = async (newValue: (string | TagOption)[]) => {
    if (!newValue || newValue.length === 0) {
      setForm({ ...form, tags: [] });
      return;
    }

    setCreatingTag(true);

    const processedTags = await Promise.all(
      newValue.map(async item => {
        if (typeof item === 'object' && item.isNew) {
          try {
            const title = item.inputValue || item.title;
            await announcementsApi.createTag({ title });
            return title.toLocaleLowerCase('en-US');
          } catch (error) {
            return prepareTagFromInput(item);
          }
        }

        return prepareTagFromInput(item);
      }),
    );

    setForm({ ...form, tags: processedTags });
    refetchTags();
    setCreatingTag(false);
  };

  return (
    <Autocomplete
      fullWidth
      freeSolo
      multiple
      value={existingTags}
      onChange={(_, newValue) => {
        handleTagChange(newValue);
      }}
      filterOptions={(options, params) => {
        const filtered = filter(options, params);
        const { inputValue } = params;

        if (!inputValue.trim()) {
          return filtered;
        }

        const isExisting = options.some(
          option =>
            inputValue.toLocaleLowerCase('en-US') ===
            option.title.toLocaleLowerCase('en-US'),
        );
        if (inputValue !== '' && !isExisting) {
          filtered.push({
            title: `${createLabel} "${inputValue}"`,
            slug: inputValue.toLocaleLowerCase('en-US'),
            inputValue,
            isNew: true,
          });
        }
        return filtered;
      }}
      selectOnFocus
      handleHomeEndKeys
      loading={tagsLoading || creatingTag}
      id="tags-input-field"
      options={tags || []}
      getOptionLabel={option => {
        // Value selected with enter, right from the input
        return prepareTagFromInput(option);
      }}
      renderOption={(props, option) => <li {...props}>{option.title}</li>}
      renderInput={params => (
        <TextField
          {...params}
          id="tags"
          label={t('announcementForm.tagsInput.label')}
          variant="outlined"
          fullWidth
          InputProps={{
            ...params.InputProps,
            endAdornment: (
              <>
                {tagsLoading || creatingTag ? (
                  <CircularProgress color="inherit" size={20} />
                ) : null}
                {params.InputProps.endAdornment}
              </>
            ),
          }}
        />
      )}
    />
  );
}
