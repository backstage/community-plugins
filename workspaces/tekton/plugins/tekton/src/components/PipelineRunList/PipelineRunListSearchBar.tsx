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
import {
  FormControl,
  IconButton,
  Input,
  InputAdornment,
  makeStyles,
} from '@material-ui/core';
import Clear from '@material-ui/icons/Clear';
import Search from '@material-ui/icons/Search';
import { useTranslationRef } from '@backstage/core-plugin-api/alpha';
import { tektonTranslationRef } from '../../translations/index.ts';

type PipelineRunListSearchBarProps = {
  value: string;
  onChange: (filter: string) => void;
};

const useStyles = makeStyles({
  formControl: {
    alignItems: 'flex-end',
    flexGrow: 1,
  },
});

export const PipelineRunListSearchBar = ({
  value,
  onChange,
}: PipelineRunListSearchBarProps) => {
  const classes = useStyles();
  const { t } = useTranslationRef(tektonTranslationRef);

  return (
    <FormControl className={classes.formControl}>
      <Input
        aria-label="search"
        placeholder={t('pipelineRunList.searchBarPlaceholder')}
        autoComplete="off"
        onChange={event => onChange(event.target.value)}
        value={value}
        startAdornment={
          <InputAdornment position="start">
            <Search />
          </InputAdornment>
        }
        endAdornment={
          <InputAdornment position="end">
            <IconButton
              aria-label="clear search"
              onClick={() => onChange('')}
              edge="end"
              disabled={!value}
              data-testid="clear-search"
            >
              <Clear />
            </IconButton>
          </InputAdornment>
        }
      />
    </FormControl>
  );
};
