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
import { Tag } from '@backstage-community/plugin-announcements-common';
import { useAnnouncementsTranslation } from '@backstage-community/plugin-announcements-react';

import { SlugTitleTableCard } from '../shared';
import { TagsTable } from './TagsTable';

/**
 * @internal
 */
type TagsTableCardProps = {
  tags: Tag[];
  onCreateClick: () => void;
  onDeleteClick: (tag: Tag) => void;
  canCreate: boolean;
  canDelete: boolean;
};

/**
 * @internal
 */
export const TagsTableCard = (props: TagsTableCardProps) => {
  const { tags, onCreateClick, onDeleteClick, canCreate, canDelete } = props;

  const { t } = useAnnouncementsTranslation();

  return (
    <SlugTitleTableCard
      items={tags}
      onCreateClick={onCreateClick}
      onDeleteClick={onDeleteClick}
      canCreate={canCreate}
      canDelete={canDelete}
      translationKeys={{
        pageTitle: t('tagsPage.title'),
        createButton: t('admin.tagsContent.createButton'),
      }}
      renderTable={({ data, onDeleteClick: onDelete }) => (
        <TagsTable data={data} onDeleteClick={onDelete} />
      )}
    />
  );
};
