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
import React, { useState, useEffect } from 'react';
import { Entity, stringifyEntityRef } from '@backstage/catalog-model';
import Autocomplete, {
  createFilterOptions,
} from '@material-ui/lab/Autocomplete';
import TextField from '@material-ui/core/TextField';
import { makeStyles } from '@material-ui/core/styles';
import { Controller, Control } from 'react-hook-form';
import { FormValues } from '../../types';
import { useApi } from '@backstage/core-plugin-api';
import {
  entityPresentationApiRef,
  EntityDisplayName,
  EntityRefPresentationSnapshot,
} from '@backstage/plugin-catalog-react';

type Props = {
  users: Entity[];
  disableClearable: boolean;
  defaultValue: string | null;
  label: string;
  name: 'responsible';
  control: Control<FormValues, object>;
  rules?: Record<string, any>;
};

const useStyles = makeStyles({
  container: { width: '100%', minWidth: '22rem' },
  autocomplete: { overflow: 'hidden' },
});

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
  const entityPresentationApi = useApi(entityPresentationApiRef);
  const [entityPresentations, setEntityPresentations] = useState<
    Map<string, EntityRefPresentationSnapshot>
  >(new Map());

  useEffect(() => {
    const fetchPresentations = async () => {
      const presentations = new Map<string, EntityRefPresentationSnapshot>();
      await Promise.all(
        users.map(async user => {
          const presentation = await entityPresentationApi.forEntity(user)
            .promise;
          presentations.set(stringifyEntityRef(user), presentation);
        }),
      );
      setEntityPresentations(presentations);
    };

    fetchPresentations();
  }, [users, entityPresentationApi]);

  const getOptionLabel = (option: Entity | string) => {
    // option can be a string due to freeSolo.
    if (typeof option === 'string') return option;
    const entityRef = stringifyEntityRef(option);

    return (
      entityPresentations.get(entityRef)?.primaryTitle ?? option.metadata.name
    );
  };

  const filterOptions = createFilterOptions<Entity | string>({
    stringify: option => {
      if (typeof option === 'string') return option;
      const entityRef = stringifyEntityRef(option);
      return (
        entityPresentations.get(entityRef)?.primaryTitle ?? option.metadata.name
      );
    },
  });

  return (
    <div className={classes.container}>
      <Controller
        name={name}
        control={control}
        rules={rules}
        defaultValue={defaultValue ?? ''}
        render={({ field: { onChange, value }, fieldState: { error } }) => (
          <Autocomplete
            className={classes.autocomplete}
            fullWidth
            freeSolo
            disableClearable={disableClearable}
            value={value}
            options={users}
            getOptionLabel={getOptionLabel}
            renderOption={option =>
              typeof option === 'string' ? (
                option
              ) : (
                <EntityDisplayName entityRef={option} />
              )
            }
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
              const filtered = filterOptions(options, params);
              if (
                params.inputValue !== '' &&
                !options.some(
                  option => getOptionLabel(option) === params.inputValue,
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
