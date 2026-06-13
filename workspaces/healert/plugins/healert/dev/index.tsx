import { createDevApp } from '@backstage/dev-utils';
import { EntityProvider } from '@backstage/plugin-catalog-react';
import { TestApiProvider } from '@backstage/test-utils';
import { healertApiRef } from '../src/api';
import { EntityHealertContent } from '../src/components/EntityHealertContent/EntityHealertContent';

const mockEntity = {
  apiVersion: 'backstage.io/v1alpha1' as const,
  kind: 'Component',
  metadata: {
    name: 'example-service',
    namespace: 'default',
    annotations: {},
  },
  spec: {
    type: 'service',
    lifecycle: 'production',
    owner: 'team-payments',
  },
};

const mockHealertApi = {
  getFrictionData: async () => ({
    entityRef: 'component:default/example-service',
    frictionScore: {
      score: 72,
      severity: 'high' as const,
      bypassCount: 14,
      overheadHoursPerEngineer: 3.5,
      topFrictionWorkflow: 'deploy',
      calculatedAt: new Date().toISOString(),
    },
    recentEvents: [
      {
        timestamp: new Date().toISOString(),
        actor: 'john.doe',
        type: 'kubectl-exec',
        description: 'kubectl exec into pod',
        workflow: 'deploy',
      },
    ],
    sources: {
      kubernetesAuditLog: true,
      github: false,
      jira: false,
    },
    fetchedAt: new Date().toISOString(),
  }),
};

createDevApp()
  .addPage({
    element: (
      <TestApiProvider apis={[[healertApiRef, mockHealertApi]]}>
        <EntityProvider entity={mockEntity}>
          <EntityHealertContent />
        </EntityProvider>
      </TestApiProvider>
    ),
    title: 'Healert',
    path: '/healert',
  })
  .render();
