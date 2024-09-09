import React from 'react';
import { screen, render } from '@testing-library/react';
import { mockArgoResources } from '../../../../../../../dev/__data__/argoRolloutsObjects';
import { Resource } from '../../../../../../types/application';
import { getRolloutUIResources } from '../../../../../../utils/rollout-utils';
import { useArgoResources } from '../../../rollouts/RolloutContext';
import RolloutMetadata from '../RolloutMetadata';

jest.mock('../../../rollouts/RolloutContext', () => ({
  ...jest.requireActual('../../../rollouts/RolloutContext'),
  useArgoResources: jest.fn(),
}));

const rolloutResource: Resource = {
  version: 'argoproj.io',
  kind: 'Rollout',
  namespace: 'openshift-gitops',
  name: 'canary-rollout-analysis',
  status: 'Synced',
  health: {
    status: 'Degraded',
  },
};

describe('RolloutMetadata component', () => {
  beforeEach(() => {
    (useArgoResources as jest.Mock).mockReturnValue({
      rollouts: getRolloutUIResources(mockArgoResources, 'quarkus-app'),
    });
  });

  it('should not render metadata when rollout is missing', () => {
    const { container } = render(
      <RolloutMetadata resource={undefined as unknown as Resource} />,
    );

    expect(container.firstChild).toBeNull();
  });

  it('should render metadata when rollout is found', () => {
    render(<RolloutMetadata resource={rolloutResource} />);

    expect(screen.getByText('openshift-gitops')).toBeInTheDocument();
    expect(screen.getByText('Canary')).toBeInTheDocument();
    expect(screen.getByText('Healthy')).toBeInTheDocument();
  });
});
