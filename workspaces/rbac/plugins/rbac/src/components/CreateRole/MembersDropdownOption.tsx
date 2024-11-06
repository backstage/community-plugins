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

import { Box, makeStyles } from '@material-ui/core';
import { AutocompleteRenderOptionState } from '@material-ui/lab/Autocomplete';
import Typography from '@mui/material/Typography';
import match from 'autosuggest-highlight/match';
import parse from 'autosuggest-highlight/parse';

import { SelectedMember } from './types';

type MembersDropdownOptionProps = {
  option: SelectedMember;
  state: AutocompleteRenderOptionState;
};

const useStyles = makeStyles(theme => ({
  optionLabel: {
    color: theme.palette.text.primary,
  },
  optionDescription: {
    color: theme.palette.text.secondary,
  },
}));

export const MembersDropdownOption = ({
  option,
  state,
}: MembersDropdownOptionProps) => {
  const classes = useStyles();
  const { inputValue } = state;
  const { label, etag } = option;
  const matches = match(label, inputValue, { insideWords: true });
  const parts = parse(label, matches);

  return (
    <Box key={`${etag}`}>
      {parts.map(part => (
        <Typography
          key={`${part.text}-${etag}`}
          component="span"
          className={classes.optionLabel}
          sx={{
            fontWeight: part.highlight ? 400 : 700,
          }}
          data-testid={option.label}
        >
          {part.text}
        </Typography>
      ))}
      <br />
      <Typography className={classes.optionDescription}>
        {option.description}
      </Typography>{' '}
    </Box>
  );
};
