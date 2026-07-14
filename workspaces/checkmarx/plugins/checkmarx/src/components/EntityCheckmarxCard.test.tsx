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
import '@testing-library/jest-dom';
import { render, screen, waitFor } from '@testing-library/react';
import { Entity } from '@backstage/catalog-model';
import {
  CheckmarxApi,
  CheckmarxEntitySummary,
} from '@backstage-community/plugin-checkmarx-react';
import { ReactNode } from 'react';
import { CheckmarxCard } from './EntityCheckmarxCard';

const mockUseApi = jest.fn();
const mockUseEntity = jest.fn();

jest.mock('@backstage/core-plugin-api', () => {
  const actual = jest.requireActual('@backstage/core-plugin-api');
  return {
    ...actual,
    useApi: () => mockUseApi(),
  };
});

jest.mock('@backstage/plugin-catalog-react', () => ({
  useEntity: () => mockUseEntity(),
  MissingAnnotationEmptyState: ({ annotation }: { annotation: string }) => (
    <div>{annotation}</div>
  ),
}));

jest.mock('@backstage/core-components', () => ({
  InfoCard: ({
    title,
    headerProps,
    children,
  }: {
    title: string;
    headerProps?: { action?: ReactNode };
    children: ReactNode;
  }) => (
    <section>
      <div>{title}</div>
      {headerProps?.action}
      <div>{children}</div>
    </section>
  ),
  EmptyState: ({
    title,
    description,
  }: {
    title: string;
    description?: string;
  }) => (
    <section>
      <div>{title}</div>
      {description && <div>{description}</div>}
    </section>
  ),
  Progress: () => <div>Loading</div>,
}));

const annotatedEntity: Entity = {
  apiVersion: 'backstage.io/v1alpha1',
  kind: 'Component',
  metadata: {
    name: 'payments-service',
    namespace: 'default',
    annotations: {
      'checkmarx.org/project-id': 'project-123',
    },
  },
  spec: {
    type: 'service',
    lifecycle: 'production',
    owner: 'guests',
  },
};

const unannotatedEntity: Entity = {
  ...annotatedEntity,
  metadata: {
    ...annotatedEntity.metadata,
    annotations: {},
  },
};

const summary: CheckmarxEntitySummary = {
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
        { compliance: 'OWASP Top 10 2021', counter: 4 },
        { compliance: 'OWASP ASVS', counter: 4 },
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

const summaryWithoutTableData: CheckmarxEntitySummary = {
  ...summary,
  counters: {
    ...summary.counters,
    sast: {
      ...summary.counters.sast,
      complianceCounters: [],
    },
    scaPackages: {
      ...summary.counters.scaPackages,
      licenseCounters: [],
    },
  },
};

function renderCard(
  entity: Entity,
  api: Partial<CheckmarxApi>,
  mode: 'summary' | 'full' = 'summary',
) {
  mockUseEntity.mockReturnValue({ entity });
  mockUseApi.mockReturnValue(api);

  return render(<CheckmarxCard mode={mode} />);
}

describe('CheckmarxCard', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('renders the summary mode with the compact mockup content and no dashboard', async () => {
    renderCard(
      annotatedEntity,
      {
        getEntitySummary: jest.fn().mockResolvedValue(summary),
        getEntitySummaries: jest.fn(),
      },
      'summary',
    );

    expect(await screen.findByText('Primary Language')).toBeInTheDocument();
    expect(screen.getByText('CSharp')).toBeInTheDocument();
    expect(screen.getByText('Outdated Rate')).toBeInTheDocument();
    expect(screen.getByText('98.7%')).toBeInTheDocument();
    expect(screen.getByText('Findings age: 30-60 days')).toBeInTheDocument();
    expect(screen.queryByText('SAST Severity')).not.toBeInTheDocument();
  });

  it('renders the full mode with the embedded dashboard panels', async () => {
    renderCard(
      annotatedEntity,
      {
        getEntitySummary: jest.fn().mockResolvedValue(summary),
        getEntitySummaries: jest.fn(),
      },
      'full',
    );

    expect(await screen.findByText('SAST Severity')).toBeInTheDocument();
    expect(screen.getByText('Critical')).toBeInTheDocument();
    expect(screen.getByText('Compliance Violations')).toBeInTheDocument();
    expect(screen.getByText('Licenses')).toBeInTheDocument();
    expect(screen.getByText('mit')).toBeInTheDocument();
  });

  it('renders empty dashboard panels without changing the surrounding layout', async () => {
    renderCard(
      annotatedEntity,
      {
        getEntitySummary: jest.fn().mockResolvedValue(summaryWithoutTableData),
        getEntitySummaries: jest.fn(),
      },
      'full',
    );

    expect(await screen.findByText('SAST Severity')).toBeInTheDocument();
    expect(screen.getAllByText('No data available')).toHaveLength(2);
  });

  it('renders the missing annotation state without calling the backend', async () => {
    const getEntitySummary = jest.fn();

    renderCard(
      unannotatedEntity,
      {
        getEntitySummary,
        getEntitySummaries: jest.fn(),
      },
      'summary',
    );

    expect(
      await screen.findByText('checkmarx.org/project-id'),
    ).toBeInTheDocument();
    await waitFor(() => expect(getEntitySummary).not.toHaveBeenCalled());
  });

  it('renders a specific unauthorized error', async () => {
    renderCard(
      annotatedEntity,
      {
        getEntitySummary: jest
          .fn()
          .mockRejectedValue(
            Object.assign(new Error('Unauthorized'), { statusCode: 401 }),
          ),
        getEntitySummaries: jest.fn(),
      },
      'summary',
    );

    expect(await screen.findByText('Unauthorized')).toBeInTheDocument();
  });
});
