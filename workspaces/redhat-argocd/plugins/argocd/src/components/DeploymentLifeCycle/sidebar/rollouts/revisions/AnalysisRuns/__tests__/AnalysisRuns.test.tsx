import React from 'react';

import { render, screen } from '@testing-library/react';

import { mockArgoResources } from '../../../../../../../../dev/__data__/argoRolloutsObjects';
import { AnalysisRun } from '../../../../../../../types/analysisRuns';
import AnalysisRuns from '../AnalysisRuns';

describe('AnalysisRuns Component', () => {
  const mockAnalysisRuns = [
    mockArgoResources.analysisruns[0],
    mockArgoResources.analysisruns[2],
  ];

  test('renders null when analysisruns is not provided or is an empty array', () => {
    const { container } = render(
      <AnalysisRuns analysisruns={null as unknown as AnalysisRun[]} />,
    );
    expect(container.firstChild).toBeNull();

    const { container: emptyContainer } = render(
      <AnalysisRuns analysisruns={[]} />,
    );
    expect(emptyContainer.firstChild).toBeNull();
  });

  test('renders the Analysis Runs title and a list of analysis runs', () => {
    render(<AnalysisRuns analysisruns={mockAnalysisRuns} />);

    expect(screen.getByText('Analysis Runs')).toBeInTheDocument();
    mockAnalysisRuns.forEach(ar => {
      const label = `Analysis ${ar?.metadata?.name
        ?.split('-')
        .slice(-2)
        .join('-')}`;
      expect(screen.getByText(label)).toBeInTheDocument();
    });
  });

  test('renders the correct icon and label for each analysis run', () => {
    render(<AnalysisRuns analysisruns={mockAnalysisRuns} />);

    mockAnalysisRuns.forEach(ar => {
      const analysisRunStatus = ar?.status?.phase;
      const label = `Analysis ${ar?.metadata?.name
        ?.split('-')
        .slice(-2)
        .join('-')}`;

      const chipElement = screen.getByText(label);
      expect(chipElement).toBeInTheDocument();

      const iconElement = screen.getByTestId(
        `analysisrun-${analysisRunStatus?.toLowerCase()}-icon`,
      );
      expect(iconElement).toBeInTheDocument();
    });
  });
});
