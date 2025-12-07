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
import { SetStateAction, useMemo } from 'react';
import {
  useAnnouncementsTranslation,
  useCategories,
} from '@backstage-community/plugin-announcements-react';
import { Select } from '@backstage/ui';

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
};

export default function CategoryInput({ setForm, form }: CategoryInputProps) {
  const { categories } = useCategories();
  const { t } = useAnnouncementsTranslation();

  const options = useMemo(() => {
    return categories.map(category => ({
      value: category.slug,
      label: category.title,
    }));
  }, [categories]);

  return (
    <Select
      name="category"
      label={t('announcementForm.categoryInput.label')}
      searchable
      searchPlaceholder="Search categories..."
      options={options}
      placeholder="Select Category"
      value={form.category || null}
      onChange={selectedValue => {
        // Handle Key | Key[] | null from react-aria-components
        const stringValue =
          selectedValue === null ? undefined : String(selectedValue);
        setForm({ ...form, category: stringValue });
      }}
    />
  );
}
