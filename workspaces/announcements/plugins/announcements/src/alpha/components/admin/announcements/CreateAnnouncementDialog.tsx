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

import { Dialog, DialogTrigger, DialogHeader, DialogBody } from '@backstage/ui';
import {
  CreateAnnouncementRequest,
  useAnnouncementsTranslation,
} from '@backstage-community/plugin-announcements-react';
import { Announcement } from '@backstage-community/plugin-announcements-common';

import { AnnouncementForm } from './AnnouncementForm';

/**
 * @internal
 */
type CreateAnnouncementDialogProps = {
  open: boolean;
  onConfirm: (request: CreateAnnouncementRequest) => Promise<void>;
  onCancel: () => void;
  initialData?: Announcement;
  canSubmit?: boolean;
};

/**
 * @internal
 */
export const CreateAnnouncementDialog = (
  props: CreateAnnouncementDialogProps,
) => {
  const { open, onConfirm, onCancel, initialData, canSubmit } = props;

  const { t } = useAnnouncementsTranslation();

  const dialogTitle = initialData?.title
    ? t('announcementForm.editAnnouncement')
    : t('announcementForm.newAnnouncement');

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
        width="80%"
      >
        <DialogHeader>{dialogTitle}</DialogHeader>

        <DialogBody>
          <AnnouncementForm
            initialData={initialData ?? ({} as Announcement)}
            onSubmit={onConfirm}
            onCancel={onCancel}
            canSubmit={canSubmit}
          />
        </DialogBody>
      </Dialog>
    </DialogTrigger>
  );
};
