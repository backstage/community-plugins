import React from 'react';

import { render, screen } from '@testing-library/react';

import { mockApplication } from '../../../../dev/__data__';
import { Application } from '../../../types/application';
import AppServerLink from '../AppServerLink';

describe('AppServerLink', () => {
  test('should not render the server link if the application is not available', () => {
    render(<AppServerLink application={null as unknown as Application} />);
    expect(
      screen.queryByText(mockApplication.spec.destination.server),
    ).not.toBeInTheDocument();
  });

  test('should render the server link', () => {
    render(<AppServerLink application={mockApplication} />);

    expect(
      screen.queryByText(mockApplication.spec.destination.server),
    ).toBeInTheDocument();
  });

  test('should render remote cluster url as server link', () => {
    const remoteApplication: Application = {
      ...mockApplication,
      spec: {
        ...mockApplication.spec,
        destination: {
          server: 'https://remote-url.com',
          namespace: 'remote-ns',
        },
      },
    };
    render(<AppServerLink application={remoteApplication} />);

    expect(screen.queryByText('(in-cluster)')).not.toBeInTheDocument();
    expect(
      screen.queryByTestId('local-cluster-tooltip'),
    ).not.toBeInTheDocument();

    screen.getByText('https://remote-url.com');
  });
});
