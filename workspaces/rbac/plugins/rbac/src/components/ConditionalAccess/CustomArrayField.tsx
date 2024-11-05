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

import { makeStyles, TextField, Typography } from '@material-ui/core';
import { getDefaultRegistry } from '@rjsf/core';
import { FieldProps } from '@rjsf/utils';
import { getInnerSchemaForArrayItem } from '@rjsf/utils/lib/schema/getDefaultFormState';

const useStyles = makeStyles(theme => ({
  arrayFieldDescription: {
    marginTop: '5px',
    fontWeight: 500,
    color: `${theme.palette.grey[500]} !important`,
  },
}));

export const CustomArrayField = (props: FieldProps) => {
  const { name, required, schema: sch, formData, onChange } = props;
  const classes = useStyles();
  const [fieldVal, setFieldVal] = React.useState<string>(
    formData?.toString() ?? '',
  );

  const arrayItemsType = getInnerSchemaForArrayItem(sch).type;

  const DefaultArrayField = getDefaultRegistry().fields.ArrayField;

  return arrayItemsType === 'string' ? (
    <>
      <TextField
        name={name}
        variant="outlined"
        label={name}
        value={fieldVal}
        onChange={e => {
          const value = e.target.value;
          setFieldVal(value);
          onChange(value ? value.split(',').map(val => val.trim()) : []);
        }}
        required={required}
        placeholder="string, string"
      />
      <Typography variant="caption">
        <Typography
          variant="subtitle2"
          className={classes.arrayFieldDescription}
        >
          {sch.description ?? ''}
        </Typography>
      </Typography>
    </>
  ) : (
    <DefaultArrayField {...props} />
  );
};
