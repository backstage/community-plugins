/*
 * Copyright 2024 The Backstage Authors
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
import { TableColumn } from '@backstage/core-components';

/**
 * Filter the given `data` rows with the Backstage TableColumn `columns` configuration
 * and the `search` string.
 *
 * It ignores upper/lower case similar to the underlaying @material-table/core implementation:
 * https://github.com/material-table-core/core/blob/v3.2.5/src/utils/data-manager.js#L808-L811
 */
export const filterTableData = <T extends Record<string, any>>({
  data,
  columns,
  searchText,
  locale = 'en',
}: {
  data: T[];
  columns: TableColumn<T>[];
  searchText?: string | null;
  locale?: string;
}): T[] => {
  if (!data || !data.length || !columns || !columns.length || !searchText) {
    return data || [];
  }

  const upperCaseSearch = searchText.toLocaleUpperCase(locale);

  return data.filter(row => {
    const fieldValues = columns.map(column =>
      column.field ? row[column.field] : null,
    );

    return fieldValues.some(fieldValue =>
      fieldValue
        ?.toString()
        .toLocaleUpperCase(locale)
        .includes(upperCaseSearch),
    );
  });
};
