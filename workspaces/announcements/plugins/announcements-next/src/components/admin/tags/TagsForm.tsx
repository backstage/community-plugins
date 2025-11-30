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
import { CreateTagRequest } from '@backstage-community/plugin-announcements-react';
import { Tag } from '@backstage-community/plugin-announcements-common';
import { EntityForm } from '../shared';

export type TagsFormProps = {
  initialData: Tag;
  onSubmit: (data: CreateTagRequest) => Promise<void>;
};

export const TagsForm = ({
  initialData = { title: '', slug: '' },
  onSubmit,
}: TagsFormProps) => {
  return (
    <EntityForm<Tag, CreateTagRequest>
      initialData={initialData}
      onSubmit={onSubmit}
      translationKeys={{
        editLabel: 'tagsForm.editTag',
        newLabel: 'tagsForm.newTag',
        titleLabel: 'tagsForm.titleLabel',
        submit: 'tagsForm.submit',
      }}
      validateForm={form => Boolean(form.title)}
      testIds={{
        form: 'tag-form',
        titleInput: 'tag-title-input',
        submitButton: 'tag-submit-button',
      }}
    />
  );
};
