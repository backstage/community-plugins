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
import { catalogApiRef } from '@backstage/plugin-catalog-react';
import { useAnnouncementsTranslation } from '@backstage-community/plugin-announcements-react';
import useAsync from 'react-use/esm/useAsync';
import { stringifyEntityRef } from '@backstage/catalog-model';

type EntityDropdownProps = {
  selectedEntity: string;
  onChange: (entityRef: string) => void;
};

const ENTITY_KINDS = ['Component', 'System', 'API', 'Domain', 'Resource'];

export default function EntityDropdown({
  selectedEntity,
  onChange,
}: EntityDropdownProps) {
  const { t } = useAnnouncementsTranslation();
  const identityApi = useApi(identityApiRef);
  const catalogApi = useApi(catalogApiRef);

  const { value: entities, loading: entitiesLoading } = useAsync(async () => {
    const identity = await identityApi.getBackstageIdentity();
    const ownershipRefs = [
      identity.userEntityRef,
      ...identity.ownershipEntityRefs,
    ];

    const response = await catalogApi.queryEntities({
      filter: [
        {
          kind: ENTITY_KINDS,
          'relations.ownedBy': ownershipRefs,
        },
      ],
    });

    return response.items;
  }, [identityApi, catalogApi]);

  const selectOptions = useMemo(() => {
    if (!entities) return [];

    return entities.map(entity => {
      const entityRef = stringifyEntityRef(entity);

      return {
        value: entityRef,
        label: entityRef,
      };
    });
  }, [entities]);

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
      key={selectedEntity || 'none'}
      name="entity"
      label={t('announcementForm.entity')}
      searchable
      placeholder={t('announcementForm.entityPlaceholder')}
      searchPlaceholder={t('announcementForm.entitySearchPlaceholder')}
      value={selectedEntity || null}
      onChange={handleChange}
      options={selectOptions}
      isDisabled={entitiesLoading || selectOptions.length === 0}
    />
  );
}
