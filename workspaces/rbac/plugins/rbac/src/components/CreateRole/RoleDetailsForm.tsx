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

import TextField from '@mui/material/TextField';

type RoleDetailsFormProps = {
  name: string;
  description?: string;
  nameError?: string;
  handleBlur: React.FocusEventHandler<HTMLInputElement | HTMLTextAreaElement>;
  handleChange: React.ChangeEventHandler<
    HTMLTextAreaElement | HTMLInputElement
  >;
};

export const RoleDetailsForm = ({
  name,
  description,
  nameError,
  handleBlur,
  handleChange,
}: RoleDetailsFormProps) => {
  return (
    <div
      style={{
        display: 'flex',
        flexDirection: 'column',
        gap: '20px',
      }}
    >
      <TextField
        required
        label="Name"
        variant="outlined"
        id="role-name"
        data-testid="role-name"
        aria-labelledby="name"
        helperText={nameError ?? 'Enter name of the role'}
        value={name}
        name="name"
        onChange={handleChange}
        onBlur={handleBlur}
        error={!!nameError}
      />
      <TextField
        label="Description"
        variant="outlined"
        helperText="Enter a brief description about the role (The purpose of the role)"
        value={description}
        data-testid="role-description"
        id="role-description"
        name="description"
        aria-labelledby="description"
        onChange={handleChange}
        onBlur={handleBlur}
        multiline
      />
    </div>
  );
};
