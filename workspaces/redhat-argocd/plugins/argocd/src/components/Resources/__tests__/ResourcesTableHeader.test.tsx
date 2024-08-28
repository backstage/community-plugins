/* eslint-disable jest/no-conditional-expect */
import React from 'react';
import { render, screen, fireEvent } from '@testing-library/react';

import { ResourcesTableHeader } from '../ResourcesTableHeader';
import { Order } from '../../../types';

jest.mock('../ResourcesColumnHeader', () => ({
  ResourcesColumnHeaders: [
    { id: 'name', title: 'Name', defaultSort: 'asc' },
    { id: 'type', title: 'Type', defaultSort: 'desc' },
    { id: 'expander', title: '', defaultSort: false },
  ],
}));

describe('ResourcesTableHeader', () => {
  const onRequestSortMock = jest.fn();
  const defaultProps = {
    order: 'asc' as Order,
    orderBy: 'Name',
    orderById: '0',
    onRequestSort: onRequestSortMock,
  };

  beforeEach(() => {
    onRequestSortMock.mockClear();
  });

  it('should render table headers correctly', () => {
    render(<ResourcesTableHeader {...defaultProps} />);

    expect(screen.getByText('Name')).toBeInTheDocument();
    expect(screen.getByText('Type')).toBeInTheDocument();
  });

  it('should render TableSortLabel correctly', () => {
    render(<ResourcesTableHeader {...defaultProps} />);

    const nameHeader = screen.getByText('Name');
    const typeHeader = screen.getByText('Type');

    expect(nameHeader.closest('span')).toHaveClass('MuiTableSortLabel-root');
    expect(typeHeader.closest('span')).toHaveClass('MuiTableSortLabel-root');
  });

  it('should trigger onRequestSort when clicking on sortable headers', () => {
    render(<ResourcesTableHeader {...defaultProps} />);

    const nameHeader = screen.getByText('Name');
    const sortLabel = nameHeader.closest('span');

    if (sortLabel) {
      fireEvent.click(sortLabel);
      expect(onRequestSortMock).toHaveBeenCalledWith(
        expect.any(Object),
        'Name',
        '0',
      );
    } else {
      throw new Error('Sort label not found');
    }
  });

  it('does not render TableSortLabel for expander column', () => {
    render(<ResourcesTableHeader {...defaultProps} />);

    expect(screen.queryByTestId('expander')).not.toBeInTheDocument();
  });
});
