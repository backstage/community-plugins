import React from 'react';
import { render, screen } from '@testing-library/react';

import { ResourcesTableBody } from '../ResourcesTableBody';
import { ResourcesTableRow } from '../ResourcesTableRow';

jest.mock('../ResourcesTableRow', () => ({
  ResourcesTableRow: jest.fn(() => <div>Mocked ResourcesTableRow</div>),
}));

describe('ResourcesTableBody', () => {
  const defaultProps = {
    rows: [
      { kind: 'Development', status: 'Synced', health: { status: 'Healthy' } },
      { kind: 'Service', status: 'Synced', health: { status: 'Healthy' } },
    ],
    createdAt: '2024-08-25T12:00:00Z',
  };

  it('should render the correct number of ResourcesTableRow components', () => {
    render(<ResourcesTableBody {...defaultProps} />);

    // Check that the correct number of ResourcesTableRow components are rendered
    expect(screen.getAllByText('Mocked ResourcesTableRow')).toHaveLength(2);
  });

  it('should passes the correct props to ResourcesTableRow', () => {
    render(<ResourcesTableBody {...defaultProps} />);

    defaultProps.rows.forEach((row, index) => {
      expect(ResourcesTableRow).toHaveBeenNthCalledWith(
        index + 1,
        expect.objectContaining({
          row,
          createdAt: defaultProps.createdAt,
          uid: index.toString(),
          open: false,
          setOpen: expect.any(Function),
        }),
        expect.anything(),
      );
    });
  });
});
