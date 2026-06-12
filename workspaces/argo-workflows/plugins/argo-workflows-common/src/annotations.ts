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

/**
 * Annotations to enable or configure the Argo Workflows plugin.
 *
 * @public
 */
export enum ArgoWorkflowsAnnotations {
  /**
   * Enables the CI/CD feature for catalog entities.
   *
   * Key is `argoworkflows.argoproj.io/workflow`, value should be set to `"true"`.
   *
   * Quotes are required because catalog entity annotation values must be a string.
   */
  CICD = 'argoworkflows.argoproj.io/workflow',

  /**
   * Kubernetes label selector used to filter Argo Workflows
   * associated with a catalog entity.
   *
   * Example: `"app=my-service,env=production"`
   */
  LABEL_SELECTOR = 'argoworkflows.argoproj.io/workflow-selector',

  /**
   * Name of the Argo Workflows server instance to query
   * for a given catalog entity.
   */
  INSTANCE_NAME = 'argoworkflows.argoproj.io/instance-name',

  /**
   * Standard Backstage annotation used to match Kubernetes resources
   * by label. The value is matched against the `backstage.io/kubernetes-id`
   * label on workflow resources.
   *
   * Same annotation used by the Backstage Kubernetes and Tekton plugins.
   */
  KUBERNETES_ID = 'backstage.io/kubernetes-id',

  /**
   * Standard Backstage annotation to scope resource discovery to a
   * specific Kubernetes namespace.
   *
   * Same annotation used by the Backstage Kubernetes and Tekton plugins.
   */
  KUBERNETES_NAMESPACE = 'backstage.io/kubernetes-namespace',

  /**
   * Standard Backstage annotation for a custom Kubernetes label selector.
   * Takes precedence over {@link ArgoWorkflowsAnnotations.KUBERNETES_ID}
   * when both are present.
   *
   * Same annotation used by the Backstage Kubernetes and Tekton plugins.
   *
   * Example: `"app=my-app,component=front-end"`
   */
  KUBERNETES_LABEL_SELECTOR = 'backstage.io/kubernetes-label-selector',
}

/**
 * Annotation used to specify the Kubernetes label selector for
 * filtering Argo Workflows associated with a catalog entity.
 *
 * @public
 * @deprecated Use {@link ArgoWorkflowsAnnotations.LABEL_SELECTOR} instead.
 */
export const ARGO_WORKFLOWS_LABEL_SELECTOR_ANNOTATION =
  ArgoWorkflowsAnnotations.LABEL_SELECTOR;

/**
 * Annotation used to identify the Argo Workflows server instance
 * to query for a given catalog entity.
 *
 * @public
 * @deprecated Use {@link ArgoWorkflowsAnnotations.INSTANCE_NAME} instead.
 */
export const ARGO_WORKFLOWS_INSTANCE_ANNOTATION =
  ArgoWorkflowsAnnotations.INSTANCE_NAME;
