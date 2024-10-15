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
import {
  Entity,
  stringifyEntityRef,
  parseEntityRef,
} from '@backstage/catalog-model';
import Typography from '@material-ui/core/Typography';
import Autocomplete, {
  createFilterOptions,
} from '@material-ui/lab/Autocomplete';
import TextField from '@material-ui/core/TextField';
import { makeStyles } from '@material-ui/core/styles';
import { Controller, Control } from 'react-hook-form';

type Props = {
  users: Entity[];
  disableClearable: boolean;
  defaultValue: string | null;
  label: string;
  name: string;
  control: Control<any>;
  rules?: Record<string, any>;
};

const useStyles = makeStyles({
  container: { width: '100%', minWidth: '22rem' },
  autocomplete: { overflow: 'hidden' },
});

const filter = createFilterOptions<Entity | string>();

export const UserSelector = ({
  users,
  disableClearable,
  defaultValue,
  label,
  name,
  control,
  rules,
}: Props) => {
  const classes = useStyles();

  const getDisplayName = (value: string | Entity) => {
    if (!value) return '';
    if (typeof value === 'string') {
      try {
        const { name: entityName } = parseEntityRef(value);
        return entityName;
      } catch {
        return value;
      }
    }
    return value.metadata.name;
  };

  return (
    <div className={classes.container}>
      <Controller
        name={name}
        control={control}
        rules={rules}
        defaultValue={defaultValue || ''}
        render={({ field: { onChange, value }, fieldState: { error } }) => (
          <Autocomplete
            className={classes.autocomplete}
            fullWidth
            freeSolo
            disableClearable={disableClearable}
            value={value}
            options={users}
            getOptionLabel={getDisplayName}
            renderOption={option => (
              <Typography component="span">{getDisplayName(option)}</Typography>
            )}
            renderInput={params => (
              <TextField
                {...params}
                label={label}
                required={!!rules?.required}
                error={!!error}
                helperText={error?.message}
              />
            )}
            onChange={(_, data) => {
              if (typeof data === 'string') {
                onChange(data);
              } else if (data) {
                onChange(stringifyEntityRef(data));
              } else {
                onChange('');
              }
            }}
            filterOptions={(options, params) => {
              const filtered = filter(options, params);
              if (
                params.inputValue !== '' &&
                !options.some(
                  option => getDisplayName(option) === params.inputValue,
                )
              ) {
                filtered.push(params.inputValue);
              }
              return filtered;
            }}
          />
        )}
      />
    </div>
  );
};
