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
import { handleDelete, handleDeleteGroup } from '../filterHelpers';
import { FiltersType } from '../../../../../../types/resources';

describe('filterHelpers', () => {
  let setFilters: jest.Mock;
  let filters: FiltersType;

  beforeEach(() => {
    setFilters = jest.fn();
    filters = {
      Kind: ['Pod', 'Service'],
      HealthStatus: ['Healthy'],
      SyncStatus: ['Synced'],
      SearchByName: ['test'],
    };
  });

  it('should remove chip from handleDelete filter', () => {
    handleDelete('Kind', 'Pod', setFilters);
    expect(setFilters).toHaveBeenCalledWith(expect.any(Function));
    const callback = setFilters.mock.calls[0][0];
    expect(callback(filters)).toEqual({
      ...filters,
      Kind: ['Service'],
    });
  });

  it('should clear the entire filter group on handleDeleteGroup', () => {
    handleDeleteGroup('Kind', setFilters);
    expect(setFilters).toHaveBeenCalledWith(expect.any(Function));
    const callback = setFilters.mock.calls[0][0];
    expect(callback(filters)).toEqual({
      ...filters,
      Kind: [],
    });
  });
});
