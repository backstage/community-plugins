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
import { usePermission } from '@backstage/plugin-permission-react';
import { Button, Dialog, DialogActions, DialogTitle } from '@material-ui/core';
import { announcementDeletePermission } from '@backstage-community/plugin-announcements-common';
import { useAnnouncementsTranslation } from '@backstage-community/plugin-announcements-react';

type DeleteAnnouncementDialogProps = {
  open: boolean;
  onConfirm: () => any;
  onCancel: () => any;
};

export const DeleteAnnouncementDialog = (
  props: DeleteAnnouncementDialogProps,
) => {
  const { open, onConfirm, onCancel } = props;

  const { loading: loadingDeletePermission, allowed: canDeleteAnnouncement } =
    usePermission({
      permission: announcementDeletePermission,
    });
  const { t } = useAnnouncementsTranslation();

  return (
    <Dialog open={open} onClose={onCancel}>
      <DialogTitle>{t('deleteDialog.title')}</DialogTitle>
      <DialogActions>
        <Button onClick={onCancel}>{t('deleteDialog.cancel')}</Button>

        <Button
          disabled={loadingDeletePermission || !canDeleteAnnouncement}
          onClick={onConfirm}
          color="secondary"
        >
          {t('deleteDialog.delete')}
        </Button>
      </DialogActions>
    </Dialog>
  );
};
