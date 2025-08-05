/*
 * Copyright 2024 The Backstage Authors
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
import { TaskRunKind } from '@janus-idp/shared-react';

import { TEKTON_PIPELINE_RUN } from '../consts/tekton-const';

export const taskRunWithResults: TaskRunKind = {
  apiVersion: 'tekton.dev/v1beta1',
  kind: 'TaskRun',
  metadata: {
    name: 'test-tr',
    namespace: 'test-ns',
    labels: {
      'tekton.dev/pipelineRun': 'test-plr',
    },
  },
  spec: {
    params: [
      {
        name: 'first',
        value: '20',
      },
      {
        name: 'second',
        value: '10',
      },
    ],
    serviceAccountName: 'pipeline',
    taskRef: {
      kind: 'Task',
      name: 'add-task',
    },
    timeout: '1h0m0s',
  },
  status: {
    completionTime: 'Mon Mar 27 2023 18:09:11',
    startTime: 'Mon Mar 27 2023 18:08:19',
    podName: 'sum-three-pipeline-run-second-add-al6kxl-deploy-pod',
    conditions: [
      {
        lastTransitionTime: '2021-02-09T09:57:03Z',
        message: 'All Steps have completed executing',
        reason: 'Succeeded',
        status: 'True',
        type: 'Succeeded',
      },
    ],
    taskResults: [
      {
        name: 'sum',
        value: '30',
      },
      {
        name: 'difference',
        value: '10',
      },
      {
        name: 'multiply',
        value: '200',
      },
      {
        name: 'divide',
        value: '2',
      },
    ],
  },
};

export const taskRunWithSBOMResult = {
  apiVersion: 'tekton.dev/v1',
  kind: 'TaskRun',
  metadata: {
    annotations: {
      'chains.tekton.dev/signed': 'true',
      'pipeline.openshift.io/preferredName': 'pipelinerun-with-sbom-task',
      'pipeline.openshift.io/started-by': 'kube:admin',
      'task.output.location': 'results',
      'task.results.format': 'application/text',
      'task.results.key': 'LINK_TO_SBOM',
    },
    labels: {
      [TEKTON_PIPELINE_RUN]: 'pipelinerun-with-sbom-task',
      'tekton.dev/pipelineTask': 'sbom-task',
    },
    ownerReferences: [
      {
        apiVersion: 'tekton.dev/v1',
        blockOwnerDeletion: true,
        controller: true,
        kind: 'PipelineRun',
        name: 'pipelinerun-with-sbom-task',
        uid: '0a091bbf-3813-48d3-a6ce-fc43644a9b24',
      },
    ],
    name: 'pipelinerun-with-sbom-task-t237ev-sbom-task',
    uid: '764d0a6c-a4f6-419c-a3c3-585c2a9eb67c',
  },
  spec: {
    serviceAccountName: 'pipeline',
    taskRef: {
      kind: 'ClusterTask',
      name: 'sbom-task',
    },
    timeout: '1h0m0s',
  },
  status: {
    completionTime: '2023-11-08T08:18:25Z',
    conditions: [
      {
        lastTransitionTime: '2023-11-08T08:18:25Z',
        message: 'All Steps have completed executing',
        reason: 'Succeeded',
        status: 'True',
        type: 'Succeeded',
      },
    ],
    podName: 'pipelinerun-with-sbom-task-t237ev-sbom-task-pod',
    results: [
      {
        name: 'LINK_TO_SBOM',
        type: 'string',
        value: 'quay.io/test/image:build-8e536-1692702836',
      },
    ],
  },
};

export const taskRunWithSBOMResultExternalLink: TaskRunKind = {
  apiVersion: 'tekton.dev/v1',
  kind: 'TaskRun',
  metadata: {
    annotations: {
      'chains.tekton.dev/signed': 'true',
      'pipeline.openshift.io/preferredName': 'pipelinerun-with-sbom-task',
      'pipeline.openshift.io/started-by': 'kube:admin',
      'pipeline.tekton.dev/release': 'a2f17f6',
      'task.output.location': 'results',
      'task.results.format': 'application/text',
      'task.results.type': 'external-link',
      'task.results.key': 'LINK_TO_SBOM',
    },
    labels: {
      [TEKTON_PIPELINE_RUN]: 'pipelinerun-with-external-sbom-task',
      'tekton.dev/pipelineTask': 'sbom-task-with-external-link',
    },
    ownerReferences: [
      {
        apiVersion: 'tekton.dev/v1',
        blockOwnerDeletion: true,
        controller: true,
        kind: 'PipelineRun',
        name: 'pipelinerun-with-external-sbom-task',
        uid: '0a091bbf-3813-48d3-a6ce-fc43644a9b24',
      },
    ],
    resourceVersion: '197373',
    name: 'pipelinerun-with-sbom-task-t237ev-sbom-task',
    uid: '764d0a6c-a4f6-419c-a3c3-585c2a9eb67c',
    generation: 1,
  },
  spec: {
    serviceAccountName: 'pipeline',
    taskRef: {
      kind: 'ClusterTask',
      name: 'sbom-task-with-external-link',
    },
    timeout: '1h0m0s',
  },
  status: {
    completionTime: '2023-11-08T08:18:25Z',
    conditions: [
      {
        lastTransitionTime: '2023-11-08T08:18:25Z',
        message: 'All Steps have completed executing',
        reason: 'Succeeded',
        status: 'True',
        type: 'Succeeded',
      },
    ],
    podName: 'pipelinerun-with-sbom-task-with-external-pod',
    results: [
      {
        name: 'LINK_TO_SBOM',
        type: 'string',
        value:
          'https://quay.io/repository/janus-idp/backstage-showcase?tab=tags',
      },
    ],
  },
};

export const enterpriseContractTaskRun: TaskRunKind = {
  apiVersion: 'tekton.dev/v1',
  kind: 'TaskRun',
  metadata: {
    name: 'ec-taskrun',
    labels: {
      'tekton.dev/pipelineRun': 'pipelinerun-with-scanner-task',
      'tekton.dev/pipelineTask': 'ec-task',
    },
    annotations: {
      'chains.tekton.dev/signed': 'true',
      'pipeline.openshift.io/preferredName': 'pipelineRun-ec-task',
      'pipeline.openshift.io/started-by': 'kube:admin',
      'pipeline.tekton.dev/release': 'a2f17f6',
      'task.results.format': 'application/json',
      'task.output.location': 'logs',
      'task.results.type': 'ec',
      name: 'pipelineRun-ec-task-t237ev',
      uid: '764d0a6c-a4f6-419c-a3c3-585c2a9eb67c',
    },
  },
  spec: {
    serviceAccountName: 'pipeline',
    taskRef: {
      kind: 'Task',
      name: 'ec-task',
    },
    timeout: '1h0m0s',
  },
  status: {
    completionTime: '2023-11-08T08:18:25Z',
    conditions: [
      {
        lastTransitionTime: '2023-11-08T08:18:25Z',
        message: 'All Steps have completed executing',
        reason: 'Succeeded',
        status: 'True',
        type: 'Succeeded',
      },
    ],
    podName: 'pipelineRun-ec-task-t237ev-pod',
  },
};

export const acsImageScanTaskRun: TaskRunKind = {
  apiVersion: 'tekton.dev/v1',
  kind: 'TaskRun',
  metadata: {
    name: 'image-scan-taskrun',
    labels: {
      'tekton.dev/pipelineRun': 'pipelinerun-with-scanner-task',
      'tekton.dev/pipelineTask': 'image-scan-task',
    },
    annotations: {
      'chains.tekton.dev/signed': 'true',
      'pipeline.openshift.io/preferredName': 'pipelineRun-image-scan-task',
      'pipeline.openshift.io/started-by': 'kube:admin',
      'pipeline.tekton.dev/release': 'a2f17f6',
      'task.results.format': 'application/json',
      'task.output.location': 'logs',
      'task.results.type': 'roxctl-image-scan',
      'task.results.key': 'SCAN_OUTPUT',
      name: 'pipelineRun-image-scan-task-t237ev',
      uid: '764d0a6c-a4f6-419c-a3c3-585c2a9eb67c',
    },
  },
  spec: {
    serviceAccountName: 'pipeline',
    taskRef: {
      kind: 'Task',
      name: 'image-scan-task',
    },
    timeout: '1h0m0s',
  },
  status: {
    completionTime: '2023-11-08T08:18:25Z',
    conditions: [
      {
        lastTransitionTime: '2023-11-08T08:18:25Z',
        message: 'All Steps have completed executing',
        reason: 'Succeeded',
        status: 'True',
        type: 'Succeeded',
      },
    ],
    podName: 'pipelineRun-image-scan-task-t237ev-pod',
  },
};

export const acsImageCheckTaskRun: TaskRunKind = {
  apiVersion: 'tekton.dev/v1',
  kind: 'TaskRun',
  metadata: {
    name: 'image-check-taskrun',
    labels: {
      'tekton.dev/pipelineRun': 'pipelinerun-with-scanner-task',
      'tekton.dev/pipelineTask': 'image-check-task',
    },
    annotations: {
      'chains.tekton.dev/signed': 'true',
      'pipeline.openshift.io/preferredName': 'pipelineRun-image-check-task',
      'pipeline.openshift.io/started-by': 'kube:admin',
      'pipeline.tekton.dev/release': 'a2f17f6',
      'task.results.format': 'application/json',
      'task.output.location': 'logs',
      'task.results.type': 'roxctl-image-check',
      'task.results.key': 'SCAN_OUTPUT',
      name: 'pipelineRun-image-check-task-t237ev',
      uid: '764d0a6c-a4f6-419c-a3c3-585c2a9eb67c',
    },
  },
  spec: {
    serviceAccountName: 'pipeline',
    taskRef: {
      kind: 'Task',
      name: 'image-check-task',
    },
    timeout: '1h0m0s',
  },
  status: {
    completionTime: '2023-11-08T08:18:25Z',
    conditions: [
      {
        lastTransitionTime: '2023-11-08T08:18:25Z',
        message: 'All Steps have completed executing',
        reason: 'Succeeded',
        status: 'True',
        type: 'Succeeded',
      },
    ],
    podName: 'pipelineRun-image-check-task-t237ev-pod',
  },
};

export const acsDeploymentCheckTaskRun: TaskRunKind = {
  apiVersion: 'tekton.dev/v1',
  kind: 'TaskRun',
  metadata: {
    name: 'deployment-check-taskrun',
    labels: {
      'tekton.dev/pipelineRun': 'pipelinerun-with-scanner-task',
      'tekton.dev/pipelineTask': 'deployment-check-task',
    },
    annotations: {
      'chains.tekton.dev/signed': 'true',
      'pipeline.openshift.io/preferredName':
        'pipelineRun-deployment-check-task',
      'pipeline.openshift.io/started-by': 'kube:admin',
      'pipeline.tekton.dev/release': 'a2f17f6',
      'task.results.format': 'application/json',
      'task.output.location': 'logs',
      'task.results.type': 'roxctl-deployment-check',
      'task.results.key': 'SCAN_OUTPUT',
      name: 'pipelineRun-deployment-check-task-t237ev',
      uid: '764d0a6c-a4f6-419c-a3c3-585c2a9eb67c',
    },
  },
  spec: {
    serviceAccountName: 'pipeline',
    taskRef: {
      kind: 'Task',
      name: 'deployment-check-task',
    },
    timeout: '1h0m0s',
  },
  status: {
    completionTime: '2023-11-08T08:18:25Z',
    conditions: [
      {
        lastTransitionTime: '2023-11-08T08:18:25Z',
        message: 'All Steps have completed executing',
        reason: 'Succeeded',
        status: 'True',
        type: 'Succeeded',
      },
    ],
    podName: 'pipelineRun-deployment-check-task-t237ev-pod',
  },
};
