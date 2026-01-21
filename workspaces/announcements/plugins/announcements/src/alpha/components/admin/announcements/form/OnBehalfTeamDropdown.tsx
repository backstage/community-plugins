/*
 * Copyright 2026 The Backstage Authors
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
import useAsync from 'react-use/esm/useAsync';
import { Select } from '@backstage/ui';
import { identityApiRef, useApi } from '@backstage/frontend-plugin-api';
import {
  useAnnouncementsTranslation,
  useCatalogEntities,
} from '@backstage-community/plugin-announcements-react';
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

export function OnBehalfTeamDropdown({
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
      const displayName = getTeamDisplayName(team);
      return {
        value: entityRef,
        label: displayName || entityRef,
      };
    });
  }, [teams]);

  const selectedTeamOption = useMemo(() => {
    if (!selectedTeam) return undefined;
    return selectOptions.find(option => option.value === selectedTeam);
  }, [selectOptions, selectedTeam]);

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

    if (!stringValue) {
      onChange('');
      return;
    }

    onChange(stringValue);
  };

  return (
    <Select
      name="onBehalfOf"
      label={t('announcementForm.onBehalfOf')}
      searchable
      searchPlaceholder={t('announcementForm.onBehalfOf')}
      value={selectedTeamOption?.value}
      onChange={handleChange}
      options={selectOptions}
      isDisabled={teamsLoading}
    />
  );
}
