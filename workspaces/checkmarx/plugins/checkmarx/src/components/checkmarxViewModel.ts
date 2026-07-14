/*
 * Copyright 2026 The Backstage Authors
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
  AgeCounter,
  CheckmarxEntitySummary,
  ComplianceCounter,
  LicenseCounter,
  RiskLevelCounter,
  SeverityCounter,
  StateCounter,
  StatusCounter,
} from '@backstage-community/plugin-checkmarx-react';

export type Tone =
  | 'default'
  | 'success'
  | 'warning'
  | 'danger'
  | 'info'
  | 'muted';

export type SummaryMetricIcon =
  | 'language'
  | 'sast'
  | 'packages'
  | 'outdated'
  | 'criticalHigh'
  | 'recurrent'
  | 'infraApi';

export type DashboardPanelIcon =
  | 'severity'
  | 'statusAge'
  | 'packages'
  | 'engines'
  | 'licenses'
  | 'compliance';

export type SummaryMetric = {
  id: string;
  label: string;
  value: string;
  icon: SummaryMetricIcon;
  span?: 1 | 2;
  valueTone?: Tone;
  indicator?: {
    kind: 'dot' | 'ring';
    tone: Tone;
  };
};

export type DashboardRow = {
  label: string;
  value: number;
  tone?: Tone;
};

export type DashboardPanel = {
  title: string;
  icon: DashboardPanelIcon;
  accent: Tone;
  kind: 'bars' | 'table';
  rows: DashboardRow[];
};

export type CheckmarxCardViewModel = {
  headerBadge: {
    label: string;
    tooltip: string;
    ariaLabel: string;
  };
  summaryMetrics: SummaryMetric[];
  findingsAgeLabel: string;
  dashboardPanels: DashboardPanel[];
};

const getCounterValue = <T extends { counter: number }>(
  items: T[] | undefined,
  predicate: (item: T) => boolean,
) => items?.find(predicate)?.counter ?? 0;

const sortByCounter = <T extends { counter: number }>(items: T[] = []) =>
  [...items].sort((a, b) => b.counter - a.counter);

const getSeverityCount = (
  counters: SeverityCounter[] | undefined,
  severity: string,
) => getCounterValue(counters, counter => counter.severity === severity);

const getStatusCount = (
  counters: StatusCounter[] | undefined,
  status: string,
) => getCounterValue(counters, counter => counter.status === status);

const getStateCount = (counters: StateCounter[] | undefined, state: string) =>
  getCounterValue(counters, counter => counter.state === state);

const getRiskLevelCount = (
  counters: RiskLevelCounter[] | undefined,
  riskLevel: string,
) => getCounterValue(counters, counter => counter.riskLevel === riskLevel);

function formatPercent(value: number): string {
  const formatted =
    value % 1 === 0 ? value.toFixed(0) : value.toFixed(1).replace(/\.0$/, '');
  return `${formatted}%`;
}

function toPercentage(numerator: number, denominator: number): number {
  if (denominator <= 0) {
    return 0;
  }

  return (numerator / denominator) * 100;
}

function getAgeRank(age: string): number {
  if (age.includes('90')) {
    return 4;
  }

  if (age.includes('61-90')) {
    return 3;
  }

  if (age.includes('31-60') || age.includes('30-60')) {
    return 2;
  }

  if (age.includes('0-30') || age.includes('1-30')) {
    return 1;
  }

  return 0;
}

function formatAgeLabel(age: string | null | undefined): string {
  if (!age) {
    return 'N/A';
  }

  if (age === '90+' || age === '90+d') {
    return '90+ days';
  }

  if (age === '61-90d' || age === '61-90') {
    return '61-90 days';
  }

  if (age === '31-60d' || age === '31-60') {
    return '31-60 days';
  }

  if (age === '30-60') {
    return '30-60 days';
  }

  if (age === '0-30d' || age === '0-30' || age === '1-30d') {
    return '0-30 days';
  }

  return age.endsWith('days') ? age : `${age} days`;
}

function getOldestAgeCounter(
  summary: CheckmarxEntitySummary,
): AgeCounter | undefined {
  return [...(summary.counters.sast.ageCounters ?? [])]
    .filter(counter => counter.counter > 0)
    .sort((a, b) => getAgeRank(b.age) - getAgeRank(a.age))[0];
}

function getFindingsAgeLabel(summary: CheckmarxEntitySummary): string {
  const oldestAgeCounter = getOldestAgeCounter(summary);

  if (oldestAgeCounter) {
    return formatAgeLabel(oldestAgeCounter.age);
  }

  return formatAgeLabel(summary.metrics.oldestAgeLabel);
}

function getPrimaryLanguage(summary: CheckmarxEntitySummary): string {
  return summary.counters.sast.languageCounters?.[0]?.language ?? 'N/A';
}

function getCriticalHighCount(summary: CheckmarxEntitySummary): number {
  return (
    getSeverityCount(summary.counters.sast.severityCounters, 'HIGH') +
    getSeverityCount(summary.counters.sast.severityCounters, 'CRITICAL')
  );
}

function getRecurrentCount(summary: CheckmarxEntitySummary): number {
  return getStatusCount(summary.counters.sast.statusCounters, 'RECURRENT');
}

function getRecurrentRate(summary: CheckmarxEntitySummary): number {
  return toPercentage(
    getRecurrentCount(summary),
    summary.counters.sast.totalCounter,
  );
}

function getOutdatedRate(summary: CheckmarxEntitySummary): number {
  return toPercentage(
    summary.counters.scaPackages.outdatedCounter,
    summary.counters.scaPackages.totalCounter,
  );
}

function getInfraApiCount(summary: CheckmarxEntitySummary): number {
  return (
    summary.counters.kics.totalCounter +
    summary.counters.apiSec.totalCounter +
    summary.counters.containers.totalCounter
  );
}

function buildSummaryMetrics(summary: CheckmarxEntitySummary): SummaryMetric[] {
  const outdatedRate = getOutdatedRate(summary);
  const criticalHighCount = getCriticalHighCount(summary);
  const recurrentRate = getRecurrentRate(summary);
  const infraApiCount = getInfraApiCount(summary);

  return [
    {
      id: 'primary-language',
      label: 'Primary Language',
      value: getPrimaryLanguage(summary),
      icon: 'language',
    },
    {
      id: 'sast-findings',
      label: 'SAST Findings',
      value: String(summary.counters.sast.totalCounter),
      icon: 'sast',
    },
    {
      id: 'sca-packages',
      label: 'SCA Packages',
      value: String(summary.counters.scaPackages.totalCounter),
      icon: 'packages',
    },
    {
      id: 'outdated-rate',
      label: 'Outdated Rate',
      value: formatPercent(outdatedRate),
      icon: 'outdated',
      valueTone: outdatedRate > 0 ? 'danger' : 'success',
    },
    {
      id: 'critical-high',
      label: 'Critical / High',
      value: String(criticalHighCount),
      icon: 'criticalHigh',
      valueTone: criticalHighCount > 0 ? 'danger' : undefined,
    },
    {
      id: 'recurrent-findings',
      label: 'RECURRENT Findings',
      value: formatPercent(recurrentRate),
      icon: 'recurrent',
      span: 2,
      indicator:
        recurrentRate > 0
          ? { kind: 'ring', tone: 'danger' }
          : { kind: 'dot', tone: 'success' },
    },
    {
      id: 'infra-api',
      label: 'Infra & API',
      value: String(infraApiCount),
      icon: 'infraApi',
      indicator: {
        kind: 'dot',
        tone: infraApiCount > 0 ? 'warning' : 'success',
      },
    },
  ];
}

function buildSeverityPanel(summary: CheckmarxEntitySummary): DashboardPanel {
  return {
    title: 'SAST Severity',
    icon: 'severity',
    accent: 'danger',
    kind: 'bars',
    rows: [
      {
        label: 'Critical',
        value: getSeverityCount(
          summary.counters.sast.severityCounters,
          'CRITICAL',
        ),
        tone: 'danger',
      },
      {
        label: 'High',
        value: getSeverityCount(summary.counters.sast.severityCounters, 'HIGH'),
        tone: 'danger',
      },
      {
        label: 'Medium',
        value: getSeverityCount(
          summary.counters.sast.severityCounters,
          'MEDIUM',
        ),
        tone: 'warning',
      },
      {
        label: 'Low',
        value: getSeverityCount(summary.counters.sast.severityCounters, 'LOW'),
        tone: 'success',
      },
    ],
  };
}

function buildStatusAgePanel(summary: CheckmarxEntitySummary): DashboardPanel {
  const oldestAgeCounter = getOldestAgeCounter(summary);

  return {
    title: 'SAST Status & Age',
    icon: 'statusAge',
    accent: 'warning',
    kind: 'bars',
    rows: [
      {
        label: 'Recurrent',
        value: getRecurrentCount(summary),
        tone: 'danger',
      },
      {
        label: 'To Verify',
        value: getStateCount(summary.counters.sast.stateCounters, 'TO_VERIFY'),
        tone: 'warning',
      },
      {
        label: getFindingsAgeLabel(summary),
        value: oldestAgeCounter?.counter ?? 0,
        tone: 'muted',
      },
    ],
  };
}

function buildScaPackagesPanel(
  summary: CheckmarxEntitySummary,
): DashboardPanel {
  return {
    title: 'SCA Packages',
    icon: 'packages',
    accent: 'info',
    kind: 'bars',
    rows: [
      {
        label: 'Total',
        value: summary.counters.scaPackages.totalCounter,
        tone: 'info',
      },
      {
        label: 'Outdated',
        value: summary.counters.scaPackages.outdatedCounter,
        tone:
          summary.counters.scaPackages.outdatedCounter > 0
            ? 'danger'
            : 'success',
      },
      {
        label: 'Unknown',
        value: getRiskLevelCount(
          summary.counters.scaPackages.riskLevelCounters,
          'UNKNOWN',
        ),
        tone: 'muted',
      },
      {
        label: 'To Verify',
        value: getStateCount(
          summary.counters.scaPackages.stateCounters,
          'TO_VERIFY',
        ),
        tone: 'warning',
      },
    ],
  };
}

function buildEnginesPanel(summary: CheckmarxEntitySummary): DashboardPanel {
  return {
    title: 'Engines Breakdown',
    icon: 'engines',
    accent: 'success',
    kind: 'bars',
    rows: [
      {
        label: 'SAST',
        value: summary.counters.sast.totalCounter,
        tone: 'info',
      },
      {
        label: 'KICS',
        value: summary.counters.kics.totalCounter,
        tone: 'success',
      },
      {
        label: 'SCA Vulns',
        value: summary.counters.sca.totalCounter,
        tone: 'warning',
      },
      {
        label: 'API Sec',
        value: summary.counters.apiSec.totalCounter,
        tone: 'danger',
      },
    ],
  };
}

function buildLicensesPanel(summary: CheckmarxEntitySummary): DashboardPanel {
  const rows = sortByCounter(summary.counters.scaPackages.licenseCounters)
    .slice(0, 2)
    .map<DashboardRow>((counter: LicenseCounter) => ({
      label: counter.license || 'Unknown',
      value: counter.counter,
    }));

  return {
    title: 'Licenses',
    icon: 'licenses',
    accent: 'muted',
    kind: 'table',
    rows,
  };
}

function buildCompliancePanel(summary: CheckmarxEntitySummary): DashboardPanel {
  const rows = sortByCounter(summary.counters.sast.complianceCounters)
    .slice(0, 5)
    .map<DashboardRow>((counter: ComplianceCounter) => ({
      label: counter.compliance,
      value: counter.counter,
    }));

  return {
    title: 'Compliance Violations',
    icon: 'compliance',
    accent: 'muted',
    kind: 'table',
    rows,
  };
}

export function buildCheckmarxCardViewModel(
  summary: CheckmarxEntitySummary,
): CheckmarxCardViewModel {
  return {
    headerBadge: {
      label: 'scan-summary',
      tooltip: `Latest ${summary.branch} scan fetched from scan-summary`,
      ariaLabel: `scan-summary for branch ${summary.branch}`,
    },
    summaryMetrics: buildSummaryMetrics(summary),
    findingsAgeLabel: getFindingsAgeLabel(summary),
    dashboardPanels: [
      buildSeverityPanel(summary),
      buildStatusAgePanel(summary),
      buildScaPackagesPanel(summary),
      buildEnginesPanel(summary),
      buildLicensesPanel(summary),
      buildCompliancePanel(summary),
    ],
  };
}
