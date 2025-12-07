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
import { identityApiRef, useApi } from '@backstage/core-plugin-api';
import {
  useAnnouncementsTranslation,
  useCatalogEntities,
} from '@backstage-community/plugin-announcements-react';
import useAsync from 'react-use/esm/useAsync';
import { useMemo } from 'react';
import { stringifyEntityRef } from '@backstage/catalog-model';
import { Select } from '@backstage/ui';

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

  const { entities: teams } = useCatalogEntities(
    userOwns, // refs
    '', // searchTerm
    25, // limit
    'Group', // kind
  );

  const options = useMemo(() => {
    return teams.map(team => {
      const entityRef = stringifyEntityRef(team);
      const displayName = getTeamDisplayName(team);
      // Use displayName if available, otherwise fall back to entityRef
      const label = displayName || entityRef;
      return {
        value: entityRef,
        label: label,
      };
    });
  }, [teams]);

  const placeholder = useMemo(() => {
    if (options.length === 0) {
      return 'No teams found';
    }
    return 'Select Team';
  }, [options.length]);

  return (
    <Select
      name="team"
      label={t('announcementForm.onBehalfOf')}
      searchable
      searchPlaceholder="Search teams..."
      options={options}
      isDisabled={options.length === 0}
      placeholder={placeholder}
      value={selectedTeam || null}
      onChange={selectedValue => {
        // Handle Key | Key[] | null from react-aria-components
        const stringValue = selectedValue === null ? '' : String(selectedValue);
        onChange(stringValue);
      }}
    />
  );
}
