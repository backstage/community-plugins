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

import {
  CreateCategoryRequest,
  useAnnouncementsTranslation,
} from '@backstage-community/plugin-announcements-react';
import { CreateTitleDialog } from '../shared';

/**
 * @internal
 */
type CreateCategoryDialogProps = {
  open: boolean;
  onConfirm: (request: CreateCategoryRequest) => Promise<void>;
  onCancel: () => void;
  canSubmit?: boolean;
};

/**
 * @internal
 */
export const CreateCategoryDialog = (props: CreateCategoryDialogProps) => {
  const { open, onConfirm, onCancel, canSubmit } = props;

  const { t } = useAnnouncementsTranslation();

  const translationKeys = {
    new: t('categoriesForm.newCategory'),
    edit: t('categoriesForm.editCategory'),
    titleLabel: t('categoriesForm.titleLabel'),
    submit: t('categoriesForm.submit'),
    cancel: t('admin.categoriesContent.cancelButton'),
  };

  return (
    <CreateTitleDialog<CreateCategoryRequest>
      open={open}
      onCancel={onCancel}
      translationKeys={translationKeys}
      onSubmit={onConfirm}
      canSubmit={canSubmit}
    />
  );
};
