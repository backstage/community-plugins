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
import React from 'react';
import { alertApiRef, useApi } from '@backstage/core-plugin-api';
import { announcementsApiRef } from '@backstage-community/plugin-announcements-react';
import Dialog from '@mui/material/Dialog';
import DialogTitle from '@mui/material/DialogTitle';
import DialogContent from '@mui/material/DialogContent';
import TextField from '@mui/material/TextField';
import DialogActions from '@mui/material/DialogActions';
import Button from '@mui/material/Button';

type NewCategoryDialogProps = {
  open: boolean;
  onClose: () => any;
};

export const NewCategoryDialog = (props: NewCategoryDialogProps) => {
  const announcementsApi = useApi(announcementsApiRef);
  const alertApi = useApi(alertApiRef);

  const [title, setTitle] = React.useState('');

  const onClose = () => {
    props.onClose();
  };

  const onConfirm = async () => {
    try {
      await announcementsApi.createCategory({
        title,
      });
      alertApi.post({ message: 'Category created.', severity: 'success' });
      props.onClose();
    } catch (err) {
      alertApi.post({ message: (err as Error).message, severity: 'error' });
    }
  };

  const handleChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    setTitle(event.target.value);
  };

  return (
    <Dialog open={props.open} onClose={onClose}>
      <DialogTitle>New category</DialogTitle>
      <DialogContent>
        <TextField
          margin="normal"
          id="title"
          label="Title"
          value={title}
          onChange={handleChange}
          type="text"
          fullWidth
        />
      </DialogContent>
      <DialogActions>
        <Button onClick={onClose}>Cancel</Button>

        <Button onClick={onConfirm} color="primary">
          Create
        </Button>
      </DialogActions>
    </Dialog>
  );
};
