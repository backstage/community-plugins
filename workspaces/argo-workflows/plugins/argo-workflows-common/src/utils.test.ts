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
import { isArgoWorkflowsAvailable } from './utils';
import {
  ArgoWorkflowsAnnotations,
  ARGO_WORKFLOWS_LABEL_SELECTOR_ANNOTATION,
  ARGO_WORKFLOWS_INSTANCE_ANNOTATION,
} from './annotations';

function createEntity(annotations?: Record<string, string>): Entity {
  return {
    apiVersion: 'backstage.io/v1alpha1',
    kind: 'Component',
    metadata: {
      name: 'test-entity',
      ...(annotations !== undefined ? { annotations } : {}),
    },
  };
}

describe('ArgoWorkflowsAnnotations enum', () => {
  it('should have the correct CICD annotation key', () => {
    expect(ArgoWorkflowsAnnotations.CICD).toBe(
      'argoworkflows.argoproj.io/workflow',
    );
  });

  it('should have the correct LABEL_SELECTOR annotation key', () => {
    expect(ArgoWorkflowsAnnotations.LABEL_SELECTOR).toBe(
      'argoworkflows.argoproj.io/workflow-selector',
    );
  });

  it('should have the correct INSTANCE_NAME annotation key', () => {
    expect(ArgoWorkflowsAnnotations.INSTANCE_NAME).toBe(
      'argoworkflows.argoproj.io/instance-name',
    );
  });

  it('should have the correct KUBERNETES_ID annotation key', () => {
    expect(ArgoWorkflowsAnnotations.KUBERNETES_ID).toBe(
      'backstage.io/kubernetes-id',
    );
  });

  it('should have the correct KUBERNETES_NAMESPACE annotation key', () => {
    expect(ArgoWorkflowsAnnotations.KUBERNETES_NAMESPACE).toBe(
      'backstage.io/kubernetes-namespace',
    );
  });

  it('should have the correct KUBERNETES_LABEL_SELECTOR annotation key', () => {
    expect(ArgoWorkflowsAnnotations.KUBERNETES_LABEL_SELECTOR).toBe(
      'backstage.io/kubernetes-label-selector',
    );
  });
});

describe('deprecated annotation constants', () => {
  it('should export the correct workflow-selector annotation key', () => {
    expect(ARGO_WORKFLOWS_LABEL_SELECTOR_ANNOTATION).toBe(
      'argoworkflows.argoproj.io/workflow-selector',
    );
  });

  it('should export the correct instance-name annotation key', () => {
    expect(ARGO_WORKFLOWS_INSTANCE_ANNOTATION).toBe(
      'argoworkflows.argoproj.io/instance-name',
    );
  });

  it('deprecated constants should match enum values', () => {
    expect(ARGO_WORKFLOWS_LABEL_SELECTOR_ANNOTATION).toBe(
      ArgoWorkflowsAnnotations.LABEL_SELECTOR,
    );
    expect(ARGO_WORKFLOWS_INSTANCE_ANNOTATION).toBe(
      ArgoWorkflowsAnnotations.INSTANCE_NAME,
    );
  });
});

