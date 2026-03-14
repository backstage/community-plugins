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

import { Select, SelectedItems, SelectItem } from '@backstage/core-components';
import { Text } from '@backstage/ui';
import styles from './Filters.module.css';

type RepositoryFiltersProps = {
  items: Array<SelectItem>;
  totalIssuesInGithub: number;
  placeholder: string;
  onChange: (active: Array<string>) => void;
};

const checkSelectedItems: (
  onChange: (active: Array<string>) => void,
) => (active: SelectedItems) => void = onChange => active => {
  return onChange(active as Array<string>);
};

export const RepositoryFilters = ({
  items,
  onChange,
  placeholder,
}: RepositoryFiltersProps) => {
  return (
    <div className={styles.filters}>
      <Select
        placeholder={placeholder}
        label=""
        items={items}
        multiple
        onChange={checkSelectedItems(onChange)}
      />
      <Text variant="body-x-small">
        *Repositories with more Issues on GitHub than available to view in
        Backstage. To view them go to GitHub.
      </Text>
    </div>
  );
};
