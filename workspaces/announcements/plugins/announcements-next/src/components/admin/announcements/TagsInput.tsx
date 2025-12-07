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
import {
  useTags,
  useAnnouncementsTranslation,
} from '@backstage-community/plugin-announcements-react';
import { Select } from '@backstage/ui';

interface TagsInputProps {
  setForm: (form: any) => void;
  form: any;
}

export default function TagsInput({ setForm, form }: TagsInputProps) {
  const { tags } = useTags();
  const { t } = useAnnouncementsTranslation();

  const options = useMemo(() => {
    return tags.map(tag => ({
      value: tag.slug,
      label: tag.title,
    }));
  }, [tags]);

  const selectedValues = useMemo(() => {
    if (!form.tags || form.tags.length === 0) return null;
    return form.tags;
  }, [form.tags]);

  return (
    <Select
      name="tags"
      label={t('announcementForm.tagsInput.label')}
      searchable
      selectionMode="multiple"
      searchPlaceholder="Search tags..."
      options={options}
      placeholder="Select Tags"
      value={selectedValues}
      onChange={selectedValue => {
        // Handle Key | Key[] | null from react-aria-components
        if (selectedValue === null) {
          setForm({ ...form, tags: [] });
        } else if (Array.isArray(selectedValue)) {
          setForm({ ...form, tags: selectedValue.map(v => String(v)) });
        } else {
          setForm({ ...form, tags: [String(selectedValue)] });
        }
      }}
    />
  );
}
