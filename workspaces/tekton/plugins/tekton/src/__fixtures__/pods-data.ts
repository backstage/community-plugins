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
import { V1Pod } from '@kubernetes/client-node';

import { PipelineRunKind } from '@janus-idp/shared-react';

export const testPipelineRun: PipelineRunKind = {
  apiVersion: 'tekton.dev/v1',
  kind: 'PipelineRun',
  metadata: {
    name: 'test-pipeline-8e09zm',
    uid: '17080e46-1ff6-4f15-99e9-e32f603d7cc8',
    creationTimestamp: new Date('2023-12-12T06:38:29Z'),
    labels: {
      'backstage.io/kubernetes-id': 'developer-portal',
      'tekton.dev/cicd': 'true',
      'tekton.dev/build-namespace': 'karthik',
      'tekton.dev/pipeline': 'new-pipeline',
    },
  },
  spec: {
    pipelineRef: {
      name: 'new-pipeline',
    },
  },
  status: {
    completionTime: '2023-12-12T06:39:12Z',
    pipelineSpec: { tasks: [] },
    conditions: [
      {
        lastTransitionTime: '2023-12-12T06:39:12Z',
        message: 'Tasks Completed: 3 (Failed: 0, Cancelled 0), Skipped: 0',
        reason: 'Succeeded',
        status: 'True',
        type: 'Succeeded',
      },
    ],
    startTime: '2023-12-12T06:38:29Z',
  },
};

export const testPods: V1Pod[] = [
  {
    metadata: {
      name: 'test-pipeline-8e09zm-task1-pod',
      namespace: 'karthik',
      uid: 'bd868fde-1b37-4168-a780-f1772c5924e3',
      resourceVersion: '379524',
      labels: {
        'app.kubernetes.io/managed-by': 'tekton-pipelines',
        'backstage.io/kubernetes-id': 'developer-portal',
        'tekton.dev/cicd': 'true',
        'tekton.dev/clusterTask': 'tkn',
        'tekton.dev/memberOf': 'tasks',
        'tekton.dev/pipeline': 'test-pipeline',
        'tekton.dev/pipelineRun': 'test-pipeline-8e09zm',
        'tekton.dev/pipelineTask': 'task1',
        'tekton.dev/taskRun': 'test-pipeline-8e09zm-task1',
      },
    },
    spec: {
      volumes: [
        {
          name: 'tekton-internal-workspace',
          emptyDir: {},
        },
      ],
      containers: [
        {
          name: 'step-tkn',
        },
      ],
    },
    status: {
      phase: 'Succeeded',
      conditions: [],
      startTime: new Date('2023-12-08T12:19:29Z'),
    },
  },
  {
    metadata: {
      name: 'test-pipeline-8e09zm-sbom-task-pod',
      namespace: 'karthik',
      uid: '055cc13a-bd3e-414e-9eb6-e6cb72870578',
      resourceVersion: '379623',
      labels: {
        'backstage.io/kubernetes-id': 'developer-portal',
        'tekton.dev/cicd': 'true',
        'tekton.dev/pipeline': 'test-pipeline',
        'tekton.dev/pipelineRun': 'test-pipeline-8e09zm',
        'tekton.dev/pipelineTask': 'sbom-task',
        'tekton.dev/task': 'sbom-task',
        'tekton.dev/taskRun': 'test-pipeline-8e09zm-sbom-task',
      },
    },
    spec: {
      containers: [
        {
          name: 'step-print-sbom-results',
        },
      ],
    },
    status: {
      phase: 'Succeeded',
      conditions: [],

      startTime: new Date('2023-12-08T12:19:38Z'),
    },
  },
  {
    metadata: {
      name: 'pipelineRun-image-scan-task-t237ev-pod',
      namespace: 'karthik',
      uid: '055cc13a-bd3e-414e-9eb6-e6cb72870578',
      resourceVersion: '379623',
      labels: {
        'backstage.io/kubernetes-id': 'developer-portal',
        'tekton.dev/cicd': 'true',
        'tekton.dev/pipeline': 'test-pipeline',
        'tekton.dev/pipelineRun': 'test-pipeline-8e09zm',
        'tekton.dev/pipelineTask': 'sbom-task',
        'tekton.dev/task': 'sbom-task',
        'tekton.dev/taskRun': 'test-pipeline-8e09zm-sbom-task',
      },
    },
    spec: {
      containers: [
        {
          name: 'step-print-scan-results',
        },
      ],
    },
    status: {
      phase: 'Succeeded',
      conditions: [],

      startTime: new Date('2023-12-08T12:19:38Z'),
    },
  },
];

export const testPipelineRunPods: {
  pipelineRun: PipelineRunKind;
  pods: V1Pod[];
} = {
  pipelineRun: testPipelineRun,
  pods: testPods,
};
