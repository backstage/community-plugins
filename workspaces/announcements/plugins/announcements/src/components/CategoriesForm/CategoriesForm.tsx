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
import { ChangeEvent, FormEvent, useState } from 'react';
import { InfoCard } from '@backstage/core-components';
import {
  CreateCategoryRequest,
  useAnnouncementsTranslation,
} from '@backstage-community/plugin-announcements-react';
import {
  announcementCreatePermission,
  Category,
} from '@backstage-community/plugin-announcements-common';
import { usePermission } from '@backstage/plugin-permission-react';
import { Button, makeStyles, TextField } from '@material-ui/core';

const useStyles = makeStyles(theme => {
  return {
    formRoot: {
      '& > *': {
        margin: theme?.spacing?.(1) ?? '8px',
      },
    },
  };
});

export type CategoriesFormProps = {
  initialData: Category;
  onSubmit: (data: CreateCategoryRequest) => Promise<void>;
};

export const CategoriesForm = ({
  initialData,
  onSubmit,
}: CategoriesFormProps) => {
  const classes = useStyles();
  const [form, setForm] = useState(initialData);
  const [loading, setLoading] = useState(false);
  const { t } = useAnnouncementsTranslation();

  const { loading: loadingCreatePermission, allowed: canCreateCategory } =
    usePermission({
      permission: announcementCreatePermission,
    });

  const handleChange = (event: ChangeEvent<HTMLInputElement>) => {
    setForm({
      ...form,
      [event.target.id]: event.target.value,
    });
  };

  const handleSubmit = async (event: FormEvent<HTMLFormElement>) => {
    setLoading(true);
    event.preventDefault();

    await onSubmit(form);
    setLoading(false);
  };

  return (
    <InfoCard
      title={
        initialData.title
          ? t('categoriesForm.editCategory')
          : t('categoriesForm.newCategory')
      }
    >
      <form className={classes.formRoot} onSubmit={handleSubmit}>
        <TextField
          id="title"
          type="text"
          label={t('categoriesForm.titleLabel')}
          value={form.title}
          onChange={handleChange}
          variant="outlined"
          fullWidth
          required
        />
        <Button
          variant="contained"
          color="primary"
          type="submit"
          disabled={
            loading || !form || loadingCreatePermission || !canCreateCategory
          }
        >
          {t('categoriesForm.submit')}
        </Button>
      </form>
    </InfoCard>
  );
};
