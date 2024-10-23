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
import React from 'react';
import { render, screen } from '@testing-library/react';

import { ResourceHealthStatus } from '../ResourcesHealthStatus';

jest.mock('@material-ui/styles', () => ({
  ...jest.requireActual('@material-ui/styles'),
  makeStyles: () => (_theme: any) => {
    return {
      success: 'success',
      error: 'error',
      running: 'running',
      warning: 'warning',
      pending: 'pending',
    };
  },
}));

describe('ResourceHealthStatus Component', () => {
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

    expect(screen.getByTestId('degraded-icon')).toBeInTheDocument();
    expect(screen.getByText(healthStatus)).toBeInTheDocument();
  });

  it('should display both the health icon and status text', () => {
    const healthStatus = 'Progressing';
    renderComponent(healthStatus);

    expect(screen.getByTestId('status-running')).toBeInTheDocument();
    expect(screen.getByText(healthStatus)).toBeInTheDocument();
  });
});
