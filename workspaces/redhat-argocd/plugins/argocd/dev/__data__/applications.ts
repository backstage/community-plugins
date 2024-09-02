import { Application } from '../../src/types/application';

const commonMetadata = {
  creationTimestamp: new Date('2024-04-22T05:39:23Z'),
  labels: {
    'rht-gitops.com/janus-argocd': 'quarkus-app-bootstrap',
  },
  instance: { name: 'main' },
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
  spec: commonSpec,
  status: commonStatus,
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
