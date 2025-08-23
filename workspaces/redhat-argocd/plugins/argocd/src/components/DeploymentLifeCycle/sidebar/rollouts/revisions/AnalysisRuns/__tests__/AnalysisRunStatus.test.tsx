/*
 * Copyright 2024 The Backstage Authors
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *     http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */
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
