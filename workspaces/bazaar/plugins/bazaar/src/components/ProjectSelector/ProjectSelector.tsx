/*
 * Copyright 2021 The Backstage Authors
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

import { Entity } from '@backstage/catalog-model';
import { Text } from '@backstage/ui';
import Autocomplete from '@material-ui/lab/Autocomplete';
import TextField from '@material-ui/core/TextField';
import styles from './ProjectSelector.module.css';

type Props = {
  catalogEntities: Entity[];
  onChange: (entity: Entity) => void;
  disableClearable: boolean;
  defaultValue: Entity | null | undefined;
  label: string;
};

export const ProjectSelector = ({
  catalogEntities,
  onChange,
  disableClearable,
  defaultValue,
  label,
}: Props) => {
  return (
    <div className={styles.container}>
      <Autocomplete
        className={styles.autocomplete}
        fullWidth
        disableClearable={disableClearable}
        defaultValue={defaultValue}
        options={catalogEntities}
        getOptionLabel={option => option?.metadata?.name}
        renderOption={option => (
          <Text variant="body-small">{option?.metadata?.name}</Text>
        )}
        renderInput={params => <TextField {...params} label={label} />}
        onChange={(_, data) => {
          onChange(data!);
        }}
      />
    </div>
  );
};
