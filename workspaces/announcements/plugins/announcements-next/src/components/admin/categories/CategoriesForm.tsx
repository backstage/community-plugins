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
import { FormEvent, useState } from 'react';
import { Card, Button, TextField } from '@backstage/ui';
import {
  CreateCategoryRequest,
  useAnnouncementsTranslation,
} from '@backstage-community/plugin-announcements-react';
import {
  announcementCreatePermission,
  Category,
} from '@backstage-community/plugin-announcements-common';
import { usePermission } from '@backstage/plugin-permission-react';

export type CategoriesFormProps = {
  initialData: Category;
  onSubmit: (data: CreateCategoryRequest) => Promise<void>;
};

export const CategoriesForm = ({
  initialData,
  onSubmit,
}: CategoriesFormProps) => {
  const [form, setForm] = useState(initialData);
  const [loading, setLoading] = useState(false);
  const { t } = useAnnouncementsTranslation();

  const { loading: loadingCreatePermission, allowed: canCreateCategory } =
    usePermission({
      permission: announcementCreatePermission,
    });

  const handleSubmit = async (event: FormEvent<HTMLFormElement>) => {
    setLoading(true);
    event.preventDefault();

    await onSubmit(form);
    setLoading(false);
  };

  return (
    <Card
      title={
        initialData.title
          ? t('categoriesForm.editCategory')
          : t('categoriesForm.newCategory')
      }
    >
      <form onSubmit={handleSubmit}>
        <TextField
          id="title"
          type="text"
          label={t('categoriesForm.titleLabel')}
          value={form.title}
          isRequired
          onChange={e => setForm({ ...form, title: e })}
        />
        <Button
          type="submit"
          variant="primary"
          isDisabled={
            loading || !form || loadingCreatePermission || !canCreateCategory
          }
        >
          {t('categoriesForm.submit')}
        </Button>
      </form>
    </Card>
  );
};
