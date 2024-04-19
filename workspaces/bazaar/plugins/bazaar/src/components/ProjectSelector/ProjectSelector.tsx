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
import { Entity } from '@backstage/catalog-model';
import Typography from '@material-ui/core/Typography';
import Autocomplete from '@material-ui/lab/Autocomplete';
import TextField from '@material-ui/core/TextField';
import { makeStyles } from '@material-ui/core/styles';

type Props = {
  catalogEntities: Entity[];
  onChange: (entity: Entity) => void;
  disableClearable: boolean;
  defaultValue: Entity | null | undefined;
  label: string;
};

const useStyles = makeStyles({
  container: { width: '100%', minWidth: '22rem' },
  autocomplete: { overflow: 'hidden' },
});

export const ProjectSelector = ({
  catalogEntities,
  onChange,
  disableClearable,
  defaultValue,
  label,
}: Props) => {
  const classes = useStyles();
  return (
    <div className={classes.container}>
      <Autocomplete
        className={classes.autocomplete}
        fullWidth
        disableClearable={disableClearable}
        defaultValue={defaultValue}
        options={catalogEntities}
        getOptionLabel={option => option?.metadata?.name}
        renderOption={option => (
          <Typography component="span">{option?.metadata?.name}</Typography>
        )}
        renderInput={params => <TextField {...params} label={label} />}
        onChange={(_, data) => {
          onChange(data!);
        }}
      />
    </div>
  );
};
