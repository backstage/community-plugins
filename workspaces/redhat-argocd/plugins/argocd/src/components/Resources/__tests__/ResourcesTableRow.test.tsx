import React from 'react';
import { render, screen, fireEvent } from '@testing-library/react';

import { ResourcesTableRow } from '../ResourcesTableRow';

jest.mock('../ResourcesSyncStatus', () => ({
  ResourceSyncStatus: jest.fn(() => <div>Mocked Sync Status</div>),
}));

jest.mock('../ResourcesHealthStatus', () => ({
  ResourceHealthStatus: jest.fn(() => <div>Mocked Health Status</div>),
}));

describe('ResourcesTableRow', () => {
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
    expect(screen.getByText('08/25/2024 12:00 pm EDT')).toBeInTheDocument();
    expect(screen.getByText('Mocked Sync Status')).toBeInTheDocument();
    expect(screen.getByText('Mocked Health Status')).toBeInTheDocument();
  });

  it('should handles expand/collapse click correctly', () => {
    render(<ResourcesTableRow {...defaultProps} />);

    const expandButton = screen.getByRole('button', { name: /expand row/i });
    fireEvent.click(expandButton);

    expect(defaultProps.setOpen).toHaveBeenCalledWith(expect.any(Function));

    // Simulate the toggle action
    const toggleFunction = defaultProps.setOpen.mock.calls[0][0];
    const currentOpenState = { '123': false };
    expect(toggleFunction(currentOpenState)).toEqual({ '123': true });
  });

  it('should render the correct icon based on open state', () => {
    render(<ResourcesTableRow {...defaultProps} />);
    expect(screen.getByTestId('right-arrow')).toBeInTheDocument();

    render(<ResourcesTableRow {...defaultProps} open />);
    expect(screen.getByTestId('down-arrow')).toBeInTheDocument();
  });
});
