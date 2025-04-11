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
import * as React from 'react';
import TextField from '@mui/material/TextField';
import Autocomplete from '@mui/material/Autocomplete';
import CircularProgress from '@mui/material/CircularProgress';
import { identityApiRef, useApi } from '@backstage/core-plugin-api';
import {
  useAnnouncementsTranslation,
  useCatalogEntities,
} from '@backstage-community/plugin-announcements-react';

type OnBehalfTeamDropdownProps = {
  selectedTeam: string;
  onChange: (team: string) => void;
};

export default function OnBehalfTeamDropdown({
  selectedTeam,
  onChange,
}: OnBehalfTeamDropdownProps) {
  const { t } = useAnnouncementsTranslation();
  const identityApi = useApi(identityApiRef);
  const [userOwns, setUserOwns] = React.useState<string[]>([]);

  React.useEffect(() => {
    const fetchIdentity = async () => {
      try {
        const identity = await identityApi.getBackstageIdentity();
        setUserOwns([identity.userEntityRef]);
      } catch (error) {
        setUserOwns([]);
      }
    };
    fetchIdentity();
  }, [identityApi]);

  const { entities: teams, loading: teamsLoading } =
    useCatalogEntities(userOwns);

  const teamOptions = React.useMemo(() => {
    return teams.flatMap(
      team =>
        team.relations
          ?.filter(relation => relation.type === 'memberOf')
          .map(relation => relation.targetRef) || [],
    );
  }, [teams]);

  return (
    <Autocomplete
      // fullWidth
      value={selectedTeam || null}
      onChange={(_, newValue) => {
        onChange(typeof newValue === 'string' ? newValue : '');
      }}
      options={teamOptions}
      loading={teamsLoading}
      id="team-dropdown-field"
      renderInput={params => (
        <TextField
          {...params}
          id="team"
          label={t('announcementForm.onBehalfOf')}
          variant="standard"
          fullWidth
          InputProps={{
            ...params.InputProps,
            endAdornment: (
              <>
                {teamsLoading ? (
                  <CircularProgress color="inherit" size={20} />
                ) : null}
                {params.InputProps.endAdornment}
              </>
            ),
          }}
        />
      )}
    />
  );
}
