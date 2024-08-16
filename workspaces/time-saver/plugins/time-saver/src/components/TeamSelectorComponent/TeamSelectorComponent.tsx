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
import React, { useEffect, useState } from 'react';
import { configApiRef, fetchApiRef, useApi } from '@backstage/core-plugin-api';
import CircularProgress from '@material-ui/core/CircularProgress';
import {
  Button,
  Select,
  Box,
  FormControl,
  InputLabel,
  MenuItem,
} from '@material-ui/core';

interface TeamSelectorProps {
  onTeamChange: (team: string) => void;
  onClearButtonClick?: () => void;
}

type GroupsResponse = {
  groups: string[];
};

export default function TeamSelector({
  onTeamChange,
  onClearButtonClick,
}: TeamSelectorProps): React.ReactElement {
  const [team, setTeam] = React.useState('');

  const handleChange = (
    event: React.ChangeEvent<{
      name?: string | undefined;
      value: unknown;
    }>,
  ) => {
    const selectedTeam = event.target.value as string;
    setTeam(selectedTeam);
    onTeamChange(selectedTeam);
  };

  const handleClearClick = () => {
    setTeam('');
    onClearButtonClick?.();
  };

  const [data, setData] = useState<GroupsResponse | null>(null);
  const configApi = useApi(configApiRef);
  const fetchApi = useApi(fetchApiRef);

  useEffect(() => {
    fetchApi
      .fetch(`${configApi.getString('backend.baseUrl')}/api/time-saver/groups`)
      .then(response => response.json())
      .then(dt => setData(dt))
      .catch();
  }, [configApi, onTeamChange, fetchApi]);

  return (
    <>
      {data?.groups ? (
        <Box
          style={{ minWidth: 360, display: 'flex', flexWrap: 'nowrap', gap: 6 }}
        >
          <FormControl fullWidth variant="outlined">
            <InputLabel>Team</InputLabel>
            <Select value={team} label="Team" onChange={handleChange}>
              {data.groups.map(group => (
                <MenuItem key={group} value={group}>
                  {group}
                </MenuItem>
              ))}
            </Select>
          </FormControl>
          {onClearButtonClick && (
            <Button
              variant="outlined"
              color="secondary"
              onClick={handleClearClick}
            >
              Clear
            </Button>
          )}
        </Box>
      ) : (
        <CircularProgress />
      )}
    </>
  );
}
