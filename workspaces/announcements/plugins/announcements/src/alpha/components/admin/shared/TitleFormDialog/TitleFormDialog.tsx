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
import { FormEvent, useEffect, useMemo, useState } from 'react';
import {
  Button,
  TextField,
  Dialog,
  DialogTrigger,
  DialogHeader,
  DialogBody,
  DialogFooter,
} from '@backstage/ui';

type TitleFormDialogTranslationKeys = {
  new: string;
  edit: string;
  titleLabel: string;
  submit: string;
  cancel?: string;
};

type TitleFormDialogTestIds = {
  form?: string;
  input?: string;
  button?: string;
};

export type TitleFormDialogRequest = {
  title: string;
};

export type TitleFormDialogProps<T extends TitleFormDialogRequest> = {
  initialData?: T;
  translationKeys: TitleFormDialogTranslationKeys;
  onSubmit: (data: T) => Promise<void>;
  open: boolean;
  onCancel: () => void;
  testIds?: TitleFormDialogTestIds;
  canSubmit?: boolean;
};

export const TitleFormDialog = <T extends TitleFormDialogRequest>(
  props: TitleFormDialogProps<T>,
) => {
  const {
    initialData,
    translationKeys,
    onSubmit,
    open,
    onCancel,
    testIds,
    canSubmit,
  } = props;

  const [form, setForm] = useState<T>(initialData ?? ({ title: '' } as T));
  const [loading, setLoading] = useState(false);

  // Reset form when dialog opens (for create mode) or when initialData changes
  useEffect(() => {
    if (open) {
      setForm(initialData ?? ({ title: '' } as T));
    }
  }, [open, initialData]);

  const handleSubmit = async (event: FormEvent<HTMLFormElement>) => {
    setLoading(true);
    event.preventDefault();

    try {
      await onSubmit(form);
      onCancel();
    } finally {
      // will still handle setting loading to false even if onSubmit fails
      setLoading(false);
    }
  };

  const isDisabled = useMemo(() => {
    return loading || !form?.title || canSubmit === false;
  }, [loading, form?.title, canSubmit]);

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
        <DialogHeader>
          {initialData?.title ? translationKeys.edit : translationKeys.new}
        </DialogHeader>

        <DialogBody>
          <form
            onSubmit={handleSubmit}
            id={testIds?.form ?? 'title-form'}
            data-testid={testIds?.form ?? 'title-form'}
          >
            <TextField
              id="title"
              data-testid={testIds?.input ?? 'title-input'}
              type="text"
              label={translationKeys.titleLabel}
              value={form.title}
              onChange={e => setForm(prev => ({ ...prev, title: e }))}
              isRequired
            />
          </form>
        </DialogBody>

        <DialogFooter>
          <Button
            variant="primary"
            type="submit"
            form={testIds?.form ?? 'title-form'}
            data-testid={testIds?.button ?? 'title-submit-button'}
            isDisabled={isDisabled}
          >
            {translationKeys.submit}
          </Button>

          <Button onClick={onCancel} variant="secondary" slot="close">
            {translationKeys.cancel ?? 'Cancel'}
          </Button>
        </DialogFooter>
      </Dialog>
    </DialogTrigger>
  );
};
