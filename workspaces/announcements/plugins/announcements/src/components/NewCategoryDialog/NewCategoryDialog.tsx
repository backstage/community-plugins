import React from 'react';
import {
  Button,
  Dialog,
  DialogActions,
  DialogContent,
  DialogTitle,
  TextField,
} from '@material-ui/core';
import { alertApiRef, useApi } from '@backstage/core-plugin-api';
import { announcementsApiRef } from '@procore-oss/backstage-plugin-announcements-react';

export type NewCategoryDialogProps = {
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
        <Button onClick={onClose} color="default">
          Cancel
        </Button>

        <Button onClick={onConfirm} color="primary">
          Create
        </Button>
      </DialogActions>
    </Dialog>
  );
};
