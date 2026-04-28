/*
 * Copyright 2022 The Backstage Authors
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

import { Select, Text } from '@backstage/ui';
import type { Key } from 'react-aria-components';
import styles from './Filters.module.css';

type SelectOption = {
  value: string;
  label: string;
};

type RepositoryFiltersProps = {
  items: Array<SelectOption>;
  totalIssuesInGithub: number;
  placeholder: string;
  onChange: (active: Array<string>) => void;
};

export const RepositoryFilters = ({
  items,
  onChange,
  placeholder,
}: RepositoryFiltersProps) => {
  const handleSelectionChange = (keys: Key | Key[] | null) => {
    onChange(Array.isArray(keys) ? keys.map(String) : []);
  };

  return (
    <div className={styles.filters}>
      <Select
        placeholder={placeholder}
        label=""
        options={items}
        selectionMode="multiple"
        onChange={handleSelectionChange}
      />
      <Text variant="body-x-small">
        *Repositories with more Issues on GitHub than available to view in
        Backstage. To view them go to GitHub.
      </Text>
    </div>
  );
};
