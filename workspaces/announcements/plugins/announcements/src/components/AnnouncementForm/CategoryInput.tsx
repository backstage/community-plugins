/*
 * Copyright 2024 The Backstage Authors
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
import { SetStateAction } from 'react';
import TextField from '@mui/material/TextField';
import Autocomplete, { createFilterOptions } from '@mui/material/Autocomplete';
import { Category } from '@backstage-community/plugin-announcements-common';
import {
  useAnnouncementsTranslation,
  useCategories,
} from '@backstage-community/plugin-announcements-react';
import CircularProgress from '@mui/material/CircularProgress';

type CategoryInputProps = {
  setForm: (
    value: SetStateAction<{
      category: string | undefined;
      tags: string[] | undefined;
      id: string;
      publisher: string;
      title: string;
      excerpt: string;
      body: string;
      created_at: string;
      active: boolean;
      start_at: string;
      until_date: string;
      sendNotification: boolean;
      updated_at: string;
    }>,
  ) => void;
  form: {
    category: string | undefined;
    tags: string[] | undefined;
    id: string;
    publisher: string;
    title: string;
    excerpt: string;
    body: string;
    created_at: string;
    active: boolean;
    start_at: string;
    until_date: string;
    sendNotification: boolean;
    updated_at: string;
  };
  initialValue: string;
};

const filter = createFilterOptions<Category>();

function prepareCategoryFromInput(
  inputCategory: Category | string,
  localizedCreate?: string,
): string {
  return (
    typeof inputCategory === 'string' ? inputCategory : inputCategory.title
  )
    .replace(localizedCreate ? `${localizedCreate} ` : 'Create ', '')
    .replaceAll('"', '');
}

export default function CategoryInput({
  setForm,
  form,
  initialValue,
}: CategoryInputProps) {
  const { categories, loading: categoriesLoading } = useCategories();
  const { t } = useAnnouncementsTranslation();

  return (
    <Autocomplete
      fullWidth
      value={initialValue ?? ''}
      onChange={async (_, newValue) => {
        if (!newValue) {
          setForm({ ...form, category: undefined });
          return;
        }

        const newCategory = prepareCategoryFromInput(
          newValue,
          t('announcementForm.categoryInput.create'),
        );
        setForm({ ...form, category: newCategory });
      }}
      filterOptions={(options, params) => {
        const filtered = filter(options, params);
        const { inputValue } = params;

        /*
          Suggest the creation of a new category. This adds the new value to the list of options
          and creates the new category when the form is submitted.
        */
        const isExisting = options.some(
          option =>
            inputValue.toLocaleLowerCase('en-US') ===
            option.title.toLocaleLowerCase('en-US'),
        );
        if (inputValue !== '' && !isExisting) {
          filtered.push({
            title: `${t(
              'announcementForm.categoryInput.create',
            )} "${inputValue}"`,
            slug: inputValue.toLocaleLowerCase('en-US'),
          });
        }

        return filtered;
      }}
      selectOnFocus
      handleHomeEndKeys
      loading={categoriesLoading}
      id="category-input-field"
      options={categories || []}
      getOptionLabel={option => {
        // Value selected with enter, right from the input
        return prepareCategoryFromInput(option);
      }}
      renderOption={(props, option) => <li {...props}>{option.title}</li>}
      freeSolo
      renderInput={params => (
        <TextField
          {...params}
          id="category"
          label={t('announcementForm.categoryInput.label')}
          variant="outlined"
          fullWidth
          InputProps={{
            ...params.InputProps,
            endAdornment: (
              <>
                {categoriesLoading ? (
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
