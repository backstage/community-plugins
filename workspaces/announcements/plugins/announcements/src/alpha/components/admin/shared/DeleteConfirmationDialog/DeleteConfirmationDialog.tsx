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

import { useAnnouncementsTranslation } from '@backstage-community/plugin-announcements-react';
import {
  Button,
  Dialog,
  DialogTrigger,
  DialogHeader,
  DialogBody,
  DialogFooter,
} from '@backstage/ui';

type DeleteConfirmationDialogProps = {
  type: 'announcement' | 'category' | 'tag';
  itemTitle?: string;
  open: boolean;
  onConfirm: () => any;
  onCancel: () => any;
  canDelete?: boolean;
};

export const DeleteConfirmationDialog = (
  props: DeleteConfirmationDialogProps,
) => {
  const { type, open, onConfirm, onCancel, itemTitle, canDelete } = props;

  const { t } = useAnnouncementsTranslation();

  const title = t('confirmDeleteDialog.title');
  const body = t('confirmDeleteDialog.body', { type });
  const cancelText = t('confirmDeleteDialog.cancel');
  const deleteText = t('confirmDeleteDialog.delete');

  return (
    <DialogTrigger>
      <Dialog
        isOpen={open}
        isDismissable
        onOpenChange={isOpen => {
          if (!isOpen) {
            onCancel();
          }
        }}
      >
        <DialogHeader>{title}</DialogHeader>
        <DialogBody>{itemTitle ? itemTitle : body}</DialogBody>
        <DialogFooter>
          <Button
            onClick={onConfirm}
            variant="primary"
            isDisabled={canDelete === false}
          >
            {deleteText}
          </Button>
          <Button onClick={onCancel} variant="secondary" slot="close">
            {cancelText}
          </Button>
        </DialogFooter>
      </Dialog>
    </DialogTrigger>
  );
};
