import { ArgoResources } from '../../src/types/resources';

export const mockArgoResources: ArgoResources = {
  pods: [],
  replicasets: [
    {
      metadata: {
        name: 'canary-rollout-analysis-5956ffbf8b',
        uid: 'b5951ebf-135e-4eb8-9e47-0c4684028c56',
        creationTimestamp: new Date('2024-08-28T06:05:11Z'),
        labels: {
          app: 'canary-rollout-analysis',
          'app.kubernetes.io/instance': 'quarkus-app',
        },
        annotations: {
          'rollout.argoproj.io/desired-replicas': '4',
          'rollout.argoproj.io/revision': '25',
          'rollout.argoproj.io/revision-history': '9,11,13,15,17,19,21,23',
        },
        ownerReferences: [
          {
            apiVersion: 'argoproj.io/v1alpha1',
            kind: 'Rollout',
            name: 'canary-rollout-analysis',
            uid: '96e8224d-d24b-4efa-bc7a-00907ad0e759',
          },
        ],
      },
      spec: {
        replicas: 0,
        selector: {
          matchLabels: {
            app: 'canary-rollout-analysis',
            'app.kubernetes.io/instance': 'quarkus-app',
          },
        },
        template: {
          metadata: {
            labels: {
              app: 'canary-rollout-analysis',
              'app.kubernetes.io/instance': 'quarkus-app',
            },
          },
          spec: {
            containers: [
              {
                name: 'rollouts-demo',
                image: 'argoproj/rollouts-demo:yellow',
                ports: [
                  {
                    containerPort: 8080,
                    protocol: 'TCP',
                  },
                ],
                resources: {},
                terminationMessagePath: '/dev/termination-log',
                terminationMessagePolicy: 'File',
                imagePullPolicy: 'Always',
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
        replicas: 0,
      },
    },
    {
      metadata: {
        name: 'canary-rollout-analysis-79cd8675b9',
        uid: '4603fa0e-a0a9-41e0-8cd6-5ec4dc17e6f8',
        creationTimestamp: new Date('2024-08-28T13:32:37Z'),
        labels: {
          app: 'canary-rollout-analysis',
          'app.kubernetes.io/instance': 'quarkus-app',
        },
        annotations: {
          'rollout.argoproj.io/revision': '27',
        },
        ownerReferences: [
          {
            apiVersion: 'argoproj.io/v1alpha1',
            kind: 'Rollout',
            name: 'canary-rollout-analysis',
            uid: '96e8224d-d24b-4efa-bc7a-00907ad0e759',
          },
        ],
      },
      spec: {
        replicas: 0,
        selector: {
          matchLabels: {
            app: 'canary-rollout-analysis',
            'app.kubernetes.io/instance': 'quarkus-app',
          },
        },
        template: {
          metadata: {
            labels: {
              app: 'canary-rollout-analysis',
              'app.kubernetes.io/instance': 'quarkus-app',
            },
          },
          spec: {
            containers: [
              {
                name: 'rollouts-demo',
                image: 'argoproj/rollouts-demo:blue',
                ports: [
                  {
                    containerPort: 8080,
                    protocol: 'TCP',
                  },
                ],
                resources: {},
                terminationMessagePath: '/dev/termination-log',
                terminationMessagePolicy: 'File',
                imagePullPolicy: 'Always',
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
        replicas: 0,
      },
    },
    {
      metadata: {
        name: 'canary-rollout-analysis-bf75cd5bb',
        uid: '56958664-cadc-46e4-9840-ba5d1d4cac57',
        creationTimestamp: new Date('2024-08-28T15:13:54Z'),
        labels: {
          app: 'canary-rollout-analysis',
          'app.kubernetes.io/instance': 'quarkus-app',
        },
        annotations: {
          'rollout.argoproj.io/revision': '28',
        },
        ownerReferences: [
          {
            apiVersion: 'argoproj.io/v1alpha1',
            kind: 'Rollout',
            name: 'canary-rollout-analysis',
            uid: '96e8224d-d24b-4efa-bc7a-00907ad0e759',
          },
        ],
      },
      spec: {
        replicas: 4,
        selector: {
          matchLabels: {
            app: 'canary-rollout-analysis',
            'app.kubernetes.io/instance': 'quarkus-app',
          },
        },
        template: {
          metadata: {
            labels: {
              app: 'canary-rollout-analysis',
              'app.kubernetes.io/instance': 'quarkus-app',
            },
          },
          spec: {
            containers: [
              {
                name: 'rollouts-demo',
                image: 'argoproj/rollouts-demo:red',
                ports: [
                  {
                    containerPort: 8080,
                    protocol: 'TCP',
                  },
                ],
                resources: {},
                terminationMessagePath: '/dev/termination-log',
                terminationMessagePolicy: 'File',
                imagePullPolicy: 'Always',
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
        replicas: 4,
        fullyLabeledReplicas: 4,
        readyReplicas: 4,
        availableReplicas: 4,
      },
    },
    {
      metadata: {
        name: 'rollout-bluegreen-7479659dfb',
        uid: '1b898450-9bef-406c-93a5-b57ff9c5faca',
        creationTimestamp: new Date('2024-08-28T16:19:22Z'),
        labels: {
          app: 'rollout-bluegreen',
          'app.kubernetes.io/instance': 'quarkus-app',
        },
        annotations: {
          'rollout.argoproj.io/revision': '1',
        },
        ownerReferences: [
          {
            apiVersion: 'argoproj.io/v1alpha1',
            kind: 'Rollout',
            name: 'rollout-bluegreen',
            uid: 'ced6c8ca-389e-4a90-9815-156d23d3a323',
          },
        ],
      },
      spec: {
        replicas: 2,
        selector: {
          matchLabels: {
            app: 'rollout-bluegreen',
            'app.kubernetes.io/instance': 'quarkus-app',
          },
        },
        template: {
          metadata: {
            labels: {
              app: 'rollout-bluegreen',
              'app.kubernetes.io/instance': 'quarkus-app',
            },
          },
          spec: {
            containers: [
              {
                name: 'rollouts-demo',
                image: 'argoproj/rollouts-demo:blue',
                ports: [
                  {
                    containerPort: 8080,
                    protocol: 'TCP',
                  },
                ],
                resources: {},
                terminationMessagePath: '/dev/termination-log',
                terminationMessagePolicy: 'File',
                imagePullPolicy: 'Always',
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
        replicas: 2,
        fullyLabeledReplicas: 2,
        readyReplicas: 2,
        availableReplicas: 2,
      },
    },
  ],
  analysisruns: [
    {
      apiVersion: 'argoproj.io/v1alpha1',
      kind: 'AnalysisRun',
      metadata: {
        annotations: {
          'rollout.argoproj.io/revision': '25',
        },
        creationTimestamp: new Date('2024-08-28T09:35:10Z'),
        labels: {
          app: 'canary-rollout-analysis',
          'app.kubernetes.io/instance': 'quarkus-app',
          'rollout-type': 'Step',
          'step-index': '1',
        },
        name: 'canary-rollout-analysis-5956ffbf8b-25-1',
        ownerReferences: [
          {
            apiVersion: 'argoproj.io/v1alpha1',

            kind: 'Rollout',
            name: 'canary-rollout-analysis',
            uid: '96e8224d-d24b-4efa-bc7a-00907ad0e759',
          },
        ],
        uid: 'bf23446d-bb3a-4a44-b9fb-e629df2f6724',
      },
      spec: {
        metrics: [
          {
            count: 2,
            failureLimit: 1,
            interval: '5s',
            name: 'random-fail',
            provider: {
              job: {
                metadata: {},
                spec: {
                  backoffLimit: 0,
                  template: {
                    metadata: {},
                    spec: {
                      containers: [
                        {
                          args: ['FLIP=$(($(($RANDOM%10))%2)) && exit $FLIP'],
                          command: ['sh', '-c'],
                          image: 'alpine:3.8',
                          name: 'sleep',
                          resources: {},
                        },
                      ],
                      restartPolicy: 'Never',
                    },
                  },
                },
              },
            },
          },
          {
            count: 1,
            failureLimit: 1,
            interval: '5s',
            name: 'pass',
            provider: {
              job: {
                metadata: {},
                spec: {
                  backoffLimit: 0,
                  template: {
                    metadata: {},
                    spec: {
                      containers: [
                        {
                          args: ['exit 0'],
                          command: ['sh', '-c'],
                          image: 'alpine:3.8',
                          name: 'sleep',
                          resources: {},
                        },
                      ],
                      restartPolicy: 'Never',
                    },
                  },
                },
              },
            },
          },
        ],
      },
      status: {
        dryRunSummary: {},
        message:
          'Metric "random-fail" assessed Failed due to failed (2) > failureLimit (1)',
        metricResults: [
          {
            count: 2,
            failed: 2,
            measurements: [
              {
                finishedAt: '2024-08-28T09:35:14Z',
                metadata: {
                  'job-name':
                    'bf23446d-bb3a-4a44-b9fb-e629df2f6724.random-fail.1',
                },
                phase: 'Failed',
                startedAt: '2024-08-28T09:35:10Z',
              },
              {
                finishedAt: '2024-08-28T09:35:22Z',
                metadata: {
                  'job-name':
                    'bf23446d-bb3a-4a44-b9fb-e629df2f6724.random-fail.2',
                },
                phase: 'Failed',
                startedAt: '2024-08-28T09:35:19Z',
              },
            ],
            name: 'random-fail',
            phase: 'Failed',
          },
          {
            count: 1,
            measurements: [
              {
                finishedAt: '2024-08-28T09:35:15Z',
                metadata: {
                  'job-name': 'bf23446d-bb3a-4a44-b9fb-e629df2f6724.pass.1',
                },
                phase: 'Successful',
                startedAt: '2024-08-28T09:35:10Z',
              },
            ],
            name: 'pass',
            phase: 'Successful',
            successful: 1,
          },
        ],
        phase: 'Failed',
        runSummary: {
          count: 2,
          failed: 1,
          successful: 1,
        },
        startedAt: '2024-08-28T09:35:10Z',
      },
    },
    {
      apiVersion: 'argoproj.io/v1alpha1',
      kind: 'AnalysisRun',
      metadata: {
        annotations: {
          'rollout.argoproj.io/revision': '25',
        },
        creationTimestamp: new Date('2024-08-28T09:36:00Z'),
        labels: {
          app: 'canary-rollout-analysis',
          'app.kubernetes.io/instance': 'quarkus-app',
          'rollout-type': 'Step',
          'step-index': '1',
        },
        name: 'canary-rollout-analysis-5956ffbf8b-25-1.1',
        ownerReferences: [
          {
            apiVersion: 'argoproj.io/v1alpha1',

            kind: 'Rollout',
            name: 'canary-rollout-analysis',
            uid: '96e8224d-d24b-4efa-bc7a-00907ad0e759',
          },
        ],
        uid: '601c437f-5e71-4fe1-a849-f4bca2608563',
      },
      spec: {
        metrics: [
          {
            count: 2,
            failureLimit: 1,
            interval: '5s',
            name: 'random-fail',
            provider: {
              job: {
                metadata: {},
                spec: {
                  backoffLimit: 0,
                  template: {
                    metadata: {},
                    spec: {
                      containers: [
                        {
                          args: ['FLIP=$(($(($RANDOM%10))%2)) && exit $FLIP'],
                          command: ['sh', '-c'],
                          image: 'alpine:3.8',
                          name: 'sleep',
                          resources: {},
                        },
                      ],
                      restartPolicy: 'Never',
                    },
                  },
                },
              },
            },
          },
          {
            count: 1,
            failureLimit: 1,
            interval: '5s',
            name: 'pass',
            provider: {
              job: {
                metadata: {},
                spec: {
                  backoffLimit: 0,
                  template: {
                    metadata: {},
                    spec: {
                      containers: [
                        {
                          args: ['exit 0'],
                          command: ['sh', '-c'],
                          image: 'alpine:3.8',
                          name: 'sleep',
                          resources: {},
                        },
                      ],
                      restartPolicy: 'Never',
                    },
                  },
                },
              },
            },
          },
        ],
      },
      status: {
        dryRunSummary: {},
        message:
          'Metric "random-fail" assessed Failed due to failed (2) > failureLimit (1)',
        metricResults: [
          {
            count: 1,
            measurements: [
              {
                finishedAt: '2024-08-28T09:36:04Z',
                metadata: {
                  'job-name': '601c437f-5e71-4fe1-a849-f4bca2608563.pass.1',
                },
                phase: 'Successful',
                startedAt: '2024-08-28T09:36:00Z',
              },
            ],
            name: 'pass',
            phase: 'Successful',
            successful: 1,
          },
          {
            count: 2,
            failed: 2,
            measurements: [
              {
                finishedAt: '2024-08-28T09:36:03Z',
                metadata: {
                  'job-name':
                    '601c437f-5e71-4fe1-a849-f4bca2608563.random-fail.1',
                },
                phase: 'Failed',
                startedAt: '2024-08-28T09:36:00Z',
              },
              {
                finishedAt: '2024-08-28T09:36:11Z',
                metadata: {
                  'job-name':
                    '601c437f-5e71-4fe1-a849-f4bca2608563.random-fail.2',
                },
                phase: 'Failed',
                startedAt: '2024-08-28T09:36:08Z',
              },
            ],
            name: 'random-fail',
            phase: 'Failed',
          },
        ],
        phase: 'Failed',
        runSummary: {
          count: 2,
          failed: 1,
          successful: 1,
        },
        startedAt: '2024-08-28T09:36:00Z',
      },
    },
    {
      apiVersion: 'argoproj.io/v1alpha1',
      kind: 'AnalysisRun',
      metadata: {
        annotations: {
          'rollout.argoproj.io/revision': '25',
        },
        creationTimestamp: new Date('2024-08-28T09:36:21Z'),
        labels: {
          app: 'canary-rollout-analysis',
          'app.kubernetes.io/instance': 'quarkus-app',
          'rollout-type': 'Step',
          'step-index': '1',
        },
        name: 'canary-rollout-analysis-5956ffbf8b-25-1.2',
        ownerReferences: [
          {
            apiVersion: 'argoproj.io/v1alpha1',

            kind: 'Rollout',
            name: 'canary-rollout-analysis',
            uid: '96e8224d-d24b-4efa-bc7a-00907ad0e759',
          },
        ],
        uid: '939409be-cf15-4376-a638-32edf98dea9b',
      },
      spec: {
        metrics: [
          {
            count: 2,
            failureLimit: 1,
            interval: '5s',
            name: 'random-fail',
            provider: {
              job: {
                metadata: {},
                spec: {
                  backoffLimit: 0,
                  template: {
                    metadata: {},
                    spec: {
                      containers: [
                        {
                          args: ['FLIP=$(($(($RANDOM%10))%2)) && exit $FLIP'],
                          command: ['sh', '-c'],
                          image: 'alpine:3.8',
                          name: 'sleep',
                          resources: {},
                        },
                      ],
                      restartPolicy: 'Never',
                    },
                  },
                },
              },
            },
          },
          {
            count: 1,
            failureLimit: 1,
            interval: '5s',
            name: 'pass',
            provider: {
              job: {
                metadata: {},
                spec: {
                  backoffLimit: 0,
                  template: {
                    metadata: {},
                    spec: {
                      containers: [
                        {
                          args: ['exit 0'],
                          command: ['sh', '-c'],
                          image: 'alpine:3.8',
                          name: 'sleep',
                          resources: {},
                        },
                      ],
                      restartPolicy: 'Never',
                    },
                  },
                },
              },
            },
          },
        ],
      },
      status: {
        dryRunSummary: {},
        metricResults: [
          {
            count: 1,
            measurements: [
              {
                finishedAt: '2024-08-28T09:36:24Z',
                metadata: {
                  'job-name': '939409be-cf15-4376-a638-32edf98dea9b.pass.1',
                },
                phase: 'Successful',
                startedAt: '2024-08-28T09:36:21Z',
              },
            ],
            name: 'pass',
            phase: 'Successful',
            successful: 1,
          },
          {
            count: 2,
            measurements: [
              {
                finishedAt: '2024-08-28T09:36:24Z',
                metadata: {
                  'job-name':
                    '939409be-cf15-4376-a638-32edf98dea9b.random-fail.1',
                },
                phase: 'Successful',
                startedAt: '2024-08-28T09:36:21Z',
              },
              {
                finishedAt: '2024-08-28T09:36:32Z',
                metadata: {
                  'job-name':
                    '939409be-cf15-4376-a638-32edf98dea9b.random-fail.2',
                },
                phase: 'Successful',
                startedAt: '2024-08-28T09:36:29Z',
              },
            ],
            name: 'random-fail',
            phase: 'Successful',
            successful: 2,
          },
        ],
        phase: 'Successful',
        runSummary: {
          count: 2,
          successful: 2,
        },
        startedAt: '2024-08-28T09:36:21Z',
      },
    },
    {
      apiVersion: 'argoproj.io/v1alpha1',
      kind: 'AnalysisRun',
      metadata: {
        annotations: {
          'rollout.argoproj.io/revision': '27',
        },
        creationTimestamp: new Date('2024-08-28T13:32:39Z'),
        labels: {
          app: 'canary-rollout-analysis',
          'app.kubernetes.io/instance': 'quarkus-app',
          'rollout-type': 'Step',
          'step-index': '1',
        },
        name: 'canary-rollout-analysis-79cd8675b9-27-1',
        ownerReferences: [
          {
            apiVersion: 'argoproj.io/v1alpha1',

            kind: 'Rollout',
            name: 'canary-rollout-analysis',
            uid: '96e8224d-d24b-4efa-bc7a-00907ad0e759',
          },
        ],
        uid: 'ada68d59-9d99-41b3-a1cb-cb80ac2cb94e',
      },
      spec: {
        metrics: [
          {
            count: 2,
            failureLimit: 1,
            interval: '5s',
            name: 'random-fail',
            provider: {
              job: {
                metadata: {},
                spec: {
                  backoffLimit: 0,
                  template: {
                    metadata: {},
                    spec: {
                      containers: [
                        {
                          args: ['FLIP=$(($(($RANDOM%10))%2)) && exit $FLIP'],
                          command: ['sh', '-c'],
                          image: 'alpine:3.8',
                          name: 'sleep',
                          resources: {},
                        },
                      ],
                      restartPolicy: 'Never',
                    },
                  },
                },
              },
            },
          },
          {
            count: 1,
            failureLimit: 1,
            interval: '5s',
            name: 'pass',
            provider: {
              job: {
                metadata: {},
                spec: {
                  backoffLimit: 0,
                  template: {
                    metadata: {},
                    spec: {
                      containers: [
                        {
                          args: ['exit 0'],
                          command: ['sh', '-c'],
                          image: 'alpine:3.8',
                          name: 'sleep',
                          resources: {},
                        },
                      ],
                      restartPolicy: 'Never',
                    },
                  },
                },
              },
            },
          },
        ],
      },
      status: {
        dryRunSummary: {},
        message:
          'Metric "random-fail" assessed Failed due to failed (2) > failureLimit (1)',
        metricResults: [
          {
            count: 1,
            measurements: [
              {
                finishedAt: '2024-08-28T13:32:42Z',
                metadata: {
                  'job-name': 'ada68d59-9d99-41b3-a1cb-cb80ac2cb94e.pass.1',
                },
                phase: 'Successful',
                startedAt: '2024-08-28T13:32:39Z',
              },
            ],
            name: 'pass',
            phase: 'Successful',
            successful: 1,
          },
          {
            count: 2,
            failed: 2,
            measurements: [
              {
                finishedAt: '2024-08-28T13:32:42Z',
                metadata: {
                  'job-name':
                    'ada68d59-9d99-41b3-a1cb-cb80ac2cb94e.random-fail.1',
                },
                phase: 'Failed',
                startedAt: '2024-08-28T13:32:39Z',
              },
              {
                finishedAt: '2024-08-28T13:32:50Z',
                metadata: {
                  'job-name':
                    'ada68d59-9d99-41b3-a1cb-cb80ac2cb94e.random-fail.2',
                },
                phase: 'Failed',
                startedAt: '2024-08-28T13:32:47Z',
              },
            ],
            name: 'random-fail',
            phase: 'Failed',
          },
        ],
        phase: 'Failed',
        runSummary: {
          count: 2,
          failed: 1,
          successful: 1,
        },
        startedAt: '2024-08-28T13:32:39Z',
      },
    },
    {
      apiVersion: 'argoproj.io/v1alpha1',
      kind: 'AnalysisRun',
      metadata: {
        annotations: {
          'rollout.argoproj.io/revision': '27',
        },
        creationTimestamp: new Date('2024-08-28T14:50:56Z'),
        labels: {
          app: 'canary-rollout-analysis',
          'app.kubernetes.io/instance': 'quarkus-app',
          'rollout-type': 'Step',
          'step-index': '1',
        },
        name: 'canary-rollout-analysis-79cd8675b9-27-1.1',
        ownerReferences: [
          {
            apiVersion: 'argoproj.io/v1alpha1',

            kind: 'Rollout',
            name: 'canary-rollout-analysis',
            uid: '96e8224d-d24b-4efa-bc7a-00907ad0e759',
          },
        ],
        uid: '6c0dfd29-722d-4b59-b71b-f8f7547e7008',
      },
      spec: {
        metrics: [
          {
            count: 2,
            failureLimit: 1,
            interval: '5s',
            name: 'random-fail',
            provider: {
              job: {
                metadata: {},
                spec: {
                  backoffLimit: 0,
                  template: {
                    metadata: {},
                    spec: {
                      containers: [
                        {
                          args: ['FLIP=$(($(($RANDOM%10))%2)) && exit $FLIP'],
                          command: ['sh', '-c'],
                          image: 'alpine:3.8',
                          name: 'sleep',
                          resources: {},
                        },
                      ],
                      restartPolicy: 'Never',
                    },
                  },
                },
              },
            },
          },
          {
            count: 1,
            failureLimit: 1,
            interval: '5s',
            name: 'pass',
            provider: {
              job: {
                metadata: {},
                spec: {
                  backoffLimit: 0,
                  template: {
                    metadata: {},
                    spec: {
                      containers: [
                        {
                          args: ['exit 0'],
                          command: ['sh', '-c'],
                          image: 'alpine:3.8',
                          name: 'sleep',
                          resources: {},
                        },
                      ],
                      restartPolicy: 'Never',
                    },
                  },
                },
              },
            },
          },
        ],
      },
      status: {
        dryRunSummary: {},
        metricResults: [
          {
            count: 1,
            measurements: [
              {
                finishedAt: '2024-08-28T14:50:59Z',
                metadata: {
                  'job-name': '6c0dfd29-722d-4b59-b71b-f8f7547e7008.pass.1',
                },
                phase: 'Successful',
                startedAt: '2024-08-28T14:50:56Z',
              },
            ],
            name: 'pass',
            phase: 'Successful',
            successful: 1,
          },
          {
            count: 2,
            failed: 1,
            measurements: [
              {
                finishedAt: '2024-08-28T14:50:59Z',
                metadata: {
                  'job-name':
                    '6c0dfd29-722d-4b59-b71b-f8f7547e7008.random-fail.1',
                },
                phase: 'Successful',
                startedAt: '2024-08-28T14:50:56Z',
              },
              {
                finishedAt: '2024-08-28T14:51:07Z',
                metadata: {
                  'job-name':
                    '6c0dfd29-722d-4b59-b71b-f8f7547e7008.random-fail.2',
                },
                phase: 'Failed',
                startedAt: '2024-08-28T14:51:04Z',
              },
            ],
            name: 'random-fail',
            phase: 'Successful',
            successful: 1,
          },
        ],
        phase: 'Successful',
        runSummary: {
          count: 2,
          successful: 2,
        },
        startedAt: '2024-08-28T14:50:56Z',
      },
    },
    {
      apiVersion: 'argoproj.io/v1alpha1',
      kind: 'AnalysisRun',
      metadata: {
        annotations: {
          'rollout.argoproj.io/revision': '28',
        },
        creationTimestamp: new Date('2024-08-28T15:13:55Z'),
        labels: {
          app: 'canary-rollout-analysis',
          'app.kubernetes.io/instance': 'quarkus-app',
          'rollout-type': 'Step',
          'step-index': '1',
        },

        name: 'canary-rollout-analysis-bf75cd5bb-28-1',
        ownerReferences: [
          {
            apiVersion: 'argoproj.io/v1alpha1',

            kind: 'Rollout',
            name: 'canary-rollout-analysis',
            uid: '96e8224d-d24b-4efa-bc7a-00907ad0e759',
          },
        ],
        uid: '76a82c27-75a6-417e-b7da-0fed392d5cb0',
      },
      spec: {
        metrics: [
          {
            count: 2,
            failureLimit: 1,
            interval: '5s',
            name: 'random-fail',
            provider: {
              job: {
                metadata: {},
                spec: {
                  backoffLimit: 0,
                  template: {
                    metadata: {},
                    spec: {
                      containers: [
                        {
                          args: ['FLIP=$(($(($RANDOM%10))%2)) && exit $FLIP'],
                          command: ['sh', '-c'],
                          image: 'alpine:3.8',
                          name: 'sleep',
                          resources: {},
                        },
                      ],
                      restartPolicy: 'Never',
                    },
                  },
                },
              },
            },
          },
          {
            count: 1,
            failureLimit: 1,
            interval: '5s',
            name: 'pass',
            provider: {
              job: {
                metadata: {},
                spec: {
                  backoffLimit: 0,
                  template: {
                    metadata: {},
                    spec: {
                      containers: [
                        {
                          args: ['exit 0'],
                          command: ['sh', '-c'],
                          image: 'alpine:3.8',
                          name: 'sleep',
                          resources: {},
                        },
                      ],
                      restartPolicy: 'Never',
                    },
                  },
                },
              },
            },
          },
        ],
      },
      status: {
        dryRunSummary: {},
        metricResults: [
          {
            count: 2,
            failed: 1,
            measurements: [
              {
                finishedAt: '2024-08-28T15:13:58Z',
                metadata: {
                  'job-name':
                    '76a82c27-75a6-417e-b7da-0fed392d5cb0.random-fail.1',
                },
                phase: 'Successful',
                startedAt: '2024-08-28T15:13:55Z',
              },
              {
                finishedAt: '2024-08-28T15:14:06Z',
                metadata: {
                  'job-name':
                    '76a82c27-75a6-417e-b7da-0fed392d5cb0.random-fail.2',
                },
                phase: 'Failed',
                startedAt: '2024-08-28T15:14:03Z',
              },
            ],
            name: 'random-fail',
            phase: 'Successful',
            successful: 1,
          },
          {
            count: 1,
            measurements: [
              {
                finishedAt: '2024-08-28T15:13:58Z',
                metadata: {
                  'job-name': '76a82c27-75a6-417e-b7da-0fed392d5cb0.pass.1',
                },
                phase: 'Successful',
                startedAt: '2024-08-28T15:13:55Z',
              },
            ],
            name: 'pass',
            phase: 'Successful',
            successful: 1,
          },
        ],
        phase: 'Successful',
        runSummary: {
          count: 2,
          successful: 2,
        },
        startedAt: '2024-08-28T15:13:55Z',
      },
    },
  ],
  rollouts: [
    {
      apiVersion: 'argoproj.io/v1alpha1',
      kind: 'Rollout',
      metadata: {
        annotations: {
          'rollout.argoproj.io/revision': '28',
        },
        creationTimestamp: new Date('2024-08-28T04:00:39Z'),
        labels: {
          'app.kubernetes.io/instance': 'quarkus-app',
        },
        name: 'canary-rollout-analysis',
        uid: '96e8224d-d24b-4efa-bc7a-00907ad0e759',
      },
      spec: {
        replicas: 4,
        revisionHistoryLimit: 2,
        selector: {
          matchLabels: {
            app: 'canary-rollout-analysis',
            'app.kubernetes.io/instance': 'quarkus-app',
          },
        },
        strategy: {
          canary: {
            steps: [
              {
                setWeight: 25,
              },
              {
                analysis: {
                  analysisRunMetadata: {},
                  templates: [
                    {
                      templateName: 'random-fail',
                    },
                    {
                      templateName: 'always-pass',
                    },
                  ],
                },
              },
            ],
          },
        },
        template: {
          metadata: {
            labels: {
              app: 'canary-rollout-analysis',
              'app.kubernetes.io/instance': 'quarkus-app',
            },
          },
          spec: {
            containers: [
              {
                image: 'argoproj/rollouts-demo:red',
                imagePullPolicy: 'Always',
                name: 'rollouts-demo',
                ports: [
                  {
                    containerPort: 8080,
                    protocol: 'TCP',
                  },
                ],
                resources: {},
                terminationMessagePath: '/dev/termination-log',
                terminationMessagePolicy: 'File',
              },
            ],
            dnsPolicy: 'ClusterFirst',
            restartPolicy: 'Always',
            schedulerName: 'default-scheduler',
            securityContext: {},
            terminationGracePeriodSeconds: 30,
          },
        },
      },
      status: {
        HPAReplicas: 4,
        availableReplicas: 4,
        blueGreen: {},
        canary: {},
        conditions: [
          {
            lastTransitionTime: '2024-08-28T15:14:09Z',
            lastUpdateTime: '2024-08-28T15:14:09Z',
            message: 'Rollout is healthy',
            reason: 'RolloutHealthy',
            status: 'True',
            type: 'Healthy',
          },
        ],
        currentPodHash: 'bf75cd5bb',
        currentStepHash: '84d4b665cd',
        currentStepIndex: 2,
        phase: 'Healthy',
        readyReplicas: 4,
        replicas: 4,
        selector:
          'app=canary-rollout-analysis,app.kubernetes.io/instance=quarkus-app',
        stableRS: 'bf75cd5bb',
        updatedReplicas: 4,
      },
    },
    {
      apiVersion: 'argoproj.io/v1alpha1',
      kind: 'Rollout',
      metadata: {
        annotations: {
          'rollout.argoproj.io/revision': '1',
        },
        creationTimestamp: new Date('2024-08-28T16:19:22Z'),
        labels: {
          'app.kubernetes.io/instance': 'quarkus-app',
        },
        name: 'rollout-bluegreen',
        uid: 'ced6c8ca-389e-4a90-9815-156d23d3a323',
      },
      spec: {
        replicas: 2,
        revisionHistoryLimit: 2,
        selector: {
          matchLabels: {
            app: 'rollout-bluegreen',
            'app.kubernetes.io/instance': 'quarkus-app',
          },
        },
        strategy: {
          blueGreen: {
            activeService: 'rollout-bluegreen-active',
            autoPromotionEnabled: false,
            postPromotionAnalysis: {
              analysisRunMetadata: {
                labels: {
                  'app.kubernetes.io/instance': 'quarkus-app',
                },
              },
              templates: [
                {
                  templateName: 'random-fail',
                },
                {
                  templateName: 'always-pass',
                },
              ],
            },
            prePromotionAnalysis: {
              analysisRunMetadata: {
                labels: {
                  'app.kubernetes.io/instance': 'quarkus-app',
                },
              },
              templates: [
                {
                  templateName: 'random-fail',
                },
                {
                  templateName: 'always-pass',
                },
              ],
            },
            previewService: 'rollout-bluegreen-preview',
          },
        },
        template: {
          metadata: {
            labels: {
              app: 'rollout-bluegreen',
              'app.kubernetes.io/instance': 'quarkus-app',
            },
          },
          spec: {
            containers: [
              {
                image: 'argoproj/rollouts-demo:blue',
                imagePullPolicy: 'Always',
                name: 'rollouts-demo',
                ports: [
                  {
                    containerPort: 8080,
                    protocol: 'TCP',
                  },
                ],
                resources: {},
              },
            ],
          },
        },
      },
      status: {
        HPAReplicas: 2,
        availableReplicas: 2,
        blueGreen: {
          activeSelector: '7479659dfb',
          previewSelector: '7479659dfb',
        },
        canary: {},
        conditions: [
          {
            lastTransitionTime: '2024-08-28T16:19:22Z',
            lastUpdateTime: '2024-08-28T16:19:22Z',
            message: 'RolloutCompleted',
            reason: 'RolloutCompleted',
            status: 'True',
            type: 'Completed',
          },
        ],
        currentPodHash: '7479659dfb',
        phase: 'Healthy',
        readyReplicas: 2,
        replicas: 2,
        selector:
          'app=rollout-bluegreen,app.kubernetes.io/instance=quarkus-app,rollouts-pod-template-hash=7479659dfb',
        stableRS: '7479659dfb',
        updatedReplicas: 2,
      },
    },
  ],
};
