import React from 'react';

import { render, screen } from '@testing-library/react';

import { RolloutPhase, RolloutPhaseType } from '../../../../../types/rollouts';
import RolloutStatus from '../RolloutStatus';

describe('RolloutStatus Component', () => {
  test('renders null when status is not provided', () => {
    const { container } = render(
      <RolloutStatus status={null as unknown as RolloutPhaseType} />,
    );
    expect(container.firstChild).toBeNull();
  });

  test('renders the Chip component with the correct status', () => {
    render(<RolloutStatus status={RolloutPhase.Progressing} />);

    const chipElement = screen.getByTestId('rollout-status-chip');
    expect(chipElement).toBeInTheDocument();
    expect(chipElement).toHaveTextContent(RolloutPhase.Progressing);
  });

  test('renders the RolloutStatusIcon with the correct status', () => {
    render(<RolloutStatus status={RolloutPhase.Healthy} />);

    const iconElement = screen.queryByTestId('rollout-healthy-icon');
    expect(iconElement).toBeInTheDocument();
  });
});
