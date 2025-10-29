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
import {
  acsDeploymentCheckTaskRun,
  acsImageCheckTaskRun,
  acsImageScanTaskRun,
  enterpriseContractTaskRun,
  taskRunWithSBOMResult,
  taskRunWithSBOMResultExternalLink,
} from './taskRunData';

export const mockKubernetesPlrResponse = {
  pods: [
    {
      metadata: {
        name: 'pipeline-test-wbvtlk-tkn-pod',
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
          'tekton.dev/pipelineRun': 'pipeline-test-wbvtlk',
          'tekton.dev/pipelineTask': 'tkn',
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
        name: 'ruby-ex-git-xf45fo-build-pod',
        generateName: 'ruby-ex-git-66d547b559-',
        namespace: 'jai-test',
        uid: 'cec5c859-3557-49aa-89db-d287f94d1ad8',
        resourceVersion: '87565',
        creationTimestamp: new Date('2023-03-30T07:04:54Z'),
        labels: {
          app: 'ruby-ex-git',
          'backstage.io/kubernetes-id': 'backstage',
          deployment: 'ruby-ex-git',
          'pod-template-hash': '66d547b559',
          'tekton.dev/pipelineRun': 'ruby-ex-git-xf45fo',
          'tekton.dev/pipelineTask': 'build',
        },
        ownerReferences: [
          {
            apiVersion: 'apps/v1',
            kind: 'ReplicaSet',
            name: 'ruby-ex-git-66d547b559',
            uid: '8a781d94-c73d-4f07-8d1f-b797db949e4a',
            controller: true,
            blockOwnerDeletion: true,
          },
        ],
      },
      spec: {
        volumes: [
          {
            name: 'kube-api-access-hzpnl',
            projected: {
              sources: [
                {
                  serviceAccountToken: {
                    expirationSeconds: 3607,
                    path: 'token',
                  },
                },
                {
                  configMap: {
                    name: 'kube-root-ca.crt',
                    items: [
                      {
                        key: 'ca.crt',
                        path: 'ca.crt',
                      },
                    ],
                  },
                },
                {
                  downwardAPI: {
                    items: [
                      {
                        path: 'namespace',
                        fieldRef: {
                          apiVersion: 'v1',
                          fieldPath: 'metadata.namespace',
                        },
                      },
                    ],
                  },
                },
                {
                  configMap: {
                    name: 'openshift-service-ca.crt',
                    items: [
                      {
                        key: 'service-ca.crt',
                        path: 'service-ca.crt',
                      },
                    ],
                  },
                },
              ],
              defaultMode: 420,
            },
          },
        ],
        containers: [
          {
            name: 'ruby-ex-git',
            image:
              'image-registry.openshift-image-registry.svc:5000/jai-test/ruby-ex-git@sha256:ade428dd4cb303a2ab9f1e0d5a6a86d6c035655d14f989e856f11bf3baef9bf2',
            ports: [
              {
                containerPort: 8080,
                protocol: 'TCP',
              },
            ],
            resources: {},
            volumeMounts: [
              {
                name: 'kube-api-access-hzpnl',
                readOnly: true,
                mountPath: '/var/run/secrets/kubernetes.io/serviceaccount',
              },
            ],
            terminationMessagePath: '/dev/termination-log',
            terminationMessagePolicy: 'File',
            imagePullPolicy: 'Always',
            securityContext: {
              capabilities: {
                drop: ['ALL'],
              },
              runAsUser: 1000690000,
              runAsNonRoot: true,
              allowPrivilegeEscalation: false,
            },
          },
        ],
        restartPolicy: 'Always',
        terminationGracePeriodSeconds: 30,
        dnsPolicy: 'ClusterFirst',
        serviceAccountName: 'default',
        serviceAccount: 'default',
        nodeName: 'ip-10-0-170-221.us-east-2.compute.internal',
        securityContext: {
          seLinuxOptions: {
            level: 's0:c26,c20',
          },
          fsGroup: 1000690000,
          seccompProfile: {
            type: 'RuntimeDefault',
          },
        },
        imagePullSecrets: [
          {
            name: 'default-dockercfg-wtjl6',
          },
        ],
        schedulerName: 'default-scheduler',
        tolerations: [
          {
            key: 'node.kubernetes.io/not-ready',
            operator: 'Exists',
            effect: 'NoExecute',
            tolerationSeconds: 300,
          },
          {
            key: 'node.kubernetes.io/unreachable',
            operator: 'Exists',
            effect: 'NoExecute',
            tolerationSeconds: 300,
          },
        ],
        priority: 0,
        enableServiceLinks: true,
        preemptionPolicy: 'PreemptLowerPriority',
      },
      status: {
        phase: 'Running',
        conditions: [
          {
            type: 'Initialized',
            status: 'True',
            lastProbeTime: null,
            lastTransitionTime: '2023-03-30T07:04:54Z',
          },
          {
            type: 'Ready',
            status: 'True',
            lastProbeTime: null,
            lastTransitionTime: '2023-03-30T07:05:12Z',
          },
          {
            type: 'ContainersReady',
            status: 'True',
            lastProbeTime: null,
            lastTransitionTime: '2023-03-30T07:05:12Z',
          },
          {
            type: 'PodScheduled',
            status: 'True',
            lastProbeTime: null,
            lastTransitionTime: '2023-03-30T07:04:54Z',
          },
        ],
        startTime: '2023-03-30T07:04:54Z',
        containerStatuses: [
          {
            name: 'ruby-ex-git',
            state: {
              running: {
                startedAt: '2023-03-30T07:05:11Z',
              },
            },
            lastState: {},
            ready: true,
            restartCount: 0,
            image:
              'image-registry.openshift-image-registry.svc:5000/jai-test/ruby-ex-git@sha256:ade428dd4cb303a2ab9f1e0d5a6a86d6c035655d14f989e856f11bf3baef9bf2',
            imageID:
              'image-registry.openshift-image-registry.svc:5000/jai-test/ruby-ex-git@sha256:ade428dd4cb303a2ab9f1e0d5a6a86d6c035655d14f989e856f11bf3baef9bf2',
            containerID:
              'cri-o://85af7fd408b95c3800ea83349541f10bf888903d0a1e19378489724b9a718607',
            started: true,
          },
        ],
        qosClass: 'BestEffort',
      },
    },
    {
      metadata: {
        name: 'pipelineRun-ec-task-t237ev-pod',
        namespace: 'karthik',
        uid: '055cc13a-bd3e-414e-9eb6-e6cb72870578',
        resourceVersion: '379623',
        labels: {
          'backstage.io/kubernetes-id': 'developer-portal',
          'tekton.dev/cicd': 'true',
          'tekton.dev/pipeline': 'test-pipeline',
          'tekton.dev/pipelineRun': 'test-pipeline-three',
          'tekton.dev/pipelineTask': 'scan-task',
          'tekton.dev/task': 'scan-task',
          'tekton.dev/taskRun': 'test-pipeline-8e09zm-scan-task',
        },
      },
      spec: {
        containers: [
          {
            name: 'step-ec-report',
          },
        ],
      },
      status: {
        phase: 'Running',
        conditions: [],

        startTime: new Date('2023-12-08T12:19:38Z'),
      },
    },
    {
      metadata: {
        name: 'pipelineRun-ec-task-t237ev-pod',
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
            name: 'step-ec-report',
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
    {
      metadata: {
        name: 'pipelineRun-image-check-task-t237ev-pod',
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
    {
      metadata: {
        name: 'pipelineRun-deployment-check-task-t237ev-pod',
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
    {
      metadata: {
        name: 'pipelinerun-with-sbom-task-t237ev-sbom-task-pod',
        namespace: 'karthik',
        uid: '055cc13a-bd3e-414e-9eb6-e6cb72870578',
        resourceVersion: '379623',
        labels: {
          'backstage.io/kubernetes-id': 'developer-portal',
          'tekton.dev/cicd': 'true',
          'tekton.dev/pipeline': 'test-pipeline',
          'tekton.dev/pipelineRun': 'pipelinerun-with-sbom-task',
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
        name: 'pipelinerun-with-sbom-task-with-external-pod',
        namespace: 'karthik',
        uid: '055cc13a-bd3e-414e-9eb6-e6cb72870578',
        resourceVersion: '379623',
        labels: {
          'backstage.io/kubernetes-id': 'developer-portal',
          'tekton.dev/cicd': 'true',
          'tekton.dev/pipeline': 'test-pipeline',
          'tekton.dev/pipelineRun': 'pipelinerun-with-external-sbom-task',
          'tekton.dev/pipelineTask': 'sbom-task-with-external-link',
          'tekton.dev/task': 'sbom-task-with-external-link',
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
  ],
  pipelineruns: [
    {
      apiVersion: 'tekton.dev/v1',
      kind: 'PipelineRun',
      metadata: {
        annotations: {
          'chains.tekton.dev/signed': 'true',
          'pipeline.openshift.io/started-by': 'kube:admin',
        },
        creationTimestamp: new Date('2023-03-30T07:03:04Z'),
        generation: 1,
        labels: {
          'app.kubernetes.io/instance': 'ruby-ex-git',
          'app.kubernetes.io/name': 'ruby-ex-git',
          'backstage.io/kubernetes-id': 'backstage',
          'operator.tekton.dev/operand-name': 'openshift-pipelines-addons',
          'pipeline.openshift.io/runtime': 'ruby',
          'pipeline.openshift.io/runtime-version': '3.0-ubi7',
          'pipeline.openshift.io/type': 'kubernetes',
          'tekton.dev/pipeline': 'ruby-ex-git',
        },
        name: 'ruby-ex-git-xf45fo',
        namespace: 'jai-test',
        resourceVersion: '87613',
        uid: 'b7584993-146c-4d4d-ba39-8619237e940b',
      },
      spec: {
        params: [
          {
            name: 'git-url',
            value: 'https://xxx',
          },
          {
            name: 'git-revision',
            value: 'master',
          },
          {
            name: 'array-params',
            value: ['one', 'two'],
          },
        ],
        pipelineRef: {
          name: 'ruby-ex-git',
        },
        serviceAccountName: 'pipeline',
        timeout: '1h0m0s',
        workspaces: [],
      },
      status: {
        completionTime: '2023-03-30T07:05:13Z',
        conditions: [
          {
            lastTransitionTime: '2023-03-30T07:05:13Z',
            message: 'Tasks Completed: 3 (Failed: 0, Cancelled 0), Skipped: 0',
            status: 'Unknown',
            type: 'Succeeded',
          },
        ],
        pipelineSpec: {
          params: [],
          tasks: [
            {
              name: 'fetch-repository',
              params: [],
              taskRef: {
                kind: 'ClusterTask',
                name: 'git-clone',
              },
              workspaces: [],
            },
            {
              name: 'build',
              params: [],
              runAfter: ['fetch-repository'],
              taskRef: {
                kind: 'ClusterTask',
                name: 's2i-ruby',
              },
              workspaces: [],
            },
            {
              name: 'deploy',
              params: [],
              runAfter: ['build'],
              taskRef: {
                kind: 'ClusterTask',
                name: 'openshift-client',
              },
            },
          ],
          workspaces: [],
        },
        startTime: '2023-03-30T07:03:04Z',
      },
    },
    {
      apiVersion: 'tekton.dev/v1',
      kind: 'PipelineRun',
      metadata: {
        annotations: {
          'pipeline.openshift.io/started-by': 'kube-admin',
          'chains.tekton.dev/signed': 'false',
        },
        labels: {
          'backstage.io/kubernetes-id': 'test-backstage',
          'tekton.dev/pipeline': 'pipeline-test',
          'app.kubernetes.io/instance': 'abs',
          'app.kubernetes.io/name': 'ghg',
          'operator.tekton.dev/operand-name': 'ytui',
          'pipeline.openshift.io/runtime-version': 'hjkhk',
          'pipeline.openshift.io/type': 'hhu',
          'pipeline.openshift.io/runtime': 'node',
        },
        name: 'pipeline-test-wbvtlk',
        namespace: 'deb-test',
        resourceVersion: '117337',
        uid: '0a091bbf-3813-48d3-a6ce-fc43644a9a24',
        creationTimestamp: new Date('2023-04-11T12:31:56Z'),
      },
      spec: {
        pipelineRef: {
          name: 'pipeline-test',
        },
        serviceAccountName: 'pipeline',
        workspaces: [],
      },
      status: {
        completionTime: '2023-04-11T06:49:05Z',
        conditions: [
          {
            lastTransitionTime: '2023-04-11T06:49:05Z',
            message: 'Tasks Completed: 4 (Failed: 3, Cancelled 0), Skipped: 0',
            reason: 'Failed',
            status: 'False',
            type: 'Succeeded',
          },
        ],
        pipelineSpec: {
          finally: [
            {
              name: 'git-clone',
              params: [],
              taskRef: {
                kind: 'ClusterTask',
                name: 'git-clone',
              },
              workspaces: [],
            },
          ],
          tasks: [
            {
              name: 'buildah',
              params: [],
              taskRef: {
                kind: 'ClusterTask',
                name: 'buildah',
              },
              workspaces: [],
            },
            {
              name: 'tkn',
              params: [],
              taskRef: {
                kind: 'ClusterTask',
                name: 'tkn',
              },
            },
            {
              name: 'argocd-task-sync-and-wait',
              params: [],
              taskRef: {
                kind: 'ClusterTask',
                name: 'argocd-task-sync-and-wait',
              },
            },
          ],
          workspaces: [],
          startTime: '2023-04-11T06:48:50Z',
        },
        startTime: '2023-04-11T05:49:05Z',
      },
    },
    {
      apiVersion: 'tekton.dev/v1',
      kind: 'PipelineRun',
      metadata: {
        annotations: {
          'pipeline.openshift.io/started-by': 'kube-admin',
          'chains.tekton.dev/signed': 'false',
        },
        labels: {
          'backstage.io/kubernetes-id': 'test-backstage',
          'tekton.dev/pipeline': 'pipeline-test',
          'app.kubernetes.io/instance': 'abs',
          'app.kubernetes.io/name': 'ghg',
          'operator.tekton.dev/operand-name': 'ytui',
          'pipeline.openshift.io/runtime-version': 'hjkhk',
          'pipeline.openshift.io/type': 'hhu',
          'pipeline.openshift.io/runtime': 'node',
        },
        name: 'pipelinerun-with-scanner-task',
        namespace: 'deb-test',
        resourceVersion: '117337',
        uid: '0a091bbf-3813-48d3-a6ce-fc43644a9b14',
        creationTimestamp: new Date('2023-04-11T12:31:56Z'),
      },
      spec: {
        pipelineRef: {
          name: 'pipeline-test',
        },
        serviceAccountName: 'pipeline',
        workspaces: [],
      },
      status: {
        completionTime: '2023-04-11T06:49:05Z',
        conditions: [
          {
            lastTransitionTime: '2023-03-30T07:05:13Z',
            message: 'Tasks Completed: 3 (Failed: 0, Cancelled 0), Skipped: 0',
            reason: 'Succeeded',
            status: 'True',
            type: 'Succeeded',
          },
        ],
        pipelineSpec: {
          tasks: [
            {
              name: 'scan-task',
              params: [],
              taskRef: {
                kind: 'ClusterTask',
                name: 'scan-task',
              },
              workspaces: [],
            },
          ],
          workspaces: [],
          startTime: '2023-04-11T06:48:50Z',
        },
        results: [
          {
            name: 'SCAN_OUTPUT',
            value:
              '{"vulnerabilities":{\n"critical": 13,\n"high": 29,\n"medium": 32,\n"low": 3,\n"unknown": 0},\n"unpatched_vulnerabilities": {\n"critical": 0,\n"high": 1,\n"medium": 0,\n"low":1}\n}\n',
          },
        ],
        startTime: '2023-04-11T05:49:05Z',
      },
    },
    {
      apiVersion: 'tekton.dev/v1',
      kind: 'PipelineRun',
      metadata: {
        annotations: {
          'pipeline.openshift.io/started-by': 'kube-admin',
          'chains.tekton.dev/signed': 'false',
        },
        labels: {
          'backstage.io/kubernetes-id': 'test-backstage',
          'tekton.dev/pipeline': 'pipeline-test',
          'app.kubernetes.io/instance': 'abs',
          'app.kubernetes.io/name': 'ghg',
          'operator.tekton.dev/operand-name': 'ytui',
          'pipeline.openshift.io/runtime-version': 'hjkhk',
          'pipeline.openshift.io/type': 'hhu',
          'pipeline.openshift.io/runtime': 'node',
        },
        name: 'pipelinerun-with-sbom-task',
        namespace: 'deb-test',
        resourceVersion: '117337',
        uid: '0a091bbf-3813-48d3-a6ce-fc43644a8b24',
        creationTimestamp: new Date('2023-04-11T12:31:56Z'),
      },
      spec: {
        pipelineRef: {
          name: 'pipeline-test',
        },
        serviceAccountName: 'pipeline',
        workspaces: [],
      },
      status: {
        completionTime: '2023-04-11T06:49:05Z',
        conditions: [
          {
            lastTransitionTime: '2023-03-30T07:05:13Z',
            message: 'Tasks Completed: 3 (Failed: 0, Cancelled 0), Skipped: 0',
            reason: 'Succeeded',
            status: 'True',
            type: 'Succeeded',
          },
        ],
        pipelineSpec: {
          tasks: [
            {
              name: 'sbom-task',
              params: [],
              taskRef: {
                kind: 'ClusterTask',
                name: 'sbom-task',
              },
              workspaces: [],
            },
          ],
          workspaces: [],
          startTime: '2023-04-11T06:48:50Z',
        },
        startTime: '2023-04-11T05:49:05Z',
      },
    },
    {
      apiVersion: 'tekton.dev/v1',
      kind: 'PipelineRun',
      metadata: {
        annotations: {
          'pipeline.openshift.io/started-by': 'kube-admin',
          'chains.tekton.dev/signed': 'false',
        },
        labels: {
          'backstage.io/kubernetes-id': 'test-backstage',
          'tekton.dev/pipeline': 'pipeline-test',
          'app.kubernetes.io/instance': 'abs',
          'app.kubernetes.io/name': 'ghg',
          'operator.tekton.dev/operand-name': 'ytui',
          'pipeline.openshift.io/runtime-version': 'hjkhk',
          'pipeline.openshift.io/type': 'hhu',
          'pipeline.openshift.io/runtime': 'node',
        },
        name: 'pipelinerun-with-external-sbom-task',
        namespace: 'deb-test',
        resourceVersion: '117337',
        uid: '0a091bbf-3813-48d3-a6ce-fc43644a9b26',
        creationTimestamp: new Date('2023-04-11T12:31:56Z'),
      },
      spec: {
        pipelineRef: {
          name: 'pipeline-test',
        },
        serviceAccountName: 'pipeline',
        workspaces: [],
      },
      status: {
        completionTime: '2023-04-11T06:49:05Z',
        conditions: [
          {
            lastTransitionTime: '2023-03-30T07:05:13Z',
            message: 'Tasks Completed: 3 (Failed: 0, Cancelled 0), Skipped: 0',
            reason: 'Succeeded',
            status: 'True',
            type: 'Succeeded',
          },
        ],
        pipelineSpec: {
          tasks: [
            {
              name: 'sbom-task-with-external-link',
              params: [],
              taskRef: {
                kind: 'ClusterTask',
                name: 'sbom-task-with-external-link',
              },
              workspaces: [],
            },
          ],
          workspaces: [],
          startTime: '2023-04-11T06:48:50Z',
        },
        pipelineResults: [
          {
            name: 'MY_SCAN_OUTPUT',
            value:
              '{"vulnerabilities":{\n"critical": 1,\n"high": 9,\n"medium": 20,\n"low": 1,\n"unknown": 0},\n"unpatched_vulnerabilities": {\n"critical": 0,\n"high": 1,\n"medium": 0,\n"low":1}\n}\n',
          },
        ],
        startTime: '2023-04-11T05:49:05Z',
      },
    },
  ],
  taskruns: [
    {
      apiVersion: 'tekton.dev/v1',
      kind: 'TaskRun',
      metadata: {
        annotations: {
          'operator.tekton.dev/last-applied-hash':
            '63911846cb698608618c9a280f25b886ea3ee59f84a4ef6da15738a699e09f0c',
          'pipeline.openshift.io/started-by': 'kube:admin',
          'pipeline.tekton.dev/release': '9ec444e',
          'tekton.dev/displayName': 's2i ruby',
          'tekton.dev/pipelines.minVersion': '0.19',
          'tekton.dev/tags': 's2i, ruby, workspace',
        },
        creationTimestamp: new Date('2023-03-30T07:03:20Z'),
        generation: 1,
        labels: {
          'app.kubernetes.io/instance': 'ruby-ex-git',
          'app.kubernetes.io/managed-by': 'tekton-pipelines',
          'app.kubernetes.io/name': 'ruby-ex-git',
          'app.kubernetes.io/version': '0.1',
          'backstage.io/kubernetes-id': 'backstage',
          'operator.tekton.dev/operand-name': 'openshift-pipelines-addons',
          'operator.tekton.dev/provider-type': 'redhat',
          'pipeline.openshift.io/runtime': 'ruby',
          'pipeline.openshift.io/runtime-version': '3.0-ubi7',
          'pipeline.openshift.io/type': 'kubernetes',
          'tekton.dev/clusterTask': 's2i-ruby',
          'tekton.dev/memberOf': 'tasks',
          'tekton.dev/pipeline': 'ruby-ex-git',
          'tekton.dev/pipelineRun': 'ruby-ex-git-xf45fo',
          'tekton.dev/pipelineTask': 'build',
        },
        name: 'ruby-ex-git-xf45fo-build',
        namespace: 'jai-test',
        ownerReferences: [
          {
            apiVersion: 'tekton.dev/v1',
            blockOwnerDeletion: true,
            controller: true,
            kind: 'PipelineRun',
            name: 'ruby-ex-git-xf45fo',
            uid: 'b7584993-146c-4d4d-ba39-8619237e940b',
          },
        ],
        resourceVersion: '87287',
        uid: 'e8d42c4a-b9c7-4f56-9482-d17f2c861804',
      },
      spec: {
        params: [],
        resources: [],
        serviceAccountName: 'pipeline',
        taskRef: {
          kind: 'ClusterTask',
          name: 's2i-ruby',
        },
        timeout: '1h0m0s',
        workspaces: [
          {
            name: 'source',
            persistentVolumeClaim: {
              claimName: 'pvc-f7934bb0ae',
            },
          },
        ],
      },
      status: {
        completionTime: '2023-03-30T07:04:55Z',
        conditions: [
          {
            lastTransitionTime: '2023-03-30T07:04:55Z',
            message: 'All Steps have completed executing',
            reason: 'Succeeded',
            status: 'Unknown',
            type: 'Succeeded',
          },
        ],
        podName: 'ruby-ex-git-xf45fo-build-pod',
        startTime: '2023-03-30T07:03:20Z',
        steps: [
          {
            container: 'step-generate',
            imageID:
              'registry.redhat.io/ocp-tools-4-tech-preview/source-to-image-rhel8@sha256:98d8cb3a255641ca6a1bce854e5e2460c20de9fb9b28e3cc67eb459f122873dd',
            name: 'generate',
            terminated: {
              containerID:
                'cri-o://3b490fe8f5ed9310fa7b322961e2069b3548a6a8134693ef78c12c8c0760ea0c',
              exitCode: 0,
              finishedAt: '2023-03-30T07:03:30Z',
              reason: 'Completed',
              startedAt: '2023-03-30T07:03:30Z',
            },
          },
          {
            container: 'step-build-and-push',
            imageID:
              'registry.redhat.io/rhel8/buildah@sha256:7678ad61e06e442b0093ab73faa73ce536721ae523015dd942f9196c4699a31d',
            name: 'build-and-push',
            terminated: {
              containerID:
                'cri-o://90521ea2114ca3fc6b54216fe8cff26b679788d1c87dee40b98caa90f71e140e',
              exitCode: 0,
              finishedAt: '2023-03-30T07:04:54Z',
              message:
                '[{"key":"IMAGE_DIGEST","value":"sha256:14e0715ec241926c081124345cd45d325a44d914261cfd642b3b0969a49ffe02","type":1}]',
              reason: 'Completed',
              startedAt: '2023-03-30T07:03:30Z',
            },
          },
        ],
        taskResults: [
          {
            name: 'IMAGE_DIGEST',
            type: 'string',
            value:
              'sha256:14e0715ec241926c081124345cd45d325a44d914261cfd642b3b0969a49ffe02',
          },
        ],
        taskSpec: {
          description:
            's2i-ruby task clones a Git repository and builds and pushes a container image using S2I and a Ruby builder image.',
          params: [],
          results: [
            {
              description: 'Digest of the image just built.',
              name: 'IMAGE_DIGEST',
              type: 'string',
            },
          ],
          steps: [
            {
              env: [],
              image:
                'registry.redhat.io/ocp-tools-4-tech-preview/source-to-image-rhel8@sha256:98d8cb3a255641ca6a1bce854e5e2460c20de9fb9b28e3cc67eb459f122873dd',
              name: 'generate',
              resources: {},
              script: 'echo',
              volumeMounts: [
                {
                  mountPath: '/gen-source',
                  name: 'gen-source',
                },
                {
                  mountPath: '/env-vars',
                  name: 'env-vars',
                },
              ],
              workingDir: '/workspace/source',
            },
            {
              image:
                'registry.redhat.io/rhel8/buildah@sha256:ac0b8714cc260c94435cab46fe41b3de0ccbc3d93e38c395fa9d52ac49e521fe',
              name: 'build-and-push',
              resources: {},
              script: 'echo',
              securityContext: {
                capabilities: {
                  add: ['SETFCAP'],
                },
              },
              volumeMounts: [
                {
                  mountPath: '/var/lib/containers',
                  name: 'varlibcontainers',
                },
                {
                  mountPath: '/gen-source',
                  name: 'gen-source',
                },
              ],
              workingDir: '/gen-source',
            },
          ],
          volumes: [
            {
              emptyDir: {},
              name: 'varlibcontainers',
            },
            {
              emptyDir: {},
              name: 'gen-source',
            },
            {
              emptyDir: {},
              name: 'env-vars',
            },
          ],
          workspaces: [],
        },
      },
    },
    {
      apiVersion: 'tekton.dev/v1',
      kind: 'TaskRun',
      metadata: {
        annotations: {
          'operator.tekton.dev/last-applied-hash': 'undefined',
          'pipeline.openshift.io/started-by': 'undefined',
          'pipeline.tekton.dev/release': 'undefined',
          'tekton.dev/displayName': 'undefined',
          'tekton.dev/pipelines.minVersion': 'undefined',
          'tekton.dev/tags': 'undefined',
        },
        creationTimestamp: new Date('2023-04-11T06:48:50Z'),
        generation: 1,
        labels: {
          'app.kubernetes.io/managed-by': 'tekton-pipelines',
          'app.kubernetes.io/version': '0.4',
          'backstage.io/kubernetes-id': 'test-backstage',
          'operator.tekton.dev/operand-name': 'openshift-pipelines-addons',
          'operator.tekton.dev/provider-type': 'redhat',
          'tekton.dev/clusterTask': 'scan-task',
          'tekton.dev/memberOf': 'tasks',
          'tekton.dev/pipeline': 'pipeline-test',
          'tekton.dev/pipelineRun': 'pipelinerun-with-scanner-task',
          'tekton.dev/pipelineTask': 'scan-task',
          'app.kubernetes.io/instance': 'xyz',
          'app.kubernetes.io/name': 'xyz',
          'pipeline.openshift.io/runtime': 'node',
          'pipeline.openshift.io/runtime-version': 'gh',
          'pipeline.openshift.io/type': 'abc',
        },
        name: 'pipeline-test-wbvtlk-scan-task',
        namespace: 'deb-test',
        ownerReferences: [
          {
            apiVersion: 'tekton.dev/v1',
            blockOwnerDeletion: true,
            controller: true,
            kind: 'PipelineRun',
            name: 'pipelinerun-with-scanner-task',
            uid: '0a091bbf-3813-48d3-a6ce-fc43644a9t24',
          },
        ],
        resourceVersion: '117189',
        uid: 'cb08cb7d-71fc-48a7-888f-4ad14a7277b9',
      },
      spec: {
        params: [],
        resources: [],
        serviceAccountName: 'pipeline',
        taskRef: {
          kind: 'ClusterTask',
          name: 'scan-task',
        },
        timeout: '1h0m0s',
      },
      status: {
        completionTime: '2023-04-11T06:48:56Z',
        conditions: [
          {
            lastTransitionTime: '2023-04-11T06:48:56Z',
            message: 'All Steps have completed executing',
            reason: 'Succeeded',
            status: 'True',
            type: 'Succeeded',
          },
        ],
        podName: 'pipelineRun-ec-task-t237ev-pod',
        startTime: '2023-04-11T06:48:50Z',
        steps: [
          {
            container: 'step-tkn',
            imageID:
              'registry.redhat.io/openshift-pipelines/pipelines-cli-tkn-rhel8@sha256:c73cefdd22522b2309f02dfa9858ed9079f1d5c94a3cd850f3f96dfbeafebc64',
            name: 'tkn',
            terminated: {
              containerID:
                'cri-o://53fbddbb25c08e97d0061a3dd79021e8d411485bbc3f18cfcffd41ae3448c0d2',
              exitCode: 0,
              finishedAt: '2023-04-11T06:48:56Z',
              reason: 'Completed',
              startedAt: '2023-04-11T06:48:56Z',
            },
          },
        ],
        taskSpec: {
          description:
            'This task performs operations on Tekton resources using tkn',
          params: [],
          steps: [
            {
              args: ['--help'],
              env: [],
              image:
                'registry.redhat.io/openshift-pipelines/pipelines-cli-tkn-rhel8@sha256:c73cefdd22522b2309f02dfa9858ed9079f1d5c94a3cd850f3f96dfbeafebc64',
              name: 'tkn',
              resources: {},
              script:
                'if [ "false" = "true" ] && [ -e /kubeconfig ]; then\n  export KUBECONFIG=""/kubeconfig\nfi\n\neval "tkn $@"\n',
              securityContext: {
                runAsNonRoot: true,
                runAsUser: 65532,
              },
            },
          ],
          workspaces: [],
        },
      },
    },
    {
      apiVersion: 'tekton.dev/v1',
      kind: 'TaskRun',
      metadata: {
        annotations: {
          'operator.tekton.dev/last-applied-hash': 'undefined',
          'pipeline.openshift.io/started-by': 'undefined',
          'pipeline.tekton.dev/release': 'undefined',
          'tekton.dev/displayName': 'undefined',
          'tekton.dev/pipelines.minVersion': 'undefined',
          'tekton.dev/tags': 'undefined',
        },
        creationTimestamp: new Date('2023-04-11T06:48:50Z'),
        generation: 1,
        labels: {
          'app.kubernetes.io/managed-by': 'tekton-pipelines',
          'app.kubernetes.io/version': '0.4',
          'backstage.io/kubernetes-id': 'test-backstage',
          'operator.tekton.dev/operand-name': 'openshift-pipelines-addons',
          'operator.tekton.dev/provider-type': 'redhat',
          'tekton.dev/clusterTask': 'tkn',
          'tekton.dev/memberOf': 'tasks',
          'tekton.dev/pipeline': 'pipeline-test',
          'tekton.dev/pipelineRun': 'pipeline-test-wbvtlk',
          'tekton.dev/pipelineTask': 'tkn',
          'app.kubernetes.io/instance': 'xyz',
          'app.kubernetes.io/name': 'xyz',
          'pipeline.openshift.io/runtime': 'node',
          'pipeline.openshift.io/runtime-version': 'gh',
          'pipeline.openshift.io/type': 'abc',
        },
        name: 'pipeline-test-wbvtlk-tkn',
        namespace: 'deb-test',
        ownerReferences: [
          {
            apiVersion: 'tekton.dev/v1',
            blockOwnerDeletion: true,
            controller: true,
            kind: 'PipelineRun',
            name: 'pipeline-test-wbvtlk',
            uid: '0a091bbf-3813-48d3-a6ce-fc43644a9b24',
          },
        ],
        resourceVersion: '117189',
        uid: 'cb08cb7d-71fc-48a7-888f-4ad14a7277b9',
      },
      spec: {
        params: [],
        resources: [],
        serviceAccountName: 'pipeline',
        taskRef: {
          kind: 'ClusterTask',
          name: 'tkn',
        },
        timeout: '1h0m0s',
      },
      status: {
        completionTime: '2023-04-11T06:48:56Z',
        conditions: [
          {
            lastTransitionTime: '2023-04-11T06:48:56Z',
            message: 'All Steps have completed executing',
            reason: 'Succeeded',
            status: 'True',
            type: 'Succeeded',
          },
        ],
        podName: 'pipeline-test-wbvtlk-tkn-pod',
        startTime: '2023-04-11T06:48:50Z',
        steps: [
          {
            container: 'step-tkn',
            imageID:
              'registry.redhat.io/openshift-pipelines/pipelines-cli-tkn-rhel8@sha256:c73cefdd22522b2309f02dfa9858ed9079f1d5c94a3cd850f3f96dfbeafebc64',
            name: 'tkn',
            terminated: {
              containerID:
                'cri-o://53fbddbb25c08e97d0061a3dd79021e8d411485bbc3f18cfcffd41ae3448c0d2',
              exitCode: 0,
              finishedAt: '2023-04-11T06:48:56Z',
              reason: 'Completed',
              startedAt: '2023-04-11T06:48:56Z',
            },
          },
        ],
        taskSpec: {
          description:
            'This task performs operations on Tekton resources using tkn',
          params: [],
          steps: [
            {
              args: ['--help'],
              env: [],
              image:
                'registry.redhat.io/openshift-pipelines/pipelines-cli-tkn-rhel8@sha256:c73cefdd22522b2309f02dfa9858ed9079f1d5c94a3cd850f3f96dfbeafebc64',
              name: 'tkn',
              resources: {},
              script:
                'if [ "false" = "true" ] && [ -e /kubeconfig ]; then\n  export KUBECONFIG=""/kubeconfig\nfi\n\neval "tkn $@"\n',
              securityContext: {
                runAsNonRoot: true,
                runAsUser: 65532,
              },
            },
          ],
          workspaces: [],
        },
      },
    },
    taskRunWithSBOMResult,
    taskRunWithSBOMResultExternalLink,
    enterpriseContractTaskRun,
    acsImageScanTaskRun,
    acsImageCheckTaskRun,
    acsDeploymentCheckTaskRun,
  ],
};
