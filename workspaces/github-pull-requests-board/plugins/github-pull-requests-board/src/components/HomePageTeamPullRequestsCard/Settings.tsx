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
import React from 'react';
import { useTeamPullRequestsContext } from './Context';
import FormControl from '@material-ui/core/FormControl';
import FormLabel from '@material-ui/core/FormLabel';
import Autocomplete from '@material-ui/lab/Autocomplete';
import type { GroupEntity } from '@backstage/catalog-model';
import TextField from '@material-ui/core/TextField';

export const Settings = () => {
  const { handleChangeType, teams, entity } = useTeamPullRequestsContext();

  return (
    <FormControl component="fieldset">
      <FormLabel component="legend">
        Select Team to view pull requests for
      </FormLabel>
      <Autocomplete
        options={teams || []}
        getOptionLabel={option =>
          `${option.metadata?.annotations?.['github.com/team-slug']}`
        }
        onChange={(_event, value) => {
          handleChangeType(value as GroupEntity);
        }}
        value={entity}
        renderInput={params => <TextField {...params} />}
      />
    </FormControl>
  );
};
