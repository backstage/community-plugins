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
import { FindingsList } from './FindingsList';
import { DefectDojoVulnerability } from '../../client';

// Mock the styles hook
jest.mock('../shared/styles', () => ({
  useDefectDojoStyles: () => ({
    expandableList: 'expandableList',
    findingItem: 'findingItem',
    severityBadge: 'severityBadge',
  }),
}));

// Mock the utils
jest.mock('../utils/defectDojoUtils', () => ({
  getSeverityIcon: jest.fn((severity: string) => (
    <span
      data-testid={`severity-icon-${severity?.toLowerCase() || 'unknown'}`}
    />
  )),
}));

// Mock window.open
const mockWindowOpen = jest.fn();
Object.defineProperty(window, 'open', {
  value: mockWindowOpen,
  writable: true,
});

describe('FindingsList', () => {
  const mockFindings: DefectDojoVulnerability[] = [
    {
      id: 1,
      title: 'SQL Injection Vulnerability',
      severity: 'Critical',
      description:
        'A critical SQL injection vulnerability that allows attackers to execute arbitrary SQL commands',
      cwe: 89,
      product: 'Test Product',
      engagement: 'Production',
      url: 'https://defectdojo.example.com/finding/1',
      created: '2024-01-01T00:00:00Z',
    },
    {
      id: 2,
      title: 'XSS Vulnerability',
      severity: 'High',
      description:
        'Cross-site scripting vulnerability in user input validation',
      cwe: 79,
      product: 'Test Product',
      engagement: 'Production',
      url: 'https://defectdojo.example.com/finding/2',
      created: '2024-01-02T00:00:00Z',
    },
    {
      id: 3,
      title: 'Missing CSRF Token',
      severity: 'Medium',
      description: 'CSRF protection is missing from form submissions',
      cwe: 352,
      product: 'Test Product',
      engagement: 'Production',
      url: 'https://defectdojo.example.com/finding/3',
      created: '2024-01-03T00:00:00Z',
    },
    {
      id: 4,
      title: 'Information Disclosure',
      severity: 'Low',
      description: 'Minor information disclosure in error messages',
      cwe: 0, // Test case with CWE 0
      product: 'Test Product',
      engagement: 'Production',
      url: 'https://defectdojo.example.com/finding/4',
      created: '2024-01-04T00:00:00Z',
    },
  ];

  const mockOnToggleExpanded = jest.fn();

  const defaultProps = {
    findings: mockFindings,
    expanded: false,
    onToggleExpanded: mockOnToggleExpanded,
  };

  beforeEach(() => {
    mockOnToggleExpanded.mockClear();
    mockWindowOpen.mockClear();
  });

  it('renders null when no findings are provided', () => {
    const { container } = render(
      <FindingsList {...defaultProps} findings={[]} />,
    );

    expect(container.firstChild).toBeNull();
  });

  it('renders findings list header correctly', () => {
    render(<FindingsList {...defaultProps} />);

    expect(screen.getByText('Findings List (4)')).toBeInTheDocument();
  });

  it('calls onToggleExpanded when accordion is clicked', () => {
    render(<FindingsList {...defaultProps} />);

    const accordionSummary = screen.getByRole('button');
    fireEvent.click(accordionSummary);

    expect(mockOnToggleExpanded).toHaveBeenCalledTimes(1);
  });

  describe('when expanded', () => {
    beforeEach(() => {
      render(<FindingsList {...defaultProps} expanded />);
    });

    it('displays all findings', () => {
      expect(
        screen.getByText('SQL Injection Vulnerability'),
      ).toBeInTheDocument();
      expect(screen.getByText('XSS Vulnerability')).toBeInTheDocument();
      expect(screen.getByText('Missing CSRF Token')).toBeInTheDocument();
      expect(screen.getByText('Information Disclosure')).toBeInTheDocument();
    });

    it('displays finding descriptions', () => {
      expect(
        screen.getByText(/A critical SQL injection vulnerability/),
      ).toBeInTheDocument();
      expect(
        screen.getByText(/Cross-site scripting vulnerability/),
      ).toBeInTheDocument();
      expect(
        screen.getByText(/CSRF protection is missing/),
      ).toBeInTheDocument();
      expect(
        screen.getByText(/Minor information disclosure/),
      ).toBeInTheDocument();
    });

    it('displays severity badges with correct styling', () => {
      const criticalBadge = screen.getByText('Critical');
      const highBadge = screen.getByText('High');
      const mediumBadge = screen.getByText('Medium');
      const lowBadge = screen.getByText('Low');

      expect(criticalBadge).toBeInTheDocument();
      expect(highBadge).toBeInTheDocument();
      expect(mediumBadge).toBeInTheDocument();
      expect(lowBadge).toBeInTheDocument();
    });

    it('displays CWE badges for non-zero CWE values', () => {
      expect(screen.getByText('CWE-89')).toBeInTheDocument();
      expect(screen.getByText('CWE-79')).toBeInTheDocument();
      expect(screen.getByText('CWE-352')).toBeInTheDocument();

      // Should not display CWE-0
      expect(screen.queryByText('CWE-0')).not.toBeInTheDocument();
    });

    it('displays severity icons for each finding', () => {
      expect(screen.getByTestId('severity-icon-critical')).toBeInTheDocument();
      expect(screen.getByTestId('severity-icon-high')).toBeInTheDocument();
      expect(screen.getByTestId('severity-icon-medium')).toBeInTheDocument();
      expect(screen.getByTestId('severity-icon-low')).toBeInTheDocument();
    });

    it('displays open in new tab buttons for each finding', () => {
      const openInNewButtons = screen.getAllByTestId('open-finding-button');
      expect(openInNewButtons).toHaveLength(4);
    });

    it('opens DefectDojo URLs when link buttons are clicked', () => {
      const openInNewButtons = screen.getAllByTestId('open-finding-button');

      fireEvent.click(openInNewButtons[0]);

      expect(mockWindowOpen).toHaveBeenCalledWith(
        'https://defectdojo.example.com/finding/1',
        '_blank',
      );
    });
  });

  describe('when collapsed', () => {
    it('renders collapsed accordion state', () => {
      render(<FindingsList {...defaultProps} expanded={false} />);

      // Check that the accordion is collapsed by checking if the details content is not visible
      const accordion = document.querySelector('.MuiAccordion-root');
      expect(accordion).toBeInTheDocument();

      // The accordion should not have the expanded class when collapsed
      expect(accordion).not.toHaveClass('Mui-expanded');
    });
  });

  describe('severity badge styling', () => {
    beforeEach(() => {
      render(<FindingsList {...defaultProps} expanded />);
    });

    it('displays severity badges with correct text and styling', () => {
      const criticalBadge = screen.getByText('Critical');
      const highBadge = screen.getByText('High');
      const mediumBadge = screen.getByText('Medium');
      const lowBadge = screen.getByText('Low');

      // Check that badges exist and have the correct class
      expect(criticalBadge).toBeInTheDocument();
      expect(highBadge).toBeInTheDocument();
      expect(mediumBadge).toBeInTheDocument();
      expect(lowBadge).toBeInTheDocument();

      // Check that badges have the severity badge class
      expect(criticalBadge.closest('.severityBadge')).toBeInTheDocument();
      expect(highBadge.closest('.severityBadge')).toBeInTheDocument();
      expect(mediumBadge.closest('.severityBadge')).toBeInTheDocument();
      expect(lowBadge.closest('.severityBadge')).toBeInTheDocument();
    });
  });

  describe('edge cases', () => {
    it('handles findings with undefined severity', () => {
      const findingsWithUndefinedSeverity = [
        {
          ...mockFindings[0],
          severity: undefined as any,
        },
      ];

      render(
        <FindingsList
          {...defaultProps}
          findings={findingsWithUndefinedSeverity}
          expanded
        />,
      );

      // Should still render the finding
      expect(
        screen.getByText('SQL Injection Vulnerability'),
      ).toBeInTheDocument();
    });

    it('handles findings with negative CWE values', () => {
      const findingsWithNegativeCWE = [
        {
          ...mockFindings[0],
          cwe: -1,
        },
      ];

      render(
        <FindingsList
          {...defaultProps}
          findings={findingsWithNegativeCWE}
          expanded
        />,
      );

      // Should not display negative CWE
      expect(screen.queryByText('CWE--1')).not.toBeInTheDocument();
    });

    it('handles single finding correctly', () => {
      render(
        <FindingsList
          {...defaultProps}
          findings={[mockFindings[0]]}
          expanded
        />,
      );

      expect(screen.getByText('Findings List (1)')).toBeInTheDocument();
      expect(
        screen.getByText('SQL Injection Vulnerability'),
      ).toBeInTheDocument();
    });

    it('handles very long descriptions gracefully', () => {
      const findingWithLongDescription = {
        ...mockFindings[0],
        description: 'A'.repeat(1000), // Very long description
      };

      render(
        <FindingsList
          {...defaultProps}
          findings={[findingWithLongDescription]}
          expanded
        />,
      );

      // Should still render without crashing
      expect(
        screen.getByText('SQL Injection Vulnerability'),
      ).toBeInTheDocument();
    });
  });
});
