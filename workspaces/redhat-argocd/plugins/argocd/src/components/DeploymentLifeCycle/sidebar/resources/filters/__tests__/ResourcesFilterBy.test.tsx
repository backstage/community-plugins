import React from 'react';
import { render, fireEvent, screen } from '@testing-library/react';

import { ResourcesFilterBy } from '../ResourcesFilterBy';
import { FiltersType } from '../../../../../../types/resources';

jest.mock('../filterHelpers', () => ({
  handleDelete: jest.fn(),
  handleDeleteGroup: jest.fn(),
}));

describe('ResourcesFilterBy', () => {
  let filters: FiltersType;
  let setFilters: jest.Mock;

  beforeEach(() => {
    setFilters = jest.fn();
    filters = {
      Kind: ['Deployment'],
      HealthStatus: ['Healthy'],
      SyncStatus: ['Synced'],
      SearchByName: ['test'],
    };
  });

  it('should render the component with correct filters', () => {
    render(
      <ResourcesFilterBy
        filters={{
          Kind: [],
          HealthStatus: [],
          SyncStatus: [],
          SearchByName: [],
        }}
        setFilters={setFilters}
        allKinds={['Deployment', 'Service']}
      />,
    );
    expect(screen.getByText('Filter by')).toBeInTheDocument();
    fireEvent.click(screen.getByText('Filter by'));
    expect(screen.getByText('Name')).toBeInTheDocument();
    expect(screen.getByText('Health status')).toBeInTheDocument();
    expect(screen.getByText('Sync status')).toBeInTheDocument();
    expect(screen.getByText('Kind')).toBeInTheDocument();
  });

  it('should clear all filters when clearAllFilters is called', () => {
    render(
      <ResourcesFilterBy
        filters={filters}
        setFilters={setFilters}
        allKinds={['Deployment', 'Service']}
      />,
    );
    fireEvent.click(screen.getByText('Clear all filters'));
    expect(setFilters).toHaveBeenCalledWith({
      Kind: [],
      HealthStatus: [],
      SyncStatus: [],
      SearchByName: [],
    });
  });
});
