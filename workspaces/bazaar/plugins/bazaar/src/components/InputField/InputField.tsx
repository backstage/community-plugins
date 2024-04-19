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

import React from 'react';
import {
  Controller,
  Control,
  FieldError,
  ValidationRule,
} from 'react-hook-form';
import TextField from '@material-ui/core/TextField';
import { FormValues } from '../../types';

type Rules = {
  required: boolean;
  pattern?: ValidationRule<RegExp> | undefined;
};

type Props = {
  inputType: 'description' | 'community' | 'responsible' | 'title' | 'docs';
  error?: FieldError | undefined;
  control: Control<FormValues, object>;
  helperText?: string;
  placeholder?: string;
  rules?: Rules | undefined;
};

export const InputField = ({
  inputType,
  error,
  control,
  helperText,
  placeholder,
  rules,
}: Props) => {
  const label =
    inputType.charAt(0).toLocaleUpperCase('en-US') + inputType.slice(1);

  return (
    <Controller
      name={inputType}
      control={control}
      rules={rules}
      render={({ field }) => (
        <TextField
          {...field}
          required={rules?.required}
          margin="dense"
          multiline
          id="title"
          type="text"
          fullWidth
          label={label}
          placeholder={placeholder}
          error={!!error}
          helperText={error && helperText}
        />
      )}
    />
  );
};
