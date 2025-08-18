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
import TextField from '@mui/material/TextField';
import Autocomplete from '@mui/material/Autocomplete';
import CircularProgress from '@mui/material/CircularProgress';
import { identityApiRef, useApi } from '@backstage/core-plugin-api';
import {
  useAnnouncementsTranslation,
  useCatalogEntities,
} from '@backstage-community/plugin-announcements-react';
import useAsync from 'react-use/esm/useAsync';
import { useMemo } from 'react';
import { stringifyEntityRef } from '@backstage/catalog-model';
import Box from '@mui/material/Box';
import Typography from '@mui/material/Typography';

type OnBehalfTeamDropdownProps = {
  selectedTeam: string;
  onChange: (team: string) => void;
};

function getTeamDisplayName(team: any): string {
  if (team.kind && team.kind.toLowerCase() === 'group') {
    return team.spec?.profile?.displayName ?? '';
  }
  return '';
}

export default function OnBehalfTeamDropdown({
  selectedTeam,
  onChange,
}: OnBehalfTeamDropdownProps) {
  const { t } = useAnnouncementsTranslation();
  const identityApi = useApi(identityApiRef);

  const { value: userOwns } = useAsync(async () => {
    const identity = await identityApi.getBackstageIdentity();
    return [identity.userEntityRef, ...identity.ownershipEntityRefs];
  }, [identityApi]);

  const { entities: teams, loading: teamsLoading } = useCatalogEntities(
    userOwns, // refs
    '', // searchTerm
    25, // limit
    'Group', // kind
  );

  const teamOptions = useMemo(() => {
    return teams.map(team => ({
      entityRef: stringifyEntityRef(team),
      displayName: getTeamDisplayName(team),
    }));
  }, [teams]);

  const selectedTeamOption = useMemo(() => {
    return teamOptions.find(team => team.entityRef === selectedTeam) || null;
  }, [teamOptions, selectedTeam]);

  return (
    <Autocomplete
      value={selectedTeamOption}
      onChange={(_, newValue) => {
        onChange(newValue?.entityRef || '');
      }}
      options={teamOptions}
      getOptionLabel={team => team.entityRef}
      loading={teamsLoading}
      id="team-dropdown-field"
      renderOption={(props, team) => (
        <Box component="li" {...props}>
          <Box sx={{ display: 'flex', flexDirection: 'column' }}>
            <Typography variant="body1">{team.entityRef}</Typography>
            {team.displayName && (
              <Typography variant="caption" color="text.secondary">
                {team.displayName}
              </Typography>
            )}
          </Box>
        </Box>
      )}
      renderInput={params => (
        <TextField
          {...params}
          id="team"
          label={t('announcementForm.onBehalfOf')}
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
