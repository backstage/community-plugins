import React from 'react';

import { render, screen } from '@testing-library/react';

import { mockApplication } from '../../../../dev/__data__';
import AppSyncStatus from '../AppSyncStatus';

describe('AppSyncStatus', () => {
  test('should return default component', () => {
    render(<AppSyncStatus app={mockApplication} />);

    expect(screen.getByTestId('synced-icon')).toBeInTheDocument();
    expect(screen.getByText('Synced')).toBeInTheDocument();
  });

  test('should return application health chip component', () => {
    render(<AppSyncStatus app={mockApplication} isChip />);

    expect(screen.getByTestId('app-sync-status-chip')).toBeInTheDocument();
  });
});
