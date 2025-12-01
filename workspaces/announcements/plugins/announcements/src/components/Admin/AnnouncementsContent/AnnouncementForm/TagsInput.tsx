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
import Autocomplete, { createFilterOptions } from '@mui/material/Autocomplete';
import TextField from '@mui/material/TextField';
import Chip from '@mui/material/Chip';
import CircularProgress from '@mui/material/CircularProgress';
import {
  useTags,
  useAnnouncementsTranslation,
} from '@backstage-community/plugin-announcements-react';
import { Tag } from '@backstage-community/plugin-announcements-common';

export interface TagOption extends Tag {
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

interface TagsInputProps {
  setForm: (form: any) => void;
  form: any;
}

export default function TagsInput({ setForm, form }: TagsInputProps) {
  const { tags, loading } = useTags();
  const { t } = useAnnouncementsTranslation();
  const createLabel = t('announcementForm.tagsInput.create');

  const existingTags = useMemo(() => {
    if (!form.tags || form.tags.length === 0) return [];
    return form.tags.map((tagSlug: string) => {
      const foundTag = tags?.find(tag => tag.slug === tagSlug);
      return foundTag || { title: tagSlug, slug: tagSlug };
    });
  }, [form.tags, tags]);

  const handleTagChange = (_event: any, newValue: (string | TagOption)[]) => {
    if (!newValue || newValue.length === 0) {
      setForm({ ...form, tags: [] });
      return;
    }

    const processedTags = newValue.map(item => prepareTagFromInput(item));
    const uniqueTags = Array.from(new Set(processedTags));

    setForm({ ...form, tags: uniqueTags });
  };

  return (
    <Autocomplete
      fullWidth
      multiple
      freeSolo
      clearOnBlur
      value={existingTags}
      onChange={handleTagChange}
      options={tags || []}
      loading={loading}
      getOptionLabel={(option: string | TagOption) =>
        typeof option === 'string' ? option : option.title
      }
      filterOptions={(options, params) => {
        const filtered = filter(options as TagOption[], params);
        const { inputValue } = params;
        if (
          inputValue.trim() !== '' &&
          !options.some(
            option =>
              typeof option !== 'string' &&
              inputValue.toLocaleLowerCase('en-US') ===
                option.title.toLocaleLowerCase('en-US'),
          )
        ) {
          filtered.push({
            title: `${createLabel} "${inputValue}"`,
            slug: inputValue.toLocaleLowerCase('en-US'),
            inputValue,
            isNew: true,
          });
        }
        return filtered;
      }}
      renderTags={(value: (string | TagOption)[], getTagProps) =>
        value.map((option, index) => {
          const tag =
            typeof option === 'string'
              ? { title: option, slug: option.toLocaleLowerCase('en-US') }
              : option;

          const tagProps = getTagProps({ index });
          const { key, ...chipProps } = tagProps;

          return (
            <Chip
              key={key}
              variant="outlined"
              label={tag.title}
              {...chipProps}
            />
          );
        })
      }
      renderInput={params => (
        <TextField
          {...params}
          label="Tags"
          variant="outlined"
          InputProps={{
            ...params.InputProps,
            endAdornment: (
              <>
                {loading ? (
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