describe('isArgoWorkflowsAvailable', () => {
  it('returns true when the cicd annotation is set to "true"', () => {
    const entity = createEntity({
      [ArgoWorkflowsAnnotations.CICD]: 'true',
    });
    expect(isArgoWorkflowsAvailable(entity)).toBe(true);
  });

  it('returns false when the cicd annotation is set to "false"', () => {
    const entity = createEntity({
      [ArgoWorkflowsAnnotations.CICD]: 'false',
    });
    expect(isArgoWorkflowsAvailable(entity)).toBe(false);
  });

  it('returns false when the cicd annotation is an empty string', () => {
    const entity = createEntity({
      [ArgoWorkflowsAnnotations.CICD]: '',
    });
    expect(isArgoWorkflowsAvailable(entity)).toBe(false);
  });

  it('returns true when the workflow-selector annotation is present and non-empty (backward compat)', () => {
    const entity = createEntity({
      [ArgoWorkflowsAnnotations.LABEL_SELECTOR]: 'app=my-service',
    });
    expect(isArgoWorkflowsAvailable(entity)).toBe(true);
  });

  it('returns true when both cicd and label-selector are present', () => {
    const entity = createEntity({
      [ArgoWorkflowsAnnotations.CICD]: 'true',
      [ArgoWorkflowsAnnotations.LABEL_SELECTOR]: 'app=my-service',
    });
    expect(isArgoWorkflowsAvailable(entity)).toBe(true);
  });

  it('returns false when the entity has no annotations', () => {
    const entity = createEntity();
    expect(isArgoWorkflowsAvailable(entity)).toBe(false);
  });

  it('returns false when the entity has an empty annotations object', () => {
    const entity = createEntity({});
    expect(isArgoWorkflowsAvailable(entity)).toBe(false);
  });

  it('returns false when the label-selector annotation value is an empty string', () => {
    const entity = createEntity({
      [ArgoWorkflowsAnnotations.LABEL_SELECTOR]: '',
    });
    expect(isArgoWorkflowsAvailable(entity)).toBe(false);
  });

  it('returns false when the label-selector annotation value is only whitespace', () => {
    const entity = createEntity({
      [ArgoWorkflowsAnnotations.LABEL_SELECTOR]: '   ',
    });
    expect(isArgoWorkflowsAvailable(entity)).toBe(false);
  });

  it('returns true when the label-selector has leading/trailing whitespace but non-empty content', () => {
    const entity = createEntity({
      [ArgoWorkflowsAnnotations.LABEL_SELECTOR]: '  app=my-service  ',
    });
    expect(isArgoWorkflowsAvailable(entity)).toBe(true);
  });

  it('returns false when only the instance-name annotation is present', () => {
    const entity = createEntity({
      [ArgoWorkflowsAnnotations.INSTANCE_NAME]: 'main',
    });
    expect(isArgoWorkflowsAvailable(entity)).toBe(false);
  });

  // Kubernetes annotations
  it('returns true when backstage.io/kubernetes-id is present', () => {
    const entity = createEntity({
      [ArgoWorkflowsAnnotations.KUBERNETES_ID]: 'my-service',
    });
    expect(isArgoWorkflowsAvailable(entity)).toBe(true);
  });

  it('returns false when backstage.io/kubernetes-id is empty', () => {
    const entity = createEntity({
      [ArgoWorkflowsAnnotations.KUBERNETES_ID]: '',
    });
    expect(isArgoWorkflowsAvailable(entity)).toBe(false);
  });

  it('returns true when backstage.io/kubernetes-label-selector is present', () => {
    const entity = createEntity({
      [ArgoWorkflowsAnnotations.KUBERNETES_LABEL_SELECTOR]:
        'app=my-app,component=front-end',
    });
    expect(isArgoWorkflowsAvailable(entity)).toBe(true);
  });

  it('returns false when backstage.io/kubernetes-label-selector is empty', () => {
    const entity = createEntity({
      [ArgoWorkflowsAnnotations.KUBERNETES_LABEL_SELECTOR]: '',
    });
    expect(isArgoWorkflowsAvailable(entity)).toBe(false);
  });

  it('returns true when backstage.io/kubernetes-namespace is present alongside kubernetes-id', () => {
    const entity = createEntity({
      [ArgoWorkflowsAnnotations.KUBERNETES_ID]: 'my-service',
      [ArgoWorkflowsAnnotations.KUBERNETES_NAMESPACE]: 'production',
    });
    expect(isArgoWorkflowsAvailable(entity)).toBe(true);
  });

  it('returns false when only backstage.io/kubernetes-namespace is present', () => {
    const entity = createEntity({
      [ArgoWorkflowsAnnotations.KUBERNETES_NAMESPACE]: 'production',
    });
    expect(isArgoWorkflowsAvailable(entity)).toBe(false);
  });
});
