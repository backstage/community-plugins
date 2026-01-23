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
import { useState, useEffect } from 'react';
import {
  Button,
  Dialog,
  DialogHeader,
  DialogBody,
  DialogFooter,
} from '@backstage/ui';
import { Announcement } from '@backstage-community/plugin-announcements-common';
import {
  CreateAnnouncementRequest,
  useAnnouncementsTranslation,
} from '@backstage-community/plugin-announcements-react';
import { AnnouncementForm } from './AnnouncementForm';

type AnnouncementFormState = Omit<
  Announcement,
  'id' | 'created_at' | 'updated_at'
>;

export type AnnouncementDialogProps = {
  initialData?: Announcement;
  onSubmit: (data: CreateAnnouncementRequest) => Promise<void>;
  open: boolean;
  onCancel: () => void;
  canSubmit?: boolean;
};

export const AnnouncementDialog = (props: AnnouncementDialogProps) => {
  const { initialData, onSubmit, open, onCancel, canSubmit } = props;
  const { t } = useAnnouncementsTranslation();
  const [currentFormData, setCurrentFormData] =
    useState<AnnouncementFormState | null>(null);
  const [loading, setLoading] = useState(false);

  // Reset form state when dialog opens/closes or initialData changes
  useEffect(() => {
    if (!open) {
      setCurrentFormData(null);
    }
  }, [open]);

  const handleFormSubmit = async (data: AnnouncementFormState) => {
    setLoading(true);

    try {
      await onSubmit(data as CreateAnnouncementRequest);
      onCancel();
    } finally {
      setLoading(false);
    }
  };

  const handleDialogSubmit = () => {
    if (currentFormData) {
      handleFormSubmit(currentFormData);
    }
  };

  const handleFormChange = (data: AnnouncementFormState) => {
    setCurrentFormData(data);
  };

  const isEditing = Boolean(initialData?.id);
  const isDisabled = loading || !currentFormData?.title || canSubmit === false;

  return (
    <Dialog
      style={{ minWidth: '75%' }}
      isOpen={open}
      isDismissable
      onOpenChange={isOpen => {
        if (!isOpen) {
          onCancel();
        }
      }}
    >
      <DialogHeader>
        {isEditing
          ? t('announcementForm.editAnnouncement')
          : t('announcementForm.newAnnouncement')}
      </DialogHeader>

      <DialogBody>
        <AnnouncementForm
          initialData={initialData}
          onFormChange={handleFormChange}
        />
      </DialogBody>

      <DialogFooter>
        <Button
          variant="primary"
          onClick={handleDialogSubmit}
          isDisabled={isDisabled}
        >
          {t('announcementForm.submit')}
        </Button>

        <Button variant="secondary" slot="close">
          {t('confirmDeleteDialog.cancel')}
        </Button>
      </DialogFooter>
    </Dialog>
  );
};
