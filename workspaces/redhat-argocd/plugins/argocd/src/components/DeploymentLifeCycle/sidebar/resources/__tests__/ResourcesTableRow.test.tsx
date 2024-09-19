import React from 'react';
import moment from 'moment';
import { fireEvent, render, screen, waitFor } from '@testing-library/react';

import { ResourcesTableRow } from '../ResourcesTableRow';
import { useArgoResources } from '../../rollouts/RolloutContext';

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

jest.mock('../../../sidebar/rollouts/RolloutContext', () => ({
  ...jest.requireActual('../../../sidebar/rollouts/RolloutContext'),
  useArgoResources: jest.fn(),
}));

describe('ResourcesTableRow Component', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    (useArgoResources as jest.Mock).mockReturnValue({ argoResources: [] });
  });

  const defaultProps = {
    row: {
      version: 'v1',
      kind: 'Deployment',
      namespace: 'openshift-gitops',
      name: 'quarkus-app',
      status: 'Synced',
      health: { status: 'Healthy' },
      createTimestamp: '2024-08-25T12:00:00Z',
    },
    uid: '123',
  };

  it('should render the row with correct data', () => {
    render(<ResourcesTableRow {...defaultProps} />);

    expect(screen.getByText('Deployment')).toBeInTheDocument();

    const expectedTimestamp = moment
      .utc('2024-08-25T12:00:00Z')
      .local()
      .format('MM/DD/YYYY hh:mm a');

    expect(screen.getByText(expectedTimestamp)).toBeInTheDocument();
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

  it('should collapse the row when clicked again', async () => {
    render(<ResourcesTableRow {...defaultProps} />);

    const expanderButton = screen.getByTestId('expander-123');

    fireEvent.click(expanderButton);
    await waitFor(() => {
      expect(screen.getByText('openshift-gitops')).toBeInTheDocument();
    });

    fireEvent.click(expanderButton);
    await waitFor(() => {
      expect(screen.queryByText('openshift-gitops')).not.toBeInTheDocument();
    });
  });
});
