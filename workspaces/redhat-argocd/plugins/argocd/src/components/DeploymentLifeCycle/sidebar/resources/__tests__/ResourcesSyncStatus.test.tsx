import React from 'react';
import { render, screen } from '@testing-library/react';

import { ResourceSyncStatus } from '../ResourcesSyncStatus';
import { SyncIcon } from '../../../../AppStatus/StatusIcons';
import { SyncStatusCode } from '../../../../../types/application';

jest.mock('../../../../AppStatus/StatusIcons', () => ({
  SyncIcon: jest.fn(() => <span>Mocked Sync Icon</span>),
}));

describe('ResourceSyncStatus Component', () => {
  const renderComponent = (syncStatus: string) => {
    render(<ResourceSyncStatus syncStatus={syncStatus} />);
  };

  it('should render the sync status text correctly', () => {
    const syncStatus = 'Synced';
    renderComponent(syncStatus);

    expect(screen.getByText(syncStatus)).toBeInTheDocument();
  });

  it('should render the SyncIcon with the correct status', () => {
    const syncStatus = 'OutOfSync';
    renderComponent(syncStatus);

    expect(SyncIcon).toHaveBeenCalledWith(
      { status: syncStatus as SyncStatusCode },
      {},
    );
  });

  it('should display both the sync icon and status text', () => {
    const syncStatus = 'Unknown';
    renderComponent(syncStatus);

    expect(screen.getByText('Mocked Sync Icon')).toBeInTheDocument();
    expect(screen.getByText(syncStatus)).toBeInTheDocument();
  });
});
