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
import { Button, TextField, Text } from '@backstage/ui';
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
      <div className={styles.formContent}>
        <Controller
          name="url"
          control={control}
          rules={{
            required: 'URL is required',
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
            <div className={styles.fieldWrapper}>
              <TextField
                value={field.value}
                onChange={field.onChange}
                onBlur={field.onBlur}
                name={field.name}
                type="text"
                placeholder="Enter a URL"
                label="Shortcut URL"
                autoComplete="off"
                isRequired
              />
              {errors.url && (
                <Text
                  className={styles.error}
                  variant="body-small"
                  style={{ color: 'var(--bui-fg-danger)' }}
                >
                  {errors.url.message}
                </Text>
              )}
            </div>
          )}
        />
        <Controller
          name="title"
          control={control}
          rules={{
            required: 'Display name is required',
            validate: titleIsUnique,
            minLength: {
              value: 2,
              message: 'Must be at least 2 characters',
            },
          }}
          render={({ field }) => (
            <div className={styles.fieldWrapper}>
              <TextField
                value={field.value}
                onChange={field.onChange}
                onBlur={field.onBlur}
                name={field.name}
                type="text"
                placeholder="Enter a display name"
                label="Display Name"
                autoComplete="off"
                isRequired
              />
              {errors.title && (
                <Text
                  className={styles.error}
                  variant="body-small"
                  style={{ color: 'var(--bui-fg-danger)' }}
                >
                  {errors.title.message}
                </Text>
              )}
            </div>
          )}
        />
      </div>
      <div className={styles.actionRoot}>
        <Button
          variant="primary"
          onPress={() => handleSubmit(onSave)()}
        >
          Save
        </Button>
        <Button variant="secondary" onPress={onClose}>
          Cancel
        </Button>
      </div>
    </>
  );
};
