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

import { Entity } from '@backstage/catalog-model';
import { discoveryApiRef, fetchApiRef } from '@backstage/core-plugin-api';
import { createDevApp } from '@backstage/dev-utils';
import { EntityProvider } from '@backstage/plugin-catalog-react';
import { TestApiProvider } from '@backstage/test-utils';
import { FullPage, PluginHeader } from '@backstage/ui';
import { RiFlowChart } from '@remixicon/react';

import { argoWorkflowsPlugin, ArgoWorkflowsCI } from '../src/plugin';
import {
  succeededWorkflow,
  runningWorkflow,
  failedWorkflow,
  errorWorkflow,
  pendingWorkflow,
  lintCheckWorkflow,
  e2eTestsWorkflow,
  dockerBuildWorkflow,
  dbMigrationWorkflow,
  securityScanWorkflow,
  allWorkflows,
} from '../src/__fixtures__';

/** Workflows returned by the Argo server instance (CI/CD pipelines). */
const argoServerWorkflows = [
  succeededWorkflow,
  runningWorkflow,
  failedWorkflow,
  lintCheckWorkflow,
  dockerBuildWorkflow,
];

/** Workflows returned by the K8s production instance (prod operations). */
const k8sProductionWorkflows = [
  dbMigrationWorkflow,
  errorWorkflow,
  securityScanWorkflow,
];

/** Workflows returned by the K8s staging instance (test runs). */
const k8sStagingWorkflows = [e2eTestsWorkflow, pendingWorkflow];

/** Map instance name → workflow list. Falls back to all workflows. */
const workflowsByInstance: Record<string, typeof allWorkflows> = {
  'argo-server': argoServerWorkflows,
  'k8s-production': k8sProductionWorkflows,
  'k8s-staging': k8sStagingWorkflows,
};

/**
 * Entity with multiple instances available — no specific instance pinned,
 * so the user can switch between them via the instance selector dropdown.
 */
const multiInstanceEntity: Entity = {
  apiVersion: 'backstage.io/v1alpha1',
  kind: 'Component',
  metadata: {
    name: 'multi-cluster-service',
    description:
      'Service deployed across Argo server and multiple K8s clusters',
    annotations: {
      'argoworkflows.argoproj.io/workflow': 'true',
      'argoworkflows.argoproj.io/workflow-selector': 'app=my-service',
    },
  },
  spec: {
    lifecycle: 'production',
    type: 'service',
    owner: 'user:guest',
  },
};

const mockDiscoveryApi = {
  getBaseUrl: async (_pluginId: string) => '/api/argo-workflows',
};

/**
 * Mock fetch API that returns fixture data regardless of instance.
 * In a real setup, different instances would return different workflows.
 */
const mockFetchApi = {
  fetch: async (
    input: RequestInfo | URL,
    _init?: RequestInit,
  ): Promise<Response> => {
    const url = typeof input === 'string' ? input : input.toString();

    // GET /api/argo-workflows/instances — list configured instances
    if (url.endsWith('/instances')) {
      return new Response(
        JSON.stringify({
          instances: [
            { name: 'argo-server', type: 'argo-server' },
            { name: 'k8s-production', type: 'kubernetes' },
            { name: 'k8s-staging', type: 'kubernetes' },
          ],
          defaultInstance: 'argo-server',
        }),
        { status: 200, headers: { 'Content-Type': 'application/json' } },
      );
    }

    // GET /api/argo-workflows/workflows — list workflows
    if (url.includes('/workflows') && !url.match(/\/workflows\/[^?]/)) {
      const params = new URL(url, 'http://localhost').searchParams;
      const instance = params.get('instanceName') ?? '';
      const workflows = workflowsByInstance[instance] ?? allWorkflows;
      return new Response(JSON.stringify({ workflows }), {
        status: 200,
        headers: { 'Content-Type': 'application/json' },
      });
    }

    // GET /api/argo-workflows/workflows/:namespace/:name — workflow detail
    const detailMatch = url.match(/\/workflows\/([^/?]+)\/([^/?]+)/);
    if (detailMatch) {
      const [, namespace, name] = detailMatch;
      const workflow = allWorkflows.find(
        w => w.metadata.namespace === namespace && w.metadata.name === name,
      );

      if (workflow) {
        return new Response(JSON.stringify(workflow), {
          status: 200,
          headers: { 'Content-Type': 'application/json' },
        });
      }

      return new Response(
        JSON.stringify({ error: `Workflow ${namespace}/${name} not found` }),
        { status: 404, headers: { 'Content-Type': 'application/json' } },
      );
    }

    return new Response(JSON.stringify({ error: 'Not found' }), {
      status: 404,
      headers: { 'Content-Type': 'application/json' },
    });
  },
};

function DevPage({ entity, title }: { entity: Entity; title: string }) {
  return (
    <TestApiProvider
      apis={[
        [discoveryApiRef, mockDiscoveryApi],
        [fetchApiRef, mockFetchApi],
      ]}
    >
      <EntityProvider entity={entity}>
        <FullPage>
          <PluginHeader
            title={title}
            icon={<RiFlowChart />}
            tabs={[{ id: 'ci-cd', label: 'CI/CD', href: '#' }]}
          />
          <ArgoWorkflowsCI />
        </FullPage>
      </EntityProvider>
    </TestApiProvider>
  );
}

createDevApp()
  .registerPlugin(argoWorkflowsPlugin)
  .addPage({
    element: <DevPage entity={multiInstanceEntity} title="Argo Workflows" />,
    title: 'Workflows',
    path: '/argo-workflows',
  })
  .render();
