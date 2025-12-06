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
import { Category } from '@backstage-community/plugin-announcements-common';
import {
  CreateCategoryRequest,
  useAnnouncementsTranslation,
} from '@backstage-community/plugin-announcements-react';
import { FormCard } from '../shared';
import { CategoriesForm } from './CategoriesForm';

type CategoriesFormCardProps = {
  initialData: Category;
  onSubmit: (data: CreateCategoryRequest) => Promise<void>;
};

/**
 * Wrapper component that displays CategoriesForm within a Card.
 * Use this when displaying the form on a page. For modals, use
 * CategoriesForm directly.
 */
export const CategoriesFormCard = (props: CategoriesFormCardProps) => {
  const { initialData, onSubmit } = props;
  const { t } = useAnnouncementsTranslation();

  const title = initialData.title
    ? t('categoriesForm.editCategory')
    : t('categoriesForm.newCategory');

  return (
    <FormCard title={title}>
      <CategoriesForm initialData={initialData} onSubmit={onSubmit} />
    </FormCard>
  );
};
