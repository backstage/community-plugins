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
import React, { useState } from 'react';
import Box from '@material-ui/core/Box';
import TextField from '@material-ui/core/TextField';
import Typography from '@material-ui/core/Typography';
import ExpandMoreIcon from '@material-ui/icons/ExpandMore';
import { Autocomplete, AutocompleteProps } from '@material-ui/lab';
import { useComboBoxStyles } from './useComboBoxStyles';
import { RenderOptionLabel } from './RenderOptionLabel';

type ExcludedAutocompleteProps =
  | 'clearOnEscape'
  | 'disableCloseOnSelect'
  | 'includeInputInList'
  | 'size'
  | 'popupIcon'
  | 'renderInput'
  | 'renderOption';

/** @public */
export type ComboBoxProps<
  T,
  Multiple extends boolean | undefined = undefined,
  DisableClearable extends boolean | undefined = undefined,
  FreeSolo extends boolean | undefined = undefined,
> = Omit<
  AutocompleteProps<T, Multiple, DisableClearable, FreeSolo>,
  ExcludedAutocompleteProps
> & {
  label: string;
};

/** @public */
export function ComboBox<
  T extends string,
  Multiple extends boolean | undefined = undefined,
  DisableClearable extends boolean | undefined = undefined,
  FreeSolo extends boolean | undefined = undefined,
>(props: ComboBoxProps<T, Multiple, DisableClearable, FreeSolo>) {
  const classes = useComboBoxStyles();
  const [_text, setText] = useState('');

  return (
    <Box className={classes.root} pb={1} pt={1}>
      <Typography className={classes.label} variant="button" component="label">
        {props.label}
      </Typography>
      <Autocomplete<T, Multiple, DisableClearable, FreeSolo>
        {...props}
        disableCloseOnSelect={props.multiple}
        includeInputInList
        popupIcon={<ExpandMoreIcon data-testid="expand-icon" />}
        renderInput={params => (
          <TextField
            {...params}
            className={classes.input}
            onChange={e => {
              setText(e.currentTarget.value);
            }}
            variant="outlined"
          />
        )}
        renderOption={(option, { selected }) =>
          !props.freeSolo ? (
            <RenderOptionLabel title={option} isSelected={selected} />
          ) : (
            option
          )
        }
        size="small"
      />
    </Box>
  );
}
