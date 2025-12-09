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
import {
  Button,
  Dialog,
  DialogTrigger,
  DialogHeader,
  DialogBody,
  DialogFooter,
} from '@backstage/ui';

type DeleteConfirmationDialogProps = {
  type: 'announcement' | 'category' | 'tag';
  open: boolean;
  onConfirm: () => any;
  onCancel: () => any;
};

export const DeleteConfirmationDialog = (
  props: DeleteConfirmationDialogProps,
) => {
  const { type, open, onConfirm, onCancel } = props;

  const title = `Delete ${type.charAt(0).toUpperCase() + type.slice(1)}`;
  const body = `Are you sure you want to delete this ${type}?`;

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
      >
        <DialogHeader>{title}</DialogHeader>
        <DialogBody>{body}</DialogBody>
        <DialogFooter>
          <Button onClick={onConfirm} variant="primary">
            Delete
          </Button>
          <Button onClick={onCancel} variant="secondary" slot="close">
            Cancel
          </Button>
        </DialogFooter>
      </Dialog>
    </DialogTrigger>
  );
};
