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

import { filterTableData } from './filter-table-data';

type Row = { name: string; value: string };

const data: Row[] = [
  { name: 'UPPER', value: 'CASE' },
  { name: 'lower', value: 'case' },
];

const columns: TableColumn<Row>[] = [{ field: 'name' }, { field: 'value' }];

describe('filterTableData', () => {
  it('should return an empty array if no data are passed', () => {
    expect(
      filterTableData({
        data: [],
        columns,
        searchText: 'search',
      }),
    ).toEqual([]);
    expect(
      filterTableData({
        data: null as any as [],
        columns,
        searchText: 'search',
      }),
    ).toEqual([]);
    expect(
      filterTableData({
        data: undefined as any as [],
        columns,
        searchText: 'search',
      }),
    ).toEqual([]);
  });

  it('should return the input data when no columns are passed', () => {
    expect(
      filterTableData({
        data,
        columns: [],
        searchText: 'search',
      }),
    ).toEqual(data);
  });

  it('should return the input data when search string is empty', () => {
    expect(
      filterTableData({
        data,
        columns,
        searchText: '',
      }),
    ).toEqual(data);
  });

  it('should filter the right properties based on the column field', () => {
    expect(
      filterTableData({
        data,
        columns,
        searchText: 'UPPER',
      }),
    ).toEqual([data[0]]);
  });

  it('should ignore upper and lower case when filtering', () => {
    expect(
      filterTableData({
        data,
        columns,
        searchText: 'LOWER',
      }),
    ).toEqual([data[1]]);
  });

  it('should return all data when neccesarry', () => {
    expect(
      filterTableData({
        data,
        columns,
        searchText: 'case',
      }),
    ).toEqual(data);
  });
});
