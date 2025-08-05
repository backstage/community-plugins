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
import { Application } from '@backstage-community/plugin-redhat-argocd-common';

const commonMetadata = {
  creationTimestamp: new Date('2024-04-22T05:39:23Z'),
  labels: {
    'rht-gitops.com/janus-argocd': 'quarkus-app-bootstrap',
  },
  instance: { name: 'main', url: 'https:/kubernetes.default.svc' },
  name: 'quarkus-app-dev',
};

const commonSpec = {
  project: 'janus',
  destination: {
    namespace: 'quarkus-app-dev',
    server: 'https://kubernetes.default.svc',
  },
  source: {
    helm: {
      parameters: [
        {
          name: 'namespace.name',
          value: 'quarkus-app-dev',
        },
        {
          name: 'environment',
          value: 'dev',
        },
        {
          name: 'image.tag',
          value: 'latest',
        },
      ],
    },
    path: './helm/app',
    repoURL:
      'https://gitlab-gitlab.apps.cluster.test.com/development/quarkus-app-gitops.git',
    targetRevision: 'HEAD',
  },
};

const commonStatus = {
  history: [
    {
      revision: '90f9758b7033a4bbb7c33a35ee474d61091644bc',
      deployedAt: '2024-04-22T05:39:24Z',
      id: 0,
      source: {
        repoURL:
          'https://gitlab-gitlab.apps.cluster.test.com/development/quarkus-app-gitops.git',
        path: './helm/app',
        targetRevision: 'HEAD',
        helm: {
          parameters: [
            {
              name: 'namespace.name',
              value: 'quarkus-app-dev',
            },
            {
              name: 'environment',
              value: 'dev',
            },
            {
              name: 'image.tag',
              value: 'latest',
            },
          ],
        },
      },
      deployStartedAt: '2024-04-22T05:39:23Z',
    },
    {
      revision: '90f9758b7033a4bbb7c33a35ee474d61091644bc',
      deployedAt: '2024-04-22T17:57:40Z',
      id: 1,
      source: {
        repoURL:
          'https://gitlab-gitlab.apps.cluster.test.com/development/quarkus-app-gitops.git',
        path: './helm/app',
        targetRevision: 'HEAD',
        helm: {
          parameters: [
            {
              name: 'namespace.name',
              value: 'quarkus-app-dev',
            },
            {
              name: 'environment',
              value: 'dev',
            },
            {
              name: 'image.tag',
              value: 'latest',
            },
          ],
        },
      },
      deployStartedAt: '2024-04-22T17:57:40Z',
    },
  ],
  health: {
    status: 'Healthy',
  },
  operationState: {
    operation: {
      sync: {
        prune: true,
        revision: '90f9758b7033a4bbb7c33a35ee474d61091644bc',
        syncOptions: [
          'RespectIgnoreDifferences=true',
          'ApplyOutOfSyncOnly=true',
        ],
      },
    },
    phase: 'Succeeded',
  },
  summary: {
    images: ['quay-hw6fw.apps.cluster.test.com/quayadmin/quarkus-app:latest'],
  },
  sync: {
    status: 'Synced',
  },
};

export const mockApplication: Application = {
  metadata: {
    ...commonMetadata,
    creationTimestamp: new Date('2024-04-22T05:39:23Z'),
    name: 'quarkus-app-dev',
  },
  spec: commonSpec,
  status: commonStatus,
};

export const mockQuarkusApplication: Application = {
  metadata: {
    ...commonMetadata,
    creationTimestamp: new Date('2024-04-22T05:39:23Z'),
    name: 'quarkus-app',
  },
  spec: {
    ...commonSpec,
    source: {
      ...commonSpec.source,
      chart: 'bitnami',
    },
  },
  status: {
    ...commonStatus,
    resources: [
      {
        version: 'argoproj.io',
        kind: 'Rollout',
        namespace: 'openshift-gitops',
        name: 'canary-rollout-analysis',
        status: 'Synced',
        health: {
          status: 'Degraded',
        },
      },
      {
        version: 'argoproj.io',
        kind: 'Rollout',
        namespace: 'openshift-gitops',
        name: 'rollout-bluegreen',
        status: 'Synced',
        health: {
          status: 'Degraded',
        },
      },
      {
        group: 'apps',
        version: 'v1',
        kind: 'Deployment',
        namespace: 'openshift-gitops',
        name: 'quarkus-app',
        status: 'Synced',
        health: {
          status: 'Healthy',
        },
      },
    ],
  },
};

