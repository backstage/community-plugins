import React from 'react';

import { render, screen } from '@testing-library/react';

import { AnalysisRunPhases } from '../../../../../types/analysisRuns';
import { HealthStatus } from '../../../../../types/application';
import { RolloutPhase } from '../../../../../types/rollouts';
import RolloutStatusIcon, { getStatusColor } from '../RolloutStatusIcon';

describe('getStatusColor', () => {
  test('returns green for Healthy, RolloutPhase.Healthy, and AnalysisRunPhases.Successful', () => {
    expect(getStatusColor(HealthStatus.Healthy)).toBe('green');
    expect(getStatusColor(RolloutPhase.Healthy)).toBe('green');
    expect(getStatusColor(AnalysisRunPhases.Successful)).toBe('green');
  });

  test('returns #766F94 for RolloutPhase.Paused', () => {
    expect(getStatusColor(RolloutPhase.Paused)).toBe('#766F94');
  });

  test('returns #E96D76 for Degraded statuses and AnalysisRunPhases.Failed', () => {
    expect(getStatusColor(HealthStatus.Degraded)).toBe('#E96D76');
    expect(getStatusColor(RolloutPhase.Degraded)).toBe('#E96D76');
    expect(getStatusColor(AnalysisRunPhases.Failed)).toBe('#E96D76');
  });

  test('returns #0DADEA for RolloutPhase.Progressing and AnalysisRunPhases.Running', () => {
    expect(getStatusColor(RolloutPhase.Progressing)).toBe('#0DADEA');
    expect(getStatusColor(AnalysisRunPhases.Running)).toBe('#0DADEA');
  });

  test('returns gray for unknown or default case', () => {
    expect(getStatusColor('UnknownStatus' as any)).toBe('gray');
  });
});

describe('RolloutStatusIcon', () => {
  test('renders null for unknown status', () => {
    const { container } = render(
      <RolloutStatusIcon status={'UnknownStatus' as any} />,
    );
    expect(container.firstChild).toBeNull();
  });

  test('renders CheckCircleIcon for RolloutPhase.Healthy with correct color', () => {
    render(<RolloutStatusIcon status={RolloutPhase.Healthy} />);
    const icon = screen.getByTestId('rollout-healthy-icon');
    expect(icon).toBeInTheDocument();
    expect(icon).toHaveStyle('color: green');
  });

  test('renders PauseCircleIcon for RolloutPhase.Paused with correct color', () => {
    render(<RolloutStatusIcon status={RolloutPhase.Paused} />);
    const icon = screen.getByTestId('rollout-paused-icon');
    expect(icon).toBeInTheDocument();
    expect(icon).toHaveStyle('color: #766F94');
  });

  test('renders ErrorCircleOIcon for RolloutPhase.Degraded with correct color', () => {
    render(<RolloutStatusIcon status={RolloutPhase.Degraded} />);
    const icon = screen.getByTestId('rollout-degraded-icon');
    expect(icon).toBeInTheDocument();
    expect(icon).toHaveStyle('color: #E96D76');
  });

  test('renders CircleNotchIcon for RolloutPhase.Progressing with correct color and spin class', () => {
    render(<RolloutStatusIcon status={RolloutPhase.Progressing} />);
    const icon = screen.getByTestId('rollout-progressing-icon');
    expect(icon).toBeInTheDocument();
    expect(icon).toHaveStyle('color: #0DADEA');
    expect(icon).toHaveClass(/\bicon-spin\b/);
  });
});
