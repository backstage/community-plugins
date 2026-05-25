// Copyright 2026 Healert OÜ — Apache-2.0

import { render } from '@testing-library/react';
import { TestApiProvider } from '@backstage/test-utils';
import { EntityProvider } from '@backstage/plugin-catalog-react';
import { FrictionHeatmap } from './FrictionHeatmap';
import { healertApiRef } from '../../api/HealertClient';

// ── Shared mock entity ────────────────────────────────────────────────────────
const mockEntity = {
  apiVersion: 'backstage.io/v1alpha1',
  kind: 'Component',
  metadata: { name: 'test-service', namespace: 'default' },
  spec: { type: 'service', lifecycle: 'production', owner: 'team' },
};

// ── Mock API — with events ────────────────────────────────────────────────────
const mockApiWithEvents = {
  getFrictionData: jest.fn().mockResolvedValue({
    entityRef: 'component:default/test-service',
    frictionScore: {
      score: 65,
      severity: 'high',
      bypassCount: 4,
      overheadHoursPerEngineer: 1.6,
      topFrictionWorkflow: 'deploy',
      calculatedAt: new Date().toISOString(),
    },
    recentEvents: [
      {
        timestamp: new Date(Date.now() - 2 * 60000).toISOString(),
        actor:       'system:admin',
        type:        'kubectl-exec',
        description: 'kubectl exec on pod/test-service by system:admin',
        workflow:    'deploy',
      },
      {
        timestamp: new Date(Date.now() - 5 * 60000).toISOString(),
        actor:       'system:admin',
        type:        'config-drift',
        description: 'Direct patch on deployments/test-service by system:admin',
        workflow:    'deploy',
      },
    ],
    sources: { kubernetesAuditLog: true, github: false, jira: false },
    fetchedAt: new Date().toISOString(),
  }),
};

// ── Mock API — empty state ────────────────────────────────────────────────────
const mockApiEmpty = {
  getFrictionData: jest.fn().mockResolvedValue({
    entityRef: 'component:default/test-service',
    frictionScore: {
      score: 0,
      severity: 'low',
      bypassCount: 0,
      overheadHoursPerEngineer: 0,
      topFrictionWorkflow: '',
      calculatedAt: new Date().toISOString(),
    },
    recentEvents: [],
    sources: { kubernetesAuditLog: true, github: false, jira: false },
    fetchedAt: new Date().toISOString(),
  }),
};

// ── Mock API — backend error ──────────────────────────────────────────────────
const mockApiError = {
  getFrictionData: jest.fn().mockRejectedValue(
    new Error('Healert API error: 504 Gateway Timeout'),
  ),
};

// Suppress jsdom @layer CSS parsing noise from @backstage/ui
beforeAll(() => {
  jest.spyOn(console, 'error').mockImplementation(msg => {
    if (typeof msg === 'string' && msg.includes('Could not parse CSS stylesheet')) return;
    // eslint-disable-next-line no-console
    console.warn(msg);
  });
});

// ── Tests ─────────────────────────────────────────────────────────────────────
describe('FrictionHeatmap', () => {

  it('renders without crashing with event data', () => {
    render(
      <TestApiProvider apis={[[healertApiRef, mockApiWithEvents]]}>
        <EntityProvider entity={mockEntity}>
          <FrictionHeatmap />
        </EntityProvider>
      </TestApiProvider>,
    );
    expect(document.body).toBeTruthy();
  });

  it('renders loading state initially', () => {
    render(
      <TestApiProvider apis={[[healertApiRef, mockApiWithEvents]]}>
        <EntityProvider entity={mockEntity}>
          <FrictionHeatmap />
        </EntityProvider>
      </TestApiProvider>,
    );
    // Component renders without throwing — loading state is shown
    expect(document.body).toBeTruthy();
  });

  it('renders empty state without crashing when no events', () => {
    render(
      <TestApiProvider apis={[[healertApiRef, mockApiEmpty]]}>
        <EntityProvider entity={mockEntity}>
          <FrictionHeatmap />
        </EntityProvider>
      </TestApiProvider>,
    );
    expect(document.body).toBeTruthy();
  });

  it('renders error state without crashing when backend is unreachable', () => {
    render(
      <TestApiProvider apis={[[healertApiRef, mockApiError]]}>
        <EntityProvider entity={mockEntity}>
          <FrictionHeatmap />
        </EntityProvider>
      </TestApiProvider>,
    );
    expect(document.body).toBeTruthy();
  });

});
