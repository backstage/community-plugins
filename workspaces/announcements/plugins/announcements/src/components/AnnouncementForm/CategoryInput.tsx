import * as React from 'react';
import TextField from '@mui/material/TextField';
import Autocomplete, { createFilterOptions } from '@mui/material/Autocomplete';
import { Category } from '@procore-oss/backstage-plugin-announcements-common';
import { useCategories } from '@procore-oss/backstage-plugin-announcements-react';
import CircularProgress from '@material-ui/core/CircularProgress';

type CategoryInputProps = {
  setForm: (
    value: React.SetStateAction<{
      category: string | undefined;
      id: string;
      publisher: string;
      title: string;
      excerpt: string;
      body: string;
      created_at: string;
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
  };
  initialValue: string;
};

const filter = createFilterOptions<Category>();

function prepareCategoryFromInput(inputCategory: Category | string): string {
  return (
    typeof inputCategory === 'string' ? inputCategory : inputCategory.title
  )
    .replace('Create ', '')
    .replaceAll('"', '');
}

export default function CategoryInput({
  setForm,
  form,
  initialValue,
}: CategoryInputProps) {
  const { categories, loading: categoriesLoading } = useCategories();

  return (
    <Autocomplete
      fullWidth
      value={initialValue ?? ''}
      onChange={async (_, newValue) => {
        if (!newValue) {
          setForm({ ...form, category: undefined });
          return;
        }

        const newCategory = prepareCategoryFromInput(newValue);
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
          option => inputValue.toLowerCase() === option.title.toLowerCase(),
        );
        if (inputValue !== '' && !isExisting) {
          filtered.push({
            title: `Create "${inputValue}"`,
            slug: inputValue.toLowerCase(),
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
          label="Category"
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
