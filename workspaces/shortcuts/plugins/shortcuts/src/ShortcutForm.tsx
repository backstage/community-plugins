/*
 * Copyright 2021 The Backstage Authors
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

import { useEffect, useRef } from 'react';
import useObservable from 'react-use/esm/useObservable';
import { useForm, SubmitHandler, Controller } from 'react-hook-form';
import { Button, TextField } from '@backstage/ui';
import { FormValues } from './types';
import { shortcutsApiRef } from './api';
import { useApi } from '@backstage/core-plugin-api';
import styles from './ShortcutForm.module.css';

type Props = {
  formValues?: FormValues;
  onSave: SubmitHandler<FormValues>;
  onClose: () => void;
  allowExternalLinks?: boolean;
};

export const ShortcutForm = ({
  formValues,
  onSave,
  onClose,
  allowExternalLinks,
}: Props) => {
  const shortcutApi = useApi(shortcutsApiRef);
  const shortcutData = useObservable(
    shortcutApi.shortcut$(),
    shortcutApi.get(),
  );
  const { current: originalValues } = useRef({
    url: formValues?.url ?? '',
    title: formValues?.title ?? '',
  });
  const {
    handleSubmit,
    reset,
    control,
    formState: { errors },
  } = useForm<FormValues>({
    mode: 'onChange',
    defaultValues: originalValues,
  });

  const titleIsUnique = (title: string) => {
    if (
      title !== originalValues.title &&
      shortcutData.some(shortcutTitle => shortcutTitle.title === title)
    )
      return 'A shortcut with this title already exists';
    return true;
  };

  const urlIsUnique = (url: string) => {
    if (
      url !== originalValues.url &&
      shortcutData.some(shortcutUrl => shortcutUrl.url === url)
    )
      return 'A shortcut with this url already exists';
    return true;
  };

  useEffect(() => {
    reset(formValues);
  }, [reset, formValues]);

  return (
    <>
      <div style={{ padding: 'var(--bui-space-4)' }}>
        <Controller
          name="url"
          control={control}
          rules={{
            required: true,
            validate: urlIsUnique,
            ...(allowExternalLinks
              ? {
                  pattern: {
                    value: /^(https?:\/\/)|\//,
                    message: 'Must start with http(s):// or /',
                  },
                }
              : {
                  pattern: {
                    value: /^\//,
                    message: 'Must be a relative URL (starts with a /)',
                  },
                }),
          }}
          render={({ field }) => (
            <TextField
              id="url"
              label="Shortcut URL"
              value={field.value}
              onChange={field.onChange}
              onBlur={field.onBlur}
              isInvalid={!!errors.url}
              errorMessage={errors.url?.message}
              type="text"
              placeholder="Enter a URL"
              autoComplete="off"
              className={styles.field}
            />
          )}
        />
        <Controller
          name="title"
          control={control}
          rules={{
            required: true,
            validate: titleIsUnique,
            minLength: {
              value: 2,
              message: 'Must be at least 2 characters',
            },
          }}
          render={({ field }) => (
            <TextField
              id="title"
              label="Display Name"
              value={field.value}
              onChange={field.onChange}
              onBlur={field.onBlur}
              isInvalid={!!errors.title}
              errorMessage={errors.title?.message}
              type="text"
              placeholder="Enter a display name"
              autoComplete="off"
              className={styles.field}
            />
          )}
        />
      </div>
      <div className={styles.actionRoot} style={{ display: 'flex', gap: 'var(--bui-space-2)' }}>
        <Button
          variant="primary"
          onClick={handleSubmit(onSave)}
        >
          Save
        </Button>
        <Button
          variant="secondary"
          onClick={onClose}
        >
          Cancel
        </Button>
      </div>
    </>
  );
};
