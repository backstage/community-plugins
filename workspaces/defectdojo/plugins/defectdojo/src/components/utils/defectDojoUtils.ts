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
import { createElement } from 'react';
import { DefectDojoVulnerability } from '../../client';
import SecurityIcon from '@material-ui/icons/Security';
import BugReportIcon from '@material-ui/icons/BugReport';
import WarningIcon from '@material-ui/icons/Warning';

export interface SeverityMetrics {
  critical: number;
  high: number;
  medium: number;
  low: number;
  total: number;
}

export interface FindingAnalytics {
  topCWEs: { cwe: number; count: number; title: string }[];
  severityDistribution: Record<string, number>;
  riskScore: { score: number; level: string; color: string };
}

export const calculateAdvancedMetrics = (
  vulnerabilities: DefectDojoVulnerability[],
): FindingAnalytics => {
  const cweMap = new Map<number, { count: number; title: string }>();
  vulnerabilities.forEach(vuln => {
    if (vuln.cwe && vuln.cwe > 0) {
      const existing = cweMap.get(vuln.cwe);
      if (existing) {
        existing.count++;
      } else {
        cweMap.set(vuln.cwe, {
          count: 1,
          title: `${vuln.title.slice(0, 70)}...`,
        });
      }
    }
  });

  const topCWEs = Array.from(cweMap.entries())
    .map(([cwe, data]) => ({ cwe, count: data.count, title: data.title }))
    .sort((a, b) => b.count - a.count)
    .slice(0, 5);

  const severityDistribution = vulnerabilities.reduce((acc, vuln) => {
    const severity = vuln.severity?.toLowerCase() || 'unknown';
    acc[severity] = (acc[severity] || 0) + 1;
    return acc;
  }, {} as Record<string, number>);

  const weightedScore =
    (severityDistribution.critical || 0) * 10 +
    (severityDistribution.high || 0) * 7 +
    (severityDistribution.medium || 0) * 4 +
    (severityDistribution.low || 0) * 1;
  const maxPossibleScore = vulnerabilities.length * 10;
  const normalizedScore =
    maxPossibleScore > 0
      ? Math.round((weightedScore / maxPossibleScore) * 100)
      : 0;

  let level = 'Minimal';
  let color = '#4caf50';

  if (normalizedScore >= 80) {
    level = 'Critical';
    color = '#f44336';
  } else if (normalizedScore >= 60) {
    level = 'High';
    color = '#ff5722';
  } else if (normalizedScore >= 40) {
    level = 'Medium';
    color = '#ff9800';
  } else if (normalizedScore >= 20) {
    level = 'Low';
    color = '#2196f3';
  }

  return {
    topCWEs,
    severityDistribution,
    riskScore: { score: normalizedScore, level, color },
  };
};

export const getSeverityIcon = (
  severity: string,
  size: 'small' | 'medium' | 'large' = 'medium',
) => {
  const iconProps = { fontSize: size };
  switch (severity?.toLowerCase()) {
    case 'critical':
    case 'high':
      return createElement(WarningIcon, iconProps);
    case 'medium':
      return createElement(SecurityIcon, iconProps);
    case 'low':
      return createElement(BugReportIcon, iconProps);
    default:
      return createElement(SecurityIcon, iconProps);
  }
};

export const calculateSeverityMetrics = (
  vulnerabilities: DefectDojoVulnerability[],
): SeverityMetrics => {
  return vulnerabilities.reduce(
    (acc, vuln: DefectDojoVulnerability) => {
      const severity = vuln.severity?.toLowerCase() || 'unknown';
      switch (severity) {
        case 'critical':
          acc.critical++;
          break;
        case 'high':
          acc.high++;
          break;
        case 'medium':
          acc.medium++;
          break;
        case 'low':
          acc.low++;
          break;
        default:
          // Unknown severity - no action needed
          break;
      }
      acc.total++;
      return acc;
    },
    { critical: 0, high: 0, medium: 0, low: 0, total: 0 },
  );
};

export const calculateTrends = (
  vulnerabilities: DefectDojoVulnerability[],
  showTrends: boolean,
) => {
  if (!showTrends) {
    return { critical: 0, high: 0, medium: 0, low: 0 };
  }

  const now = new Date();
  const past7Days = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000);
  const past14Days = new Date(now.getTime() - 14 * 24 * 60 * 60 * 1000);

  const recentFindings = vulnerabilities.filter(v => {
    if (!v.created) return false;
    const date = new Date(v.created);
    return date >= past7Days;
  });

  const previousFindings = vulnerabilities.filter(v => {
    if (!v.created) return false;
    const date = new Date(v.created);
    return date >= past14Days && date < past7Days;
  });

  const getDistribution = (findings: DefectDojoVulnerability[]) =>
    findings.reduce((acc, v) => {
      const severity = v.severity?.toLowerCase() || 'unknown';
      acc[severity] = (acc[severity] || 0) + 1;
      return acc;
    }, {} as Record<string, number>);

  const recent = getDistribution(recentFindings);
  const previous = getDistribution(previousFindings);

  const calculateTrend = (current: number, prev: number): number => {
    if (prev === 0) return current > 0 ? 100 : 0;
    return Math.round(((current - prev) / prev) * 100);
  };

  return {
    critical: calculateTrend(recent.critical || 0, previous.critical || 0),
    high: calculateTrend(recent.high || 0, previous.high || 0),
    medium: calculateTrend(recent.medium || 0, previous.medium || 0),
    low: calculateTrend(recent.low || 0, previous.low || 0),
  };
};
