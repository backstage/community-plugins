import { render } from '@testing-library/react';
import {
  healthStatusMenuItems,
  syncStatusMenuItems,
  kindFilterMenuItems,
} from '../Filters';
import { FiltersType } from '../../../../../../types/resources';

describe('Filters', () => {
  let filters: FiltersType;

  beforeEach(() => {
    filters = {
      Kind: ['Pod'],
      HealthStatus: ['Healthy'],
      SyncStatus: ['Synced'],
      SearchByName: [],
    };
  });

  it('should render with selected health status menu items', () => {
    const { getByText } = render(healthStatusMenuItems(filters));
    expect(getByText('Healthy')).toBeInTheDocument();
  });

  it('should render with selected sync status menu items', () => {
    const { getByText } = render(syncStatusMenuItems(filters));
    expect(getByText('Synced')).toBeInTheDocument();
  });

  it('should render with selected kind filter menu items', () => {
    const { getByText } = render(
      kindFilterMenuItems(['Pod', 'Service'], filters),
    );
    expect(getByText('Pod')).toBeInTheDocument();
  });
});
