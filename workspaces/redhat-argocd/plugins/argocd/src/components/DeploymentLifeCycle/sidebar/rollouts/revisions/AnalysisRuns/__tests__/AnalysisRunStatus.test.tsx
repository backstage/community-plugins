import React from 'react';

import { render, screen } from '@testing-library/react';

import {
  AnalysisRunPhase,
  AnalysisRunPhases,
} from '../../../../../../../types/analysisRuns';
import AnalysisRunStatus from '../AnalysisRunStatus';

describe('AnalysisRunStatus Component', () => {
  it('returns null if status is undefined', () => {
    const { container } = render(<AnalysisRunStatus status={undefined} />);
    expect(container.firstChild).toBeNull();
  });

  it('should not render any icon for Unknown status', () => {
    const { container } = render(
      <AnalysisRunStatus status={'Unknown' as AnalysisRunPhase} />,
    );
    expect(container.firstChild).toBeNull();
  });

  it('renders the correct icon for Successful status', () => {
    render(<AnalysisRunStatus status={AnalysisRunPhases.Successful} />);

    const icon = screen.getByTestId('analysisrun-successful-icon');
    expect(icon).toBeInTheDocument();
    expect(icon).toHaveStyle({ color: 'green' });
  });

  it('renders the correct icon for Running status', () => {
    render(<AnalysisRunStatus status={AnalysisRunPhases.Running} />);

    const icon = screen.getByTestId('analysisrun-running-icon');
    expect(icon).toBeInTheDocument();
    expect(icon).toHaveStyle({ color: '#0DADEA' });
  });

  it('renders the correct icon for Failed status', () => {
    render(<AnalysisRunStatus status={AnalysisRunPhases.Failed} />);

    const icon = screen.getByTestId('analysisrun-failed-icon');
    expect(icon).toBeInTheDocument();
    expect(icon).toHaveStyle({ color: '#E96D76' });
  });
});
