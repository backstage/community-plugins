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

/* eslint-disable @backstage/no-undeclared-imports */
import { FormControl, InputLabel, Select, MenuItem } from '@material-ui/core';
import { DoraTeam } from '@backstage-community/plugin-devlake-common';

/** @public */
export interface TeamSelectorProps {
  teams: DoraTeam[];
  selectedTeam: string;
  onTeamChange: (teamName: string) => void;
}

/** @public */
export const TeamSelector = (props: TeamSelectorProps) => {
  const { teams, selectedTeam, onTeamChange } = props;

  return (
    <FormControl variant="outlined" size="small" style={{ minWidth: 200 }}>
      <InputLabel>Team</InputLabel>
      <Select
        value={selectedTeam}
        onChange={e => onTeamChange(e.target.value as string)}
        label="Team"
      >
        {teams.map(team => (
          <MenuItem key={team.name} value={team.name}>
            {team.name}
          </MenuItem>
        ))}
      </Select>
    </FormControl>
  );
};
