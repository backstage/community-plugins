import React from 'react';
import { Button, Dialog, DialogActions, DialogTitle } from '@material-ui/core';

export type DeleteAnnouncementDialogProps = {
  open: boolean;
  onConfirm: () => any;
  onCancel: () => any;
};

export const DeleteAnnouncementDialog = (
  props: DeleteAnnouncementDialogProps,
) => {
  const { open, onConfirm, onCancel } = props;

  return (
    <Dialog open={open} onClose={onCancel}>
      <DialogTitle>
        Are you sure you want to delete this announcement?
      </DialogTitle>

      <DialogActions>
        <Button onClick={onCancel} color="default">
          Cancel
        </Button>

        <Button onClick={onConfirm} color="secondary">
          Delete
        </Button>
      </DialogActions>
    </Dialog>
  );
};
