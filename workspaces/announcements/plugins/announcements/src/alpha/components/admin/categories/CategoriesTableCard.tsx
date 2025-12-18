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
import { Category } from '@backstage-community/plugin-announcements-common';
import { useAnnouncementsTranslation } from '@backstage-community/plugin-announcements-react';

import { SlugTitleTableCard } from '../shared';
import { CategoriesTable } from './CategoriesTable';

/**
 * @internal
 */
type CategoriesTableCardProps = {
  categories: Category[];
  onCreateClick: () => void;
  onDeleteClick: (category: Category) => void;
  canCreate: boolean;
  canDelete: boolean;
};

/**
 * @internal
 */
export const CategoriesTableCard = (props: CategoriesTableCardProps) => {
  const { categories, onCreateClick, onDeleteClick, canCreate, canDelete } =
    props;

  const { t } = useAnnouncementsTranslation();

  return (
    <SlugTitleTableCard
      items={categories}
      onCreateClick={onCreateClick}
      onDeleteClick={onDeleteClick}
      canCreate={canCreate}
      canDelete={canDelete}
      translationKeys={{
        pageTitle: t('categoriesPage.title'),
        createButton: t('admin.categoriesContent.createButton'),
      }}
      renderTable={({ data, onDeleteClick: onDelete }) => (
        <CategoriesTable data={data} onDeleteClick={onDelete} />
      )}
    />
  );
};
