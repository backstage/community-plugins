import React from 'react';

import { render, screen } from '@testing-library/react';

import { mockApplication } from '../../../../dev/__data__';
import { Application } from '../../../types/application';
import StatusHeading from '../StatusHeading';

describe('StatusHeading', () => {
  test('should not render if the application is not available', () => {
    render(<StatusHeading app={null as unknown as Application} />);
    expect(screen.queryByText('app-sync-status-chip')).not.toBeInTheDocument();
  });

  test('should render if the application is available', () => {
    render(<StatusHeading app={mockApplication} />);

    expect(screen.queryByTestId('app-health-status-chip')).toBeInTheDocument();
    expect(screen.queryByTestId('app-sync-status-chip')).toBeInTheDocument();
  });
});
