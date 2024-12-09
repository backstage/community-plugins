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
import Select, { SelectChangeEvent } from '@mui/material/Select';
import MenuItem from '@mui/material/MenuItem';
import OutlinedInput from '@mui/material/OutlinedInput';
import CloseIcon from '@mui/icons-material/Close';
import IconButton from '@mui/material/IconButton';
import { FilterProps } from '../../types';
import { styled } from '@mui/material/styles';

const InputStyled = styled(OutlinedInput)(({ theme }) => ({
  borderRadius: 4,
  backgroundColor: theme.palette.background.paper,
}));

export function SelectTeamFilter({ options, team, setTeam }: FilterProps) {
  const handleChange = (event: SelectChangeEvent<string>) => {
    setTeam(event.target.value as string);
  };

  const handleClear = () => {
    setTeam(undefined);
  };

  const getPlaceholderMessage = () => {
    const teamCount = options.length ?? 0;
    if (teamCount === 0) {
      return 'No teams available for selection';
    }
    if (teamCount === 1) {
      return '1 team available for selection';
    }
    return `${teamCount} teams available for selection`;
  };

  return (
    <Select
      value={team ?? ''}
      onChange={handleChange}
      input={
        <InputStyled
          endAdornment={
            team && (
              <IconButton onClick={handleClear} sx={{ mr: 2 }}>
                <CloseIcon />
              </IconButton>
            )
          }
        />
      }
      inputProps={{ 'aria-label': 'Team selection' }}
      fullWidth
      displayEmpty
      renderValue={selected => {
        if (!selected) {
          return <em>{getPlaceholderMessage()}</em>;
        }
        return selected;
      }}
    >
      {options?.map(option => (
        <MenuItem key={option.value} value={option.value}>
          {option.label}
        </MenuItem>
      ))}
    </Select>
  );
}
