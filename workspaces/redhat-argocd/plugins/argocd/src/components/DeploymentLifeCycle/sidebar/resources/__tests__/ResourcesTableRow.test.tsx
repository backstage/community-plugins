import React from 'react';
import { render, screen } from '@testing-library/react';

import { ResourcesTableRow } from '../ResourcesTableRow';

jest.mock('../ResourcesSyncStatus', () => ({
  ResourceSyncStatus: jest.fn(() => <div>Mocked Sync Status</div>),
}));

jest.mock('../ResourcesHealthStatus', () => ({
  ResourceHealthStatus: jest.fn(() => <div>Mocked Health Status</div>),
}));

describe('ResourcesTableRow Component', () => {
  const defaultProps = {
    row: {
      kind: 'Service',
      status: 'Synced',
      health: {
        status: 'Healthy',
      },
    },
    createdAt: '2024-08-25T12:00:00Z',
    open: false,
    uid: '123',
    setOpen: jest.fn(),
  };

  it('should render the row with correct data', () => {
    render(<ResourcesTableRow {...defaultProps} />);

    expect(screen.getByText('Service')).toBeInTheDocument();
    expect(screen.getByText('08/25/2024 12:00 pm')).toBeInTheDocument();
    expect(screen.getByText('Mocked Sync Status')).toBeInTheDocument();
    expect(screen.getByText('Mocked Health Status')).toBeInTheDocument();
  });
});
