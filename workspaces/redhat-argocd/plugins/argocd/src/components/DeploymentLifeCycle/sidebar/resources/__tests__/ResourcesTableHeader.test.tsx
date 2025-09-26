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

import { render, screen, fireEvent } from '@testing-library/react';

import { ResourcesTableHeader } from '../ResourcesTableHeader';
import { Order } from '@backstage-community/plugin-redhat-argocd-common';
import { mockUseTranslation } from '../../../../../test-utils/mockTranslations';

jest.mock('../../../../../hooks/useTranslation', () => ({
  useTranslation: () => mockUseTranslation(),
}));

jest.mock('../ResourcesColumnHeader', () => ({
  getResourcesColumnHeaders: () => {
    return [
      { id: 'name', title: 'Name', defaultSort: 'asc' },
      { id: 'type', title: 'Type', defaultSort: 'desc' },
      { id: 'expander', title: '', defaultSort: false },
    ];
  },
}));

describe('ResourcesTableHeader Component', () => {
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

    if (!sortLabel) {
      throw new Error('Sort label not found');
    }
    fireEvent.click(sortLabel);
    expect(onRequestSortMock).toHaveBeenCalledWith(
      expect.any(Object),
      'name',
      '0',
    );
  });

  it('should not render TableSortLabel for expander column', () => {
    render(<ResourcesTableHeader {...defaultProps} />);

    expect(screen.queryByTestId('expander')).not.toBeInTheDocument();
  });
});
