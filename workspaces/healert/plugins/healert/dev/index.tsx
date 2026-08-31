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

import { createDevApp } from '@backstage/dev-utils';
import { EntityProvider } from '@backstage/plugin-catalog-react';
import { TestApiProvider } from '@backstage/test-utils';
import { healertApiRef } from '../src/api';
import { EntityHealertContent } from '../src/components/EntityHealertContent/EntityHealertContent';

// ─────────────────────────────────────────────────────────────────────────
// Mock Catalog Entity
//
// Represents a single Backstage catalog entity (a "service") that the
// Healert plugin will render friction data for. This stands in for a real
// entity from the Software Catalog.
// ─────────────────────────────────────────────────────────────────────────
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

// ─────────────────────────────────────────────────────────────────────────
// Mock Healert API
//
// Implements the HealertApi interface with static sample data so the
// plugin UI can be developed and previewed without a running Healert
// backend. Replace/extend this to test different scores, severities,
// and bypass event types.
// ─────────────────────────────────────────────────────────────────────────
const mockHealertApi = {
  getFrictionData: async () => ({
    entityRef: 'component:default/example-service',

    // Friction score summary for the entity
    frictionScore: {
      score: 72,
      severity: 'high' as const,
      bypassCount: 14,
      overheadHoursPerEngineer: 3.5,
      topFrictionWorkflow: 'deploy',
      calculatedAt: new Date().toISOString(),
    },

    // Most recent bypass events detected for this entity
    recentEvents: [
      {
        timestamp: new Date().toISOString(),
        actor: 'john.doe',
        type: 'kubectl-exec',
        description: 'kubectl exec into pod',
        workflow: 'deploy',
      },
    ],

    // Which data sources contributed to this friction score
    sources: {
      kubernetesAuditLog: true,
      github: false,
      jira: false,
    },

    fetchedAt: new Date().toISOString(),
  }),
};

// ─────────────────────────────────────────────────────────────────────────
// Dev App
//
// Renders the EntityHealertContent component in isolation, wrapped with:
//  - TestApiProvider: supplies the mock Healert API instead of a real one
//  - EntityProvider:  supplies the mock catalog entity as context
//
// Run with `yarn start` to preview at http://localhost:3000/healert
// ─────────────────────────────────────────────────────────────────────────
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
