/*
 * Copyright 2025 The Backstage Authors
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
import { MetricCard } from './MetricCard';

// Mock the styles hook
jest.mock('../shared/styles', () => ({
  useDefectDojoStyles: () => ({
    metricCard: 'metricCard',
    criticalCard: 'criticalCard',
    criticalCardWithTrend: 'criticalCardWithTrend',
    highCard: 'highCard',
    highCardWithTrend: 'highCardWithTrend',
    mediumCard: 'mediumCard',
    lowCard: 'lowCard',
    metricNumber: 'metricNumber',
    criticalNumber: 'criticalNumber',
    highNumber: 'highNumber',
    mediumNumber: 'mediumNumber',
    lowNumber: 'lowNumber',
    progressBar: 'progressBar',
  }),
}));

// Mock the utils
jest.mock('../utils/defectDojoUtils', () => ({
  getSeverityIcon: jest.fn(() => <span data-testid="severity-icon" />),
}));

describe('MetricCard', () => {
  const defaultProps = {
    title: 'Critical',
    count: 5,
    total: 20,
    severity: 'critical',
  };

  it('renders without crashing', () => {
    render(<MetricCard {...defaultProps} />);

    expect(screen.getByText('Critical')).toBeInTheDocument();
    expect(screen.getByText('5')).toBeInTheDocument();
    expect(screen.getByText('25.0% of total')).toBeInTheDocument();
  });

  it('calculates percentage correctly', () => {
    render(<MetricCard {...defaultProps} count={10} total={50} />);

    expect(screen.getByText('20.0% of total')).toBeInTheDocument();
  });

  it('handles zero total correctly', () => {
    render(<MetricCard {...defaultProps} count={0} total={0} />);

    expect(screen.getByText('0.0% of total')).toBeInTheDocument();
  });

  it('displays severity icon', () => {
    render(<MetricCard {...defaultProps} />);

    expect(screen.getByTestId('severity-icon')).toBeInTheDocument();
  });

  describe('trend display', () => {
    it('shows positive trend with correct styling', () => {
      render(<MetricCard {...defaultProps} trend={15} />);

      expect(screen.getByText('+15%')).toBeInTheDocument();
    });

    it('shows negative trend with correct styling', () => {
      render(<MetricCard {...defaultProps} trend={-10} />);

      expect(screen.getByText('-10%')).toBeInTheDocument();
    });

    it('does not show trend when trend is 0', () => {
      render(<MetricCard {...defaultProps} trend={0} />);

      // Should not show trend indicators (+ or - prefix)
      expect(screen.queryByText(/[+-]\d+%/)).not.toBeInTheDocument();
    });

    it('does not show trend when trend is undefined', () => {
      render(<MetricCard {...defaultProps} trend={undefined} />);

      // Should not show trend indicators (+ or - prefix)
      expect(screen.queryByText(/[+-]\d+%/)).not.toBeInTheDocument();
    });
  });

  describe('severity styling', () => {
    it('applies critical styling', () => {
      const { container } = render(
        <MetricCard {...defaultProps} severity="critical" />,
      );

      expect(container.querySelector('.criticalCard')).toBeInTheDocument();
      expect(
        container.querySelector('.criticalCardWithTrend'),
      ).not.toBeInTheDocument();
    });

    it('applies critical styling with trend when trend is provided', () => {
      const { container } = render(
        <MetricCard {...defaultProps} severity="critical" trend={5} />,
      );

      expect(
        container.querySelector('.criticalCardWithTrend'),
      ).toBeInTheDocument();
      expect(container.querySelector('.criticalCard')).not.toBeInTheDocument();
    });

    it('applies high styling', () => {
      const { container } = render(
        <MetricCard {...defaultProps} severity="high" />,
      );

      expect(container.querySelector('.highCard')).toBeInTheDocument();
      expect(
        container.querySelector('.highCardWithTrend'),
      ).not.toBeInTheDocument();
    });

    it('applies high styling with trend when trend is provided', () => {
      const { container } = render(
        <MetricCard {...defaultProps} severity="high" trend={-3} />,
      );

      expect(container.querySelector('.highCardWithTrend')).toBeInTheDocument();
      expect(container.querySelector('.highCard')).not.toBeInTheDocument();
    });

    it('applies medium styling (no trend variant)', () => {
      const { container } = render(
        <MetricCard {...defaultProps} severity="medium" trend={10} />,
      );

      expect(container.querySelector('.mediumCard')).toBeInTheDocument();
    });

    it('applies low styling (no trend variant)', () => {
      const { container } = render(
        <MetricCard {...defaultProps} severity="low" trend={10} />,
      );

      expect(container.querySelector('.lowCard')).toBeInTheDocument();
    });

    it('handles unknown severity', () => {
      const { container } = render(
        <MetricCard {...defaultProps} severity="unknown" />,
      );

      expect(container.querySelector('.metricCard')).toBeInTheDocument();
    });
  });

  describe('number styling', () => {
    it('applies critical number styling', () => {
      const { container } = render(
        <MetricCard {...defaultProps} severity="critical" />,
      );

      expect(container.querySelector('.criticalNumber')).toBeInTheDocument();
    });

    it('applies high number styling', () => {
      const { container } = render(
        <MetricCard {...defaultProps} severity="high" />,
      );

      expect(container.querySelector('.highNumber')).toBeInTheDocument();
    });

    it('applies medium number styling', () => {
      const { container } = render(
        <MetricCard {...defaultProps} severity="medium" />,
      );

      expect(container.querySelector('.mediumNumber')).toBeInTheDocument();
    });

    it('applies low number styling', () => {
      const { container } = render(
        <MetricCard {...defaultProps} severity="low" />,
      );

      expect(container.querySelector('.lowNumber')).toBeInTheDocument();
    });
  });

  describe('progress bar', () => {
    it('shows progress bar with correct value', () => {
      const { container } = render(
        <MetricCard {...defaultProps} count={25} total={100} />,
      );

      const progressBar = container.querySelector('[role="progressbar"]');
      expect(progressBar).toBeInTheDocument();
      expect(progressBar).toHaveAttribute('aria-valuenow', '25');
    });

    it('uses secondary color for critical severity', () => {
      const { container } = render(
        <MetricCard {...defaultProps} severity="critical" />,
      );

      const progressBar = container.querySelector(
        '.MuiLinearProgress-colorSecondary',
      );
      expect(progressBar).toBeInTheDocument();
    });

    it('uses secondary color for high severity', () => {
      const { container } = render(
        <MetricCard {...defaultProps} severity="high" />,
      );

      const progressBar = container.querySelector(
        '.MuiLinearProgress-colorSecondary',
      );
      expect(progressBar).toBeInTheDocument();
    });

    it('uses primary color for medium severity', () => {
      const { container } = render(
        <MetricCard {...defaultProps} severity="medium" />,
      );

      const progressBar = container.querySelector(
        '.MuiLinearProgress-colorPrimary',
      );
      expect(progressBar).toBeInTheDocument();
    });

    it('uses primary color for low severity', () => {
      const { container } = render(
        <MetricCard {...defaultProps} severity="low" />,
      );

      const progressBar = container.querySelector(
        '.MuiLinearProgress-colorPrimary',
      );
      expect(progressBar).toBeInTheDocument();
    });
  });
});
