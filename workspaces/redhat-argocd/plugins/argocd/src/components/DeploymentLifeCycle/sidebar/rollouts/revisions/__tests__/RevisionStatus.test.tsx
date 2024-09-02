import React from 'react';

import { render } from '@testing-library/react';

import { ReplicaSet } from '../../../../../../types/resources';
import RevisionStatus from '../RevisionStatus';

jest.mock('@patternfly/react-icons', () => ({
  ArrowCircleDownIcon: () => <div data-testid="ArrowCircleDownIcon" />,
  CircleNotchIcon: () => <div data-testid="CircleNotchIcon" />,
  CheckCircleIcon: () => <div data-testid="CheckCircleIcon" />,
}));

describe('RevisionStatus', () => {
  it('renders ArrowCircleDownIcon revision is not passed', () => {
    const mockRevision: ReplicaSet = null as unknown as ReplicaSet;
    const { container } = render(<RevisionStatus revision={mockRevision} />);
    expect(container.firstChild).toBeNull();
  });

  it('renders ArrowCircleDownIcon when replicas are 0', () => {
    const mockRevision: ReplicaSet = {
      status: {
        replicas: 0,
        availableReplicas: 0,
      },
    } as ReplicaSet;

    const { getByTestId } = render(<RevisionStatus revision={mockRevision} />);

    expect(getByTestId('ArrowCircleDownIcon')).toBeInTheDocument();
  });

  it('renders CircleNotchIcon when availableReplicas are less than replicas', () => {
    const mockRevision: ReplicaSet = {
      status: {
        replicas: 3,
        availableReplicas: 1,
      },
    } as ReplicaSet;

    const { getByTestId } = render(<RevisionStatus revision={mockRevision} />);

    expect(getByTestId('CircleNotchIcon')).toBeInTheDocument();
  });

  it('renders CheckCircleIcon when availableReplicas equal replicas', () => {
    const mockRevision: ReplicaSet = {
      status: {
        replicas: 3,
        availableReplicas: 3,
      },
    } as ReplicaSet;

    const { getByTestId } = render(<RevisionStatus revision={mockRevision} />);

    expect(getByTestId('CheckCircleIcon')).toBeInTheDocument();
  });
});
