import React from 'react';
import { fireEvent, render, screen, waitFor } from '@testing-library/react';

import { ResourcesTableRow } from '../ResourcesTableRow';

jest.mock('../ResourcesSyncStatus', () => ({
  ResourceSyncStatus: jest.fn(() => <div>Mocked Sync Status</div>),
}));

jest.mock(
  '../resource/DeploymentMetadata',
  () =>
    ({ resource }: { resource: any }) =>
      <div>{resource.namespace}</div>,
);

jest.mock('../ResourcesHealthStatus', () => ({
  ResourceHealthStatus: jest.fn(() => <div>Mocked Health Status</div>),
}));

describe('ResourcesTableRow Component', () => {
  const defaultProps = {
    row: {
      version: 'v1',
      kind: 'Deployment',
      namespace: 'openshift-gitops',
      name: 'quarkus-app',
      status: 'Synced',
      health: { status: 'Healthy' },
    },
    createdAt: '2024-08-25T12:00:00Z',
    open: false,
    uid: '123',
    setOpen: jest.fn(),
  };

  it('should render the row with correct data', () => {
    render(<ResourcesTableRow {...defaultProps} />);

    expect(screen.getByText('Deployment')).toBeInTheDocument();
    expect(screen.getByText('08/25/2024 12:00 pm')).toBeInTheDocument();
    expect(screen.getByText('Mocked Sync Status')).toBeInTheDocument();
    expect(screen.getByText('Mocked Health Status')).toBeInTheDocument();
  });

  it('should expand the clicked row and metadata should be visible', async () => {
    render(<ResourcesTableRow {...defaultProps} />);

    fireEvent.click(screen.getByTestId('expander-123'));
    await waitFor(() => {
      expect(screen.getByText('openshift-gitops')).toBeInTheDocument();
    });
  });
});
