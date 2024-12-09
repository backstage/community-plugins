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
import { mockKubernetesResponse } from './1-deployments';
import { mockTektonResources } from './1-tektonResources';

export const workloadNodeData = {
  data: {
    resource: {
      metadata: {
        name: 'hello-minikube2',
        namespace: 'div',
        uid: 'bfb6932f-64c6-4fe3-b283-16ecec8628c0',
        resourceVersion: '417930',
        generation: 6,
        creationTimestamp: '2023-02-13T14:49:49Z',
        ownerReferences: [{ name: 'app' }],
        labels: {
          app: 'hello-minikube2',
          'app.kubernetes.io/part-of': 'nationalparks-py',
          'backstage.io/kubernetes-id': 'nationalparks-py',
        },
        annotations: {
          'app.openshift.io/connects-to': 'hello-minikube3',
          'deployment.kubernetes.io/revision': '2',
        },
      },
      spec: {
        replicas: 1,
        selector: {
          matchLabels: {
            app: 'hello-minikube2',
          },
        },
        template: {
          metadata: {
            creationTimestamp: null,
            labels: {
              app: 'hello-minikube2',
              'backstage.io/kubernetes-id': 'nationalparks-py',
            },
          },
          spec: {
            containers: [
              {
                name: 'echo-server',
                image: 'kicbase/echo-server:1.0',
                resources: {},
                terminationMessagePath: '/dev/termination-log',
                terminationMessagePolicy: 'File',
                imagePullPolicy: 'IfNotPresent',
              },
            ],
            restartPolicy: 'Always',
            terminationGracePeriodSeconds: 30,
            dnsPolicy: 'ClusterFirst',
            securityContext: {},
            schedulerName: 'default-scheduler',
          },
        },
        strategy: {
          type: 'RollingUpdate',
          rollingUpdate: {
            maxUnavailable: '25%',
            maxSurge: '25%',
          },
        },
        revisionHistoryLimit: 10,
        progressDeadlineSeconds: 600,
      },
      status: {
        observedGeneration: 6,
        replicas: 1,
        updatedReplicas: 1,
        readyReplicas: 1,
        availableReplicas: 1,
        conditions: [
          {
            type: 'Progressing',
            status: 'True',
            lastUpdateTime: '2023-03-23T13:14:51Z',
            lastTransitionTime: '2023-02-13T14:49:49Z',
            reason: 'NewReplicaSetAvailable',
            message:
              'ReplicaSet "hello-minikube2-848cf77669" has successfully progressed.',
          },
          {
            type: 'Available',
            status: 'True',
            lastUpdateTime: '2023-04-07T15:03:02Z',
            lastTransitionTime: '2023-04-07T15:03:02Z',
            reason: 'MinimumReplicasAvailable',
            message: 'Deployment has minimum availability.',
          },
        ],
      },
      kind: 'Deployment',
      apiVersion: 'apps/v1',
    },
    data: {
      kind: 'Deployment',
      builderImage: 'default image',
      url: 'http://div/minikube',
      podsData: {
        obj: {
          metadata: {
            name: 'hello-minikube2',
            namespace: 'div',
            uid: 'bfb6932f-64c6-4fe3-b283-16ecec8628c0',
            resourceVersion: '417930',
            generation: 6,
            creationTimestamp: '2023-02-13T14:49:49Z',
            labels: {
              app: 'hello-minikube2',
              'app.kubernetes.io/part-of': 'nationalparks-py',
              'backstage.io/kubernetes-id': 'nationalparks-py',
            },
            annotations: {
              'app.openshift.io/connects-to': 'hello-minikube3',
              'deployment.kubernetes.io/revision': '2',
            },
          },
          spec: {
            replicas: 1,
            selector: {
              matchLabels: {
                app: 'hello-minikube2',
              },
            },
            template: {
              metadata: {
                creationTimestamp: null,
                labels: {
                  app: 'hello-minikube2',
                  'backstage.io/kubernetes-id': 'nationalparks-py',
                },
              },
              spec: {
                containers: [
                  {
                    name: 'echo-server',
                    image: 'kicbase/echo-server:1.0',
                    resources: {},
                    terminationMessagePath: '/dev/termination-log',
                    terminationMessagePolicy: 'File',
                    imagePullPolicy: 'IfNotPresent',
                  },
                ],
                restartPolicy: 'Always',
                terminationGracePeriodSeconds: 30,
                dnsPolicy: 'ClusterFirst',
                securityContext: {},
                schedulerName: 'default-scheduler',
              },
            },
            strategy: {
              type: 'RollingUpdate',
              rollingUpdate: {
                maxUnavailable: '25%',
                maxSurge: '25%',
              },
            },
            revisionHistoryLimit: 10,
            progressDeadlineSeconds: 600,
          },
          status: {
            observedGeneration: 6,
            replicas: 1,
            updatedReplicas: 1,
            readyReplicas: 1,
            availableReplicas: 1,
            conditions: [
              {
                type: 'Progressing',
                status: 'True',
                lastUpdateTime: '2023-03-23T13:14:51Z',
                lastTransitionTime: '2023-02-13T14:49:49Z',
                reason: 'NewReplicaSetAvailable',
                message:
                  'ReplicaSet "hello-minikube2-848cf77669" has successfully progressed.',
              },
              {
                type: 'Available',
                status: 'True',
                lastUpdateTime: '2023-04-07T15:03:02Z',
                lastTransitionTime: '2023-04-07T15:03:02Z',
                reason: 'MinimumReplicasAvailable',
                message: 'Deployment has minimum availability.',
              },
            ],
          },
          kind: 'Deployment',
          apiVersion: 'apps/v1',
        },
        current: {
          alerts: {},
          obj: {
            metadata: {
              name: 'hello-minikube2-848cf77669',
              namespace: 'div',
              uid: '06d5c182-5135-4676-9ceb-6b5cc52b9519',
              resourceVersion: '417928',
              generation: 3,
              creationTimestamp: '2023-03-23T13:14:49Z',
              labels: {
                app: 'hello-minikube2',
                'backstage.io/kubernetes-id': 'nationalparks-py',
                'pod-template-hash': '848cf77669',
              },
              annotations: {
                'app.openshift.io/connects-to': 'hello-minikube3',
                'deployment.kubernetes.io/desired-replicas': '4',
                'deployment.kubernetes.io/max-replicas': '5',
                'deployment.kubernetes.io/revision': '2',
              },
              ownerReferences: [
                {
                  apiVersion: 'apps/v1',
                  kind: 'Deployment',
                  name: 'hello-minikube2',
                  uid: 'bfb6932f-64c6-4fe3-b283-16ecec8628c0',
                  controller: true,
                  blockOwnerDeletion: true,
                },
              ],
            },
            spec: {
              replicas: 1,
              selector: {
                matchLabels: {
                  app: 'hello-minikube2',
                  'pod-template-hash': '848cf77669',
                },
              },
              template: {
                metadata: {
                  creationTimestamp: null,
                  labels: {
                    app: 'hello-minikube2',
                    'backstage.io/kubernetes-id': 'nationalparks-py',
                    'pod-template-hash': '848cf77669',
                  },
                },
                spec: {
                  containers: [
                    {
                      name: 'echo-server',
                      image: 'kicbase/echo-server:1.0',
                      resources: {},
                      terminationMessagePath: '/dev/termination-log',
                      terminationMessagePolicy: 'File',
                      imagePullPolicy: 'IfNotPresent',
                    },
                  ],
                  restartPolicy: 'Always',
                  terminationGracePeriodSeconds: 30,
                  dnsPolicy: 'ClusterFirst',
                  securityContext: {},
                  schedulerName: 'default-scheduler',
                },
              },
            },
            status: {
              replicas: 1,
              fullyLabeledReplicas: 1,
              readyReplicas: 1,
              availableReplicas: 1,
              observedGeneration: 3,
            },
            kind: 'ReplicaSet',
            apiVersion: 'apps/v1',
          },
          pods: [
            {
              metadata: {
                name: 'hello-minikube2-848cf77669-5fqtp',
                generateName: 'hello-minikube2-848cf77669-',
                namespace: 'div',
                uid: 'ef2848f6-bdfd-4ae4-bba7-fac8d93e8dc5',
                resourceVersion: '417920',
                creationTimestamp: '2023-03-23T13:14:50Z',
                labels: {
                  app: 'hello-minikube2',
                  'backstage.io/kubernetes-id': 'nationalparks-py',
                  'pod-template-hash': '848cf77669',
                },
                ownerReferences: [
                  {
                    apiVersion: 'apps/v1',
                    kind: 'ReplicaSet',
                    name: 'hello-minikube2-848cf77669',
                    uid: '06d5c182-5135-4676-9ceb-6b5cc52b9519',
                    controller: true,
                    blockOwnerDeletion: true,
                  },
                ],
              },
              spec: {
                volumes: [
                  {
                    name: 'kube-api-access-lb9mh',
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
                      ],
                      defaultMode: 420,
                    },
                  },
                ],
                containers: [
                  {
                    name: 'echo-server',
                    image: 'kicbase/echo-server:1.0',
                    resources: {},
                    volumeMounts: [
                      {
                        name: 'kube-api-access-lb9mh',
                        readOnly: true,
                        mountPath:
                          '/var/run/secrets/kubernetes.io/serviceaccount',
                      },
                    ],
                    terminationMessagePath: '/dev/termination-log',
                    terminationMessagePolicy: 'File',
                    imagePullPolicy: 'IfNotPresent',
                  },
                ],
                restartPolicy: 'Always',
                terminationGracePeriodSeconds: 30,
                dnsPolicy: 'ClusterFirst',
                serviceAccountName: 'default',
                serviceAccount: 'default',
                nodeName: 'minikube',
                securityContext: {},
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
                    lastTransitionTime: '2023-03-23T13:14:50Z',
                  },
                  {
                    type: 'Ready',
                    status: 'True',
                    lastProbeTime: null,
                    lastTransitionTime: '2023-03-23T13:14:51Z',
                  },
                  {
                    type: 'ContainersReady',
                    status: 'True',
                    lastProbeTime: null,
                    lastTransitionTime: '2023-03-23T13:14:51Z',
                  },
                  {
                    type: 'PodScheduled',
                    status: 'True',
                    lastProbeTime: null,
                    lastTransitionTime: '2023-03-23T13:14:50Z',
                  },
                ],
                hostIP: '192.168.49.2',
                podIP: '10.244.0.23',
                podIPs: [
                  {
                    ip: '10.244.0.23',
                  },
                ],
                startTime: '2023-03-23T13:14:50Z',
                containerStatuses: [
                  {
                    name: 'echo-server',
                    state: {
                      running: {
                        startedAt: '2023-03-23T13:14:51Z',
                      },
                    },
                    lastState: {},
                    ready: true,
                    restartCount: 0,
                    image: 'kicbase/echo-server:1.0',
                    imageID:
                      'docker-pullable://kicbase/echo-server@sha256:127ac38a2bb9537b7f252addff209ea6801edcac8a92c8b1104dacd66a583ed6',
                    containerID:
                      'docker://44fa417ec9454b56491eb143d5914c12712f48732282f26eb224029f1a013cf6',
                    started: true,
                  },
                ],
                qosClass: 'BestEffort',
              },
              kind: 'Pod',
              apiVersion: 'v1',
            },
          ],
          revision: 2,
        },
        isRollingOut: false,
        pods: [
          {
            metadata: {
              name: 'hello-minikube2-848cf77669-5fqtp',
              generateName: 'hello-minikube2-848cf77669-',
              namespace: 'div',
              uid: 'ef2848f6-bdfd-4ae4-bba7-fac8d93e8dc5',
              resourceVersion: '417920',
              creationTimestamp: '2023-03-23T13:14:50Z',
              labels: {
                app: 'hello-minikube2',
                'backstage.io/kubernetes-id': 'nationalparks-py',
                'pod-template-hash': '848cf77669',
              },
              ownerReferences: [
                {
                  apiVersion: 'apps/v1',
                  kind: 'ReplicaSet',
                  name: 'hello-minikube2-848cf77669',
                  uid: '06d5c182-5135-4676-9ceb-6b5cc52b9519',
                  controller: true,
                  blockOwnerDeletion: true,
                },
              ],
            },
            spec: {
              volumes: [
                {
                  name: 'kube-api-access-lb9mh',
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
                    ],
                    defaultMode: 420,
                  },
                },
              ],
              containers: [
                {
                  name: 'echo-server',
                  image: 'kicbase/echo-server:1.0',
                  resources: {},
                  volumeMounts: [
                    {
                      name: 'kube-api-access-lb9mh',
                      readOnly: true,
                      mountPath:
                        '/var/run/secrets/kubernetes.io/serviceaccount',
                    },
                  ],
                  terminationMessagePath: '/dev/termination-log',
                  terminationMessagePolicy: 'File',
                  imagePullPolicy: 'IfNotPresent',
                },
              ],
              restartPolicy: 'Always',
              terminationGracePeriodSeconds: 30,
              dnsPolicy: 'ClusterFirst',
              serviceAccountName: 'default',
              serviceAccount: 'default',
              nodeName: 'minikube',
              securityContext: {},
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
                  lastTransitionTime: '2023-03-23T13:14:50Z',
                },
                {
                  type: 'Ready',
                  status: 'True',
                  lastProbeTime: null,
                  lastTransitionTime: '2023-03-23T13:14:51Z',
                },
                {
                  type: 'ContainersReady',
                  status: 'True',
                  lastProbeTime: null,
                  lastTransitionTime: '2023-03-23T13:14:51Z',
                },
                {
                  type: 'PodScheduled',
                  status: 'True',
                  lastProbeTime: null,
                  lastTransitionTime: '2023-03-23T13:14:50Z',
                },
              ],
              hostIP: '192.168.49.2',
              podIP: '10.244.0.23',
              podIPs: [
                {
                  ip: '10.244.0.23',
                },
              ],
              startTime: '2023-03-23T13:14:50Z',
              containerStatuses: [
                {
                  name: 'echo-server',
                  state: {
                    running: {
                      startedAt: '2023-03-23T13:14:51Z',
                    },
                  },
                  lastState: {},
                  ready: true,
                  restartCount: 0,
                  image: 'kicbase/echo-server:1.0',
                  imageID:
                    'docker-pullable://kicbase/echo-server@sha256:127ac38a2bb9537b7f252addff209ea6801edcac8a92c8b1104dacd66a583ed6',
                  containerID:
                    'docker://44fa417ec9454b56491eb143d5914c12712f48732282f26eb224029f1a013cf6',
                  started: true,
                },
              ],
              qosClass: 'BestEffort',
            },
            kind: 'Pod',
            apiVersion: 'v1',
          },
        ],
      },
      services: [
        {
          metadata: {
            name: 'hello-minikube2',
            namespace: 'div',
            uid: '465a9db1-b30c-4636-949b-c9bc9a000f56',
            resourceVersion: '3825',
            creationTimestamp: '2023-02-13T14:52:24Z',
            labels: {
              app: 'hello-minikube2',
              'backstage.io/kubernetes-id': 'nationalparks-py',
            },
          },
          spec: {
            ports: [
              {
                protocol: 'TCP',
                port: 8081,
                targetPort: 8081,
                nodePort: 30179,
              },
            ],
            selector: {
              app: 'hello-minikube2',
            },
            clusterIP: '10.101.77.157',
            clusterIPs: ['10.101.77.157'],
            type: 'NodePort',
            sessionAffinity: 'None',
            externalTrafficPolicy: 'Cluster',
            ipFamilies: ['IPv4'],
            ipFamilyPolicy: 'SingleStack',
            internalTrafficPolicy: 'Cluster',
          },
          status: {
            loadBalancer: {},
          },
          kind: 'Service',
          apiVersion: 'v1',
        },
      ],
      ingressesData: [
        {
          ingress: {
            metadata: {
              name: 'hello-minikube2-ingress',
              namespace: 'div',
              uid: 'a2ea87d9-6ab5-4c4c-883f-cb8eb0d6f272',
              resourceVersion: '345759',
              generation: 2,
              creationTimestamp: new Date('2023-02-13T15:00:22Z'),
              labels: {
                'backstage.io/kubernetes-id': 'nationalparks-py',
              },
              annotations: {
                'kubectl.kubernetes.io/last-applied-configuration':
                  '{"apiVersion":"networking.k8s.io/v1","kind":"Ingress","metadata":{"annotations":{},"name":"hello-minikube2-ingress","namespace":"div"},"spec":{"rules":[{"http":{"paths":[{"backend":{"service":{"name":"hello-minikube2","port":{"number":8081}}},"path":"/minikube","pathType":"Prefix"}]}}]}}\n',
              },
            },
            spec: {
              rules: [
                {
                  host: 'div',
                  http: {
                    paths: [
                      {
                        path: '/minikube',
                        pathType: 'Prefix',
                        backend: {
                          service: {
                            name: 'hello-minikube2',
                            port: {
                              number: 8081,
                            },
                          },
                        },
                      },
                    ],
                  },
                },
              ],
            },
            status: {
              loadBalancer: {},
            },
            kind: 'Ingress',
            apiVersion: 'networking.k8s.io/v1',
          },
          url: 'http://div/minikube',
        },
      ],
      routesData: [
        {
          route: {
            metadata: {
              name: 'hello-minikube2',
              namespace: 'jai-test',
              uid: '17c0f520-3878-4834-96a1-b19854f0d06f',
              resourceVersion: '174049',
              creationTimestamp: '2023-05-22T08:14:25Z',
              labels: {
                app: 'hello-minikube2',
                'app.kubernetes.io/component': 'hello-minikube2',
                'app.kubernetes.io/instance': 'hello-minikube2',
                'app.kubernetes.io/name': 'hello-minikube2',
                'app.openshift.io/runtime': 'nodejs',
                'app.openshift.io/runtime-version': '16-ubi8',
                'backstage.io/kubernetes-id': 'backstage',
              },
              annotations: {
                'openshift.io/host.generated': 'true',
              },
            },
            spec: {
              host: 'nodejs-ex-git-jai-test.apps.viraj-22-05-2023-0.devcluster.openshift.com',
              to: {
                kind: 'Service',
                name: 'hello-minikube2',
                weight: 100,
              },
              port: {
                targetPort: '8080-tcp',
              },
              tls: {
                termination: 'edge',
                insecureEdgeTerminationPolicy: 'Redirect',
              },
              wildcardPolicy: 'None',
            },
            status: {
              ingress: [
                {
                  host: 'nodejs-ex-git-jai-test.apps.viraj-22-05-2023-0.devcluster.openshift.com',
                  routerName: 'default',
                  conditions: [
                    {
                      type: 'Admitted',
                      status: 'True',
                      lastTransitionTime: '2023-05-22T08:14:25Z',
                    },
                  ],
                  wildcardPolicy: 'None',
                  routerCanonicalHostname:
                    'router-default.apps.viraj-22-05-2023-0.devcluster.openshift.com',
                },
              ],
            },
            kind: 'Route',
          },
          url: 'https://nodejs-ex-git-jai-test.apps.viraj-22-05-2023-0.devcluster.openshift.com',
        },
      ],
    },
  },
  width: 104,
  height: 104,
};

