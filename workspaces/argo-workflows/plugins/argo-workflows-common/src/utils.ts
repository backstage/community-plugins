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
import { ArgoWorkflowsAnnotations } from './annotations';

/**
 * Returns true if the given entity supports the Argo Workflows CI/CD feature
 * and the plugin UI should be shown.
 *
 * This means that the catalog entity has one of these annotations set:
 *
 * 1. `argoworkflows.argoproj.io/workflow: "true"` (preferred), or
 * 2. `argoworkflows.argoproj.io/workflow-selector` is defined with a
 *    non-empty value, or
 * 3. `backstage.io/kubernetes-label-selector` is defined with a
 *    non-empty value, or
 * 4. `backstage.io/kubernetes-id` is defined with a non-empty value.
 *
 * @public
 */
export function isArgoWorkflowsAvailable(entity: Entity): boolean {
  const annotations = entity.metadata.annotations;
  if (!annotations) return false;

  // Primary gate: explicit CI/CD opt-in (Tekton-style)
  if (annotations[ArgoWorkflowsAnnotations.CICD] === 'true') {
    return true;
  }

  // Plugin-specific label selector
  const selector = annotations[ArgoWorkflowsAnnotations.LABEL_SELECTOR];
  if (typeof selector === 'string' && selector.trim().length > 0) {
    return true;
  }

  // Standard Kubernetes label selector
  const k8sSelector =
    annotations[ArgoWorkflowsAnnotations.KUBERNETES_LABEL_SELECTOR];
  if (typeof k8sSelector === 'string' && k8sSelector.trim().length > 0) {
    return true;
  }

  // Standard Kubernetes ID
  const k8sId = annotations[ArgoWorkflowsAnnotations.KUBERNETES_ID];
  if (typeof k8sId === 'string' && k8sId.trim().length > 0) {
    return true;
  }

  return false;
}
