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
