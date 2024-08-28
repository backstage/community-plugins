import React from 'react';
import { render, screen } from '@testing-library/react';

import { ResourceHealthStatus } from '../ResourcesHealthStatus';
import { AppHealthIcon } from '../../AppStatus/StatusIcons';
import { HealthStatus } from '../../../types';

jest.mock('../../AppStatus/StatusIcons', () => ({
  AppHealthIcon: jest.fn(() => <span>Mocked Health Icon</span>),
}));

describe('ResourceHealthStatus', () => {
  const renderComponent = (healthStatus: string) => {
    render(<ResourceHealthStatus healthStatus={healthStatus} />);
  };

  it('should render the health status text correctly', () => {
    const healthStatus = 'Healthy';
    renderComponent(healthStatus);

    expect(screen.getByText(healthStatus)).toBeInTheDocument();
  });

  it('should render the AppHealthIcon with the correct status', () => {
    const healthStatus = 'Degraded';
    renderComponent(healthStatus);

    expect(AppHealthIcon).toHaveBeenCalledWith(
      { status: healthStatus as HealthStatus },
      {},
    );
  });

  it('should displays both the health icon and status text', () => {
    const healthStatus = 'Progressing';
    renderComponent(healthStatus);

    expect(screen.getByText('Mocked Health Icon')).toBeInTheDocument();
    expect(screen.getByText(healthStatus)).toBeInTheDocument();
  });
});
