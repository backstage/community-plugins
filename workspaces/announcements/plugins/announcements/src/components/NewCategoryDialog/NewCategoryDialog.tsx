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
import { ChangeEvent, useState } from 'react';
import { alertApiRef, useApi } from '@backstage/core-plugin-api';
import {
  announcementsApiRef,
  useAnnouncementsTranslation,
} from '@backstage-community/plugin-announcements-react';
import {
  Button,
  Dialog,
  DialogActions,
  DialogContent,
  DialogTitle,
  TextField,
} from '@material-ui/core';

type NewCategoryDialogProps = {
  open: boolean;
  onClose: () => any;
};

export const NewCategoryDialog = (props: NewCategoryDialogProps) => {
  const announcementsApi = useApi(announcementsApiRef);
  const { t } = useAnnouncementsTranslation();
  const alertApi = useApi(alertApiRef);

  const [title, setTitle] = useState('');

  const onClose = () => {
    props.onClose();
  };

  const onConfirm = async () => {
    try {
      await announcementsApi.createCategory({
        title,
      });
      alertApi.post({
        message: t('newCategoryDialog.createdMessage'),
        severity: 'success',
        display: 'transient',
      });
      props.onClose();
      setTitle('');
    } catch (err) {
      alertApi.post({ message: (err as Error).message, severity: 'error' });
      setTitle('');
    }
  };

  const handleChange = (event: ChangeEvent<HTMLInputElement>) => {
    setTitle(event.target.value);
  };

  return (
    <Dialog open={props.open} onClose={onClose}>
      <DialogTitle>{t('newCategoryDialog.newCategory')}</DialogTitle>
      <DialogContent>
        <TextField
          margin="normal"
          id="title"
          label={t('newCategoryDialog.title')}
          value={title}
          onChange={handleChange}
          type="text"
          fullWidth
          required
        />
      </DialogContent>
      <DialogActions>
        <Button onClick={onClose}>{t('newCategoryDialog.cancelButton')}</Button>

        <Button onClick={onConfirm} color="primary" disabled={!title.trim()}>
          {t('newCategoryDialog.createButton')}
        </Button>
      </DialogActions>
    </Dialog>
  );
};
