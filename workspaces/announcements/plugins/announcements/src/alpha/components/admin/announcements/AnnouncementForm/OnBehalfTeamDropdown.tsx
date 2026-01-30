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
import { Key, useMemo } from 'react';
import { Select } from '@backstage/ui';
import { identityApiRef, useApi } from '@backstage/core-plugin-api';
import {
  useAnnouncementsTranslation,
  useCatalogEntities,
} from '@backstage-community/plugin-announcements-react';
import useAsync from 'react-use/esm/useAsync';
import { stringifyEntityRef } from '@backstage/catalog-model';

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
    'Group', // kind
  );

  const selectOptions = useMemo(() => {
    return teams.map(team => {
      const entityRef = stringifyEntityRef(team);
      return {
        value: entityRef,
        label: getTeamDisplayName(team) ?? entityRef,
      };
    });
  }, [teams]);

  const handleChange = (value: Key[] | Key | null) => {
    if (!value) {
      onChange('');
      return;
    }

    let stringValue: string | null = null;

    if (Array.isArray(value)) {
      stringValue = String(value[0] ?? '');
    } else {
      stringValue = String(value);
    }

    onChange(stringValue || '');
  };

  return (
    <Select
      key={selectedTeam || 'none'}
      name="team"
      label={t('announcementForm.onBehalfOf')}
      searchable
      placeholder={t('announcementForm.onBehalfOf')}
      value={selectedTeam || null}
      onChange={handleChange}
      options={selectOptions}
      isDisabled={teamsLoading || selectOptions.length === 0}
    />
  );
}
