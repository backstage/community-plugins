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

import { Alert } from '@backstage/ui';
import { useEntity } from '@backstage/plugin-catalog-react';
import {
  isArgoWorkflowsAvailable,
  ArgoWorkflowsAnnotations,
} from '@backstage-community/plugin-argo-workflows-common';
import { useArgoInstances } from '@backstage-community/plugin-argo-workflows-react';
import { WorkflowRunsTable } from './WorkflowRunsTable';

/**
 * Router component for the Argo Workflows plugin.
 *
 * Uses the entity context to check if the Argo Workflows CI/CD annotation
 * is present. If the annotation is present, renders the workflow runs table
 * with inline expandable DAG views. Returns null if the annotation is absent.
 *
 * Label selector resolution order (highest priority first):
 * 1. `argoworkflows.argoproj.io/workflow-selector` (plugin-specific selector)
 * 2. `backstage.io/kubernetes-label-selector` (standard Kubernetes label selector)
 * 3. `backstage.io/kubernetes-id` (converted to `backstage.io/kubernetes-id=<value>`)
 */
export const Router = () => {
  const { entity } = useEntity();
  const { instances: availableInstances } = useArgoInstances();

  if (!isArgoWorkflowsAvailable(entity)) {
    return null;
  }

  const annotations = entity.metadata.annotations ?? {};

  // Resolve label selector — Argo-specific annotations take precedence
  const workflowSelector = annotations[ArgoWorkflowsAnnotations.LABEL_SELECTOR];
  const k8sLabelSelector =
    annotations[ArgoWorkflowsAnnotations.KUBERNETES_LABEL_SELECTOR];
  const k8sId = annotations[ArgoWorkflowsAnnotations.KUBERNETES_ID];

  let labelSelector = '';
  if (workflowSelector) {
    labelSelector = workflowSelector;
  } else if (k8sLabelSelector) {
    labelSelector = k8sLabelSelector;
  } else if (k8sId) {
    labelSelector = `backstage.io/kubernetes-id=${k8sId}`;
  }

  if (!labelSelector) {
    return (
      <Alert
        status="info"
        icon
        title="No label selector configured"
        description={
          'The Argo Workflows plugin is enabled but no label selector could be resolved. ' +
          'Add one of the following annotations to your entity: ' +
          `"${ArgoWorkflowsAnnotations.LABEL_SELECTOR}", ` +
          `"${ArgoWorkflowsAnnotations.KUBERNETES_LABEL_SELECTOR}", or ` +
          `"${ArgoWorkflowsAnnotations.KUBERNETES_ID}".`
        }
      />
    );
  }

  const instanceName = annotations[ArgoWorkflowsAnnotations.INSTANCE_NAME];
  const namespace = annotations[ArgoWorkflowsAnnotations.KUBERNETES_NAMESPACE];

  return (
    <WorkflowRunsTable
      labelSelector={labelSelector}
      instanceName={instanceName}
      namespace={namespace}
      availableInstances={availableInstances}
    />
  );
};
