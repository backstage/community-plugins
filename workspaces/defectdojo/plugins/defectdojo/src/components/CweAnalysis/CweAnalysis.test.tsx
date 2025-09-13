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
import { CweAnalysis } from './CweAnalysis';
import { FindingAnalytics } from '../utils/defectDojoUtils';

// Mock the styles hook
jest.mock('../shared/styles', () => ({
  useDefectDojoStyles: () => ({
    metricCard: 'metricCard',
    cweChip: 'cweChip',
  }),
}));

describe('CweAnalysis', () => {
  const mockAnalytics: FindingAnalytics = {
    topCWEs: [
      { cwe: 89, count: 5, title: 'SQL Injection Vulnerability' },
      { cwe: 79, count: 3, title: 'Cross-site Scripting (XSS)' },
      { cwe: 352, count: 2, title: 'Cross-Site Request Forgery' },
      { cwe: 22, count: 1, title: 'Path Traversal' },
    ],
    severityDistribution: {
      critical: 2,
      high: 4,
      medium: 3,
      low: 2,
    },
    riskScore: {
      score: 75,
      level: 'High',
      color: '#ff5722',
    },
  };

  it('renders without crashing', () => {
    render(<CweAnalysis analytics={mockAnalytics} />);

    expect(
      screen.getByText('Top CWE (Common Weakness Enumeration)'),
    ).toBeInTheDocument();
  });

  it('displays all top CWEs', () => {
    render(<CweAnalysis analytics={mockAnalytics} />);

    expect(screen.getByText('CWE-89')).toBeInTheDocument();
    expect(screen.getByText('CWE-79')).toBeInTheDocument();
    expect(screen.getByText('CWE-352')).toBeInTheDocument();
    expect(screen.getByText('CWE-22')).toBeInTheDocument();
  });

  it('displays CWE titles', () => {
    render(<CweAnalysis analytics={mockAnalytics} />);

    expect(screen.getByText('SQL Injection Vulnerability')).toBeInTheDocument();
    expect(screen.getByText('Cross-site Scripting (XSS)')).toBeInTheDocument();
    expect(screen.getByText('Cross-Site Request Forgery')).toBeInTheDocument();
    expect(screen.getByText('Path Traversal')).toBeInTheDocument();
  });

  it('displays count badges for each CWE', () => {
    render(<CweAnalysis analytics={mockAnalytics} />);

    // Check for badge elements containing the counts
    expect(screen.getByText('5')).toBeInTheDocument();
    expect(screen.getByText('3')).toBeInTheDocument();
    expect(screen.getByText('2')).toBeInTheDocument();
    expect(screen.getByText('1')).toBeInTheDocument();
  });

  it('displays CWE chips with correct styling', () => {
    const { container } = render(<CweAnalysis analytics={mockAnalytics} />);

    const cweChips = container.querySelectorAll('.cweChip');
    expect(cweChips).toHaveLength(4);
  });

  it('handles empty CWE list gracefully', () => {
    const emptyAnalytics: FindingAnalytics = {
      ...mockAnalytics,
      topCWEs: [],
    };

    render(<CweAnalysis analytics={emptyAnalytics} />);

    expect(
      screen.getByText('Top CWE (Common Weakness Enumeration)'),
    ).toBeInTheDocument();
    // Should not crash and should still show the header
  });

  it('handles single CWE correctly', () => {
    const singleCweAnalytics: FindingAnalytics = {
      ...mockAnalytics,
      topCWEs: [{ cwe: 89, count: 10, title: 'SQL Injection Only' }],
    };

    render(<CweAnalysis analytics={singleCweAnalytics} />);

    expect(screen.getByText('CWE-89')).toBeInTheDocument();
    expect(screen.getByText('SQL Injection Only')).toBeInTheDocument();
    expect(screen.getByText('10')).toBeInTheDocument();
  });

  it('maintains proper layout structure', () => {
    const { container } = render(<CweAnalysis analytics={mockAnalytics} />);

    // Check for Grid container
    const gridContainer = container.querySelector('.MuiGrid-container');
    expect(gridContainer).toBeInTheDocument();

    // Check for Card component
    const card = container.querySelector('.MuiCard-root');
    expect(card).toBeInTheDocument();

    // Check for CardContent
    const cardContent = container.querySelector('.MuiCardContent-root');
    expect(cardContent).toBeInTheDocument();
  });

  it('displays Code icon in header', () => {
    const { container } = render(<CweAnalysis analytics={mockAnalytics} />);

    // Check for Code icon (material-ui icon) - look for the SVG with the specific path
    const codeIcon = container.querySelector(
      'svg path[d*="9.4 16.6L4.8 12l4.6-4.6L8 6l-6 6 6 6 1.4-1.4zm5.2 0l4.6-4.6-4.6-4.6L16 6l6 6-6 6-1.4-1.4z"]',
    );
    expect(codeIcon).toBeInTheDocument();
  });

  describe('CWE ordering and display', () => {
    it('displays CWEs in the order provided by analytics', () => {
      render(<CweAnalysis analytics={mockAnalytics} />);

      const cweElements = screen.getAllByText(/CWE-\d+/);
      expect(cweElements[0]).toHaveTextContent('CWE-89');
      expect(cweElements[1]).toHaveTextContent('CWE-79');
      expect(cweElements[2]).toHaveTextContent('CWE-352');
      expect(cweElements[3]).toHaveTextContent('CWE-22');
    });

    it('handles large count numbers correctly', () => {
      const largeCountAnalytics: FindingAnalytics = {
        ...mockAnalytics,
        topCWEs: [
          { cwe: 89, count: 1000, title: 'High Volume SQL Injection' },
          { cwe: 79, count: 500, title: 'High Volume XSS' },
        ],
      };

      render(<CweAnalysis analytics={largeCountAnalytics} />);

      // Material-UI Badge shows "99+" for numbers greater than 99
      expect(screen.getAllByText('99+')).toHaveLength(2);
    });

    it('handles zero count gracefully', () => {
      const zeroCountAnalytics: FindingAnalytics = {
        ...mockAnalytics,
        topCWEs: [{ cwe: 89, count: 0, title: 'Zero Count CWE' }],
      };

      render(<CweAnalysis analytics={zeroCountAnalytics} />);

      expect(screen.getByText('CWE-89')).toBeInTheDocument();
      expect(screen.getByText('Zero Count CWE')).toBeInTheDocument();
      expect(screen.getByText('0')).toBeInTheDocument();
    });
  });

  describe('responsive layout', () => {
    it('applies correct grid sizing for different screen sizes', () => {
      const { container } = render(<CweAnalysis analytics={mockAnalytics} />);

      // Check for responsive grid item classes
      const gridItem = container.querySelector('.MuiGrid-item');
      expect(gridItem).toBeInTheDocument();

      // Should have md=12 class for responsive behavior
      expect(gridItem).toHaveClass('MuiGrid-grid-md-12');
    });
  });

  describe('edge cases', () => {
    it('handles very long CWE titles', () => {
      const longTitleAnalytics: FindingAnalytics = {
        ...mockAnalytics,
        topCWEs: [
          {
            cwe: 89,
            count: 1,
            title:
              'This is a very long CWE title that should be handled gracefully without breaking the layout or causing overflow issues in the user interface',
          },
        ],
      };

      render(<CweAnalysis analytics={longTitleAnalytics} />);

      expect(
        screen.getByText(/This is a very long CWE title/),
      ).toBeInTheDocument();
    });

    it('handles missing or undefined analytics properties gracefully', () => {
      const incompleteAnalytics = {
        topCWEs: mockAnalytics.topCWEs,
        severityDistribution: {},
        riskScore: mockAnalytics.riskScore,
      } as FindingAnalytics;

      render(<CweAnalysis analytics={incompleteAnalytics} />);

      // Should still render the CWE section
      expect(
        screen.getByText('Top CWE (Common Weakness Enumeration)'),
      ).toBeInTheDocument();
    });

    it('handles CWE numbers with special formatting', () => {
      const specialCweAnalytics: FindingAnalytics = {
        ...mockAnalytics,
        topCWEs: [
          { cwe: 1234567, count: 1, title: 'Large CWE Number' },
          { cwe: 0, count: 1, title: 'Zero CWE' },
        ],
      };

      render(<CweAnalysis analytics={specialCweAnalytics} />);

      expect(screen.getByText('CWE-1234567')).toBeInTheDocument();
      expect(screen.getByText('CWE-0')).toBeInTheDocument();
    });
  });
});
