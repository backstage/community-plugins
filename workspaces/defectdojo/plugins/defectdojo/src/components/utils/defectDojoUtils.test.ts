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
import {
  calculateAdvancedMetrics,
  calculateSeverityMetrics,
  calculateTrends,
  getSeverityIcon,
} from './defectDojoUtils';
import { DefectDojoVulnerability } from '../../client';

describe('defectDojoUtils', () => {
  const mockVulnerabilities: DefectDojoVulnerability[] = [
    {
      id: 1,
      title: 'SQL Injection in login form',
      severity: 'Critical',
      description: 'Critical SQL injection vulnerability',
      cwe: 89,
      product: 'Test Product',
      engagement: 'Production',
      url: 'https://defectdojo.example.com/finding/1',
      created: new Date(Date.now() - 3 * 24 * 60 * 60 * 1000).toISOString(), // 3 days ago
    },
    {
      id: 2,
      title: 'XSS in user input',
      severity: 'High',
      description: 'Cross-site scripting vulnerability',
      cwe: 79,
      product: 'Test Product',
      engagement: 'Production',
      url: 'https://defectdojo.example.com/finding/2',
      created: new Date(Date.now() - 5 * 24 * 60 * 60 * 1000).toISOString(), // 5 days ago
    },
    {
      id: 3,
      title: 'Another SQL Injection',
      severity: 'Critical',
      description: 'Another critical SQL injection',
      cwe: 89,
      product: 'Test Product',
      engagement: 'Production',
      url: 'https://defectdojo.example.com/finding/3',
      created: new Date(Date.now() - 10 * 24 * 60 * 60 * 1000).toISOString(), // 10 days ago
    },
    {
      id: 4,
      title: 'CSRF vulnerability',
      severity: 'Medium',
      description: 'Missing CSRF protection',
      cwe: 352,
      product: 'Test Product',
      engagement: 'Production',
      url: 'https://defectdojo.example.com/finding/4',
      created: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000).toISOString(), // 2 days ago
    },
    {
      id: 5,
      title: 'Information disclosure',
      severity: 'Low',
      description: 'Minor information disclosure',
      cwe: 200,
      product: 'Test Product',
      engagement: 'Production',
      url: 'https://defectdojo.example.com/finding/5',
      created: new Date(Date.now() - 15 * 24 * 60 * 60 * 1000).toISOString(), // 15 days ago
    },
  ];

  describe('calculateSeverityMetrics', () => {
    it('calculates severity metrics correctly', () => {
      const metrics = calculateSeverityMetrics(mockVulnerabilities);

      expect(metrics).toEqual({
        critical: 2,
        high: 1,
        medium: 1,
        low: 1,
        total: 5,
      });
    });

    it('handles empty vulnerability list', () => {
      const metrics = calculateSeverityMetrics([]);

      expect(metrics).toEqual({
        critical: 0,
        high: 0,
        medium: 0,
        low: 0,
        total: 0,
      });
    });

    it('handles vulnerabilities with undefined severity', () => {
      const vulnsWithUndefinedSeverity = [
        {
          ...mockVulnerabilities[0],
          severity: undefined as any,
        },
      ];

      const metrics = calculateSeverityMetrics(vulnsWithUndefinedSeverity);

      expect(metrics).toEqual({
        critical: 0,
        high: 0,
        medium: 0,
        low: 0,
        total: 1, // Still counts towards total
      });
    });

    it('handles case-insensitive severity levels', () => {
      const mixedCaseVulns = [
        { ...mockVulnerabilities[0], severity: 'CRITICAL' },
        { ...mockVulnerabilities[1], severity: 'high' },
        { ...mockVulnerabilities[2], severity: 'Medium' },
        { ...mockVulnerabilities[3], severity: 'LOW' },
      ];

      const metrics = calculateSeverityMetrics(mixedCaseVulns);

      expect(metrics).toEqual({
        critical: 1,
        high: 1,
        medium: 1,
        low: 1,
        total: 4,
      });
    });

    it('handles unknown severity levels', () => {
      const unknownSeverityVulns = [
        { ...mockVulnerabilities[0], severity: 'Unknown' },
        { ...mockVulnerabilities[1], severity: 'Invalid' },
      ];

      const metrics = calculateSeverityMetrics(unknownSeverityVulns);

      expect(metrics).toEqual({
        critical: 0,
        high: 0,
        medium: 0,
        low: 0,
        total: 2,
      });
    });
  });

  describe('calculateAdvancedMetrics', () => {
    it('calculates advanced metrics correctly', () => {
      const analytics = calculateAdvancedMetrics(mockVulnerabilities);

      expect(analytics.topCWEs).toHaveLength(4);
      expect(analytics.topCWEs[0]).toEqual({
        cwe: 89,
        count: 2,
        title: 'SQL Injection in login form...',
      });
      expect(analytics.topCWEs[1]).toEqual({
        cwe: 79,
        count: 1,
        title: 'XSS in user input...',
      });

      expect(analytics.severityDistribution).toEqual({
        critical: 2,
        high: 1,
        medium: 1,
        low: 1,
      });

      expect(analytics.riskScore.score).toBeGreaterThan(0);
      expect(analytics.riskScore.level).toBeDefined();
      expect(analytics.riskScore.color).toBeDefined();
    });

    it('handles vulnerabilities with zero or negative CWE', () => {
      const vulnsWithZeroCWE = [
        { ...mockVulnerabilities[0], cwe: 0 },
        { ...mockVulnerabilities[1], cwe: -1 },
      ];

      const analytics = calculateAdvancedMetrics(vulnsWithZeroCWE);

      expect(analytics.topCWEs).toHaveLength(0);
    });

    it('sorts CWEs by count in descending order', () => {
      const analytics = calculateAdvancedMetrics(mockVulnerabilities);

      for (let i = 0; i < analytics.topCWEs.length - 1; i++) {
        expect(analytics.topCWEs[i].count).toBeGreaterThanOrEqual(
          analytics.topCWEs[i + 1].count,
        );
      }
    });

    it('limits top CWEs to 5', () => {
      const manyVulns = Array.from({ length: 10 }, (_, i) => ({
        ...mockVulnerabilities[0],
        id: i + 1,
        cwe: i + 1,
        title: `Vulnerability ${i + 1}`,
      }));

      const analytics = calculateAdvancedMetrics(manyVulns);

      expect(analytics.topCWEs).toHaveLength(5);
    });

    it('truncates long CWE titles', () => {
      const longTitleVuln = {
        ...mockVulnerabilities[0],
        title: 'A'.repeat(80), // More than 70 characters
      };

      const analytics = calculateAdvancedMetrics([longTitleVuln]);

      expect(analytics.topCWEs[0].title).toHaveLength(73); // 70 characters + "..."
      expect(analytics.topCWEs[0].title.endsWith('...')).toBe(true);
    });

    describe('risk score calculation', () => {
      it('calculates minimal risk score correctly', () => {
        const lowRiskVulns = [{ ...mockVulnerabilities[0], severity: 'Low' }];

        const analytics = calculateAdvancedMetrics(lowRiskVulns);

        expect(analytics.riskScore.score).toBe(10); // 1 * 1 / 1 * 10 * 100 = 10%
        expect(analytics.riskScore.level).toBe('Minimal');
        expect(analytics.riskScore.color).toBe('#4caf50');
      });

      it('calculates low risk score correctly', () => {
        const lowRiskVulns = [
          { ...mockVulnerabilities[0], severity: 'Low' },
          { ...mockVulnerabilities[1], severity: 'Low' },
          { ...mockVulnerabilities[2], severity: 'Medium' },
        ];

        const analytics = calculateAdvancedMetrics(lowRiskVulns);

        expect(analytics.riskScore.score).toBe(20); // (2*1 + 1*4) / (3*10) * 100 = 20%
        expect(analytics.riskScore.level).toBe('Low');
        expect(analytics.riskScore.color).toBe('#2196f3');
      });

      it('calculates medium risk score correctly', () => {
        const mediumRiskVulns = [
          { ...mockVulnerabilities[0], severity: 'Medium' },
          { ...mockVulnerabilities[1], severity: 'Medium' },
          { ...mockVulnerabilities[2], severity: 'High' },
        ];

        const analytics = calculateAdvancedMetrics(mediumRiskVulns);

        expect(analytics.riskScore.score).toBe(50); // (2*4 + 1*7) / (3*10) * 100 = 50%
        expect(analytics.riskScore.level).toBe('Medium');
        expect(analytics.riskScore.color).toBe('#ff9800');
      });

      it('calculates high risk score correctly', () => {
        const highRiskVulns = [
          { ...mockVulnerabilities[0], severity: 'High' },
          { ...mockVulnerabilities[1], severity: 'High' },
          { ...mockVulnerabilities[2], severity: 'Critical' },
        ];

        const analytics = calculateAdvancedMetrics(highRiskVulns);

        expect(analytics.riskScore.score).toBe(80); // (2*7 + 1*10) / (3*10) * 100 = 80%
        expect(analytics.riskScore.level).toBe('Critical');
        expect(analytics.riskScore.color).toBe('#f44336');
      });

      it('calculates critical risk score correctly', () => {
        const criticalRiskVulns = [
          { ...mockVulnerabilities[0], severity: 'Critical' },
          { ...mockVulnerabilities[1], severity: 'Critical' },
          { ...mockVulnerabilities[2], severity: 'Critical' },
        ];

        const analytics = calculateAdvancedMetrics(criticalRiskVulns);

        expect(analytics.riskScore.score).toBe(100); // (3*10) / (3*10) * 100 = 100%
        expect(analytics.riskScore.level).toBe('Critical');
        expect(analytics.riskScore.color).toBe('#f44336');
      });

      it('handles empty vulnerability list', () => {
        const analytics = calculateAdvancedMetrics([]);

        expect(analytics.riskScore.score).toBe(0);
        expect(analytics.riskScore.level).toBe('Minimal');
        expect(analytics.riskScore.color).toBe('#4caf50');
      });
    });
  });

  describe('calculateTrends', () => {
    it('returns zero trends when showTrends is false', () => {
      const trends = calculateTrends(mockVulnerabilities, false);

      expect(trends).toEqual({
        critical: 0,
        high: 0,
        medium: 0,
        low: 0,
      });
    });

    it('calculates trends correctly when showTrends is true', () => {
      const trends = calculateTrends(mockVulnerabilities, true);

      // Recent (last 7 days): 1 critical (3 days), 1 high (5 days), 1 medium (2 days), 0 low
      // Previous (7-14 days ago): 1 critical (10 days), 0 high, 0 medium, 0 low
      // Older (>14 days): 0 critical, 0 high, 0 medium, 1 low (15 days)
      expect(trends.critical).toBe(0); // 1 vs 1 = 0%
      expect(trends.high).toBe(100); // 1 vs 0 = +100%
      expect(trends.medium).toBe(100); // 1 vs 0 = +100%
      expect(trends.low).toBe(0); // 0 vs 0 = 0%
    });

    it('handles vulnerabilities without created dates', () => {
      const vulnsWithoutDates = mockVulnerabilities.map(v => ({
        ...v,
        created: undefined as any,
      }));

      const trends = calculateTrends(vulnsWithoutDates, true);

      expect(trends).toEqual({
        critical: 0,
        high: 0,
        medium: 0,
        low: 0,
      });
    });

    it('handles invalid date formats gracefully', () => {
      const vulnsWithInvalidDates = mockVulnerabilities.map(v => ({
        ...v,
        created: 'invalid-date',
      }));

      const trends = calculateTrends(vulnsWithInvalidDates, true);

      expect(trends).toEqual({
        critical: 0,
        high: 0,
        medium: 0,
        low: 0,
      });
    });

    it('calculates 100% increase when previous count is zero', () => {
      const recentVulns = [
        {
          ...mockVulnerabilities[0],
          created: new Date(Date.now() - 3 * 24 * 60 * 60 * 1000).toISOString(),
        },
      ];

      const trends = calculateTrends(recentVulns, true);

      expect(trends.critical).toBe(100); // 1 vs 0 = +100%
    });
  });

  describe('getSeverityIcon', () => {
    it('returns warning icon for critical severity', () => {
      const icon = getSeverityIcon('critical');
      expect(icon.type).toBeDefined();
      expect(icon.props.fontSize).toBe('medium');
    });

    it('returns warning icon for high severity', () => {
      const icon = getSeverityIcon('high');
      expect(icon.type).toBeDefined();
      expect(icon.props.fontSize).toBe('medium');
    });

    it('returns security icon for medium severity', () => {
      const icon = getSeverityIcon('medium');
      expect(icon.type).toBeDefined();
      expect(icon.props.fontSize).toBe('medium');
    });

    it('returns bug report icon for low severity', () => {
      const icon = getSeverityIcon('low');
      expect(icon.type).toBeDefined();
      expect(icon.props.fontSize).toBe('medium');
    });

    it('returns security icon for unknown severity', () => {
      const icon = getSeverityIcon('unknown');
      expect(icon.type).toBeDefined();
      expect(icon.props.fontSize).toBe('medium');
    });

    it('handles case-insensitive severity', () => {
      const criticalIcon = getSeverityIcon('CRITICAL');
      const highIcon = getSeverityIcon('High');
      const mediumIcon = getSeverityIcon('Medium');
      const lowIcon = getSeverityIcon('LOW');

      expect(criticalIcon.type).toBeDefined();
      expect(highIcon.type).toBeDefined();
      expect(mediumIcon.type).toBeDefined();
      expect(lowIcon.type).toBeDefined();
    });

    it('accepts different icon sizes', () => {
      const smallIcon = getSeverityIcon('critical', 'small');
      const mediumIcon = getSeverityIcon('critical', 'medium');
      const largeIcon = getSeverityIcon('critical', 'large');

      expect(smallIcon.props.fontSize).toBe('small');
      expect(mediumIcon.props.fontSize).toBe('medium');
      expect(largeIcon.props.fontSize).toBe('large');
    });

    it('uses medium size when no size specified', () => {
      const icon = getSeverityIcon('critical');
      expect(icon.props.fontSize).toBe('medium');
    });

    it('handles undefined or null severity', () => {
      const undefinedIcon = getSeverityIcon(undefined as any);
      const nullIcon = getSeverityIcon(null as any);

      expect(undefinedIcon.type).toBeDefined();
      expect(nullIcon.type).toBeDefined();
    });
  });
});
