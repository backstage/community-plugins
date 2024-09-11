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
