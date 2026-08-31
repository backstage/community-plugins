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
import { CheckmarxEntitySummary } from '@backstage-community/plugin-checkmarx-react';
import { buildCheckmarxCardViewModel } from './checkmarxViewModel';

function createSummary(
  overrides: Partial<CheckmarxEntitySummary['metrics']> = {},
): CheckmarxEntitySummary {
  return {
    projectId: 'project-123',
    branch: 'main',
    scanId: 'scan-1',
    scanUrl: 'https://example.test/scans/scan-1',
    lastUpdated: '2026-05-20T00:00:00.000Z',
    engines: ['sast', 'sca'],
    metrics: {
      sastFindings: 4,
      criticalHighFindings: 0,
      scaPackages: 76,
      outdatedPackages: 75,
      recurrentFindings: 4,
      recurrentFindingsPercent: 100,
      additionalFindings: 0,
      oldestAgeLabel: '30-60',
      ...overrides,
    },
    counters: {
      sast: {
        severityCounters: [
          { severity: 'MEDIUM', counter: 1 },
          { severity: 'LOW', counter: 3 },
        ],
        statusCounters: [{ status: 'RECURRENT', counter: 4 }],
        stateCounters: [{ state: 'TO_VERIFY', counter: 4 }],
        ageCounters: [{ age: '30-60', counter: 4 }],
        totalCounter: 4,
        languageCounters: [{ language: 'CSharp', counter: 4 }],
        complianceCounters: [
          { compliance: 'OWASP ASVS', counter: 4 },
          { compliance: 'OWASP Top 10 2021', counter: 4 },
          { compliance: 'PCI DSS v4.0', counter: 3 },
          { compliance: 'NIST SP 800-53', counter: 2 },
          { compliance: 'ASD STIG 6.1', counter: 2 },
          { compliance: 'Base Preset', counter: 1 },
        ],
      },
      kics: {
        severityCounters: [],
        statusCounters: [],
        stateCounters: [],
        ageCounters: [],
        totalCounter: 0,
      },
      sca: {
        severityCounters: [],
        statusCounters: [],
        stateCounters: [],
        ageCounters: [],
        totalCounter: 0,
      },
      scaPackages: {
        severityCounters: [],
        statusCounters: [],
        stateCounters: [{ state: 'TO_VERIFY', counter: 76 }],
        ageCounters: [],
        totalCounter: 76,
        outdatedCounter: 75,
        riskLevelCounters: [{ riskLevel: 'UNKNOWN', counter: 76 }],
        licenseCounters: [
          { license: 'mit', counter: 12 },
          { license: 'apache 2.0', counter: 9 },
          { license: 'bsd-3', counter: 4 },
        ],
      },
      apiSec: {
        severityCounters: [],
        statusCounters: [],
        stateCounters: [],
        ageCounters: [],
        totalCounter: 0,
      },
      containers: {
        severityCounters: [],
        statusCounters: [],
        stateCounters: [],
        ageCounters: [],
        totalCounter: 0,
      },
    },
  };
}

describe('checkmarxViewModel', () => {
  it('maps the summary metrics from scan-summary counters', () => {
    const viewModel = buildCheckmarxCardViewModel(createSummary());

    expect(viewModel.headerBadge).toEqual({
      label: 'scan-summary',
      tooltip: 'Latest main scan fetched from scan-summary',
      ariaLabel: 'scan-summary for branch main',
    });
    expect(viewModel.summaryMetrics).toEqual([
      expect.objectContaining({
        id: 'primary-language',
        label: 'Primary Language',
        value: 'CSharp',
      }),
      expect.objectContaining({
        id: 'sast-findings',
        label: 'SAST Findings',
        value: '4',
      }),
      expect.objectContaining({
        id: 'sca-packages',
        label: 'SCA Packages',
        value: '76',
      }),
      expect.objectContaining({
        id: 'outdated-rate',
        label: 'Outdated Rate',
        value: '98.7%',
        valueTone: 'danger',
      }),
      expect.objectContaining({
        id: 'critical-high',
        label: 'Critical / High',
        value: '0',
      }),
      expect.objectContaining({
        id: 'recurrent-findings',
        label: 'RECURRENT Findings',
        value: '100%',
        span: 2,
        indicator: { kind: 'ring', tone: 'danger' },
      }),
      expect.objectContaining({
        id: 'infra-api',
        label: 'Infra & API',
        value: '0',
        indicator: { kind: 'dot', tone: 'success' },
      }),
    ]);
    expect(viewModel.findingsAgeLabel).toBe('30-60 days');
  });

  it('falls back safely when language, ages, and package denominators are missing', () => {
    const summary = createSummary({
      scaPackages: 0,
      outdatedPackages: 0,
      recurrentFindingsPercent: 0,
      oldestAgeLabel: null,
    });

    summary.counters.sast.languageCounters = [];
    summary.counters.sast.ageCounters = [];
    summary.counters.sast.statusCounters = [];
    summary.counters.scaPackages.totalCounter = 0;
    summary.counters.scaPackages.outdatedCounter = 0;

    const viewModel = buildCheckmarxCardViewModel(summary);

    expect(viewModel.summaryMetrics[0]).toEqual(
      expect.objectContaining({
        label: 'Primary Language',
        value: 'N/A',
      }),
    );
    expect(viewModel.summaryMetrics[3]).toEqual(
      expect.objectContaining({
        label: 'Outdated Rate',
        value: '0%',
      }),
    );
    expect(viewModel.findingsAgeLabel).toBe('N/A');
  });

  it('builds dashboard panels with the correct order and truncation', () => {
    const viewModel = buildCheckmarxCardViewModel(createSummary());

    expect(viewModel.dashboardPanels.map(panel => panel.title)).toEqual([
      'SAST Severity',
      'SAST Status & Age',
      'SCA Packages',
      'Engines Breakdown',
      'Licenses',
      'Compliance Violations',
    ]);
    expect(viewModel.dashboardPanels[0].rows.map(row => row.label)).toEqual([
      'Critical',
      'High',
      'Medium',
      'Low',
    ]);
    expect(viewModel.dashboardPanels[1].rows).toEqual([
      expect.objectContaining({ label: 'Recurrent', value: 4 }),
      expect.objectContaining({ label: 'To Verify', value: 4 }),
      expect.objectContaining({ label: '30-60 days', value: 4 }),
    ]);
    expect(viewModel.dashboardPanels[2].rows).toEqual([
      expect.objectContaining({ label: 'Total', value: 76 }),
      expect.objectContaining({ label: 'Outdated', value: 75 }),
      expect.objectContaining({ label: 'Unknown', value: 76 }),
      expect.objectContaining({ label: 'To Verify', value: 76 }),
    ]);
    expect(viewModel.dashboardPanels[4].rows).toEqual([
      { label: 'mit', value: 12 },
      { label: 'apache 2.0', value: 9 },
    ]);
    expect(viewModel.dashboardPanels[5].rows).toHaveLength(5);
  });
});
