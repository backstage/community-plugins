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
import type { ChangeEvent, FC } from 'react';
import InputAdornment from '@mui/material/InputAdornment';
import TextField from '@mui/material/TextField';
import SearchIcon from '@mui/icons-material/Search';
import ClearIcon from '@mui/icons-material/Clear';
import { useTranslation } from '../../../../hooks/useTranslation';

interface ResourcesSearchBarProps {
  value: string;
  onChange: (event: ChangeEvent<HTMLInputElement>) => void;
  onSearchClear: () => void;
}

export const ResourcesSearchBar: FC<ResourcesSearchBarProps> = ({
  value,
  onChange,
  onSearchClear,
}) => {
  const { t } = useTranslation();

  return (
    <TextField
      size="small"
      variant="outlined"
      placeholder={t(
        'deploymentLifecycle.sidebar.resources.resourcesSearchBar.placeholder',
      )}
      value={value}
      onChange={onChange}
      sx={theme => ({
        border: `1px solid ${theme.palette.grey.A100}`,
        ml: 1.875,
        borderRadius: '4px',
      })}
      InputProps={{
        startAdornment: (
          <InputAdornment position="start">
            <SearchIcon />
          </InputAdornment>
        ),
        endAdornment: (
          <InputAdornment
            position="end"
            aria-label={t(
              'deploymentLifecycle.sidebar.resources.resourcesSearchBar.ariaLabel',
            )}
            data-testid="clear-search"
            style={{
              display: value === '' ? 'none' : 'flex',
              cursor: 'pointer',
            }}
            onClick={onSearchClear}
          >
            <ClearIcon />
          </InputAdornment>
        ),
      }}
    />
  );
};
