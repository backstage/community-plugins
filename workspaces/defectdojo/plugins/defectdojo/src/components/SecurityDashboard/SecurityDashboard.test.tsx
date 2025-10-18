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
import { render, screen, fireEvent } from '@testing-library/react';
import { SecurityDashboard } from './SecurityDashboard';
import { SeverityMetrics, FindingAnalytics } from '../utils/defectDojoUtils';

// Mock the styles hook
jest.mock('../shared/styles', () => ({
  useDefectDojoStyles: () => ({
    metricCard: 'metricCard',
    successCard: 'successCard',
    totalFindings: 'totalFindings',
    successNumber: 'successNumber',
    riskScore: 'riskScore',
    actionButton: 'actionButton',
  }),
}));

describe('SecurityDashboard', () => {
  const mockOnOpenDefectDojo = jest.fn();

  const defaultMetrics: SeverityMetrics = {
    critical: 2,
    high: 3,
    medium: 5,
    low: 1,
    total: 11,
  };

  const defaultAnalytics: FindingAnalytics = {
    topCWEs: [
      { cwe: 89, count: 3, title: 'SQL Injection' },
      { cwe: 79, count: 2, title: 'Cross-site Scripting' },
    ],
    severityDistribution: {
      critical: 2,
      high: 3,
      medium: 5,
      low: 1,
    },
    riskScore: {
      score: 75,
      level: 'High',
      color: '#ff5722',
    },
  };

  const defaultProps = {
    metrics: defaultMetrics,
    analytics: defaultAnalytics,
    loading: false,
    hasData: true,
    defectdojoBaseUrl: 'https://defectdojo.example.com',
    onOpenDefectDojo: mockOnOpenDefectDojo,
  };

  beforeEach(() => {
    mockOnOpenDefectDojo.mockClear();
  });

  it('renders without crashing', () => {
    render(<SecurityDashboard {...defaultProps} />);

    expect(screen.getByText('11')).toBeInTheDocument();
    expect(screen.getByText('Active Findings')).toBeInTheDocument();
  });

  it('displays loading state correctly', () => {
    render(<SecurityDashboard {...defaultProps} loading />);

    expect(screen.getByText('...')).toBeInTheDocument();
    expect(screen.getByText('Loading...')).toBeInTheDocument();
  });

  it('displays no vulnerabilities state when total is 0', () => {
    const noVulnMetrics = {
      ...defaultMetrics,
      critical: 0,
      high: 0,
      medium: 0,
      low: 0,
      total: 0,
    };

    render(
      <SecurityDashboard
        {...defaultProps}
        metrics={noVulnMetrics}
        loading={false}
        hasData
      />,
    );

    expect(screen.getByText('0')).toBeInTheDocument();
    expect(screen.getByText('No Vulnerabilities')).toBeInTheDocument();
  });

  it('shows success icon when no vulnerabilities found', () => {
    const noVulnMetrics = {
      ...defaultMetrics,
      critical: 0,
      high: 0,
      medium: 0,
      low: 0,
      total: 0,
    };

    const { container } = render(
      <SecurityDashboard
        {...defaultProps}
        metrics={noVulnMetrics}
        loading={false}
        hasData
      />,
    );

    // Check for success styling classes
    expect(container.querySelector('.successCard')).toBeInTheDocument();
    expect(container.querySelector('.successNumber')).toBeInTheDocument();
  });

  it('shows security icon when vulnerabilities are found', () => {
    render(<SecurityDashboard {...defaultProps} />);

    // Should not have success styling when vulnerabilities exist
    const { container } = render(<SecurityDashboard {...defaultProps} />);
    expect(container.querySelector('.successCard')).not.toBeInTheDocument();
  });

  describe('risk score display', () => {
    it('shows risk score when vulnerabilities exist', () => {
      render(<SecurityDashboard {...defaultProps} />);

      expect(screen.getByText('Risk Level')).toBeInTheDocument();
      expect(screen.getByText('High (75%)')).toBeInTheDocument();
    });

    it('does not show risk score when no vulnerabilities', () => {
      const noVulnMetrics = {
        ...defaultMetrics,
        total: 0,
      };

      render(<SecurityDashboard {...defaultProps} metrics={noVulnMetrics} />);

      expect(screen.queryByText('Risk Level')).not.toBeInTheDocument();
    });

    it('does not show risk score when loading', () => {
      render(<SecurityDashboard {...defaultProps} loading />);

      expect(screen.queryByText('Risk Level')).not.toBeInTheDocument();
    });

    it('applies correct risk score styling', () => {
      const { container } = render(<SecurityDashboard {...defaultProps} />);

      const riskScoreElement = container.querySelector('.riskScore');
      expect(riskScoreElement).toBeInTheDocument();
      expect(riskScoreElement).toHaveStyle('background-color: #ff5722');
    });
  });

  describe('DefectDojo button', () => {
    it('renders enabled button when URL is provided', () => {
      render(<SecurityDashboard {...defaultProps} />);

      const button = screen.getByRole('button', {
        name: /view in defectdojo/i,
      });
      expect(button).toBeInTheDocument();
      expect(button).toBeEnabled();
    });

    it('renders disabled button when URL is not provided', () => {
      render(
        <SecurityDashboard {...defaultProps} defectdojoBaseUrl={undefined} />,
      );

      const button = screen.getByRole('button', {
        name: /defectdojo not configured/i,
      });
      expect(button).toBeInTheDocument();
      expect(button).toBeDisabled();
    });

    it('calls onOpenDefectDojo when button is clicked', () => {
      render(<SecurityDashboard {...defaultProps} />);

      const button = screen.getByRole('button', {
        name: /view in defectdojo/i,
      });
      fireEvent.click(button);

      expect(mockOnOpenDefectDojo).toHaveBeenCalledTimes(1);
    });

    it('does not call onOpenDefectDojo when button is disabled', () => {
      render(
        <SecurityDashboard {...defaultProps} defectdojoBaseUrl={undefined} />,
      );

      const button = screen.getByRole('button', {
        name: /defectdojo not configured/i,
      });
      fireEvent.click(button);

      expect(mockOnOpenDefectDojo).not.toHaveBeenCalled();
    });
  });

  describe('edge cases', () => {
    it('handles missing analytics data gracefully', () => {
      const incompleteAnalytics = {
        ...defaultAnalytics,
        riskScore: {
          score: 0,
          level: 'Minimal',
          color: '#4caf50',
        },
      };

      render(
        <SecurityDashboard {...defaultProps} analytics={incompleteAnalytics} />,
      );

      expect(screen.getByText('Minimal (0%)')).toBeInTheDocument();
    });

    it('handles different risk levels correctly', () => {
      const criticalAnalytics = {
        ...defaultAnalytics,
        riskScore: {
          score: 95,
          level: 'Critical',
          color: '#f44336',
        },
      };

      render(
        <SecurityDashboard {...defaultProps} analytics={criticalAnalytics} />,
      );

      expect(screen.getByText('Critical (95%)')).toBeInTheDocument();
    });

    it('handles hasData false correctly', () => {
      render(
        <SecurityDashboard {...defaultProps} hasData={false} loading={false} />,
      );

      // Should show the total but not in success state
      expect(screen.getByText('11')).toBeInTheDocument();
      expect(screen.getByText('Active Findings')).toBeInTheDocument();
    });
  });
});
