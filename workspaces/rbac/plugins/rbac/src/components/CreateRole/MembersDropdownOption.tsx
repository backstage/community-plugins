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

import { AutocompleteRenderOptionState } from '@mui/material/Autocomplete';
import Typography from '@mui/material/Typography';
import match from 'autosuggest-highlight/match';
import parse from 'autosuggest-highlight/parse';

import { SelectedMember } from './types';

type MembersDropdownOptionProps = {
  option: SelectedMember;
  state: AutocompleteRenderOptionState;
  props: React.HTMLAttributes<HTMLLIElement>;
};

export const MembersDropdownOption = ({
  props,
  option,
  state,
}: MembersDropdownOptionProps) => {
  const { inputValue } = state;
  const { label, etag } = option;
  const matches = match(label, inputValue, { insideWords: true });
  const parts = parse(label, matches);

  return (
    <li
      {...props}
      key={`${etag}`}
      style={{
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'flex-start',
      }}
    >
      <Typography component="span">
        {parts.map(part => (
          <Typography
            key={`${part.text}-${etag}`}
            component="span"
            sx={{
              fontWeight: part.highlight ? 400 : 700,
              color: theme => theme.palette.text.primary,
            }}
            data-testid={option.label}
          >
            {part.text}
          </Typography>
        ))}
      </Typography>
      <Typography sx={{ color: theme => theme.palette.text.secondary }}>
        {option.description}
      </Typography>{' '}
    </li>
  );
};