const preProdHelmParameters = {
  parameters: [
    {
      name: 'namespace.name',
      value: 'quarkus-app-preprod',
    },
    {
      name: 'environment',
      value: 'preprod',
    },
    {
      name: 'image.tag',
      value: 'latest',
    },
  ],
};
export const preProdApplication = {
  metadata: {
    ...commonMetadata,
    creationTimestamp: new Date('2024-04-22T05:39:23Z'),
    name: 'quarkus-app-preprod',
  },
  spec: {
    ...commonSpec,
    destination: {
      ...commonSpec.destination,
      namespace: 'quarkus-app-preprod',
    },
    source: {
      ...commonSpec.source,
      helm: {
        parameters: preProdHelmParameters,
      },
    },
  },
  status: {
    ...commonStatus,
    history: [
      {
        ...commonStatus.history[0],
        revision: '80f9758b7033a4bbb7c33a35ee474d61091644bc',
        deployedAt: '2024-04-22T05:39:24Z',
        source: {
          ...commonStatus.history[0].source,
          helm: preProdHelmParameters,
        },
      },
      {
        ...commonStatus.history[1],
        revision: '80f9758b7033a4bbb7c33a35ee474d61091644bc',
        source: {
          ...commonStatus.history[0].source,
          helm: preProdHelmParameters,
        },
      },
    ],
    operationState: {
      ...commonStatus.operationState,
      operation: {
        ...commonStatus.operationState.operation,
        sync: {
          ...commonStatus.operationState.operation.sync,
          revision: '80f9758b7033a4bbb7c33a35ee474d61091644bc',
        },
      },
    },
    health: {
      status: 'Degraded',
    },
    sync: {
      status: 'Synced',
    },
    resources: [
      {
        version: 'v1',
        kind: 'Service',
        namespace: 'openshift-gitops',
        name: 'quarkus-app',
        status: 'Synced',
        health: {
          status: 'Healthy',
        },
      },
      {
        group: 'apps',
        version: 'v1',
        kind: 'Deployment',
        namespace: 'openshift-gitops',
        name: 'quarkus-app',
        status: 'Synced',
        health: {
          status: 'Degraded',
        },
      },
    ],
  },
};

const prodHelmParameters = {
  parameters: [
    {
      name: 'namespace.name',
      value: 'quarkus-app-pre-prod',
    },
    {
      name: 'environment',
      value: 'prod',
    },
    {
      name: 'image.tag',
      value: 'prod',
    },
  ],
};
export const prodApplication = {
  metadata: {
    creationTimestamp: new Date('2024-04-22T05:39:23Z'),
    labels: {
      'rht-gitops.com/janus-argocd': 'quarkus-app-bootstrap',
    },
    instance: { name: 'main' },
    name: 'quarkus-app-prod',
  },
  spec: {
    destination: {
      namespace: 'quarkus-app-prod',
      server: 'https://kubernetes.default.svc',
    },
    project: 'janus',
    source: {
      helm: prodHelmParameters,
      path: './helm/app',
      repoURL:
        'https://gitlab-gitlab.apps.cluster.test.com/prod/quarkus-app-gitops.git',
      targetRevision: 'HEAD',
    },
  },
  status: {
    history: [
      {
        ...commonStatus.history[0],
        revision: '70f9758b7033a4bbb7c33a35ee474d61091644bc',
        deployedAt: '2024-04-19T05:39:24Z',
        source: {
          ...commonStatus.history[0].source,
          helm: preProdHelmParameters,
          repoURL:
            'https://gitlab-gitlab.apps.cluster.test.com/prod/quarkus-app-gitops.git',
        },
      },
      {
        ...commonStatus.history[1],
        revision: '70f9758b7033a4bbb7c33a35ee474d61091644bc',
        deployedAt: '2024-04-19T05:39:24Z',
        id: 1,
        source: {
          ...commonStatus.history[1].source,
          helm: preProdHelmParameters,
          repoURL:
            'https://gitlab-gitlab.apps.cluster.test.com/prod/quarkus-app-gitops.git',
        },
      },
    ],
    resources: [
      {
        version: 'v1',
        kind: 'Service',
        namespace: 'openshift-gitops',
        name: 'quarkus-app',
        status: 'Synced',
        health: {
          status: 'Degraded',
        },
      },
      {
        group: 'apps',
        version: 'v1',
        kind: 'Deployment',
        namespace: 'openshift-gitops',
        name: 'quarkus-app',
        status: 'Synced',
        health: {
          status: 'Healthy',
        },
      },
    ],
    operationState: {
      ...commonStatus.operationState,
      operation: {
        ...commonStatus.operationState.operation,
        sync: {
          ...commonStatus.operationState.operation.sync,
          revision: '80f9758b7033a4bbb7c33a35ee474d61091644bc',
        },
      },
    },
    summary: {
      images: ['quay-hw6fw.apps.cluster.test.com/quayadmin/quarkus-app:latest'],
    },
    health: {
      status: 'Missing',
    },
    sync: {
      status: 'OutOfSync',
    },
  },
};

