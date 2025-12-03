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
import { Button, Dialog, DialogActions, DialogTitle } from '@material-ui/core';
import {
  useAnnouncementsTranslation,
  useAnnouncementsPermissions,
} from '@backstage-community/plugin-announcements-react';

type DeleteDialogProps = {
  isOpen: boolean;
  onConfirm: () => void;
  onCancel: () => void;
};

export const DeleteDialog = (props: DeleteDialogProps) => {
  const { isOpen, onConfirm, onCancel } = props;

  const { t } = useAnnouncementsTranslation();
  const permissions = useAnnouncementsPermissions();

  const dialogTitle = t('confirmDeleteDialog.title');
  const cancelText = t('confirmDeleteDialog.cancel');
  const deleteText = t('confirmDeleteDialog.delete');

  return (
    <Dialog open={isOpen} onClose={onCancel}>
      <DialogTitle>{dialogTitle}</DialogTitle>
      <DialogActions>
        <Button onClick={onCancel}>{cancelText}</Button>

        <Button
          disabled={permissions.delete.loading || !permissions.delete.allowed}
          onClick={onConfirm}
          color="secondary"
        >
          {deleteText}
        </Button>
      </DialogActions>
    </Dialog>
  );
};
