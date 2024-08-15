import React from 'react';

import { render, screen } from '@testing-library/react';

import { mockApplication } from '../../../../dev/__data__';
import AppHealthStatus from '../AppHealthStatus';

describe('AppHealthStatus', () => {
  test('should return default component', () => {
    render(<AppHealthStatus app={mockApplication} />);

    expect(screen.queryByTestId('healthy-icon')).toBeInTheDocument();
    expect(screen.queryByText('Healthy')).toBeInTheDocument();
  });

  test('should return application health chip component', () => {
    render(<AppHealthStatus app={mockApplication} isChip />);

    expect(screen.getByTestId('app-health-status-chip')).toBeInTheDocument();
  });
});
