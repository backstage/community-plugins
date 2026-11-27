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
import { useDeferredValue, useState } from 'react';
import { useAsync } from 'react-use';

import { stringifyEntityRef } from '@backstage/catalog-model';
import { useApi } from '@backstage/core-plugin-api';
import { Text } from '@backstage/ui';

import Autocomplete from '@mui/material/Autocomplete';
import TextField from '@mui/material/TextField';

import { rbacApiRef } from '../../api/RBACBackendClient';
import { useTranslation } from '../../hooks/useTranslation';
import styles from './AccessCheck.module.css';

type UserOption = {
  ref: string;
  label: string;
};

/** Autocomplete over the catalog's users, reporting the selected entity ref. */
export const UserPicker = ({
  onSelect,
}: {
  onSelect: (userRef: string | null) => void;
}) => {
  const { t } = useTranslation();
  const rbacApi = useApi(rbacApiRef);
  const [input, setInput] = useState('');
  const deferredInput = useDeferredValue(input);

  const { value: options = [], loading } = useAsync(async () => {
    const result = await rbacApi.searchMembers({
      searchTerm: deferredInput,
      kind: 'user',
      limit: 20,
    });
    if (!('items' in result)) {
      return [];
    }
    return result.items.map(member => ({
      ref: stringifyEntityRef(member),
      label: member.spec?.profile?.displayName ?? member.metadata.name,
    }));
  }, [deferredInput, rbacApi]);

  return (
    <Autocomplete<UserOption>
      className={styles.userPicker}
      options={options}
      loading={loading}
      // the catalog search already narrows the options
      filterOptions={userOptions => userOptions}
      getOptionLabel={option => option.label}
      isOptionEqualToValue={(option, value) => option.ref === value.ref}
      renderOption={(props, option) => (
        <li {...props} key={option.ref}>
          <div>
            {option.label}
            <Text as="p" variant="body-small" color="secondary">
              {option.ref}
            </Text>
          </div>
        </li>
      )}
      onInputChange={(_event, newInput) => setInput(newInput)}
      onChange={(_event, option) => onSelect(option?.ref ?? null)}
      renderInput={params => (
        <TextField
          {...params}
          label={t('accessCheck.selectUser')}
          variant="outlined"
        />
      )}
    />
  );
};
