/* eslint-disable no-restricted-imports */
/*
 * Copyright 2025 The Backstage Authors
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

import { ReportPortalDocument } from '@backstage-community/plugin-report-portal-common';
import { useApp } from '@backstage/core-plugin-api';
import { Result } from '@backstage/plugin-search-common';
import {
  SearchContextProvider,
  SearchContextProviderProps,
  useSearch,
} from '@backstage/plugin-search-react';
import DefaultSearchIcon from '@mui/icons-material/Search';
import { Autocomplete, IconButton, TextField } from '@mui/material';
import { useEffect, useState } from 'react';
import useDebounce from 'react-use/lib/useDebounce';
import { ReportPortalSearchResultItem } from '../../plugin';
import { ReportPortalIcon } from '../ReportPortalIcon';

const SearchBar = () => {
  const { setTerm, result } = useSearch();

  const [searchText, setSearchText] = useState('');
  const [options, setOptions] = useState<Result<ReportPortalDocument>[]>();

  useDebounce(
    () => {
      setTerm(searchText);
    },
    400,
    [searchText],
  );

  useEffect(() => {
    setOptions(result.value?.results as Result<ReportPortalDocument>[]);
  }, [result]);

  const SearchIcon = useApp().getSystemIcon('search') || DefaultSearchIcon;

  return (
    <Autocomplete
      fullWidth
      options={
        options?.sort((a, b) =>
          b.document.resourceType.localeCompare(a.document.resourceType),
        ) ?? []
      }
      onInputChange={(_e, v) => setSearchText(v)}
      renderOption={(props, option) => (
        <ReportPortalSearchResultItem
          {...props}
          result={option.document}
          highlight={option.highlight}
          rank={option.rank}
          icon={<ReportPortalIcon />}
        />
      )}
      getOptionLabel={opt => opt.document.title}
      filterOptions={opts => opts} // Do not filter anything, show all results
      groupBy={option => option.document.resourceType}
      renderInput={params => (
        <TextField
          {...params}
          label="Search"
          placeholder="Search all Projects and Launches"
          InputProps={{
            ...params.InputProps,
            startAdornment: (
              <IconButton aria-label="Query" size="small" disabled>
                <SearchIcon />
              </IconButton>
            ),
          }}
        />
      )}
    />
  );
};

/** @public */
export const ReportPortalSearchBar = (props: SearchContextProviderProps) => {
  return (
    <SearchContextProvider {...props}>
      <SearchBar />
    </SearchContextProvider>
  );
};