export const cronJobWorkloadNodeData = {
  data: {
    resource: {
      metadata: {
        name: 'example-cj',
        namespace: 'div',
        uid: '9afc9c71-3870-4185-9725-ffe16b574575',
        resourceVersion: '378313',
        generation: 1,
        creationTimestamp: '2023-05-23T11:20:26Z',
        labels: {
          'backstage.io/kubernetes-id': 'nationalparks-py',
        },
      },
      spec: {
        schedule: '* * * * *',
        concurrencyPolicy: 'Allow',
        suspend: false,
        jobTemplate: {
          metadata: {
            creationTimestamp: null,
          },
          spec: {
            template: {
              metadata: {
                creationTimestamp: null,
                labels: {
                  'backstage.io/kubernetes-id': 'nationalparks-py',
                },
              },
              spec: {
                containers: [
                  {
                    name: 'hello',
                    image: 'busybox',
                    args: [
                      '/bin/sh',
                      '-c',
                      'date; echo Hello from the Kubernetes cluster',
                    ],
                    resources: {},
                    terminationMessagePath: '/dev/termination-log',
                    terminationMessagePolicy: 'File',
                    imagePullPolicy: 'Always',
                  },
                ],
                restartPolicy: 'OnFailure',
                terminationGracePeriodSeconds: 30,
                dnsPolicy: 'ClusterFirst',
                securityContext: {},
                schedulerName: 'default-scheduler',
              },
            },
          },
        },
        successfulJobsHistoryLimit: 3,
        failedJobsHistoryLimit: 1,
      },
      status: {
        lastScheduleTime: '2023-05-23T11:23:00Z',
        lastSuccessfulTime: '2023-05-23T11:23:06Z',
      },
      kind: 'CronJob',
      apiVersion: 'batch/v1',
    },
    data: {
      jobsData: [
        {
          job: {
            metadata: {
              name: 'example-cj-28080681',
              namespace: 'div',
              uid: 'a758623e-6ddd-4858-acd8-efa18b336c25',
              resourceVersion: '376354',
              generation: 1,
              creationTimestamp: '2023-05-23T11:21:00Z',
              labels: {
                'backstage.io/kubernetes-id': 'nationalparks-py',
                'controller-uid': 'a758623e-6ddd-4858-acd8-efa18b336c25',
                'job-name': 'example-cj-28080681',
              },
              annotations: {
                'batch.kubernetes.io/job-tracking': '',
              },
              ownerReferences: [
                {
                  apiVersion: 'batch/v1',
                  kind: 'CronJob',
                  name: 'example-cj',
                  uid: '9afc9c71-3870-4185-9725-ffe16b574575',
                  controller: true,
                  blockOwnerDeletion: true,
                },
              ],
            },
            spec: {
              parallelism: 1,
              completions: 1,
              backoffLimit: 6,
              selector: {
                matchLabels: {
                  'controller-uid': 'a758623e-6ddd-4858-acd8-efa18b336c25',
                },
              },
              template: {
                metadata: {
                  creationTimestamp: null,
                  labels: {
                    'backstage.io/kubernetes-id': 'nationalparks-py',
                    'controller-uid': 'a758623e-6ddd-4858-acd8-efa18b336c25',
                    'job-name': 'example-cj-28080681',
                  },
                },
                spec: {
                  containers: [
                    {
                      name: 'hello',
                      image: 'busybox',
                      args: [
                        '/bin/sh',
                        '-c',
                        'date; echo Hello from the Kubernetes cluster',
                      ],
                      resources: {},
                      terminationMessagePath: '/dev/termination-log',
                      terminationMessagePolicy: 'File',
                      imagePullPolicy: 'Always',
                    },
                  ],
                  restartPolicy: 'OnFailure',
                  terminationGracePeriodSeconds: 30,
                  dnsPolicy: 'ClusterFirst',
                  securityContext: {},
                  schedulerName: 'default-scheduler',
                },
              },
              completionMode: 'NonIndexed',
              suspend: false,
            },
            status: {
              conditions: [
                {
                  type: 'Complete',
                  status: 'True',
                  lastProbeTime: '2023-05-23T11:21:09Z',
                  lastTransitionTime: '2023-05-23T11:21:09Z',
                },
              ],
              startTime: '2023-05-23T11:21:00Z',
              completionTime: '2023-05-23T11:21:09Z',
              succeeded: 1,
              uncountedTerminatedPods: {},
              ready: 0,
            },
            kind: 'Job',
            apiVersion: 'batch/v1',
          },
          podsData: {
            pods: [
              {
                metadata: {
                  name: 'example-cj-28080681-clstf',
                  generateName: 'example-cj-28080681-',
                  namespace: 'div',
                  uid: '63fa5640-9a7e-4d85-8ab0-a83d1b11c925',
                  resourceVersion: '376353',
                  creationTimestamp: '2023-05-23T11:21:00Z',
                  labels: {
                    'backstage.io/kubernetes-id': 'nationalparks-py',
                    'controller-uid': 'a758623e-6ddd-4858-acd8-efa18b336c25',
                    'job-name': 'example-cj-28080681',
                  },
                  annotations: {
                    'k8s.ovn.org/pod-networks':
                      '{"default":{"ip_addresses":["10.129.2.93/23"],"mac_address":"0a:58:0a:81:02:5d","gateway_ips":["10.129.2.1"],"ip_address":"10.129.2.93/23","gateway_ip":"10.129.2.1"}}',
                    'k8s.v1.cni.cncf.io/network-status':
                      '[{\n    "name": "ovn-kubernetes",\n    "interface": "eth0",\n    "ips": [\n        "10.129.2.93"\n    ],\n    "mac": "0a:58:0a:81:02:5d",\n    "default": true,\n    "dns": {}\n}]',
                    'openshift.io/scc': 'restricted-v2',
                    'seccomp.security.alpha.kubernetes.io/pod':
                      'runtime/default',
                  },
                  ownerReferences: [
                    {
                      apiVersion: 'batch/v1',
                      kind: 'Job',
                      name: 'example-cj-28080681',
                      uid: 'a758623e-6ddd-4858-acd8-efa18b336c25',
                      controller: true,
                      blockOwnerDeletion: true,
                    },
                  ],
                },
                spec: {
                  volumes: [
                    {
                      name: 'kube-api-access-rzlcq',
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
                      name: 'hello',
                      image: 'busybox',
                      args: [
                        '/bin/sh',
                        '-c',
                        'date; echo Hello from the Kubernetes cluster',
                      ],
                      resources: {},
                      volumeMounts: [
                        {
                          name: 'kube-api-access-rzlcq',
                          readOnly: true,
                          mountPath:
                            '/var/run/secrets/kubernetes.io/serviceaccount',
                        },
                      ],
                      terminationMessagePath: '/dev/termination-log',
                      terminationMessagePolicy: 'File',
                      imagePullPolicy: 'Always',
                      securityContext: {
                        capabilities: {
                          drop: ['ALL'],
                        },
                        runAsUser: 1000850000,
                        runAsNonRoot: true,
                        allowPrivilegeEscalation: false,
                      },
                    },
                  ],
                  restartPolicy: 'OnFailure',
                  terminationGracePeriodSeconds: 30,
                  dnsPolicy: 'ClusterFirst',
                  serviceAccountName: 'default',
                  serviceAccount: 'default',
                  nodeName: 'ip-10-0-142-122.sa-east-1.compute.internal',
                  securityContext: {
                    seLinuxOptions: {
                      level: 's0:c29,c19',
                    },
                    fsGroup: 1000850000,
                    seccompProfile: {
                      type: 'RuntimeDefault',
                    },
                  },
                  imagePullSecrets: [
                    {
                      name: 'default-dockercfg-ngnwr',
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
                  phase: 'Succeeded',
                  conditions: [
                    {
                      type: 'Initialized',
                      status: 'True',
                      lastProbeTime: null,
                      lastTransitionTime: '2023-05-23T11:21:00Z',
                      reason: 'PodCompleted',
                    },
                    {
                      type: 'Ready',
                      status: 'False',
                      lastProbeTime: null,
                      lastTransitionTime: '2023-05-23T11:21:00Z',
                      reason: 'PodCompleted',
                    },
                    {
                      type: 'ContainersReady',
                      status: 'False',
                      lastProbeTime: null,
                      lastTransitionTime: '2023-05-23T11:21:00Z',
                      reason: 'PodCompleted',
                    },
                    {
                      type: 'PodScheduled',
                      status: 'True',
                      lastProbeTime: null,
                      lastTransitionTime: '2023-05-23T11:21:00Z',
                    },
                  ],
                  hostIP: '10.0.142.122',
                  podIP: '10.129.2.93',
                  podIPs: [
                    {
                      ip: '10.129.2.93',
                    },
                  ],
                  startTime: '2023-05-23T11:21:00Z',
                  containerStatuses: [
                    {
                      name: 'hello',
                      state: {
                        terminated: {
                          exitCode: 0,
                          reason: 'Completed',
                          startedAt: '2023-05-23T11:21:05Z',
                          finishedAt: '2023-05-23T11:21:05Z',
                          containerID:
                            'cri-o://db5fc2a895837eaa71cf4fdfc23602f9e5190140b9a7b6d30b6b8d781e99c53e',
                        },
                      },
                      lastState: {},
                      ready: false,
                      restartCount: 0,
                      image: 'docker.io/library/busybox:latest',
                      imageID:
                        'docker.io/library/busybox@sha256:560af6915bfc8d7630e50e212e08242d37b63bd5c1ccf9bd4acccf116e262d5b',
                      containerID:
                        'cri-o://db5fc2a895837eaa71cf4fdfc23602f9e5190140b9a7b6d30b6b8d781e99c53e',
                      started: false,
                    },
                  ],
                  qosClass: 'BestEffort',
                },
                kind: 'Pod',
                apiVersion: 'v1',
              },
            ],
          },
        },
      ],
    },
  },
  width: 104,
  height: 104,
};

export const tektonWorkloadNodeData = {
  ...workloadNodeData,
  data: {
    ...workloadNodeData.data,
    data: {
      ...workloadNodeData.data.data,
      pipelinesData: {
        pipelines: mockTektonResources.pipelines,
        pipelineRuns: mockTektonResources.pipelineruns,
      },
    },
  },
};

export const workloadNode = {
  getDimensions: () => ({
    width: workloadNodeData.width,
    height: workloadNodeData.height,
  }),
  getData: () => workloadNodeData.data,
};

export const workloadNode2 = {
  getDimensions: () => ({
    width: workloadNodeData.width,
    height: workloadNodeData.height,
  }),
  getData: () => ({ resource: {}, data: {} }),
};

export const workloadNode3 = {
  getDimensions: () => ({
    width: cronJobWorkloadNodeData.width,
    height: cronJobWorkloadNodeData.height,
  }),
  getData: () => cronJobWorkloadNodeData.data,
};

export const workloadNode4 = {
  getDimensions: () => ({
    width: cronJobWorkloadNodeData.width,
    height: cronJobWorkloadNodeData.height,
  }),
  getData: () => ({
    resource: cronJobWorkloadNodeData.data.resource,
    data: {},
  }),
};

export const workloadNode5 = {
  getDimensions: () => ({
    width: workloadNodeData.width,
    height: workloadNodeData.height,
  }),
  getData: () => ({
    resource: { ...workloadNodeData.data.resource },
    data: {
      ...workloadNodeData.data.data,
      podsData: {
        ...workloadNodeData.data.data.podsData,
        pods: mockKubernetesResponse.pods,
      },
    },
  }),
};

export const workloadNodeWtknRes = {
  getDimensions: () => ({
    width: workloadNodeData.width,
    height: workloadNodeData.height,
  }),
  getData: () => tektonWorkloadNodeData.data,
};

export const workloadNodeWtknRes2 = {
  getDimensions: () => ({
    width: workloadNodeData.width,
    height: workloadNodeData.height,
  }),
  getData: () => ({
    resource: { ...tektonWorkloadNodeData.data.resource },
    data: {
      ...tektonWorkloadNodeData.data.data,
      pipelinesData: {
        ...tektonWorkloadNodeData.data.data.pipelinesData,
        pipelineRuns: [
          ...tektonWorkloadNodeData.data.data.pipelinesData.pipelineRuns,
          {
            apiVersion: 'tekton.dev/v1',
            kind: 'PipelineRun',
            metadata: {
              annotations: {
                'pipeline.openshift.io/started-by': 'kube:admin',
              },
              creationTimestamp: new Date('2023-03-30T07:05:04Z'),
              generation: 1,
              labels: {
                'app.kubernetes.io/instance': 'test-deployment',
                'app.kubernetes.io/name': 'test-deployment',
                'backstage.io/kubernetes-id': 'backstage',
                'operator.tekton.dev/operand-name':
                  'openshift-pipelines-addons',
                'pipeline.openshift.io/runtime': 'ruby',
                'pipeline.openshift.io/runtime-version': '3.0-ubi7',
                'pipeline.openshift.io/type': 'kubernetes',
                'tekton.dev/pipeline': 'test-deployment',
              },
              name: 'test-deployment-xf45fp',
              namespace: 'jai-test',
              resourceVersion: '87613',
              uid: 'b7584993-146c-4d4d-ba39-8619237e940b',
            },
            spec: {
              params: [],
              pipelineRef: {
                name: 'test-deployment',
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
                  message:
                    'Tasks Completed: 3 (Failed: 0, Cancelled 0), Skipped: 0',
                  reason: 'Succeeded',
                  status: 'True',
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
              taskRuns: {
                'ruby-ex-git-xf45fo-build': {
                  pipelineTaskName: 'build',
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
                          script: 'echo hi',
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
                          script: 'echo hi',
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
                'ruby-ex-git-xf45fo-deploy': {
                  pipelineTaskName: 'deploy',
                  status: {
                    completionTime: '2023-03-30T07:05:13Z',
                    conditions: [
                      {
                        lastTransitionTime: '2023-03-30T07:05:13Z',
                        message: 'All Steps have completed executing',
                        reason: 'Succeeded',
                        status: 'Unknown',
                        type: 'Succeeded',
                      },
                    ],
                    podName: 'ruby-ex-git-xf45fo-deploy-pod',
                    startTime: '2023-03-30T07:04:55Z',
                    steps: [
                      {
                        container: 'step-oc',
                        imageID:
                          'image-registry.openshift-image-registry.svc:5000/openshift/cli@sha256:e2f0217ba0ea40703b104c1a70e8ecbcc6ba997041fff68467214f5ba87b52b6',
                        name: 'oc',
                        terminated: {
                          containerID:
                            'cri-o://1cf6af84b780655695cfba670fb8a6dad774667925eda98eda6e8f0400ef1723',
                          exitCode: 0,
                          finishedAt: '2023-03-30T07:05:12Z',
                          reason: 'Completed',
                          startedAt: '2023-03-30T07:05:02Z',
                        },
                      },
                    ],
                    taskSpec: {
                      description:
                        'This task runs commands against the cluster provided by user and if not provided then where the Task is being executed.\nOpenShift is a Kubernetes distribution from Red Hat which provides oc, the OpenShift CLI that complements kubectl for simplifying deployment and configuration applications on OpenShift.',
                      params: [],
                      steps: [
                        {
                          env: [],
                          image:
                            'image-registry.openshift-image-registry.svc:5000/openshift/cli:latest',
                          name: 'oc',
                          resources: {},
                          script: 'echo hi',
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
                'ruby-ex-git-xf45fo-fetch-repository': {
                  pipelineTaskName: 'fetch-repository',
                  status: {
                    completionTime: '2023-03-30T07:03:20Z',
                    conditions: [
                      {
                        lastTransitionTime: '2023-03-30T07:03:20Z',
                        message: 'All Steps have completed executing',
                        reason: 'Succeeded',
                        status: 'Unknown',
                        type: 'Succeeded',
                      },
                    ],
                    podName: 'ruby-ex-git-xf45fo-fetch-repository-pod',
                    startTime: '2023-03-30T07:03:05Z',
                    steps: [
                      {
                        container: 'step-clone',
                        imageID:
                          'registry.redhat.io/openshift-pipelines/pipelines-git-init-rhel8@sha256:6c3980b3d28c8fb92b17466f5654d5f484ab893f1673ec8f29e49c0d03f8aca9',
                        name: 'clone',
                        terminated: {
                          containerID:
                            'cri-o://8937c0bc0cd043d09395b85bffee7010624f26d5345141ff988b618a60027e48',
                          exitCode: 0,
                          finishedAt: '2023-03-30T07:03:20Z',
                          message:
                            '[{"key":"commit","value":"01effef3a23935c1a83110d4b074b0738d677c44","type":1},{"key":"url","value":"https://github.com/sclorg/ruby-ex.git","type":1}]',
                          reason: 'Completed',
                          startedAt: '2023-03-30T07:03:20Z',
                        },
                      },
                    ],
                    taskResults: [
                      {
                        name: 'commit',
                        type: 'string',
                        value: '01effef3a23935c1a83110d4b074b0738d677c44',
                      },
                      {
                        name: 'url',
                        type: 'string',
                        value: 'https://github.com/sclorg/ruby-ex.git',
                      },
                    ],
                    taskSpec: {
                      description:
                        "These Tasks are Git tasks to work with repositories used by other tasks in your Pipeline.\nThe git-clone Task will clone a repo from the provided url into the output Workspace. By default the repo will be cloned into the root of your Workspace. You can clone into a subdirectory by setting this Task's subdirectory param. This Task also supports sparse checkouts. To perform a sparse checkout, pass a list of comma separated directory patterns to this Task's sparseCheckoutDirectories param.",
                      params: [
                        {
                          description: 'Repository URL to clone from.',
                          name: 'url',
                        },
                        {
                          default: '',
                          description:
                            'Revision to checkout. (branch, tag, sha, ref, etc...)',
                          name: 'revision',
                        },
                        {
                          default: '',
                          description:
                            'Refspec to fetch before checking out revision.',
                          name: 'refspec',
                        },
                        {
                          default: 'true',
                          description: 'Initialize and fetch git submodules.',
                          name: 'submodules',
                        },
                        {
                          default: '1',
                          description:
                            'Perform a shallow clone, fetching only the most recent N commits.',
                          name: 'depth',
                        },
                        {
                          default: 'true',
                          description:
                            'Set the `http.sslVerify` global git config. Setting this to `false` is not advised unless you are sure that you trust your git remote.',
                          name: 'sslVerify',
                        },
                        {
                          default: 'ca-bundle.crt',
                          description:
                            'file name of mounted crt using ssl-ca-directory workspace. default value is ca-bundle.crt.',
                          name: 'crtFileName',
                        },
                        {
                          default: '',
                          description:
                            'Subdirectory inside the `output` Workspace to clone the repo into.',
                          name: 'subdirectory',
                        },
                        {
                          default: '',
                          description:
                            'Define the directory patterns to match or exclude when performing a sparse checkout.',
                          name: 'sparseCheckoutDirectories',
                        },
                        {
                          default: 'true',
                          description:
                            'Clean out the contents of the destination directory if it already exists before cloning.',
                          name: 'deleteExisting',
                        },
                        {
                          default: '',
                          description:
                            'HTTP proxy server for non-SSL requests.',
                          name: 'httpProxy',
                        },
                        {
                          default: '',
                          description: 'HTTPS proxy server for SSL requests.',
                          name: 'httpsProxy',
                        },
                        {
                          default: '',
                          description:
                            'Opt out of proxying HTTP/HTTPS requests.',
                          name: 'noProxy',
                        },
                        {
                          default: 'true',
                          description:
                            "Log the commands that are executed during `git-clone`'s operation.",
                          name: 'verbose',
                        },
                        {
                          default:
                            'registry.redhat.io/openshift-pipelines/pipelines-git-init-rhel8@sha256:6c3980b3d28c8fb92b17466f5654d5f484ab893f1673ec8f29e49c0d03f8aca9',
                          description:
                            'The image providing the git-init binary that this Task runs.',
                          name: 'gitInitImage',
                        },
                        {
                          default: '/tekton/home',
                          description:
                            "Absolute path to the user's home directory.\n",
                          name: 'userHome',
                        },
                      ],
                      results: [
                        {
                          description:
                            'The precise commit SHA that was fetched by this Task.',
                          name: 'commit',
                          type: 'string',
                        },
                        {
                          description:
                            'The precise URL that was fetched by this Task.',
                          name: 'url',
                          type: 'string',
                        },
                      ],
                      steps: [
                        {
                          env: [],
                          image:
                            'registry.redhat.io/openshift-pipelines/pipelines-git-init-rhel8@sha256:6c3980b3d28c8fb92b17466f5654d5f484ab893f1673ec8f29e49c0d03f8aca9',
                          name: 'clone',
                          resources: {},
                          script: 'echo hi',
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
              },
            },
          },
          {
            apiVersion: 'tekton.dev/v1',
            kind: 'PipelineRun',
            metadata: {
              annotations: {
                'pipeline.openshift.io/started-by': 'kube-admin',
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
              name: 'pipeline-test-wbvtlq',
              namespace: 'deb-test',
              resourceVersion: '117337',
              uid: '0a091bbf-3813-48d3-a6ce-fc43644a9b24',
              creationTimestamp: new Date('2023-03-30T07:06:04Z'),
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
                  message:
                    'Tasks Completed: 4 (Failed: 3, Cancelled 0), Skipped: 0',
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
                taskRuns: {
                  'pipeline-test-wbvtlk-argocd-task-sync-and-wait': {
                    pipelineTaskName: 'argocd-task-sync-and-wait',
                    status: {
                      conditions: [
                        {
                          lastTransitionTime: '2023-04-11T06:48:55Z',
                          message: 'Failed to create pod due to config error',
                          reason: 'CreateContainerConfigError',
                          status: 'False',
                          type: 'Succeeded',
                        },
                      ],
                      podName:
                        'pipeline-test-wbvtlk-argocd-task-sync-and-wait-pod',
                      startTime: '2023-04-11T06:48:51Z',
                      steps: [
                        {
                          container: 'step-login',
                          name: 'login',
                          waiting: {
                            message:
                              'configmap "argocd-env-configmap" not found',
                            reason: 'CreateContainerConfigError',
                          },
                        },
                      ],
                      taskSpec: {
                        description:
                          'This task syncs (deploys) an Argo CD application and waits for it to be healthy.\nTo do so, it requires the address of the Argo CD server and some form of authentication either a username/password or an authentication token.',
                        params: [],
                        stepTemplate: {
                          envFrom: [
                            {
                              configMapRef: {
                                name: 'argocd-env-configmap',
                              },
                            },
                            {
                              secretRef: {
                                name: 'argocd-env-secret',
                              },
                            },
                          ],
                          name: '',
                          resources: {},
                        },
                        steps: [
                          {
                            image: 'quay.io/argoproj/argocd:v2.2.2',
                            name: 'login',
                            resources: {},
                            script:
                              'if [ -z "$ARGOCD_AUTH_TOKEN" ]; then\n  yes | argocd login "$ARGOCD_SERVER" --username="$ARGOCD_USERNAME" --password="$ARGOCD_PASSWORD";\nfi\nargocd app sync "dw" --revision "HEAD" "--"\nargocd app wait "dw" --health "--"\n',
                          },
                        ],
                      },
                      reason: 'Cancelled',
                    },
                  },
                  'pipeline-test-wbvtlk-buildah': {
                    pipelineTaskName: 'buildah',
                    status: {
                      completionTime: '2023-04-11T06:48:58Z',
                      conditions: [
                        {
                          lastTransitionTime: '2023-04-11T06:48:58Z',
                          message:
                            '"step-build-and-push" exited with code 125 (image: "registry.redhat.io/rhel8/buildah@sha256:7678ad61e06e442b0093ab73faa73ce536721ae523015dd942f9196c4699a31d"); for logs run: kubectl -n deb-test logs pipeline-test-wbvtlk-buildah-pod -c step-build-and-push\n',
                          reason: 'Failed',
                          status: 'False',
                          type: 'Succeeded',
                        },
                      ],
                      podName: 'pipeline-test-wbvtlk-buildah-pod',
                      startTime: '2023-04-11T06:48:50Z',
                      steps: [
                        {
                          container: 'step-build-and-push',
                          imageID:
                            'registry.redhat.io/rhel8/buildah@sha256:7678ad61e06e442b0093ab73faa73ce536721ae523015dd942f9196c4699a31d',
                          name: 'build-and-push',
                          terminated: {
                            containerID:
                              'cri-o://42a5bb291a4cebe89ced1d95daf1aeb54873ec4f4203259ab94d5124fe3b01d0',
                            exitCode: 125,
                            finishedAt: '2023-04-11T06:48:57Z',
                            reason: 'Error',
                            startedAt: '2023-04-11T06:48:57Z',
                          },
                        },
                      ],
                      taskSpec: {
                        description:
                          "Buildah task builds source into a container image and then pushes it to a container registry.\nBuildah Task builds source into a container image using Project Atomic's Buildah build tool.It uses Buildah's support for building from Dockerfiles, using its buildah bud command.This command executes the directives in the Dockerfile to assemble a container image, then pushes that image to a container registry.",
                        params: [],
                        results: [
                          {
                            description: 'Digest of the image just built.',
                            name: 'IMAGE_DIGEST',
                            type: 'string',
                          },
                          {
                            description:
                              'Image repository where the built image would be pushed to',
                            name: 'IMAGE_URL',
                            type: 'string',
                          },
                        ],
                        steps: [
                          {
                            image:
                              'registry.redhat.io/rhel8/buildah@sha256:ac0b8714cc260c94435cab46fe41b3de0ccbc3d93e38c395fa9d52ac49e521fe',
                            name: 'build-and-push',
                            resources: {},
                            script:
                              'buildah --storage-driver=vfs bud \\\n   --format=oci \\\n  --tls-verify=true --no-cache \\\n  -f ./Dockerfile -t openshift/hello-openshift .\n\n[[ "false" == "true" ]] && echo "Push skipped" && exit 0\n\nif [[ "true" == "true" ]]; then\n\n  # if config.json exists at workspace root, we use that\n  if test -f "/workspace/dockerconfig/config.json"; then\n    export DOCKER_CONFIG="/workspace/dockerconfig"\n\n  # else we look for .dockerconfigjson at the root\n  elif test -f "/workspace/dockerconfig/.dockerconfigjson"; then\n    cp "/workspace/dockerconfig/.dockerconfigjson" "$HOME/.docker/config.json"\n    export DOCKER_CONFIG="$HOME/.docker"\n\n  # need to error out if neither files are present\n  else\n    echo "neither \'config.json\' nor \'.dockerconfigjson\' found at workspace root"\n    exit 1\n  fi\nfi\n\nbuildah --storage-driver=vfs push \\\n   --tls-verify=true \\\n  --digestfile /tmp/image-digest openshift/hello-openshift \\\n  docker://openshift/hello-openshift\ncat /tmp/image-digest | tee /tekton/results/IMAGE_DIGEST\necho "openshift/hello-openshift" | tee /tekton/results/IMAGE_URL\n',
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
                            ],
                            workingDir: '/workspace/source',
                          },
                        ],
                        volumes: [
                          {
                            emptyDir: {},
                            name: 'varlibcontainers',
                          },
                        ],
                        workspaces: [],
                      },
                    },
                  },
                  'pipeline-test-wbvtlk-git-clone': {
                    pipelineTaskName: 'git-clone',
                    status: {
                      completionTime: '2023-04-11T06:49:05Z',
                      conditions: [
                        {
                          lastTransitionTime: '2023-04-11T06:49:05Z',
                          message:
                            '"step-clone" exited with code 1 (image: "registry.redhat.io/openshift-pipelines/pipelines-git-init-rhel8@sha256:6c3980b3d28c8fb92b17466f5654d5f484ab893f1673ec8f29e49c0d03f8aca9"); for logs run: kubectl -n deb-test logs pipeline-test-wbvtlk-git-clone-pod -c step-clone\n',
                          reason: 'Failed',
                          status: 'False',
                          type: 'Succeeded',
                        },
                      ],
                      podName: 'pipeline-test-wbvtlk-git-clone-pod',
                      startTime: '2023-04-11T06:48:58Z',
                      steps: [
                        {
                          container: 'step-clone',
                          imageID:
                            'registry.redhat.io/openshift-pipelines/pipelines-git-init-rhel8@sha256:6c3980b3d28c8fb92b17466f5654d5f484ab893f1673ec8f29e49c0d03f8aca9',
                          name: 'clone',
                          terminated: {
                            containerID:
                              'cri-o://b727febb4b981471a5729cf6002d59d31673d25280192e7dc0ea09de113743dd',
                            exitCode: 1,
                            finishedAt: '2023-04-11T06:49:04Z',
                            reason: 'Error',
                            startedAt: '2023-04-11T06:49:04Z',
                          },
                        },
                      ],
                      taskSpec: {
                        description:
                          "These Tasks are Git tasks to work with repositories used by other tasks in your Pipeline.\nThe git-clone Task will clone a repo from the provided url into the output Workspace. By default the repo will be cloned into the root of your Workspace. You can clone into a subdirectory by setting this Task's subdirectory param. This Task also supports sparse checkouts. To perform a sparse checkout, pass a list of comma separated directory patterns to this Task's sparseCheckoutDirectories param.",
                        params: [],
                        results: [
                          {
                            description:
                              'The precise commit SHA that was fetched by this Task.',
                            name: 'commit',
                            type: 'string',
                          },
                          {
                            description:
                              'The precise URL that was fetched by this Task.',
                            name: 'url',
                            type: 'string',
                          },
                        ],
                        steps: [
                          {
                            env: [
                              {
                                name: 'HOME',
                                value: '/tekton/home',
                              },
                              {
                                name: 'PARAM_URL',
                                value: 'https://xyz',
                              },
                              {
                                name: 'PARAM_REVISION',
                              },
                              {
                                name: 'PARAM_REFSPEC',
                              },
                              {
                                name: 'PARAM_SUBMODULES',
                                value: 'true',
                              },
                              {
                                name: 'PARAM_DEPTH',
                                value: '1',
                              },
                              {
                                name: 'PARAM_SSL_VERIFY',
                                value: 'true',
                              },
                              {
                                name: 'PARAM_CRT_FILENAME',
                                value: 'ca-bundle.crt',
                              },
                              {
                                name: 'PARAM_SUBDIRECTORY',
                              },
                              {
                                name: 'PARAM_DELETE_EXISTING',
                                value: 'true',
                              },
                              {
                                name: 'PARAM_HTTP_PROXY',
                              },
                              {
                                name: 'PARAM_HTTPS_PROXY',
                              },
                              {
                                name: 'PARAM_NO_PROXY',
                              },
                              {
                                name: 'PARAM_VERBOSE',
                                value: 'true',
                              },
                              {
                                name: 'PARAM_SPARSE_CHECKOUT_DIRECTORIES',
                              },
                              {
                                name: 'PARAM_USER_HOME',
                                value: '/tekton/home',
                              },
                              {
                                name: 'WORKSPACE_OUTPUT_PATH',
                                value: '/workspace/output',
                              },
                              {
                                name: 'WORKSPACE_SSH_DIRECTORY_BOUND',
                                value: 'false',
                              },
                              {
                                name: 'WORKSPACE_SSH_DIRECTORY_PATH',
                              },
                              {
                                name: 'WORKSPACE_BASIC_AUTH_DIRECTORY_BOUND',
                                value: 'false',
                              },
                              {
                                name: 'WORKSPACE_BASIC_AUTH_DIRECTORY_PATH',
                              },
                              {
                                name: 'WORKSPACE_SSL_CA_DIRECTORY_BOUND',
                                value: 'false',
                              },
                              {
                                name: 'WORKSPACE_SSL_CA_DIRECTORY_PATH',
                              },
                            ],
                            image:
                              'registry.redhat.io/openshift-pipelines/pipelines-git-init-rhel8@sha256:6c3980b3d28c8fb92b17466f5654d5f484ab893f1673ec8f29e49c0d03f8aca9',
                            name: 'clone',
                            resources: {},
                            script:
                              '#!/usr/bin/env sh\nset -eu\n\nif [ "${PARAM_VERBOSE}" = "true" ] ; then\n  set -x\nfi\n\n\nif [ "${WORKSPACE_BASIC_AUTH_DIRECTORY_BOUND}" = "true" ] ; then\n  cp "${WORKSPACE_BASIC_AUTH_DIRECTORY_PATH}/.git-credentials" "${PARAM_USER_HOME}/.git-credentials"\n  cp "${WORKSPACE_BASIC_AUTH_DIRECTORY_PATH}/.gitconfig" "${PARAM_USER_HOME}/.gitconfig"\n  chmod 400 "${PARAM_USER_HOME}/.git-credentials"\n  chmod 400 "${PARAM_USER_HOME}/.gitconfig"\nfi\n\nif [ "${WORKSPACE_SSH_DIRECTORY_BOUND}" = "true" ] ; then\n  cp -R "${WORKSPACE_SSH_DIRECTORY_PATH}" "${PARAM_USER_HOME}"/.ssh\n  chmod 700 "${PARAM_USER_HOME}"/.ssh\n  chmod -R 400 "${PARAM_USER_HOME}"/.ssh/*\nfi\n\nif [ "${WORKSPACE_SSL_CA_DIRECTORY_BOUND}" = "true" ] ; then\n   export GIT_SSL_CAPATH="${WORKSPACE_SSL_CA_DIRECTORY_PATH}"\n   if [ "${PARAM_CRT_FILENAME}" != "" ] ; then\n      export GIT_SSL_CAINFO="${WORKSPACE_SSL_CA_DIRECTORY_PATH}/${PARAM_CRT_FILENAME}"\n   fi\nfi\nCHECKOUT_DIR="${WORKSPACE_OUTPUT_PATH}/${PARAM_SUBDIRECTORY}"\n\ncleandir() {\n  # Delete any existing contents of the repo directory if it exists.\n  #\n  # We don\'t just "rm -rf ${CHECKOUT_DIR}" because ${CHECKOUT_DIR} might be "/"\n  # or the root of a mounted volume.\n  if [ -d "${CHECKOUT_DIR}" ] ; then\n    # Delete non-hidden files and directories\n    rm -rf "${CHECKOUT_DIR:?}"/*\n    # Delete files and directories starting with . but excluding ..\n    rm -rf "${CHECKOUT_DIR}"/.[!.]*\n    # Delete files and directories starting with .. plus any other character\n    rm -rf "${CHECKOUT_DIR}"/..?*\n  fi\n}\n\nif [ "${PARAM_DELETE_EXISTING}" = "true" ] ; then\n  cleandir\nfi\n\ntest -z "${PARAM_HTTP_PROXY}" || export HTTP_PROXY="${PARAM_HTTP_PROXY}"\ntest -z "${PARAM_HTTPS_PROXY}" || export HTTPS_PROXY="${PARAM_HTTPS_PROXY}"\ntest -z "${PARAM_NO_PROXY}" || export NO_PROXY="${PARAM_NO_PROXY}"\n\n/ko-app/git-init \\\n  -url="${PARAM_URL}" \\\n  -revision="${PARAM_REVISION}" \\\n  -refspec="${PARAM_REFSPEC}" \\\n  -path="${CHECKOUT_DIR}" \\\n  -sslVerify="${PARAM_SSL_VERIFY}" \\\n  -submodules="${PARAM_SUBMODULES}" \\\n  -depth="${PARAM_DEPTH}" \\\n  -sparseCheckoutDirectories="${PARAM_SPARSE_CHECKOUT_DIRECTORIES}"\ncd "${CHECKOUT_DIR}"\nRESULT_SHA="$(git rev-parse HEAD)"\nEXIT_CODE="$?"\nif [ "${EXIT_CODE}" != 0 ] ; then\n  exit "${EXIT_CODE}"\nfi\nprintf "%s" "${RESULT_SHA}" > "/tekton/results/commit"\nprintf "%s" "${PARAM_URL}" > "/tekton/results/url"\n',
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
                  'pipeline-test-wbvtlk-tkn': {
                    pipelineTaskName: 'tkn',
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
                            env: [
                              {
                                name: 'HOME',
                                value: '/tekton/home',
                              },
                            ],
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
                },
              },
            },
          },
        ],
      },
    },
  }),
};
