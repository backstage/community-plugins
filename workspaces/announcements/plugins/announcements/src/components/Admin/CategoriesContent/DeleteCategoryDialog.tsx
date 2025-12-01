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
import { Dialog, DialogTitle, DialogActions, Button } from '@material-ui/core';

type DeleteCategoryDialogProps = {
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
        <Button onClick={onCancel}>Cancel</Button>

        <Button onClick={onConfirm} color="secondary">
          Delete
        </Button>
      </DialogActions>
    </Dialog>
  );
};
