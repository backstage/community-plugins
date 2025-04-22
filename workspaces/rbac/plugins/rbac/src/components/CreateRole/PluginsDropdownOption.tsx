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
import type { HTMLAttributes } from 'react';

import { AutocompleteRenderOptionState } from '@mui/material/Autocomplete';
import Typography from '@mui/material/Typography';
import Checkbox from '@mui/material/Checkbox';
import Box from '@mui/material/Box';
import match from 'autosuggest-highlight/match';
import parse from 'autosuggest-highlight/parse';

import { SelectedPlugin } from '../../types';

type PluginsDropdownOptionProps = {
  option: SelectedPlugin;
  state: AutocompleteRenderOptionState;
  props: HTMLAttributes<HTMLLIElement>;
};

export const PluginsDropdownOption = ({
  props,
  option,
  state,
}: PluginsDropdownOptionProps) => {
  const { inputValue } = state;
  const { label, value } = option;
  const matches = match(label, inputValue, { insideWords: true });
  const parts = parse(label, matches);

  return (
    <li
      {...props}
      key={`${label}`}
      style={{
        ...(value === '' ? { borderBottom: `1px solid #D2D2D2` } : {}),
      }}
    >
      <Box
        sx={{
          display: 'flex',
        }}
      >
        <Checkbox style={{ marginRight: 8 }} checked={state.selected} />
        <Typography component="span" sx={{ marginTop: '0.5rem' }}>
          {parts.map(part => (
            <Typography
              key={`${part.text}-${label}`}
              component="span"
              sx={{
                fontWeight: !inputValue || part.highlight ? 400 : 700,
                color: theme => theme.palette.text.primary,
              }}
              data-testid={option.label}
            >
              {part.text}
            </Typography>
          ))}
        </Typography>
      </Box>
    </li>
  );
};
