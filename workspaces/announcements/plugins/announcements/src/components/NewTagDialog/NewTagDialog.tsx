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
import { useState } from 'react';
import Button from '@mui/material/Button';
import Dialog from '@mui/material/Dialog';
import DialogActions from '@mui/material/DialogActions';
import DialogContent from '@mui/material/DialogContent';
import DialogTitle from '@mui/material/DialogTitle';
import TextField from '@mui/material/TextField';
import { alertApiRef, useApi } from '@backstage/core-plugin-api';
import {
  useAnnouncementsTranslation,
  announcementsApiRef,
  CreateTagRequest,
} from '@backstage-community/plugin-announcements-react';

export type NewTagDialogProps = {
  open: boolean;
  onClose: () => void;
  onSubmit: () => void;
};

export const NewTagDialog = (props: NewTagDialogProps) => {
  const { open, onClose, onSubmit } = props;
  const [title, setTitle] = useState('');
  const [loading, setLoading] = useState(false);
  const alertApi = useApi(alertApiRef);
  const announcementsApi = useApi(announcementsApiRef);
  const { t } = useAnnouncementsTranslation();

  const handleClose = () => {
    setTitle('');
    onClose();
  };

  const handleSubmit = async () => {
    if (!title) return;

    setLoading(true);
    try {
      const request: CreateTagRequest = { title };
      await announcementsApi.createTag(request);

      alertApi.post({
        message: t('newTagDialog.createdMessage'),
        severity: 'success',
        display: 'transient',
      });

      setTitle('');
      onSubmit();
    } catch (error) {
      alertApi.post({
        message: (error as Error).message,
        severity: 'error',
      });
    } finally {
      setLoading(false);
      onClose();
    }
  };

  return (
    <Dialog open={open} onClose={handleClose}>
      <DialogTitle>{t('newTagDialog.newTag')}</DialogTitle>
      <DialogContent>
        <TextField
          margin="dense"
          id="title"
          label={t('newTagDialog.title')}
          fullWidth
          value={title}
          onChange={e => setTitle(e.target.value)}
          required
        />
      </DialogContent>
      <DialogActions>
        <Button onClick={handleClose} color="primary">
          {t('newTagDialog.cancelButton')}
        </Button>
        <Button
          onClick={handleSubmit}
          color="primary"
          disabled={!title || loading}
        >
          {t('newTagDialog.createButton')}
        </Button>
      </DialogActions>
    </Dialog>
  );
};
