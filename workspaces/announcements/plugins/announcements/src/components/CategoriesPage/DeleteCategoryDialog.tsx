import React from 'react';
import { Button, Dialog, DialogActions, DialogTitle } from '@material-ui/core';

export type DeleteCategoryDialogProps = {
  open: boolean;
  onConfirm: () => any;
  onCancel: () => any;
};

export const DeleteCategoryDialog = (props: DeleteCategoryDialogProps) => {
  const { open, onConfirm, onCancel } = props;

  return (
    <Dialog open={open} onClose={onCancel}>
      <DialogTitle>Are you sure you want to delete this category?</DialogTitle>

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
