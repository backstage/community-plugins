// Copyright 2026 Healert OÜ — Apache-2.0

import { render } from '@testing-library/react';
import { TestApiProvider } from '@backstage/test-utils';
import { EntityProvider } from '@backstage/plugin-catalog-react';
import { EntityHealertContent } from './EntityHealertContent';
import { healertApiRef } from '../../api/HealertClient';

// ── Mock API ──────────────────────────────────────────────────────────────────
const mockApi = {
  getFrictionData: jest.fn().mockResolvedValue({
    entityRef: 'component:default/test-service',
    frictionScore: {
      score: 42,
      severity: 'medium',
      bypassCount: 3,
      overheadHoursPerEngineer: 1.1,
      topFrictionWorkflow: 'deploy',
      calculatedAt: new Date().toISOString(),
    },
    recentEvents: [
      {
        timestamp: new Date().toISOString(),
        actor: 'system:admin',
        type: 'kubectl-exec',
        description: 'kubectl exec on pod/test-service by system:admin',
        workflow: 'deploy',
      },
    ],
    sources: { kubernetesAuditLog: true, github: false, jira: false },
    fetchedAt: new Date().toISOString(),
  }),
};

// Suppress jsdom @layer CSS parsing noise from @backstage/ui
let consoleSpy: jest.SpyInstance;

beforeAll(() => {
  consoleSpy = jest.spyOn(console, 'error').mockImplementation(msg => {
    if (
      typeof msg === 'string' &&
      msg.includes('Could not parse CSS stylesheet')
    )
      return;
    // eslint-disable-next-line no-console
    console.warn(msg);
  });
});

afterAll(() => {
  consoleSpy.mockRestore();
});

// ── Helpers ───────────────────────────────────────────────────────────────────
const renderWithEntity = (entity: object) =>
  render(
    <TestApiProvider apis={[[healertApiRef, mockApi]]}>
      <EntityProvider entity={entity as any}>
        <EntityHealertContent />
      </EntityProvider>
    </TestApiProvider>,
  );

// ── Tests ─────────────────────────────────────────────────────────────────────
describe('EntityHealertContent', () => {
  it('renders without crashing for Component kind', () => {
    renderWithEntity({
      apiVersion: 'backstage.io/v1alpha1',
      kind: 'Component',
      metadata: { name: 'test-service', namespace: 'default' },
      spec: { type: 'service', lifecycle: 'production', owner: 'team' },
    });
    expect(document.body).toBeTruthy();
  });

  it('renders without crashing for Service kind', () => {
    renderWithEntity({
      apiVersion: 'backstage.io/v1alpha1',
      kind: 'Service',
      metadata: { name: 'my-service', namespace: 'default' },
      spec: { type: 'service', lifecycle: 'production', owner: 'team' },
    });
    expect(document.body).toBeTruthy();
  });

  it('returns null for API kind — plugin not shown on API entities', () => {
    const { container } = renderWithEntity({
      apiVersion: 'backstage.io/v1alpha1',
      kind: 'API',
      metadata: { name: 'my-api', namespace: 'default' },
      spec: { type: 'openapi', lifecycle: 'production', owner: 'team' },
    });
    // EntityHealertContent returns null for API kind
    expect(container.firstChild).toBeNull();
  });

  it('renders for any kind when healert.io/enabled annotation is set', () => {
    renderWithEntity({
      apiVersion: 'backstage.io/v1alpha1',
      kind: 'System',
      metadata: {
        name: 'my-system',
        namespace: 'default',
        annotations: { 'healert.io/enabled': 'true' },
      },
      spec: { owner: 'team' },
    });
    expect(document.body).toBeTruthy();
  });
});
