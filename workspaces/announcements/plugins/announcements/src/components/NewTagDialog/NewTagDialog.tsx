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
import {
  Button,
  Dialog,
  DialogActions,
  DialogContent,
  DialogTitle,
  TextField,
} from '@material-ui/core';
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
          label="Title"
          fullWidth
          value={title}
          onChange={e => setTitle(e.target.value)}
        />
      </DialogContent>
      <DialogActions>
        <Button onClick={handleClose} color="primary">
          Cancel
        </Button>
        <Button
          onClick={handleSubmit}
          color="primary"
          disabled={!title || loading}
        >
          Create
        </Button>
      </DialogActions>
    </Dialog>
  );
};