export const multiSourceArgoApp = {
  metadata: {
    name: 'demo',
    namespace: 'argocd',
    uid: 'abcd1234-5678-90ef-ghij-klmnopqrstuv',
    resourceVersion: '405389',
    generation: 408,
    creationTimestamp: new Date('2025-02-20T16:39:18Z'),
    labels: {
      app: 'fullstack',
    },
    instance: {
      name: 'main',
      url: 'https://kubernetes.default.svc',
    },
  },
  spec: {
    destination: {
      server: 'https://kubernetes.example.cluster:6443',
      namespace: 'demo',
    },
    project: 'demo',
    syncPolicy: {
      automated: {
        prune: true,
      },
    },
    source: {
      repoURL: 'https://github.com/example-org/frontend-app.git',
      path: '.',
      targetRevision: 'HEAD',
    },
    sources: [
      {
        repoURL: 'https://github.com/example-org/frontend-app.git',
        path: '.',
        targetRevision: 'HEAD',
      },
      {
        repoURL: 'https://github.com/example-org/backend-app.git',
        path: '.',
        targetRevision: 'HEAD',
      },
    ],
  },
  status: {
    resources: [
      {
        version: 'v1',
        kind: 'Namespace',
        name: 'backend-system',
        status: 'OutOfSync',
      },
      {
        version: 'v1',
        kind: 'Service',
        namespace: 'argocd',
        name: 'argocd-server-nodeport',
        status: 'Synced',
        health: {
          status: 'Healthy',
        },
      },
      {
        version: 'v1',
        kind: 'Service',
        namespace: 'frontend-system',
        name: 'frontend-app',
        status: 'Synced',
        health: {
          status: 'Healthy',
        },
      },
      {
        version: 'v1',
        kind: 'Service',
        namespace: 'backend-system',
        name: 'backend-service',
        status: 'OutOfSync',
        health: {
          status: 'Healthy',
        },
      },
      {
        group: 'apps',
        version: 'v1',
        kind: 'Deployment',
        namespace: 'demo-apps',
        name: 'fullstack-demo',
        status: 'Synced',
        health: {
          status: 'Healthy',
        },
      },
      {
        group: 'apps',
        version: 'v1',
        kind: 'Deployment',
        namespace: 'redis-system',
        name: 'backend',
        status: 'OutOfSync',
        health: {
          status: 'Healthy',
        },
      },
      {
        group: 'networking.k8s.io',
        version: 'v1',
        kind: 'NetworkPolicy',
        namespace: 'redis-system',
        name: 'backend-network-policy',
        status: 'OutOfSync',
      },
    ],
    sync: {
      status: 'OutOfSync',
      comparedTo: {
        source: {
          repoURL: '',
        },
        destination: {
          server: 'https://kubernetes.default.svc',
          namespace: 'demo',
        },
        sources: [
          {
            repoURL: 'https://github.com/example-org/frontend-app.git',
            path: '.',
            targetRevision: 'HEAD',
          },
          {
            repoURL: 'https://github.com/example-org/backend-app.git',
            path: '.',
            targetRevision: 'HEAD',
          },
        ],
      },
      revisions: [
        'abc123def456ghi789jkl012mno345pqr678stu',
        'xyz987wvu654tsr321qpo098nml765kji432hgf',
      ],
    },
    health: {
      status: 'Healthy',
      lastTransitionTime: '2025-02-25T19:12:43Z',
    },
    history: [
      {
        deployedAt: '2025-02-20T16:40:32Z',
        id: 0,
        source: {
          repoURL: '',
        },
        deployStartedAt: '2025-02-20T16:40:31Z',
        sources: [
          {
            repoURL: 'https://github.com/example-org/frontend-app.git',
            path: '.',
            targetRevision: 'HEAD',
          },
          {
            repoURL: 'https://github.com/example-org/backend-app.git',
            path: '.',
            targetRevision: 'HEAD',
          },
        ],
        revisions: [
          '331386ce09e4536a730a16f10d1bce8dfca0c8b1',
          'de1631a6d84f35d826235a933657baca77c2ca9c',
        ],
        initiatedBy: {
          username: 'admin',
        },
      },
    ],
    conditions: [
      {
        type: 'SharedResourceWarning',
        message:
          'Deployment/backend is part of applications argocd/demo and backend-app',
        lastTransitionTime: '2025-02-25T19:12:43Z',
      },
      {
        type: 'SharedResourceWarning',
        message:
          'Namespace/backend-system is part of applications argocd/demo and backend-app',
        lastTransitionTime: '2025-02-25T19:32:40Z',
      },
      {
        type: 'SharedResourceWarning',
        message:
          'NetworkPolicy/backend-network-policy is part of applications argocd/demo and backend-app',
        lastTransitionTime: '2025-02-25T19:32:40Z',
      },
      {
        type: 'SharedResourceWarning',
        message:
          'Service/backend-service is part of applications argocd/demo and backend-app',
        lastTransitionTime: '2025-02-25T19:32:40Z',
      },
    ],
    reconciledAt: '2025-02-25T19:32:40Z',
    operationState: {
      operation: {
        sync: {
          syncStrategy: {
            hook: {},
          },
          sources: [
            {
              repoURL: 'https://github.com/example-org/frontend-app.git',
              path: '.',
              targetRevision: 'HEAD',
            },
            {
              repoURL: 'https://github.com/example-org/backend-app.git',
              path: '.',
              targetRevision: 'HEAD',
            },
          ],
          revisions: [
            '331386ce09e4536a730a16f10d1bce8dfca0c8b1',
            'de1631a6d84f35d826235a933657baca77c2ca9c',
          ],
        },
        initiatedBy: {
          username: 'admin',
        },
        retry: {},
      },
      phase: 'Succeeded',
      message: 'successfully synced (all tasks run)',
      syncResult: {
        resources: [
          {
            group: '',
            version: 'v1',
            kind: 'Namespace',
            namespace: 'demo',
            name: 'redis-system',
            status: 'Synced',
            message: 'namespace/redis-system created',
            hookPhase: 'Running',
            syncPhase: 'Sync',
          },
          {
            group: 'networking.k8s.io',
            version: 'v1',
            kind: 'NetworkPolicy',
            namespace: 'redis-system',
            name: 'redis-network-policy',
            status: 'Synced',
            message:
              'networkpolicy.networking.k8s.io/redis-network-policy created',
            hookPhase: 'Running',
            syncPhase: 'Sync',
          },
          {
            group: '',
            version: 'v1',
            kind: 'Service',
            namespace: 'redis-system',
            name: 'redis-service',
            status: 'Synced',
            message: 'service/redis-service created',
            hookPhase: 'Running',
            syncPhase: 'Sync',
          },
          {
            group: '',
            version: 'v1',
            kind: 'Service',
            namespace: 'demo-apps',
            name: 'nginx-demo',
            status: 'Synced',
            message: 'service/nginx-demo created',
            hookPhase: 'Running',
            syncPhase: 'Sync',
          },
          {
            group: '',
            version: 'v1',
            kind: 'Service',
            namespace: 'argocd',
            name: 'argocd-server-nodeport',
            status: 'Synced',
            message: 'service/argocd-server-nodeport configured',
            hookPhase: 'Running',
            syncPhase: 'Sync',
          },
          {
            group: 'apps',
            version: 'v1',
            kind: 'Deployment',
            namespace: 'demo-apps',
            name: 'nginx-demo',
            status: 'Synced',
            message: 'deployment.apps/nginx-demo created',
            hookPhase: 'Running',
            syncPhase: 'Sync',
          },
          {
            group: 'apps',
            version: 'v1',
            kind: 'Deployment',
            namespace: 'redis-system',
            name: 'redis',
            status: 'Synced',
            message: 'deployment.apps/redis created',
            hookPhase: 'Running',
            syncPhase: 'Sync',
          },
        ],
        revision: '',
        source: {
          repoURL: '',
        },
        sources: [
          {
            repoURL: 'https://github.com/example-org/frontend-app.git',
            path: '.',
            targetRevision: 'HEAD',
          },
          {
            repoURL: 'https://github.com/example-org/backend-app.git',
            path: '.',
            targetRevision: 'HEAD',
          },
        ],
        revisions: [
          '331386ce09e4536a730a16f10d1bce8dfca0c8b1',
          'de1631a6d84f35d826235a933657baca77c2ca9c',
        ],
      },
      startedAt: '2025-02-20T16:40:31Z',
      finishedAt: '2025-02-20T16:40:32Z',
    },
    summary: {
      images: ['example/frontend:v1.2.3', 'example/backend:v4.5.6'],
    },
    sourceTypes: ['Directory', 'Directory'],
    controllerNamespace: 'argocd',
    sourceHydrator: {},
  },
};
