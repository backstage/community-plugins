import React from 'react';

import { render, screen } from '@testing-library/react';

import { mockArgoResources } from '../../../../../../dev/__data__/argoRolloutsObjects';
import { getRolloutUIResources } from '../../../../../utils/rollout-utils';
import { useArgoResources } from '../RolloutContext';
import Rollouts from '../Rollouts';

jest.mock('../RolloutContext', () => ({
  ...jest.requireActual('../RolloutContext'),
  useArgoResources: jest.fn(),
}));

describe('Rollouts', () => {
  beforeEach(() => {
    (useArgoResources as jest.Mock).mockReturnValue({
      rollouts: getRolloutUIResources(mockArgoResources, 'quarkus-app'),
    });
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  it('should not render anything if rollouts is missing', () => {
    (useArgoResources as jest.Mock).mockReturnValue({ rollouts: [] });

    render(<Rollouts />);
    expect(screen.queryByTestId('rollouts-list')).not.toBeInTheDocument();
  });

  it('should render rollouts', () => {
    render(<Rollouts />);
    expect(screen.queryByTestId('rollouts-list')).toBeInTheDocument();
  });
});
